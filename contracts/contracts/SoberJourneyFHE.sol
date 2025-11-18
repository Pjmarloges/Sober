// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title SoberJourneyFHE - FHE-enabled sobriety journey contract
/// @notice Stores minimal indices on-chain and uses FHE to keep sensitive counters private.
contract SoberJourneyFHE is ZamaEthereumConfig {
    enum ParticipantStatus { Active, Failed, Completed, Withdrawn }

    struct Journey {
        uint256 journeyId;
        address creator;
        string journeyCID; // IPFS metadata CID
        uint256 startTime;
        uint256 endTime;
        uint256 daysTotal; // e.g., 30
        uint256 stakeAmount; // in wei; 0 if not required
        address stakeToken; // address(0) = ETH
        bool requireEvidence;
        uint8 verificationMode; // 0: none, 1: whitelist, 2: community
        uint256 rewardPool; // ETH stored in the contract
        bool finalized;
    }

    struct ParticipantRecord {
        address participant;
        uint256 enrolledAt;
        ParticipantStatus status;
        uint256 stakeLocked; // in wei
        euint32 encryptedProgressDays; // kept private via FHE
    }

    event JourneyStarted(uint256 indexed journeyId, address indexed creator, string journeyCID);
    event ParticipantEnrolled(uint256 indexed journeyId, address indexed participant);
    event ProgressRecorded(
        uint256 indexed journeyId,
        address indexed participant,
        uint256 dayIndex,
        string reportCID
    );
    event ProgressValidated(
        uint256 indexed journeyId,
        address indexed participant,
        uint256 dayIndex,
        address validator,
        bool approve
    );
    event ParticipantFailed(uint256 indexed journeyId, address indexed participant, string evidenceCID);
    event JourneyFinalized(uint256 indexed journeyId, uint256 rewardPool, uint256 winnersCount);
    event RewardsClaimed(uint256 indexed journeyId, address indexed participant, uint256 amount);

    uint256 public nextJourneyId = 1;

    mapping(uint256 => Journey) public journeys;
    mapping(uint256 => mapping(address => ParticipantRecord)) public participants; // journeyId => participant => record

    // ----------------------------------------
    // Start & Enroll
    // ----------------------------------------

    function startJourney(
        string calldata journeyCID,
        uint256 startTime,
        uint256 endTime,
        uint256 daysTotal,
        uint256 stakeAmount,
        address stakeToken,
        bool requireEvidence,
        uint8 verificationMode
    ) external payable returns (uint256 journeyId) {
        require(bytes(journeyCID).length > 0, "CID required");
        require(endTime > startTime, "Invalid time window");
        require(daysTotal > 0, "daysTotal=0");

        journeyId = nextJourneyId++;

        journeys[journeyId] = Journey({
            journeyId: journeyId,
            creator: msg.sender,
            journeyCID: journeyCID,
            startTime: startTime,
            endTime: endTime,
            daysTotal: daysTotal,
            stakeAmount: stakeAmount,
            stakeToken: stakeToken,
            requireEvidence: requireEvidence,
            verificationMode: verificationMode,
            rewardPool: msg.value, // allow creator to seed reward pool with ETH
            finalized: false
        });

        emit JourneyStarted(journeyId, msg.sender, journeyCID);
    }

    function enrollInJourney(uint256 journeyId) external payable {
        Journey storage j = journeys[journeyId];
        require(j.creator != address(0), "Journey not found");
        require(block.timestamp < j.endTime, "Journey ended");

        ParticipantRecord storage r = participants[journeyId][msg.sender];
        require(r.participant == address(0), "Already enrolled");

        if (j.stakeAmount > 0) {
            // Only ETH stake for MVP
            require(j.stakeToken == address(0), "ERC20 stake not supported in MVP");
            require(msg.value == j.stakeAmount, "Invalid stake value");
        } else {
            require(msg.value == 0, "No stake required");
        }

        r.participant = msg.sender;
        r.enrolledAt = block.timestamp;
        r.status = ParticipantStatus.Active;
        r.stakeLocked = msg.value;

        // Initialize encryptedProgressDays to encrypted zero, then set view permissions
        // Using explicit FHE.asEuint32(0) avoids operating on an uninitialized euint32
        r.encryptedProgressDays = FHE.asEuint32(0);
        FHE.allowThis(r.encryptedProgressDays);
        FHE.allow(r.encryptedProgressDays, msg.sender);

        emit ParticipantEnrolled(journeyId, msg.sender);
    }

    // ----------------------------------------
    // Progress & Validation
    // ----------------------------------------

    /// @notice Record daily progress and increment the encrypted progress days by an encrypted input.
    /// @dev Front-end must pass an encrypted value (typically 1) and its proof.
    function recordProgress(
        uint256 journeyId,
        string calldata reportCID,
        externalEuint32 encIncrement,
        bytes calldata inputProof
    ) external {
        Journey storage j = journeys[journeyId];
        require(j.creator != address(0), "Journey not found");
        require(block.timestamp >= j.startTime && block.timestamp <= j.endTime, "Not in time window");

        ParticipantRecord storage r = participants[journeyId][msg.sender];
        require(r.participant == msg.sender, "Not enrolled");
        require(r.status == ParticipantStatus.Active, "Not active");

        // Compute day index (0-based)
        uint256 dayIndex = (block.timestamp - j.startTime) / 1 days;
        require(dayIndex < j.daysTotal, "Out of range");

        // FHE add encrypted increment to encryptedProgressDays
        euint32 inc = FHE.fromExternal(encIncrement, inputProof);
        r.encryptedProgressDays = FHE.add(r.encryptedProgressDays, inc);

        // authorize decryption to contract and user
        FHE.allowThis(r.encryptedProgressDays);
        FHE.allow(r.encryptedProgressDays, msg.sender);

        emit ProgressRecorded(journeyId, msg.sender, dayIndex, reportCID);
    }

    function validateProgress(
        uint256 journeyId,
        address participant,
        uint256 dayIndex,
        bool approve,
        string calldata evidenceCID
    ) external {
        // MVP: emit-only, validation policy enforced off-chain or in future versions
        require(journeys[journeyId].creator != address(0), "Journey not found");
        emit ProgressValidated(journeyId, participant, dayIndex, msg.sender, approve);
        if (!approve) {
            emit ParticipantFailed(journeyId, participant, evidenceCID);
        }
    }

    // ----------------------------------------
    // Views & Finalization
    // ----------------------------------------

    function getJourneyInfo(uint256 journeyId) external view returns (Journey memory) {
        return journeys[journeyId];
    }

    function getParticipantInfo(uint256 journeyId, address participant) external view returns (ParticipantRecord memory) {
        return participants[journeyId][participant];
    }

    function getEncryptedProgressDays(uint256 journeyId, address participant) external view returns (euint32) {
        return participants[journeyId][participant].encryptedProgressDays;
    }

    function finalizeJourney(uint256 journeyId) external {
        Journey storage j = journeys[journeyId];
        require(j.creator != address(0), "Journey not found");
        require(!j.finalized, "Already finalized");
        require(block.timestamp > j.endTime, "Not ended");

        // MVP: mark finalized, distribution logic can be added later
        j.finalized = true;
        emit JourneyFinalized(journeyId, j.rewardPool, 0);
    }

    function claimRewards(uint256 journeyId) external {
        Journey storage j = journeys[journeyId];
        require(j.finalized, "Not finalized");
        // MVP: no reward distribution; emit zero for traceability
        emit RewardsClaimed(journeyId, msg.sender, 0);
    }
}



