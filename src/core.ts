import { BigInt, Address } from "@graphprotocol/graph-ts";
import { BufferBinaryOptions } from "../generated/BufferBinaryOptions/BufferBinaryOptions";
import { User } from "../generated/schema";
import { _getDayId } from "./helpers";
import {
  _loadOrCreateOptionContractEntity,
  _loadOrCreateUserStat,
  ZERO,
} from "./initialize";
import { DailyUserStat } from "../generated/schema";
import {
  USDC_POOL_CONTRACT,
  ARB_POOL_CONTRACT,
  USDC_POL_POOL_CONTRACT,
  BFR_POOL_CONTRACT,
  V2_ARB_POOL_CONTRACT,
  V2_USDC_POOL_CONTRACT,
} from "./config";

const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

export function updateOptionContractData(
  increaseInOpenInterest: boolean,
  totalFee: BigInt,
  contractAddress: Address
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

    // let dailyUserStat = new DailyUserStat(dailyUserStatid);
    // dailyUserStat.save();
  } else {
    let entity = DailyUserStat.load(dailyUserStatid);
    if (entity == null) {
      userStat.existingCount += 1;
      userStat.save();
      // entity = new DailyUserStat(dailyUserStatid);
      // entity.save();
    }
  }
}
