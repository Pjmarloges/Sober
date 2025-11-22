"use client";

import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { useState, useMemo, useEffect } from "react";
import { ethers } from "ethers";
import { getSoberJourneyAddressByChainId, getBadgeAddressByChainId } from "@/config/addresses";
import { JourneyBadgeABI } from "@/abi/JourneyBadgeABI";
import { SoberJourneyFHEABI } from "@/abi/SoberJourneyFHEABI";

export default function RewardsPage() {
  const { chainId, ethersReadonlyProvider, ethersSigner, isConnected, connect } = useMetaMaskEthersSigner();
  const challengeAddress = useMemo(() => getSoberJourneyAddressByChainId(chainId), [chainId]);
  const badgeAddress = useMemo(() => getBadgeAddressByChainId(chainId), [chainId]);

  const [myCount, setMyCount] = useState<number>(0);
  const [mintedFirst, setMintedFirst] = useState<boolean>(false);
  const [mintedThirty, setMintedThirty] = useState<boolean>(false);
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    const run = async () => {
      if (!ethersReadonlyProvider || !challengeAddress || !ethersSigner) return;
      try {
        const me = await ethersSigner.getAddress();
        const c = new ethers.Contract(challengeAddress, SoberJourneyFHEABI.abi, ethersReadonlyProvider);
        // Use correct event name: ProgressRecorded
        const filter = c.filters.ProgressRecorded(null, me);
        const logs = await c.queryFilter(filter, 0, "latest");
        setMyCount(logs.length);

        if (badgeAddress) {
          const b = new ethers.Contract(badgeAddress, JourneyBadgeABI.abi, ethersReadonlyProvider);
          try { setMintedFirst(Boolean(await b.mintedFirst(me))); } catch {}
          try { setMintedThirty(Boolean(await b.mintedThirty(me))); } catch {}
        }
      } catch (e: any) {
        setMsg(`Error: ${e?.message || String(e)}`);
        console.error("Rewards page error:", e);
      }
    };
    run();
  }, [ethersReadonlyProvider, challengeAddress, badgeAddress, ethersSigner]);

  const claimFirst = async () => {
    if (!ethersSigner || !badgeAddress) return;
    setMsg("Claiming first badge...");
    try {
      const b = new ethers.Contract(badgeAddress, JourneyBadgeABI.abi, ethersSigner);
      const tx = await b.claimFirst();
      await tx.wait();
      setMintedFirst(true);
      setMsg("Claimed first badge!");
    } catch (e) { setMsg(String(e)); }
  };

  const claimThirty = async () => {
    if (!ethersSigner || !badgeAddress) return;
    setMsg("Claiming 30-days badge...");
    try {
      const b = new ethers.Contract(badgeAddress, JourneyBadgeABI.abi, ethersSigner);
      const tx = await b.claimThirty();
      await tx.wait();
      setMintedThirty(true);
      setMsg("Claimed 30-days badge!");
    } catch (e) { setMsg(String(e)); }
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-10 space-y-6">
      <h1 className="text-5xl font-black gradient-text">Rewards</h1>
      {!isConnected && (
        <div className="warm-card p-6 flex items-center justify-between">
          <span className="text-gray-700 font-medium">Please connect your wallet</span>
          <button onClick={connect} className="orange-button px-6 py-3 rounded-xl">Connect Wallet</button>
        </div>
      )}

      <div className="warm-card p-8 space-y-3">
        <p className="text-gray-700">Check-in count (from events): <span className="font-bold">{myCount}</span></p>
        <p className="text-gray-700 text-sm">Challenge Contract: <span className="font-mono">{challengeAddress || '-'}</span></p>
        <p className="text-gray-700 text-sm">Badge Contract: <span className="font-mono">{badgeAddress || '-'}</span></p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="warm-card p-8 space-y-3">
          <h3 className="text-2xl font-bold text-gray-800">First Check-in Badge</h3>
          <p className="text-gray-600 text-sm">Eligible after first record. Manual claim.</p>
          <button disabled={!(myCount>=1) || mintedFirst || !isConnected} onClick={claimFirst} className="orange-button rounded-xl disabled:opacity-50">{ mintedFirst ? 'Already Claimed' : 'Claim Badge' }</button>
        </div>
        <div className="warm-card p-8 space-y-3">
          <h3 className="text-2xl font-bold text-gray-800">30 Days Streak Badge</h3>
          <p className="text-gray-600 text-sm">Eligible after 30 records. Manual claim.</p>
          <button disabled={!(myCount>=30) || mintedThirty || !isConnected} onClick={claimThirty} className="orange-button rounded-xl disabled:opacity-50">{ mintedThirty ? 'Already Claimed' : 'Claim Badge' }</button>
        </div>
      </div>

      {msg && (<div className="warm-card p-6"><p className="text-sm font-mono text-gray-700">{msg}</p></div>)}
    </main>
  );
}


