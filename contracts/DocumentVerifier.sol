// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract DocumentVerifier {
    struct Document {
        address owner;
        uint256 timestamp;
        bool exists;
    }

    mapping(string => Document) public documents;

    event DocumentRegistered(string documentHash, address indexed owner, uint256 timestamp);

    function registerDocument(string memory _hash) public {
        require(!documents[_hash].exists, "Document has already been registered");

        documents[_hash] = Document({
            owner: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });

        emit DocumentRegistered(_hash, msg.sender, block.timestamp);
    }

    function verifyDocument(string memory _hash) public view returns (address owner, uint256 timestamp) {
        require(documents[_hash].exists, "Document not found in registry");

        Document memory doc = documents[_hash];
        return (doc.owner, doc.timestamp);
    }
}
