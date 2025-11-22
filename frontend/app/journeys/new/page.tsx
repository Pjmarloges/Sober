"use client";

import { useState } from "react";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { useFhevm } from "@/fhevm/useFhevm";
import { getSoberJourneyAddressByChainId } from "@/config/addresses";
import { ethers } from "ethers";
import { SoberJourneyFHEABI } from "@/abi/SoberJourneyFHEABI";
import { pinFileToIPFS } from "@/utils/pinata";
import { useRouter } from "next/navigation";

export default function NewJourneyPage() {
  const router = useRouter();
  const { provider, chainId, ethersSigner, isConnected, connect } = useMetaMaskEthersSigner();
  const { instance } = useFhevm({ provider, chainId, enabled: true, initialMockChains: { 31337: "http://localhost:8545" } });
  // New, richer content fields (different from JieYan01)
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("alcohol-free");
  const [difficulty, setDifficulty] = useState("medium");
  const [name, setName] = useState("");
  const [days, setDays] = useState(30);
  const [requireEvidence, setRequireEvidence] = useState(true);
  const [verificationMode, setVerificationMode] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState("");

  const address = getSoberJourneyAddressByChainId(chainId);

  const onCreate = async () => {
    if (!ethersSigner || !address) return;
    setCreating(true);
    try {
      let cid = "";
      if (file) {
        const res = await pinFileToIPFS(file);
        cid = res.cid;
      }
      // Store a much richer metadata object on IPFS to differentiate the app
      const meta = {
        title,
        tagline,
        description,
        category,
        difficulty,
        name,
        days,
        requireEvidence,
        verificationMode,
        coverCid: cid,
        createdAt: Date.now(),
      };
      const blob = new Blob([JSON.stringify(meta)], { type: "application/json" });
      const metaFile = new File([blob], "journey.json", { type: "application/json" });
      const metaRes = await pinFileToIPFS(metaFile);
      const journeyCID = `ipfs://${metaRes.cid}`;

      const now = Math.floor(Date.now() / 1000);
      const start = now + 10;
      const end = now + days * 24 * 60 * 60;

      const contract = new ethers.Contract(address, SoberJourneyFHEABI.abi, ethersSigner);
      const tx = await contract.startJourney(
        journeyCID,
        start,
        end,
        days,
        0,
        ethers.ZeroAddress,
        requireEvidence,
        verificationMode,
        { value: 0 }
      );
      setMsg(`Transaction submitted: ${tx.hash}`);
      const receipt = await tx.wait();
      let journeyId: number | undefined = undefined;
      if (receipt?.logs) {
        for (const log of receipt.logs) {
          try {
            const iface = new ethers.Interface(SoberJourneyFHEABI.abi);
            const parsed = iface.parseLog({ data: log.data, topics: [...log.topics] });
            if (parsed?.name === "JourneyStarted") {
              journeyId = Number(parsed.args[0]);
              break;
            }
          } catch {}
        }
      }
      if (journeyId === undefined) {
        try {
          const filter = contract.filters.JourneyStarted?.();
          const logs = await contract.queryFilter(filter as any, receipt?.blockNumber, receipt?.blockNumber);
          const iface2 = new ethers.Interface(SoberJourneyFHEABI.abi);
          for (const log of logs) {
            try {
              const parsed2 = iface2.parseLog({ data: log.data, topics: [...log.topics] });
              if (parsed2?.name === "JourneyStarted") {
                journeyId = Number(parsed2.args[0]);
                break;
              }
            } catch {}
          }
        } catch {}
      }
      if (journeyId !== undefined) {
        router.push(`/journeys/${journeyId}`);
      } else {
        setMsg("Created successfully, but couldn't parse JourneyId. Please check the list page.");
      }
    } catch (e) {
      setMsg(String(e));
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
      <h1 className="text-5xl font-black gradient-text">Start New Journey</h1>
      {!isConnected && (
        <div className="warm-card p-6 flex items-center justify-between">
          <span className="text-gray-700 font-medium">Please connect your wallet first (Sepolia 11155111)</span>
          <button onClick={connect} className="orange-button px-6 py-3 rounded-xl">Connect Wallet</button>
        </div>
      )}
      <div className="warm-card p-8 space-y-6">
        {/* Journey Identity */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Journey Title *</label>
            <input className="w-full px-4 py-3 bg-white border-3 border-orange-200 rounded-xl focus:border-orange-400 outline-none text-gray-800" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="A memorable title for your journey" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Short Tagline</label>
            <input className="w-full px-4 py-3 bg-white border-3 border-orange-200 rounded-xl focus:border-orange-400 outline-none text-gray-800" value={tagline} onChange={(e)=>setTagline(e.target.value)} placeholder="One line that captures your motivation" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Detailed Description</label>
            <textarea className="w-full px-4 py-3 bg-white border-3 border-orange-200 rounded-xl focus:border-orange-400 outline-none text-gray-800 min-h-[100px]" value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Tell your story, goals and how you'll succeed..." />
          </div>
        </div>

        {/* Categorization & Style */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Category</label>
            <select className="w-full px-4 py-3 bg-white border-3 border-orange-200 rounded-xl focus:border-orange-400 outline-none text-gray-800" value={category} onChange={(e)=>setCategory(e.target.value)}>
              <option value="alcohol-free">Alcohol-Free</option>
              <option value="smoke-free">Smoke-Free</option>
              <option value="sugar-free">Sugar-Free</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Difficulty</label>
            <select className="w-full px-4 py-3 bg-white border-3 border-orange-200 rounded-xl focus:border-orange-400 outline-none text-gray-800" value={difficulty} onChange={(e)=>setDifficulty(e.target.value)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="extreme">Extreme</option>
            </select>
          </div>
        </div>

        {/* Core settings mapped to contract */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Challenge Days</label>
            <input type="number" min={1} className="w-full px-4 py-3 bg-white border-3 border-orange-200 rounded-xl focus:border-orange-400 outline-none text-gray-800" value={days} onChange={(e)=>setDays(Number(e.target.value)||30)} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Require Evidence</label>
            <select className="w-full px-4 py-3 bg-white border-3 border-orange-200 rounded-xl focus:border-orange-400 outline-none text-gray-800" value={requireEvidence?"1":"0"} onChange={(e)=>setRequireEvidence(e.target.value==="1")}> 
              <option value="1">Yes</option>
              <option value="0">No</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Verification Mode</label>
          <select className="w-full px-4 py-3 bg-white border-3 border-orange-200 rounded-xl focus:border-orange-400 outline-none text-gray-800" value={verificationMode} onChange={(e)=>setVerificationMode(Number(e.target.value))}>
            <option value={0}>No Verification</option>
            <option value={1}>Whitelist Verification</option>
            <option value={2}>Community Verification</option>
          </select>
        </div>

        {/* Media */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Cover/Rule File (Optional)</label>
          <input type="file" onChange={(e)=>setFile(e.target.files?.[0]||null)} className="text-gray-700" />
        </div>

        <button onClick={onCreate} disabled={creating || !ethersSigner || !address} className="orange-button w-full py-4 rounded-xl text-lg disabled:opacity-50">
          {creating?"Creating...":"Start Journey"}
        </button>
        {msg && <p className="text-sm text-gray-600 font-medium">{msg}</p>}
      </div>
    </main>
  );
}
