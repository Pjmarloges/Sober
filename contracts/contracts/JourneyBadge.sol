// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title JourneyBadge - Simple demo NFT for progress rewards
/// @notice Tier1: first check-in; Tier30: 30 check-ins
contract JourneyBadge is ERC721, Ownable {
    uint256 private _nextTokenId = 1;
    string private _baseUriFirst;
    string private _baseUriThirty;

    mapping(uint256 => uint8) public tokenIdToTier; // 1 or 30
    mapping(address => bool) public mintedFirst;
    mapping(address => bool) public mintedThirty;

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) Ownable(msg.sender) {}

    function setBaseUris(string memory firstUri, string memory thirtyUri) external onlyOwner {
        _baseUriFirst = firstUri;
        _baseUriThirty = thirtyUri;
    }

    function claimFirst() external {
        require(!mintedFirst[msg.sender], "Already claimed first");
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        tokenIdToTier[tokenId] = 1;
        mintedFirst[msg.sender] = true;
    }

    function claimThirty() external {
        require(!mintedThirty[msg.sender], "Already claimed 30");
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        tokenIdToTier[tokenId] = 30;
        mintedThirty[msg.sender] = true;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "ERC721: invalid token");
        uint8 tier = tokenIdToTier[tokenId];
        if (tier == 30) return _baseUriThirty;
        return _baseUriFirst;
    }
}



