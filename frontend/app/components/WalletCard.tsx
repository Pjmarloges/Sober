"use client";

interface WalletCardProps {
  chainId?: number;
  account?: string;
  isConnected: boolean;
  onConnect: () => void;
}

export function WalletCard({ chainId, account, isConnected, onConnect }: WalletCardProps) {
  const chainName = chainId === 11155111 ? "Sepolia Testnet" : chainId === 31337 ? "Local Node" : `Chain ${chainId}`;
  
  return (
    <div className="warm-card p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Left: Icon and info */}
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-400 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Wallet Connection</h3>
            <p className="text-sm text-gray-500 mb-4">{chainName}</p>
            {account && (
              <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-4 border-2 border-orange-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Account Address</p>
                <p className="text-sm font-mono text-gray-800 break-all bg-white/60 px-3 py-2 rounded-lg">{account}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Connect button */}
        <div className="flex-shrink-0">
          {!isConnected ? (
            <button
              onClick={onConnect}
              className="orange-button px-8 py-4 text-lg rounded-2xl"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-3 border-green-300 shadow-lg">
              <div className="w-4 h-4 bg-green-400 rounded-full shadow-lg shadow-green-400/50"></div>
              <span className="text-green-700 font-bold text-lg">Connected</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
