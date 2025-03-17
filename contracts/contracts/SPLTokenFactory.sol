// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// Counters is removed in OpenZeppelin v5.0.0

/**
 * @title ContentToken
 * @dev ERC20 token representing tokenized social content
 */
contract ContentToken is ERC20, Ownable {
    string public contentType; // "post", "clip", "profile"
    string public contentHash; // IPFS hash of the content
    address public creator;
    uint256 public creationTime;
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        string memory _contentType,
        string memory _contentHash,
        address _creator
    ) ERC20(name, symbol) Ownable(_creator) {
        contentType = _contentType;
        contentHash = _contentHash;
        creator = _creator;
        creationTime = block.timestamp;
        _mint(_creator, initialSupply * 10**decimals());
    }
    
    function getContentDetails() public view returns (
        string memory _contentType,
        string memory _contentHash,
        address _creator,
        uint256 _creationTime
    ) {
        return (contentType, contentHash, creator, creationTime);
    }
}

/**
 * @title SPLTokenFactory
 * @dev Factory contract for creating content tokens
 */
contract SPLTokenFactory is Ownable {
    // Replace Counters with a simple uint256
    uint256 private _tokenCounter;
    
    uint256 public mintFee = 0.5 ether; // 0.5 SONIC
    address public feeReceiver;
    
    // Mapping from token ID to token address
    mapping(uint256 => address) public tokens;
    // Mapping from content hash to token ID
    mapping(string => uint256) public contentToToken;
    
    event TokenCreated(uint256 indexed tokenId, address tokenAddress, string contentType, string contentHash, address creator);
    
    constructor() Ownable(msg.sender) {
        feeReceiver = msg.sender;
    }
    
    function createToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        string memory contentType,
        string memory contentHash
    ) external payable returns (address) {
        require(msg.value >= mintFee, "Insufficient fee");
        require(contentToToken[contentHash] == 0, "Content already tokenized");
        
        // Transfer fee to receiver
        payable(feeReceiver).transfer(msg.value);
        
        // Create new token
        ContentToken newToken = new ContentToken(
            name,
            symbol,
            initialSupply,
            contentType,
            contentHash,
            msg.sender
        );
        
        // Increment counter manually
        _tokenCounter += 1;
        uint256 tokenId = _tokenCounter;
        
        tokens[tokenId] = address(newToken);
        contentToToken[contentHash] = tokenId;
        
        emit TokenCreated(tokenId, address(newToken), contentType, contentHash, msg.sender);
        
        return address(newToken);
    }
    
    function setMintFee(uint256 newFee) external onlyOwner {
        mintFee = newFee;
    }
    
    function setFeeReceiver(address newReceiver) external onlyOwner {
        feeReceiver = newReceiver;
    }
    
    function getTokenCount() external view returns (uint256) {
        return _tokenCounter;
    }
}