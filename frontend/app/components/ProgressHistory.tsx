"use client";

interface ProgressRecord {
  txHash: string;
  blockNumber: number;
  participant: string;
  dayIndex: number;
  reportCID: string;
}

export function ProgressHistory({ records }: { records: ProgressRecord[] }) {
  return (
    <div className="warm-card p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 17v-6h13M9 7h13M4 6h.01M4 12h.01M4 18h.01" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-800">Progress History</h3>
      </div>
      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-4 min-h-[80px] max-h-[260px] overflow-y-auto border-2 border-orange-200">
        {records.length === 0 ? (
          <p className="text-center py-8 text-gray-400 font-medium">No records yet. Start your journey!</p>
        ) : (
          <div className="space-y-3">
            {records.map((r, idx) => (
              <div key={r.txHash + idx} className="bg-white rounded-xl p-4 border-2 border-orange-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-800 text-lg">Day {r.dayIndex + 1}</span>
                  <a 
                    className="text-orange-600 hover:text-orange-700 font-semibold text-sm underline" 
                    href={`https://sepolia.etherscan.io/tx/${r.txHash}`} 
                    target="_blank" 
                    rel="noreferrer"
                  >
                    View Transaction
                  </a>
                </div>
                {r.reportCID && (
                  <div className="mt-2 text-xs text-gray-600 break-all bg-orange-50 px-3 py-2 rounded-lg">
                    CID: {r.reportCID}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
