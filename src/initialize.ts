import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { NFT } from "../generated/schema";

export const ZERO = BigInt.fromI32(0);
export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

export function _loadOrCreateNFT(tokenId: BigInt): NFT {
  let referenceID = tokenId.toString();
  let entity = NFT.load(referenceID);
  if (entity == null) {
    entity = new NFT(referenceID);
    entity.batchId = ZERO;
    entity.tokenId = tokenId;
    entity.tier = "";
    entity.owner = Bytes.fromHexString(ADDRESS_ZERO);
    entity.nftImage = "";
    entity.ipfs = "";
    entity.hasRevealed = false;
    entity.save();
  }
  return entity as NFT;
}
