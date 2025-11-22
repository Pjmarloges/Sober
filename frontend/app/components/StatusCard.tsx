"use client";

interface StatusCardProps {
  fhevmStatus: string;
  fhevmError?: Error;
  contractAddress?: string;
  handle?: string;
  clear?: string | bigint | boolean;
  isDecrypted: boolean;
}

export function StatusCard({ fhevmStatus, fhevmError, contractAddress, handle, clear, isDecrypted }: StatusCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready": return { color: "from-green-400 to-emerald-500", text: "Ready", bg: "bg-green-50", border: "border-green-300" };
      case "loading": return { color: "from-blue-400 to-cyan-500", text: "Loading", bg: "bg-blue-50", border: "border-blue-300" };
      case "error": return { color: "from-red-400 to-pink-500", text: "Error", bg: "bg-red-50", border: "border-red-300" };
      default: return { color: "from-gray-400 to-gray-500", text: "Idle", bg: "bg-gray-50", border: "border-gray-300" };
    }
  };

  const statusBadge = getStatusBadge(fhevmStatus);

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* FHEVM Instance */}
      <div className="warm-card p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-14 h-14 bg-gradient-to-br ${statusBadge.color} rounded-xl flex items-center justify-center text-white text-xl font-black shadow-lg`}>
            FHE
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">FHEVM Engine</h3>
            <p className="text-xs text-gray-500">Encrypted Computing</p>
          </div>
        </div>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm border-2 ${statusBadge.border} ${statusBadge.bg}`}>
          <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${statusBadge.color}`}></span>
          <span className="text-gray-700">{statusBadge.text}</span>
        </div>
        {fhevmError && (
          <div className="mt-4 p-3 bg-red-50 border-2 border-red-200 rounded-xl">
            <p className="text-sm text-red-600 font-medium">{fhevmError.message}</p>
          </div>
        )}
      </div>

      {/* Contract Status */}
      <div className="warm-card p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-pink-400 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Contract Status</h3>
            <p className="text-xs text-gray-500">On-chain Deployment</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Contract Address</p>
            <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg p-3 border-2 border-orange-200">
              <p className="text-sm font-mono text-gray-800 break-all">{contractAddress || "-"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${contractAddress ? "bg-green-400 shadow-lg shadow-green-400/50" : "bg-gray-300"}`}></span>
            <span className="text-sm font-semibold text-gray-700">{contractAddress ? "Deployed" : "Not Deployed"}</span>
          </div>
        </div>
      </div>

      {/* Progress Days */}
      <div className="warm-card p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Progress Days</h3>
            <p className="text-xs text-gray-500">Encrypted Protection</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Encrypted Handle</p>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 border-2 border-yellow-200">
              <p className="text-xs font-mono text-gray-700 break-all">{handle || "-"}</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Plaintext Value</p>
            {isDecrypted ? (
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black gradient-text">{String(clear)}</span>
                <span className="text-lg text-gray-600 font-bold">days</span>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic font-medium">Waiting for decryption</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
