import { Address, BigInt } from "@graphprotocol/graph-ts";
import { BufferBinaryOptions } from "../generated/BufferBinaryOptions/BufferBinaryOptions";
import { BufferRouter } from "../generated/BufferRouter/BufferRouter";
import {
  ABQueuedOptionData,
  ABUserOptionData,
  OptionContract,
  UserOptionData,
} from "../generated/schema";
import {
  ADDRESS_ZERO,
  AboveBelow_RouterAddress,
  AboveBelow_RouterAddress_2,
  RouterAddress,
  V2_RouterAddress,
  V2_RouterAddress_2,
  V2_RouterAddress_3,
} from "./config";
import { findPoolAndTokenFromPoolAddress } from "./configContractHandlers";
import { isContractRegisteredToRouter } from "./optionContractHandlers";

export const ZERO = BigInt.fromI32(0);

//TODO: Scan Config for settlement fee update
export function calculatePayout(settlementFeePercent: BigInt): BigInt {
  let payout = BigInt.fromI64(1000000000000000000).minus(
    settlementFeePercent.times(BigInt.fromI64(200000000000000))
  );
  return payout;
}

export function findRouterContract(address: string): string {
  const contractAddress = Address.fromString(address);
  const routerContract = BufferRouter.bind(Address.fromString(RouterAddress));
  const v2RouterContract = BufferRouter.bind(
    Address.fromString(V2_RouterAddress)
  );
  const v2RouterContract_2 = BufferRouter.bind(
    Address.fromString(V2_RouterAddress_2)
  );
  const v2RouterContract_3 = BufferRouter.bind(
    Address.fromString(V2_RouterAddress_3)
  );
  const aboveBelowRouterContract = BufferRouter.bind(
    Address.fromString(AboveBelow_RouterAddress)
  );
  const aboveBelowRouterContract_2 = BufferRouter.bind(
    Address.fromString(AboveBelow_RouterAddress_2)
  );

  if (routerContract.contractRegistry(contractAddress) == true) {
    return RouterAddress;
  } else if (
    aboveBelowRouterContract.try_contractRegistry(contractAddress).reverted ==
      false &&
    aboveBelowRouterContract.try_contractRegistry(contractAddress).value ==
      true &&
    aboveBelowRouterContract.contractRegistry(contractAddress) == true
  ) {
    return AboveBelow_RouterAddress;
  } else if (
    aboveBelowRouterContract_2.try_contractRegistry(contractAddress).reverted ==
      false &&
    aboveBelowRouterContract_2.try_contractRegistry(contractAddress).value ==
      true &&
    aboveBelowRouterContract_2.contractRegistry(contractAddress) == true
  ) {
    return AboveBelow_RouterAddress_2;
  } else if (
    v2RouterContract.try_contractRegistry(contractAddress).reverted == false &&
    v2RouterContract.try_contractRegistry(contractAddress).value == true &&
    v2RouterContract.contractRegistry(contractAddress) == true
  ) {
    return V2_RouterAddress;
  } else if (
    v2RouterContract_2.try_contractRegistry(contractAddress).reverted ==
      false &&
    v2RouterContract_2.try_contractRegistry(contractAddress).value == true &&
    v2RouterContract_2.contractRegistry(contractAddress) == true
  ) {
    return V2_RouterAddress_2;
  } else if (
    v2RouterContract_3.try_contractRegistry(contractAddress).reverted ==
      false &&
    v2RouterContract_3.try_contractRegistry(contractAddress).value == true &&
    v2RouterContract_3.contractRegistry(contractAddress) == true
  ) {
    return V2_RouterAddress_3;
  } else {
    return ADDRESS_ZERO;
  }
}

export function _loadOrCreateOptionContractEntity(
  contractAddress: string
): OptionContract {
  let optionContract = OptionContract.load(contractAddress);
  if (optionContract == null) {
    optionContract = new OptionContract(contractAddress);
    optionContract.address = Address.fromString(contractAddress);
    optionContract.volume = ZERO;
    optionContract.tradeCount = 0;
    optionContract.openDown = ZERO;
    optionContract.openUp = ZERO;
    optionContract.openInterest = ZERO;
    optionContract.currentUtilization = ZERO;
    //    optionContract.payoutForDown = ZERO;
    //    optionContract.payoutForUp = ZERO;
    optionContract.isPaused = false;
    optionContract.category = -1;
    optionContract.openInterestDown = ZERO;
    optionContract.openInterestUp = ZERO;

    if (
      optionContract.routerContract == ADDRESS_ZERO ||
      optionContract.routerContract == null
    )
      optionContract.routerContract = findRouterContract(contractAddress);

    let optionContractPool = Address.fromString(ADDRESS_ZERO);
    if (optionContract.routerContract == ADDRESS_ZERO) {
      optionContract.isPaused = true;
      optionContract.asset = "unknown";
    } else {
      if (isContractRegisteredToRouter(optionContract)) {
        let optionContractInstance = BufferBinaryOptions.bind(
          Address.fromString(contractAddress)
        );
        optionContract.asset = optionContractInstance.assetPair();
        optionContractPool = optionContractInstance.pool();
      } else {
      }

      const tokenPool = findPoolAndTokenFromPoolAddress(optionContractPool);
      optionContract.token = tokenPool[0];
      optionContract.pool = tokenPool[1];
      optionContract.save();
    }
  }
  return optionContract as OptionContract;
}

export function _loadOrCreateOptionDataEntity(
  optionID: BigInt,
  contractAddress: string
): UserOptionData {
  let referrenceID = `${optionID}${contractAddress}`;
  let entity = UserOptionData.load(referrenceID);
  if (entity == null) {
    entity = new UserOptionData(referrenceID);
    entity.optionID = optionID;
    entity.optionContract = contractAddress;
    entity.amount = ZERO;
    entity.totalFee = ZERO;
    entity.lag = ZERO;
    entity.creationEventTimeStamp = ZERO;
  }
  return entity as UserOptionData;
}

export function _loadOrCreateAboveBelowOptionDataEntity(
  optionID: BigInt,
  contractAddress: string
): ABUserOptionData {
  let referrenceID = `${optionID}${contractAddress}`;
  let entity = ABUserOptionData.load(referrenceID);
  if (entity == null) {
    entity = new ABUserOptionData(referrenceID);
    entity.optionID = optionID;
    entity.optionContract = contractAddress;
    entity.amount = ZERO;
    entity.totalFee = ZERO;
    entity.queuedTimestamp = ZERO;
    entity.lag = ZERO;
  }
  return entity as ABUserOptionData;
}

export function _loadOrCreateAboveBelowQueuedOptionEntity(
  queueID: BigInt,
  contractAddress: string
): ABQueuedOptionData {
  let referenceID = `${queueID}${contractAddress}`;
  let entity = ABQueuedOptionData.load(referenceID);
  if (entity == null) {
    entity = new ABQueuedOptionData(referenceID);
    entity.queueID = queueID;
    entity.optionContract = contractAddress;
    entity.queueTimestamp = ZERO;
    entity.cancelTimestamp = ZERO;
    entity.lag = ZERO;
    entity.processTime = ZERO;
    entity.maxFeePerContract = ZERO;
    entity.numberOfContracts = ZERO;
    entity.totalFee = ZERO;
    entity.save();
  }
  return entity as ABQueuedOptionData;
}
