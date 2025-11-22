"use client";

import { ethers } from "ethers";
import { useCallback, useMemo, useRef, useState } from "react";
import type { FhevmInstance } from "@/fhevm/fhevmTypes";
import { FhevmDecryptionSignature } from "@/fhevm/FhevmDecryptionSignature";
import { GenericStringStorage } from "@/fhevm/GenericStringStorage";
import { getSoberJourneyAddressByChainId } from "@/config/addresses";
import { SoberJourneyFHEABI } from "@/abi/SoberJourneyFHEABI";
import { pinFileToIPFS } from "@/utils/pinata";

export function useSoberJourneyFHE(parameters: {
  instance: FhevmInstance | undefined;
  storage: GenericStringStorage;
  chainId: number | undefined;
  ethersSigner: ethers.JsonRpcSigner | undefined;
  ethersReadonlyProvider: ethers.ContractRunner | undefined;
  sameChain: React.RefObject<(chainId: number | undefined) => boolean>;
  sameSigner: React.RefObject<(ethersSigner: ethers.JsonRpcSigner | undefined) => boolean>;
  journeyId?: number;
  refreshFhevm?: () => void; // allow caller to refresh FHEVM instance on demand
}) {
  const { instance, storage, chainId, ethersSigner, ethersReadonlyProvider, sameChain, sameSigner, journeyId, refreshFhevm } = parameters;

  const [message, setMessage] = useState<string>("");
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [handle, setHandle] = useState<string | undefined>(undefined);
  const [clear, setClear] = useState<string | bigint | boolean | undefined>(undefined);
  const [progressLogs, setProgressLogs] = useState<Array<{ txHash: string; blockNumber: number; participant: string; dayIndex: number; reportCID: string }>>([]);

  const contractAddress = useMemo(() => getSoberJourneyAddressByChainId(chainId), [chainId]);
  const isDecrypted = handle && handle === (clear as any)?.handle ? true : typeof clear !== "undefined";

  const canWrite = useMemo(() => !!contractAddress && !!instance && !!ethersSigner, [contractAddress, instance, ethersSigner]);
  const canRead = useMemo(() => !!contractAddress && !!ethersReadonlyProvider, [contractAddress, ethersReadonlyProvider]);
  const canDecrypt = useMemo(() => !!contractAddress && !!instance && !!ethersSigner && !!handle && !isDecrypting, [contractAddress, instance, ethersSigner, handle, isDecrypting]);

  const journeyIdRef = useRef<number>(journeyId ?? 1);
  if (journeyId && journeyIdRef.current !== journeyId) {
    journeyIdRef.current = journeyId;
  }

  const contractRW = useMemo(() => {
    if (!contractAddress || !ethersSigner) return undefined;
    return new ethers.Contract(contractAddress, SoberJourneyFHEABI.abi, ethersSigner);
  }, [contractAddress, ethersSigner]);

  const contractRO = useMemo(() => {
    if (!contractAddress || !ethersReadonlyProvider) return undefined;
    return new ethers.Contract(contractAddress, SoberJourneyFHEABI.abi, ethersReadonlyProvider);
  }, [contractAddress, ethersReadonlyProvider]);

  const startSampleJourney = useCallback(async () => {
    if (!contractRW) return;
    setMessage("Starting sample journey...");
    const now = Math.floor(Date.now() / 1000);
    const start = now - 60;
    const end = now + 30 * 24 * 60 * 60;
    const tx = await contractRW.startJourney(
      "ipfs://sample", start, end, 30, 0, ethers.ZeroAddress, false, 0, { value: 0 }
    );
    const receipt = await tx.wait();
    setMessage(`Journey started: tx=${receipt?.hash}`);
  }, [contractRW]);

  const enrollInSampleJourney = useCallback(async () => {
    if (!contractRW) return;
    setMessage("Enrolling in journey...");
    const tx = await contractRW.enrollInJourney(journeyIdRef.current, { value: 0 });
    const receipt = await tx.wait();
    setMessage(`Enrolled: tx=${receipt?.hash}`);
  }, [contractRW]);

  const refreshEncryptedProgressDays = useCallback(async () => {
    if (!contractRO || !ethersSigner) return;
    setMessage("Loading encrypted progress days...");
    try {
      const addr = await ethersSigner.getAddress();
      const h = await contractRO.getEncryptedProgressDays(journeyIdRef.current, addr);
      setHandle(h);
      setMessage("Loaded handle");
    } catch (e) {
      setMessage(`getEncryptedProgressDays failed: ${String(e)}`);
    }
  }, [contractRO, ethersSigner]);

  const loadProgressHistory = useCallback(async () => {
    if (!contractRO || !ethersSigner) return;
    try {
      const me = await ethersSigner.getAddress();
      const filter = (contractRO as any).filters?.ProgressRecorded?.(journeyIdRef.current);
      const logs = await (contractRO as any).queryFilter(filter);
      const iface = new ethers.Interface(SoberJourneyFHEABI.abi);
      const parsed = logs
        .map((l: any) => {
          try {
            const p = iface.parseLog({ topics: l.topics, data: l.data });
            if (!p) return undefined;
            const [jid, participant, dayIndex, reportCID] = p.args as any;
            if (Number(jid) !== journeyIdRef.current) return undefined;
            if (String(participant).toLowerCase() !== me.toLowerCase()) return undefined;
            return {
              txHash: l.transactionHash as string,
              blockNumber: Number(l.blockNumber),
              participant: String(participant),
              dayIndex: Number(dayIndex),
              reportCID: String(reportCID),
            };
          } catch { return undefined; }
        })
        .filter(Boolean) as Array<{ txHash: string; blockNumber: number; participant: string; dayIndex: number; reportCID: string }>;
      parsed.sort((a, b) => a.blockNumber - b.blockNumber);
      setProgressLogs(parsed);
    } catch (e) {
      setMessage(`loadProgressHistory failed: ${String(e)}`);
    }
  }, [contractRO, ethersSigner]);

  const decryptProgressDays = useCallback(async () => {
    if (!instance || !ethersSigner || !handle || !contractAddress) return;
    setIsDecrypting(true);
    try {
      const sig = await FhevmDecryptionSignature.loadOrSign(
        instance,
        [contractAddress],
        ethersSigner,
        storage
      );
      if (!sig) { setMessage("Unable to build FHEVM decryption signature"); return; }
      const res = await instance.userDecrypt(
        [{ handle, contractAddress }],
        sig.privateKey,
        sig.publicKey,
        sig.signature,
        sig.contractAddresses,
        sig.userAddress,
        sig.startTimestamp,
        sig.durationDays
      );
      setClear((res as any)[handle]);
      setMessage(`Decrypted clear value: ${(res as any)[handle]}`);
    } finally { setIsDecrypting(false); }
  }, [instance, ethersSigner, handle, contractAddress, storage]);

  const recordProgress = useCallback(async (reportCID?: string) => {
    const tryOnce = async () => {
      if (!instance || !ethersSigner || !contractRW || !contractAddress) return;
      const userAddr = await ethersSigner.getAddress();
      const input = instance.createEncryptedInput(contractAddress as `0x${string}` | string, userAddr as `0x${string}` | string);
      input.add32(1);
      const enc = await input.encrypt();
      const tx: ethers.TransactionResponse = await contractRW.recordProgress(
        journeyIdRef.current,
        reportCID ?? "",
        enc.handles[0],
        enc.inputProof
      );
      const receipt = await tx.wait();
      setMessage(`Progress recorded: ${receipt?.hash}`);
      await refreshEncryptedProgressDays();
      await loadProgressHistory();
    };

    if (!instance || !ethersSigner || !contractRW || !contractAddress) return;
    setIsRecording(true);
    setMessage("Encrypting + recording progress...");
    try {
      await tryOnce();
    } catch (e: any) {
      const msg = String(e?.message || e);
      // If relayer backend dropped, refresh FHEVM instance and retry once
      if (msg.includes("backend connection task has stopped") || msg.includes("Relayer didn't response correctly")) {
        setMessage("Relayer connection dropped. Refreshing FHEVM and retrying...");
        try {
          refreshFhevm?.();
        } catch {}
        try {
          await tryOnce();
          return;
        } catch (e2) {
          setMessage(`recordProgress failed after refresh: ${String(e2)}`);
        }
      } else {
        setMessage(`recordProgress failed: ${msg}`);
      }
    } finally {
      setIsRecording(false);
    }
  }, [instance, ethersSigner, contractRW, contractAddress, refreshEncryptedProgressDays, loadProgressHistory, refreshFhevm]);

  const uploadToIPFS = useCallback(async (file: File) => {
    const res = await pinFileToIPFS(file);
    setMessage(`Pinned to IPFS: ${res.cid}`);
    return res;
  }, []);

  return {
    contractAddress,
    message,
    isDecrypting,
    isRecording,
    handle,
    clear,
    isDecrypted: typeof clear !== "undefined",
    canWrite,
    canRead,
    canDecrypt,
    startSampleJourney,
    enrollInSampleJourney,
    refreshEncryptedProgressDays,
    decryptProgressDays,
    recordProgress,
    uploadToIPFS,
    progressLogs,
    loadProgressHistory,
  };
}


