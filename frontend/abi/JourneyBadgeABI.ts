export const JourneyBadgeABI = {
  abi: [
    { "inputs": [ {"internalType":"string","name":"name_","type":"string"}, {"internalType":"string","name":"symbol_","type":"string"}], "stateMutability":"nonpayable", "type":"constructor" },
    { "inputs": [], "name": "claimFirst", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "claimThirty", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [ {"internalType":"string","name":"firstUri","type":"string"}, {"internalType":"string","name":"thirtyUri","type":"string"}], "name": "setBaseUris", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [ {"internalType":"uint256","name":"tokenId","type":"uint256"}], "name": "tokenURI", "outputs": [ {"internalType":"string","name":"","type":"string"}], "stateMutability": "view", "type": "function" },
    { "inputs": [ {"internalType":"address","name":"","type":"address"}], "name": "mintedFirst", "outputs": [ {"internalType":"bool","name":"","type":"bool"} ], "stateMutability": "view", "type": "function" },
    { "inputs": [ {"internalType":"address","name":"","type":"address"}], "name": "mintedThirty", "outputs": [ {"internalType":"bool","name":"","type":"bool"} ], "stateMutability": "view", "type": "function" },
  ]
} as const;



