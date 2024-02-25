import { Bytes, JSONValue, ipfs, json } from "@graphprotocol/graph-ts";
import { NFT } from "../generated/schema";

export function _getMetaData(ipfs_json: Bytes): string[] {
  let nftImage = "";
  let nftTier = "";
  const value = json.fromBytes(ipfs_json).toObject();
  if (value) {
    const image = value.get("image");
    if (image) {
      nftImage = image.toString();
    }
    let attributes: JSONValue[];
    let _attributes = value.get("attributes");
    if (_attributes) {
      attributes = _attributes.toArray();

      for (let i = 0; i < attributes.length; i++) {
        let item = attributes[i].toObject();
        let trait: string;
        let traitName = item.get("trait_type");
        if (traitName) {
          trait = traitName.toString();
          let value: string;
          let traitValue = item.get("value");
          if (traitValue) {
            value = traitValue.toString();
            if (trait == "tier") {
              nftTier = value;
            }
          }
        }
      }
    }
  }
  return [nftImage, nftTier];
}

export function _updateNFTMetadata(nft: NFT, tokenUri: string): void {
  let ipfs_json = ipfs.cat(tokenUri.replace("ipfs://", ""));
  if (ipfs_json) {
    let metadata = _getMetaData(ipfs_json);
    nft.nftImage = metadata[0];
    nft.tier = metadata[1];
    nft.ipfs = tokenUri;
    nft.save();
  } else {
    _updateNFTMetadata(nft, tokenUri);
  }
}
