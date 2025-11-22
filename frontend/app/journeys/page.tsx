"use client";

import Link from "next/link";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { useMemo, useEffect, useState } from "react";
import { ethers } from "ethers";
import { SoberJourneyFHEABI } from "@/abi/SoberJourneyFHEABI";
import { getSoberJourneyAddressByChainId } from "@/config/addresses";

type Item = { id: number; creator: string; cid: string; start: number; end: number };

export default function JourneysListPage() {
  const { chainId, ethersReadonlyProvider } = useMetaMaskEthersSigner();
  const address = useMemo(() => getSoberJourneyAddressByChainId(chainId), [chainId]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address || !ethersReadonlyProvider) return;
    setLoading(true);
    const contract = new ethers.Contract(address, SoberJourneyFHEABI.abi, ethersReadonlyProvider);
    (async () => {
      try {
        const filter = contract.filters.JourneyStarted();
        const logs = await contract.queryFilter(filter, 0, "latest");
        const iface = new ethers.Interface(SoberJourneyFHEABI.abi);
        const parsed: Item[] = [];
        for (const l of logs) {
          try {
            const p = iface.parseLog({ data: l.data, topics: [...l.topics] });
            if (p?.name === "JourneyStarted") {
              const id = Number(p.args[0]);
              const creator = String(p.args[1]);
              const cid = String(p.args[2]);
              parsed.push({ id, creator, cid, start: 0, end: 0 });
            }
          } catch {}
        }
        setItems(parsed.reverse());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [address, ethersReadonlyProvider]);

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-5xl font-black gradient-text">Journey List</h1>
        <Link href="/journeys/new" className="orange-button text-lg px-8 py-4 rounded-2xl">
          Start New Journey
        </Link>
      </div>
      {loading ? (
        <div className="warm-card p-12 text-center">
          <p className="text-gray-500 text-lg font-medium">Loading...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="warm-card p-12 text-center">
          <p className="text-gray-500 text-lg font-medium">No journeys yet. Click the button above to start one.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {items.map((it) => (
            <Link key={it.id} href={`/journeys/${it.id}`} className="warm-card p-6 block">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Journey ID</p>
                  <p className="text-3xl font-black gradient-text">#{it.id}</p>
                </div>
                <span className="text-orange-500 font-bold text-lg">View Details →</span>
              </div>
              <div className="mt-4 space-y-2">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Creator</p>
                  <p className="text-sm font-mono break-all text-gray-700 bg-orange-50 px-3 py-2 rounded-lg mt-1">{it.creator}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rule CID</p>
                  <p className="text-sm font-mono break-all text-gray-700 bg-orange-50 px-3 py-2 rounded-lg mt-1">{it.cid}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
