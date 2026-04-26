// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract DocumentVerifier {
    struct Document {
        address owner;
        uint256 timestamp;
        bool exists;
    }

    // Mapping from document hash to Document struct
    mapping(string => Document) public documents;

    // Event emitted when a document is registered
    event DocumentRegistered(string documentHash, address indexed owner, uint256 timestamp);

    /**
     * @dev Register a new document hash.
     * @param _hash The SHA-256 hash of the document.
     */
    function registerDocument(string memory _hash) public {
        require(!documents[_hash].exists, "Document has already been registered");

        documents[_hash] = Document({
            owner: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });

        emit DocumentRegistered(_hash, msg.sender, block.timestamp);
    }

    /**
     * @dev Verify a document hash.
     * @param _hash The SHA-256 hash of the document.
     * @return owner The address that registered the document.
     * @return timestamp The time when it was registered.
     */
    function verifyDocument(string memory _hash) public view returns (address owner, uint256 timestamp) {
        require(documents[_hash].exists, "Document not found in registry");

        Document memory doc = documents[_hash];
        return (doc.owner, doc.timestamp);
    }
}
