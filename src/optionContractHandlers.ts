import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  BufferBinaryOptions,
  Create,
  CreateContract,
  Exercise,
  Expire,
  Pause,
} from "../generated/BufferBinaryOptions/BufferBinaryOptions";
import { BufferRouter } from "../generated/BufferRouter/BufferRouter";
import { RouterAddress, State } from "./config";
import { _loadOrCreateConfigContractEntity } from "./configContractHandlers";
import { calculatePayout } from "./helpers";
import {
  _loadOrCreateOptionContractEntity,
  _loadOrCreateOptionDataEntity,
} from "./initialize";

export function _handleCreateContract(event: CreateContract): void {
  let contractAddress = event.address;
  let contractAddressString = contractAddress.toHexString();
  let routerContract = BufferRouter.bind(Address.fromString(RouterAddress));
  if (routerContract.contractRegistry(contractAddress) == true) {
    let optionContract = _loadOrCreateOptionContractEntity(
      contractAddressString
    );
    const configContractEntity = _loadOrCreateConfigContractEntity(
      event.params.config.toHexString()
    );
    optionContract.asset = event.params.assetPair;
    optionContract.config = configContractEntity.id;
    let optionContractInstance = BufferBinaryOptions.bind(
      Address.fromBytes(contractAddress)
    );
    optionContract.payoutForDown = calculatePayout(
      BigInt.fromI32(
        optionContractInstance.baseSettlementFeePercentageForBelow()
      )
    );
    optionContract.payoutForUp = calculatePayout(
      BigInt.fromI32(
        optionContractInstance.baseSettlementFeePercentageForAbove()
      )
    );
    optionContract.save();
  }
}

export function _handleCreate(event: Create): void {
  let contractAddress = event.address;
  let contractAddressString = contractAddress.toHexString();
  let routerContract = BufferRouter.bind(Address.fromString(RouterAddress));
  if (routerContract.contractRegistry(contractAddress) == true) {
    let optionID = event.params.id;
    let optionContractInstance = BufferBinaryOptions.bind(contractAddress);
    let optionData = optionContractInstance.options(optionID);
    let isAbove = optionData.value6 ? true : false;
    let totalFee = event.params.totalFee;
    let userOptionData = _loadOrCreateOptionDataEntity(
      optionID,
      contractAddressString
    );
    userOptionData.user = event.params.account;
    userOptionData.totalFee = totalFee;
    userOptionData.state = optionData.value0;
    userOptionData.strike = optionData.value1;
    userOptionData.amount = optionData.value2;
    userOptionData.expirationTime = optionData.value5;
    userOptionData.isAbove = isAbove;
    userOptionData.creationTime = optionData.value8;
    userOptionData.settlementFee = event.params.settlementFee;
    userOptionData.tournament = event.params.tournamentId.toString();
    userOptionData.save();
  }
}

export function _handleExpire(event: Expire): void {
  let contractAddress = event.address;
  let contractAddressString = contractAddress.toHexString();

  let routerContract = BufferRouter.bind(Address.fromString(RouterAddress));
  if (routerContract.contractRegistry(contractAddress) == true) {
    let userOptionData = _loadOrCreateOptionDataEntity(
      event.params.id,
      contractAddressString
    );
    userOptionData.state = State.expired;
    userOptionData.expirationPrice = event.params.priceAtExpiration;
    userOptionData.save();
  }
}

export function _handleExercise(event: Exercise): void {
  let contractAddress = event.address;
  let contractAddressString = contractAddress.toHexString();

  let routerContract = BufferRouter.bind(Address.fromString(RouterAddress));
  if (routerContract.contractRegistry(contractAddress) == true) {
    let userOptionData = _loadOrCreateOptionDataEntity(
      event.params.id,
      contractAddressString
    );
    userOptionData.state = State.exercised;
    userOptionData.payout = event.params.profit;
    userOptionData.expirationPrice = event.params.priceAtExpiration;
    userOptionData.save();
  }
}

export function _handlePause(event: Pause): void {
  let optionContract = _loadOrCreateOptionContractEntity(
    event.address.toHexString()
  );

  optionContract.isPaused = event.params.isPaused;
  optionContract.save();
}
