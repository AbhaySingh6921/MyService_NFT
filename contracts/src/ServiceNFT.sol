// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


/**
 * @title ServiceNFT (Multi-Mint Version)
 * @dev An ERC721 collection where each token represents a 10-year service agreement.
 * Mints one new token for each lottery winner.
 * The "void on transfer" logic is now tracked PER TOKEN.
 */
contract ServiceNFT is ERC721, Ownable {
    uint256 private _tokenIdCounter;

function _incrementCounter() internal {
    _tokenIdCounter += 1;
}

function _currentCounter() internal view returns (uint256) {
    return _tokenIdCounter;
}


    // --- State Variables ---
   
    address public lotteryContract;

    // We now store data FOR EACH token ID.
    mapping(uint256 => address) public originalWinner;
    mapping(uint256 => string) public msaURI;
    mapping(uint256 => bool) public isServiceVoid;

    // --- Events ---
    event ServiceAwarded(address indexed winner, uint256 indexed tokenId, string msaURI);
    event ServiceVoided(uint256 indexed tokenId);

    // --- Constructor ---
    constructor(address initialOwner) ERC721("10-Year Service NFT", "SVCNFT") Ownable(initialOwner) {}

    // --- Core Logic ---

    /**
     * @dev Called by the Lottery contract to mint a NEW NFT to the winner.
     */
   function awardToWinner(address _winner, string memory _msaURI) external returns (uint256) {
    require(msg.sender == lotteryContract, "Only lottery can award");

    _incrementCounter();
    uint256 newTokenId = _currentCounter();

    originalWinner[newTokenId] = _winner;
    msaURI[newTokenId] = _msaURI;
    isServiceVoid[newTokenId] = false;

    _safeMint(_winner, newTokenId);
    emit ServiceAwarded(_winner, newTokenId, _msaURI);
    return newTokenId;
}


    /**
     * @dev Voids the service agreement for a specific token ID.
     */
    function _voidService(uint256 tokenId) internal {
        isServiceVoid[tokenId] = true;
        emit ServiceVoided(tokenId);
    }

    /**
     * @dev Hook that checks for transfers.
     * This now checks the 'originalWinner' for the specific token being moved.
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        // _ownerOf is cheap 'view'
        address from = _ownerOf(tokenId); 

        // Check if this is a transfer (not mint or burn)
        if (from != address(0) && to != address(0)) {
            // Check if the sender is the original winner and is transferring to someone else
            if (
                originalWinner[tokenId] != address(0) &&
                from == originalWinner[tokenId] &&
                to != originalWinner[tokenId]
            ) {
                _voidService(tokenId);
            }
        }

        // Continue normal ERC721 logic
        return super._update(to, tokenId, auth);
    }

    // --- Metadata ---

    /**
     * @dev Returns the metadata URI for a specific token.
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
       require(_ownerOf(tokenId) != address(0), "Token does not exist");

        return msaURI[tokenId];
    }

    // --- Admin ---

    /**
     * @dev Sets the one-and-only trusted Lottery contract.
     */
    function setLotteryContract(address _lotteryContract) external onlyOwner {
        lotteryContract = _lotteryContract;
    }

    /*
     * @dev Inherited from Ownable:
     * function owner() public view returns (address)
     * function transferOwnership(address newOwner) public virtual onlyOwner
     */
}