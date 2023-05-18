import { Create } from "../generated/BufferBinaryOptions/BufferBinaryOptions";
import { Claim } from "../generated/FaucetLBFR/FaucetLBFR";
import {
  _loadOrCreateLBFRClaimDataPerUser,
  _loadOrCreateOptionContractEntity,
  _loadOrCreateLBFRStat,
  ZERO,
} from "./initialize";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { BufferRouter } from "../generated/BufferRouter/BufferRouter";
import { RouterAddress, LBFR_START_TIMESTAMP } from "./config";
import { updateLBFRStats } from "./aggregate";
import { _getWeekId } from "./helpers";
import {
  DropERC721,
  Transfer,
  TokenURIRevealed,
  TokensClaimed,
  TokensLazyMinted,
} from "../generated/DropERC721/DropERC721";
import { NFT, NFTBatch, UserNFT } from "../generated/schema";
import { _loadOrCreateNFT } from "./initialize";
import { _updateNFTMetadata } from "./core";

export function handleCreate(event: Create): void {
  let contractAddress = event.address;
  let routerContract = BufferRouter.bind(Address.fromString(RouterAddress));
  if (routerContract.contractRegistry(contractAddress) == true) {
    if (BigInt.fromI32(LBFR_START_TIMESTAMP) < event.block.timestamp) {
      let optionContract = _loadOrCreateOptionContractEntity(contractAddress);
      let token = optionContract.token;
      updateLBFRStats(
        token,
        event.block.timestamp,
        event.params.totalFee,
        event.params.account
      );
    }
  }
}

export function handleClaim(event: Claim): void {
  if (BigInt.fromI32(LBFR_START_TIMESTAMP) < event.block.timestamp) {
    let claimDataPerUser = _loadOrCreateLBFRClaimDataPerUser(
      event.params.account,
      event.block.timestamp
    );
    claimDataPerUser.claimed = claimDataPerUser.claimed.plus(
      event.params.claimedTokens
    );
    let LBFRStatTotal = _loadOrCreateLBFRStat(
      "total",
      event.block.timestamp,
      event.params.account,
      "total"
    );
    claimDataPerUser.claimable = LBFRStatTotal.lBFRAlloted.minus(
      claimDataPerUser.claimed
    );
    let LBFRStatWeekly = _loadOrCreateLBFRStat(
      "weekly",
      event.block.timestamp,
      event.params.account,
      event.params.weekID.toString()
    );
    LBFRStatWeekly.claimed = LBFRStatWeekly.claimed.plus(
      event.params.claimedTokens
    );
    LBFRStatWeekly.claimable = LBFRStatWeekly.claimable.minus(
      event.params.claimedTokens
    );
    LBFRStatTotal.claimed = LBFRStatTotal.claimed.plus(
      event.params.claimedTokens
    );
    LBFRStatTotal.claimable = LBFRStatTotal.claimable.minus(
      event.params.claimedTokens
    );
    claimDataPerUser.lastClaimedTimestamp = event.block.timestamp;
    claimDataPerUser.save();
    LBFRStatWeekly.save();
    LBFRStatTotal.save();
  }
}

export function handleLazyMint(event: TokensLazyMinted): void {
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

export function handleReveal(event: TokenURIRevealed): void {
  let nftContract = DropERC721.bind(event.address);
  let batchId = nftContract.getBatchIdAtIndex(event.params.index);
  let revealedURI = event.params.revealedURI;

  let batch = NFTBatch.load(batchId.toString());
  if (batch != null) {
    let allTokenIds = batch.tokenIds;
    for (let i = 0; i < allTokenIds.length; i++) {
      let nft = _loadOrCreateNFT(allTokenIds[i]);
      _updateNFTMetadata(nft, `${revealedURI}${allTokenIds[i]}`);
      nft.hasRevealed = true;
      nft.save();
    }
  }
}

export function handleNftTransfer(event: Transfer): void {
  let nft = _loadOrCreateNFT(event.params.tokenId);
  nft.owner = event.params.to;
  nft.save();
  let userNFT = UserNFT.load(event.params.to);
  if (userNFT == null) {
    userNFT = new UserNFT(event.params.to);
    let allTokenIds = new Array<BigInt>();
    allTokenIds.push(event.params.tokenId);
    userNFT.tokenIds = allTokenIds;
  } else {
    let allTokenIds = userNFT.tokenIds;
    allTokenIds.push(event.params.tokenId);
    userNFT.tokenIds = allTokenIds;
  }
  userNFT.save();
}

export function handleTokenClaim(event: TokensClaimed): void {
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
