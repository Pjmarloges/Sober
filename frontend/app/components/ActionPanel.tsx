"use client";
import React from "react";

interface ActionPanelProps {
  canWrite: boolean;
  canRead: boolean;
  canDecrypt: boolean;
  isDecrypting: boolean;
  isRecording: boolean;
  onStartJourney: () => void;
  onEnrollJourney: () => void;
  onRefreshHandle: () => void;
  onDecrypt: () => void;
  onRecordProgress: (cid: string) => void;
  onUpload: (file: File) => Promise<{ cid: string }>;
}

export function ActionPanel(props: ActionPanelProps) {
  const [ipfsFile, setIpfsFile] = React.useState<File | null>(null);
  const [cid, setCid] = React.useState<string>("");
  const [uploading, setUploading] = React.useState(false);

  const handleUpload = async () => {
    if (!ipfsFile) return;
    setUploading(true);
    try {
      const res = await props.onUpload(ipfsFile);
      setCid(res.cid);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Journey Operations */}
      <div className="warm-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-400 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">⚡</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Journey Operations</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={props.onStartJourney} 
              disabled={!props.canWrite}
              className="orange-button rounded-xl py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Journey
            </button>
            <button 
              onClick={props.onEnrollJourney} 
              disabled={!props.canWrite}
              className="px-6 py-4 rounded-xl bg-white border-3 border-orange-300 text-gray-700 font-bold shadow-lg hover:bg-orange-50 transition-all disabled:opacity-50"
            >
              Join Journey
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={props.onRefreshHandle} 
              disabled={!props.canRead}
              className="px-4 py-3 rounded-xl bg-white border-2 border-orange-200 text-gray-700 font-bold hover:bg-orange-50 transition-all disabled:opacity-50"
            >
              Refresh
            </button>
            <button 
              onClick={props.onDecrypt} 
              disabled={!props.canDecrypt}
              className="px-4 py-3 rounded-xl bg-white border-2 border-orange-200 text-gray-700 font-bold hover:bg-orange-50 transition-all disabled:opacity-50"
            >
              {props.isDecrypting ? "Decrypting..." : "Decrypt"}
            </button>
            <button 
              onClick={() => props.onRecordProgress(cid)} 
              disabled={!props.canWrite || props.isRecording}
              className="orange-button rounded-xl py-3 disabled:opacity-50"
            >
              {props.isRecording ? "Recording..." : "Record +1"}
            </button>
          </div>
        </div>
      </div>

      {/* IPFS Upload */}
      <div className="warm-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-red-400 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">📷</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Evidence Upload</h3>
        </div>
        <div className="space-y-4">
          <div className="border-3 border-dashed border-orange-300 rounded-xl p-6 bg-gradient-to-br from-orange-50 to-pink-50 hover:border-orange-400 transition-colors">
            <input
              type="file"
              onChange={(e) => setIpfsFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-orange-400 file:to-pink-400 file:text-white file:font-bold hover:file:from-orange-500 file:hover:to-pink-500 file:cursor-pointer"
              accept="image/*,video/*"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleUpload} 
              disabled={!ipfsFile || uploading}
              className="orange-button rounded-xl py-3 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload to IPFS"}
            </button>
            <input
              type="text"
              placeholder="Or enter CID"
              value={cid}
              onChange={(e) => setCid(e.target.value)}
              className="px-4 py-3 bg-white border-2 border-orange-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors text-gray-800 placeholder-gray-400"
            />
          </div>
          {cid && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-300">
              <p className="text-sm text-green-700 mb-2 font-bold">✓ IPFS CID</p>
              <p className="text-xs font-mono text-green-600 break-all mb-2">{cid}</p>
              <a
                href={`https://ipfs.io/ipfs/${cid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-orange-600 hover:text-orange-700 underline font-semibold"
              >
                View on IPFS →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
