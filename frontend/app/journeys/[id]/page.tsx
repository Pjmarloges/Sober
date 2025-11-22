"use client";

import { useParams } from "next/navigation";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { useFhevm } from "@/fhevm/useFhevm";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useSoberJourneyFHE } from "@/hooks/useSoberJourneyFHE";
import { useMemo, useState, useEffect } from "react";
import { getSoberJourneyAddressByChainId } from "@/config/addresses";
import { ethers } from "ethers";
import { SoberJourneyFHEABI } from "@/abi/SoberJourneyFHEABI";

type JourneyInfo = {
  journeyId: bigint;
  creator: string;
  journeyCID: string;
  startTime: bigint;
  endTime: bigint;
  daysTotal: bigint;
  stakeAmount: bigint;
  stakeToken: string;
  requireEvidence: boolean;
  verificationMode: number;
  rewardPool: bigint;
  finalized: boolean;
};

export default function JourneyDetailPage() {
  const params = useParams<{ id: string }>();
  const journeyId = Number(params?.id);
  const { storage } = useInMemoryStorage();
  const { provider, chainId, isConnected, connect, ethersSigner, ethersReadonlyProvider, sameChain, sameSigner, accounts } = useMetaMaskEthersSigner();
  const { instance, status, error, refresh } = useFhevm({ provider, chainId, enabled: true, initialMockChains: { 31337: "http://localhost:8545" } });

  const journey = useSoberJourneyFHE({ instance, storage, chainId, ethersSigner, ethersReadonlyProvider, sameChain, sameSigner, journeyId, refreshFhevm: refresh });

  const [info, setInfo] = useState<JourneyInfo | null>(null);
  const [joined, setJoined] = useState<boolean>(false);
  const [joining, setJoining] = useState(false);

  const address = useMemo(() => getSoberJourneyAddressByChainId(chainId), [chainId]);

  const loadInfo = async () => {
    if (!address || !ethersReadonlyProvider) return;
    const c = new ethers.Contract(address, SoberJourneyFHEABI.abi, ethersReadonlyProvider);
    try {
      const res = await c.getJourneyInfo(journeyId);
      setInfo(res as JourneyInfo);

      if (ethersSigner) {
        try {
          const me = await ethersSigner.getAddress();
          const rec = await c.getParticipantInfo(journeyId, me);
          const alreadyJoined = String(rec.participant).toLowerCase() === me.toLowerCase();
          setJoined(alreadyJoined);
        } catch {}
      }
    } catch (e) {
      console.error("loadInfo failed", e);
    }
  };

  useEffect(() => {
    loadInfo();
  }, [address, ethersReadonlyProvider, ethersSigner, journeyId]);

  const onJoin = async () => {
    if (!address || !ethersSigner) return;
    setJoining(true);
    try {
      const c = new ethers.Contract(address, SoberJourneyFHEABI.abi, ethersSigner);
      const stakeValue = info?.stakeAmount ?? 0n;
      const tx = await c.enrollInJourney(journeyId, { value: stakeValue });
      await tx.wait();
      setJoined(true);
      await loadInfo();
    } catch (e: any) {
      alert(`Failed to join: ${e?.message || String(e)}`);
    } finally {
      setJoining(false);
    }
  };

  const now = Math.floor(Date.now() / 1000);
  const notStarted = info && Number(info.startTime) > now;
  const ended = info && Number(info.endTime) < now;
  const canJoin = info && !joined && !notStarted && !ended && isConnected;

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-5xl font-black gradient-text">Journey Details #{journeyId}</h1>
        {!isConnected && (
          <button onClick={connect} className="orange-button px-8 py-4 rounded-2xl text-lg">Connect Wallet</button>
        )}
      </div>

      <div className="warm-card p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Journey Information</h3>
        {!info ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-600 font-semibold">Creator:</span><span className="font-mono text-gray-800 ml-2">{info.creator}</span></div>
            <div><span className="text-gray-600 font-semibold">Total Days:</span><span className="font-bold text-orange-600 ml-2">{String(info.daysTotal)} days</span></div>
            <div><span className="text-gray-600 font-semibold">Start Time:</span><span className="text-gray-800 ml-2">{new Date(Number(info.startTime) * 1000).toLocaleString()}</span></div>
            <div><span className="text-gray-600 font-semibold">End Time:</span><span className="text-gray-800 ml-2">{new Date(Number(info.endTime) * 1000).toLocaleString()}</span></div>
            <div><span className="text-gray-600 font-semibold">Require Evidence:</span><span className="text-gray-800 ml-2">{info.requireEvidence ? "Yes" : "No"}</span></div>
            <div><span className="text-gray-600 font-semibold">Verification Mode:</span><span className="text-gray-800 ml-2">{info.verificationMode === 0 ? "No Verification" : info.verificationMode === 1 ? "Whitelist" : "Community"}</span></div>
            <div><span className="text-gray-600 font-semibold">Stake Amount:</span><span className="text-gray-800 ml-2">{ethers.formatEther(info.stakeAmount)} ETH</span></div>
            <div><span className="text-gray-600 font-semibold">Reward Pool:</span><span className="text-gray-800 ml-2">{ethers.formatEther(info.rewardPool)} ETH</span></div>
            <div className="col-span-2"><span className="text-gray-600 font-semibold">Rule CID:</span><span className="font-mono text-xs break-all text-gray-700 ml-2 bg-orange-50 px-3 py-2 rounded-lg inline-block">{info.journeyCID}</span></div>
          </div>
        )}
        {notStarted && <p className="mt-4 text-sm text-yellow-600 font-semibold bg-yellow-50 px-4 py-2 rounded-lg border-2 border-yellow-300">⚠ Journey not started</p>}
        {ended && <p className="mt-4 text-sm text-red-600 font-semibold bg-red-50 px-4 py-2 rounded-lg border-2 border-red-300">✕ Journey ended</p>}
        {joined && <p className="mt-4 text-sm text-green-600 font-semibold bg-green-50 px-4 py-2 rounded-lg border-2 border-green-300">✓ You have joined</p>}
      </div>

      {!joined && (
        <div className="warm-card p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Join Journey</h3>
          <button
            onClick={onJoin}
            disabled={!canJoin || joining}
            className="orange-button px-10 py-5 rounded-2xl text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {joining ? "Joining..." : canJoin ? "Confirm Join" : "Cannot Join"}
          </button>
          {info && Number(info.stakeAmount) > 0 && (
            <p className="mt-4 text-sm text-gray-600 font-medium">Stake required: {ethers.formatEther(info.stakeAmount)} ETH</p>
          )}
        </div>
      )}

      {joined && (
        <div className="warm-card p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Record Progress & Decrypt</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <button className="px-4 py-3 rounded-xl bg-white border-2 border-orange-200 hover:border-orange-400 text-gray-700 font-bold hover:bg-orange-50 transition-all" onClick={journey.refreshEncryptedProgressDays}>
              Refresh Handle
            </button>
            <button
              className="px-4 py-3 rounded-xl bg-white border-2 border-orange-200 hover:border-orange-400 disabled:opacity-50 text-gray-700 font-bold hover:bg-orange-50 transition-all"
              disabled={!journey.canDecrypt || journey.isDecrypting}
              onClick={journey.decryptProgressDays}
            >
              {journey.isDecrypting ? "Decrypting..." : "Decrypt Progress"}
            </button>
            <button
              className="orange-button rounded-xl py-3 disabled:opacity-50"
              disabled={!journey.canWrite || journey.isRecording}
              onClick={() => journey.recordProgress("")}
            >
              {journey.isRecording ? "Recording..." : "Record +1"}
            </button>
          </div>
          <div className="mt-6 p-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border-2 border-orange-200">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 font-semibold mb-2 uppercase tracking-wide text-xs">Encrypted Handle</p>
                <p className="font-mono text-xs break-all text-gray-700 bg-white px-3 py-2 rounded-lg">{journey.handle || "-"}</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold mb-2 uppercase tracking-wide text-xs">Plaintext Progress Days</p>
                {journey.isDecrypted ? (
                  <p className="text-4xl font-black gradient-text">{String(journey.clear)} days</p>
                ) : (
                  <p className="text-sm text-gray-400 italic font-medium">Not decrypted</p>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-700 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border-2 border-blue-200">
            <p className="font-bold mb-2 text-gray-800">Operation Log</p>
            <p className="font-mono text-xs text-gray-600">{journey.message || "-"}</p>
          </div>
        </div>
      )}
    </main>
  );
}
