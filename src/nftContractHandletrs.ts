import { BigInt } from "@graphprotocol/graph-ts";
import {
  DropERC721,
  TokensClaimed,
  TokensLazyMinted,
  Transfer,
} from "../generated/DropERC721/DropERC721";
import { NFTBatch } from "../generated/schema";
import { _updateNFTMetadata } from "./core";
import { _loadOrCreateLeaderBoardUser, _loadOrCreateNFT } from "./initialize";

export function _handleLazyMint(event: TokensLazyMinted): void {
  let nftContract = DropERC721.bind(event.address);
  let endTokenId = event.params.endTokenId;
  let startTokenId = event.params.startTokenId;
  let batchId = endTokenId.plus(BigInt.fromI32(1));

  let batch = new NFTBatch(batchId.toString());
  let allTokenIds = new Array<BigInt>();
  for (
    let tokenId = startTokenId;
    tokenId <= endTokenId;
    tokenId = tokenId.plus(BigInt.fromI32(1))
  ) {
    let tokenUri = nftContract.tokenURI(tokenId);
    let nft = _loadOrCreateNFT(tokenId);
    _updateNFTMetadata(nft, tokenUri.toString());
    nft.batchId = batchId;
    nft.save();
    allTokenIds.push(tokenId);
  }
  batch.tokenIds = allTokenIds;
  batch.save();
}

// export function _handleReveal(event: TokenURIRevealed): void {
//   let nftContract = DropERC721.bind(event.address);
//   let batchId = nftContract.getBatchIdAtIndex(event.params.index);
//   let revealedURI = event.params.revealedURI;

//   let batch = NFTBatch.load(batchId.toString());
//   if (batch != null) {
//     let allTokenIds = batch.tokenIds;
//     for (let i = 0; i < allTokenIds.length; i++) {
//       let nft = _loadOrCreateNFT(allTokenIds[i]);
//       _updateNFTMetadata(nft, `${revealedURI}${allTokenIds[i]}`);
//       nft.hasRevealed = true;
//       nft.save();
//     }
//   }
// }

export function _handleNftTransfer(event: Transfer): void {
  let nft = _loadOrCreateNFT(event.params.tokenId);
  nft.owner = event.params.to;
  const transferFromUser = _loadOrCreateLeaderBoardUser(
    event.params.from.toHexString()
  );
  const transferToUser = _loadOrCreateLeaderBoardUser(
    event.params.to.toHexString()
  );
  let fromUserNFTs = transferFromUser.nfts;
  // Use a regular for loop for filtering the array
  for (let i = 0; i < fromUserNFTs.length; i++) {
    if (fromUserNFTs[i] == event.params.tokenId.toString()) {
      fromUserNFTs.splice(i, 1);
      break; // exit loop once the item is removed
    }
  }

  transferFromUser.nfts = fromUserNFTs;

  transferToUser.nfts.push(event.params.tokenId.toString());
  nft.save();
}

export function _handleTokenClaim(event: TokensClaimed): void {
  for (
    let tokenId = event.params.startTokenId;
    tokenId < event.params.startTokenId.plus(event.params.quantityClaimed);
    tokenId = tokenId.plus(BigInt.fromI32(1))
  ) {
    let nft = _loadOrCreateNFT(tokenId);
    nft.claimTimestamp = event.block.timestamp;
    nft.phaseId = event.params.claimConditionIndex;
    nft.save();
  }
}
