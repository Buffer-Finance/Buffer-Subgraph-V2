import {
  Address,
  BigInt,
  Bytes,
  JSONValue,
  ipfs,
  json,
} from "@graphprotocol/graph-ts";
import { ABUser, DailyUserStat, NFT, User } from "../generated/schema";
import { _getDayId } from "./helpers";
import {
  ZERO,
  _loadOrCreateABUserStat,
  _loadOrCreateOptionContractEntity,
  _loadOrCreateUserStat,
} from "./initialize";

const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

export function updateOptionContractData(
  increaseInOpenInterest: boolean,
  totalFee: BigInt,
  contractAddress: string
): string {
  let optionContractData = _loadOrCreateOptionContractEntity(contractAddress);
  let poolToken = optionContractData.pool;
  // let poolAddress = Address.fromString(ADDRESS_ZERO);
  // let optionContractInstance = BufferBinaryOptions.bind(contractAddress);
  optionContractData.tradeCount += 1;
  optionContractData.volume = optionContractData.volume.plus(totalFee);
  optionContractData.openInterest = increaseInOpenInterest
    ? optionContractData.openInterest.plus(totalFee)
    : optionContractData.openInterest.minus(totalFee);
  optionContractData.currentUtilization = ZERO;
  // if (poolToken == "USDC_POL") {
  //   poolAddress = Address.fromString(USDC_POL_POOL_CONTRACT);
  // } else if (poolToken == "ARB") {
  //   poolAddress = Address.fromString(ARB_POOL_CONTRACT);
  // } else if (poolToken == "USDC") {
  //   poolAddress = Address.fromString(USDC_POOL_CONTRACT);
  // } else if (poolToken == "BFR") {
  //   poolAddress = Address.fromString(BFR_POOL_CONTRACT);
  // } else if (poolToken == "V2_ARB") {
  //   poolAddress = Address.fromString(V2_ARB_POOL_CONTRACT);
  // } else if (poolToken == "V2_USDC") {
  //   poolAddress = Address.fromString(V2_USDC_POOL_CONTRACT);
  // }

  optionContractData.save();
  return poolToken;
}

export function logUser(timestamp: BigInt, account: string): void {
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
    user.address = Address.fromString(account);
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

export function logABUser(timestamp: BigInt, account: string): void {
  let user = ABUser.load(account);
  let id = _getDayId(timestamp);
  let dailyUserStatid = `${id}-${account.toString()}`;
  let userStat = _loadOrCreateABUserStat(id, "daily", timestamp);
  if (user == null) {
    let totalUserStat = _loadOrCreateABUserStat("total", "total", timestamp);
    totalUserStat.uniqueCountCumulative =
      totalUserStat.uniqueCountCumulative + 1;
    totalUserStat.save();

    userStat.uniqueCount = userStat.uniqueCount + 1;
    userStat.save();

    user = new ABUser(account);
    user.address = Address.fromString(account);
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
