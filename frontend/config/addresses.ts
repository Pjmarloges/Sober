export function getSoberJourneyAddressByChainId(chainId: number | undefined): `0x${string}` | undefined {
  if (!chainId) return undefined;
  if (chainId === 31337) {
    // Fill after local deploy
    const addr = process.env.NEXT_PUBLIC_LOCAL_SOBER_JOURNEY_ADDRESS as `0x${string}` | undefined;
    return addr;
  }
  if (chainId === 11155111) {
    // Sepolia
    const envAddr = process.env.NEXT_PUBLIC_SEPOLIA_SOBER_JOURNEY_ADDRESS as `0x${string}` | undefined;
    // Fallback to deployed address if env is missing
    const fallback: `0x${string}` = "0x0000000000000000000000000000000000000000";
    return (envAddr && envAddr.startsWith("0x")) ? envAddr : fallback;
  }
  return undefined;
}

export function getBadgeAddressByChainId(chainId: number | undefined): `0x${string}` | undefined {
  if (!chainId) return undefined;
  if (chainId === 31337) {
    const addr = process.env.NEXT_PUBLIC_LOCAL_BADGE_ADDRESS as `0x${string}` | undefined;
    return addr;
  }
  if (chainId === 11155111) {
    const envAddr = process.env.NEXT_PUBLIC_SEPOLIA_BADGE_ADDRESS as `0x${string}` | undefined;
    const fallback: `0x${string}` = "0x0000000000000000000000000000000000000000";
    return (envAddr && envAddr.startsWith("0x")) ? envAddr : fallback;
  }
  return undefined;
}


