import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts";
import { User, NFT, DailyUserStat } from "../generated/schema";
import { _getDayId } from "./helpers";
import {
  _loadOrCreateOptionContractEntity,
  _loadOrCreateUserStat,
} from "./initialize";
import {
  USDC_POL_POOL_CONTRACT,
  USDC_POOL_CONTRACT,
  ARB_POOL_CONTRACT,
  BFR,
  BFR_POOL_CONTRACT,
} from "./config";
import { ipfs, json, JSONValue } from "@graphprotocol/graph-ts";

const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

export function updateOptionContractData(
  increaseInOpenInterest: boolean,
  isAbove: boolean,
  totalFee: BigInt,
  contractAddress: Address
): string {
  let optionContractData = _loadOrCreateOptionContractEntity(contractAddress);
  let poolToken = optionContractData.pool;
  let poolAddress = Address.fromString(ADDRESS_ZERO);
  optionContractData.tradeCount += 1;
  optionContractData.volume = optionContractData.volume.plus(totalFee);
  if (isAbove) {
    optionContractData.openUp = increaseInOpenInterest
      ? optionContractData.openUp.plus(totalFee)
      : optionContractData.openUp.minus(totalFee);
  } else {
    optionContractData.openDown = increaseInOpenInterest
      ? optionContractData.openDown.plus(totalFee)
      : optionContractData.openDown.minus(totalFee);
  }
  optionContractData.openInterest = increaseInOpenInterest
    ? optionContractData.openInterest.plus(totalFee)
    : optionContractData.openInterest.minus(totalFee);
  if (poolToken == "USDC_POL") {
    poolAddress = Address.fromString(USDC_POL_POOL_CONTRACT);
  } else if (poolToken == "ARB") {
    poolAddress = Address.fromString(ARB_POOL_CONTRACT);
  } else if (poolToken == "USDC") {
    poolAddress = Address.fromString(USDC_POOL_CONTRACT);
  } else if (poolToken == "BFR") {
    poolAddress = Address.fromString(BFR_POOL_CONTRACT);
  }
  optionContractData.save();
  return poolToken;
}

export function logUser(timestamp: BigInt, account: Address): void {
  let user = User.load(account);
  let id = _getDayId(timestamp);
  let dailyUserStatid = `${id}-${account.toString()}`;
  let userStat = _loadOrCreateUserStat(id, "daily", timestamp);
  if (user == null) {
    let totalUserStat = _loadOrCreateUserStat("total", "total", timestamp);
    totalUserStat.uniqueCountCumulative =
      totalUserStat.uniqueCountCumulative + 1;
    totalUserStat.save();

    userStat.uniqueCount = userStat.uniqueCount + 1;
    userStat.save();

    user = new User(account);
    user.address = account;
    user.save();

    let dailyUserStat = new DailyUserStat(dailyUserStatid);
    dailyUserStat.save();
  } else {
    let entity = DailyUserStat.load(dailyUserStatid);
    if (entity == null) {
      userStat.existingCount += 1;
      userStat.save();
      entity = new DailyUserStat(dailyUserStatid);
      entity.save();
    }
  }
}

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
