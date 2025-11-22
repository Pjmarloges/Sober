"use client";

import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { useFhevm } from "@/fhevm/useFhevm";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useSoberJourneyFHE } from "@/hooks/useSoberJourneyFHE";
import { Hero } from "@/app/components/Hero";
import { WalletCard } from "@/app/components/WalletCard";
import { StatusCard } from "@/app/components/StatusCard";
import { ActionPanel } from "@/app/components/ActionPanel";
import { MessageLog } from "@/app/components/MessageLog";
import { ProgressHistory } from "@/app/components/ProgressHistory";

export default function Home() {
  const { storage } = useInMemoryStorage();
  const {
    provider,
    chainId,
    isConnected,
    connect,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    accounts,
  } = useMetaMaskEthersSigner();

  const { instance, status, error, refresh } = useFhevm({
    provider,
    chainId,
    initialMockChains: { 31337: "http://localhost:8545" },
    enabled: true,
  });

  const journey = useSoberJourneyFHE({
    instance,
    storage,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    refreshFhevm: refresh,
  });

  return (
    <main className="min-h-screen">
      <Hero />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <WalletCard
          chainId={chainId}
          account={accounts?.[0]}
          isConnected={isConnected}
          onConnect={connect}
        />

        <StatusCard
          fhevmStatus={status}
          fhevmError={error}
          contractAddress={journey.contractAddress}
          handle={journey.handle}
          clear={journey.clear}
          isDecrypted={journey.isDecrypted}
        />

        <ActionPanel
          canWrite={journey.canWrite}
          canRead={journey.canRead}
          canDecrypt={journey.canDecrypt}
          isDecrypting={journey.isDecrypting}
          isRecording={journey.isRecording}
          onStartJourney={journey.startSampleJourney}
          onEnrollJourney={journey.enrollInSampleJourney}
          onRefreshHandle={() => { journey.refreshEncryptedProgressDays(); journey.loadProgressHistory(); }}
          onDecrypt={journey.decryptProgressDays}
          onRecordProgress={journey.recordProgress}
          onUpload={journey.uploadToIPFS}
        />

        <ProgressHistory records={journey.progressLogs} />
        <MessageLog message={journey.message} />
      </div>
    </main>
  );
}


