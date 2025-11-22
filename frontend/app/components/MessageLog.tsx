"use client";

interface MessageLogProps {
  message: string;
}

export function MessageLog({ message }: MessageLogProps) {
  return (
    <div className="warm-card p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-800">Operation Log</h3>
      </div>
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 min-h-[80px] max-h-[200px] overflow-y-auto border-2 border-blue-200">
        {message ? (
          <p className="text-sm text-gray-700 font-mono leading-relaxed">{message}</p>
        ) : (
          <p className="text-center py-4 text-gray-400 font-medium italic">Waiting for operation...</p>
        )}
      </div>
    </div>
  );
}
