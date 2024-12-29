//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import {ERC721URIStorage, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract RealEstate is ERC721URIStorage {
    uint256 private _nextTokenId;
    constructor() ERC721("Real Estate", "REAL") {}

    function mint (string memory tokenURI) public returns (uint256){
         uint256 tokenId = _nextTokenId++;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        return tokenId;
    }
 
    function totalSupply() public view returns (uint256) {
        return _nextTokenId;
    }

}
