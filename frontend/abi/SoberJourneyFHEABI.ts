export const SoberJourneyFHEABI = {
  abi: [
    { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
    // Events
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "uint256", "name": "journeyId", "type": "uint256" },
        { "indexed": true, "internalType": "address", "name": "creator", "type": "address" },
        { "indexed": false, "internalType": "string", "name": "journeyCID", "type": "string" }
      ],
      "name": "JourneyStarted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "uint256", "name": "journeyId", "type": "uint256" },
        { "indexed": true, "internalType": "address", "name": "participant", "type": "address" }
      ],
      "name": "ParticipantEnrolled",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "uint256", "name": "journeyId", "type": "uint256" },
        { "indexed": true, "internalType": "address", "name": "participant", "type": "address" },
        { "indexed": false, "internalType": "uint256", "name": "dayIndex", "type": "uint256" },
        { "indexed": false, "internalType": "string", "name": "reportCID", "type": "string" }
      ],
      "name": "ProgressRecorded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "uint256", "name": "journeyId", "type": "uint256" },
        { "indexed": true, "internalType": "address", "name": "participant", "type": "address" },
        { "indexed": false, "internalType": "uint256", "name": "dayIndex", "type": "uint256" },
        { "indexed": true, "internalType": "address", "name": "validator", "type": "address" },
        { "indexed": false, "internalType": "bool", "name": "approve", "type": "bool" }
      ],
      "name": "ProgressValidated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "uint256", "name": "journeyId", "type": "uint256" },
        { "indexed": true, "internalType": "address", "name": "participant", "type": "address" },
        { "indexed": false, "internalType": "string", "name": "evidenceCID", "type": "string" }
      ],
      "name": "ParticipantFailed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "uint256", "name": "journeyId", "type": "uint256" },
        { "indexed": false, "internalType": "uint256", "name": "rewardPool", "type": "uint256" },
        { "indexed": false, "internalType": "uint256", "name": "winnersCount", "type": "uint256" }
      ],
      "name": "JourneyFinalized",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "uint256", "name": "journeyId", "type": "uint256" },
        { "indexed": true, "internalType": "address", "name": "participant", "type": "address" },
        { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
      ],
      "name": "RewardsClaimed",
      "type": "event"
    },
    {
      "inputs": [
        { "internalType": "string", "name": "journeyCID", "type": "string" },
        { "internalType": "uint256", "name": "startTime", "type": "uint256" },
        { "internalType": "uint256", "name": "endTime", "type": "uint256" },
        { "internalType": "uint256", "name": "daysTotal", "type": "uint256" },
        { "internalType": "uint256", "name": "stakeAmount", "type": "uint256" },
        { "internalType": "address", "name": "stakeToken", "type": "address" },
        { "internalType": "bool", "name": "requireEvidence", "type": "bool" },
        { "internalType": "uint8", "name": "verificationMode", "type": "uint8" }
      ],
      "name": "startJourney",
      "outputs": [{ "internalType": "uint256", "name": "journeyId", "type": "uint256" }],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "journeyId", "type": "uint256" }],
      "name": "getJourneyInfo",
      "outputs": [
        {
          "components": [
            { "internalType": "uint256", "name": "journeyId", "type": "uint256" },
            { "internalType": "address", "name": "creator", "type": "address" },
            { "internalType": "string", "name": "journeyCID", "type": "string" },
            { "internalType": "uint256", "name": "startTime", "type": "uint256" },
            { "internalType": "uint256", "name": "endTime", "type": "uint256" },
            { "internalType": "uint256", "name": "daysTotal", "type": "uint256" },
            { "internalType": "uint256", "name": "stakeAmount", "type": "uint256" },
            { "internalType": "address", "name": "stakeToken", "type": "address" },
            { "internalType": "bool", "name": "requireEvidence", "type": "bool" },
            { "internalType": "uint8", "name": "verificationMode", "type": "uint8" },
            { "internalType": "uint256", "name": "rewardPool", "type": "uint256" },
            { "internalType": "bool", "name": "finalized", "type": "bool" }
          ],
          "internalType": "struct SoberJourneyFHE.Journey",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "journeyId", "type": "uint256" },
        { "internalType": "address", "name": "participant", "type": "address" }
      ],
      "name": "getEncryptedProgressDays",
      "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "journeyId", "type": "uint256" },
        { "internalType": "address", "name": "participant", "type": "address" }
      ],
      "name": "getParticipantInfo",
      "outputs": [
        {
          "components": [
            { "internalType": "address", "name": "participant", "type": "address" },
            { "internalType": "uint256", "name": "enrolledAt", "type": "uint256" },
            { "internalType": "uint8", "name": "status", "type": "uint8" },
            { "internalType": "uint256", "name": "stakeLocked", "type": "uint256" },
            { "internalType": "bytes32", "name": "encryptedProgressDays", "type": "bytes32" }
          ],
          "internalType": "struct SoberJourneyFHE.ParticipantRecord",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "nextJourneyId",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "journeyId", "type": "uint256" }],
      "name": "enrollInJourney",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "journeyId", "type": "uint256" },
        { "internalType": "string", "name": "reportCID", "type": "string" },
        { "internalType": "bytes32", "name": "encIncrement", "type": "bytes32" },
        { "internalType": "bytes", "name": "inputProof", "type": "bytes" }
      ],
      "name": "recordProgress",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "journeyId", "type": "uint256" },
        { "internalType": "address", "name": "participant", "type": "address" },
        { "internalType": "uint256", "name": "dayIndex", "type": "uint256" },
        { "internalType": "bool", "name": "approve", "type": "bool" },
        { "internalType": "string", "name": "evidenceCID", "type": "string" }
      ],
      "name": "validateProgress",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
} as const;



