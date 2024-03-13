import {
  BufferBinaryOptions,
  Create,
  CreateMarket,
  CreateOptionsContract,
  Exercise,
  Expire,
  Pause,
} from "../generated/BufferBinaryOptions/BufferBinaryOptions";
import { OptionContract } from "../generated/schema";
import { updateClosingStats, updateOpeningStats } from "./aggregate";
import { State } from "./config";
import { _loadOrCreateConfigContractEntity } from "./configContractHandlers";
import {
  _loadOrCreateMarket,
  _loadOrCreateOptionContractEntity,
  _loadOrCreateOptionDataEntity,
} from "./initialize";

export function _handleCreateContract(event: CreateOptionsContract): void {
  const contractAddress = event.address;
  const contractAddressString = contractAddress.toHexString();

  const optionContract = OptionContract.load(contractAddressString);

  if (optionContract !== null) {
    const optionContract = _loadOrCreateOptionContractEntity(
      contractAddressString
    );
    const configContractEntity = _loadOrCreateConfigContractEntity(
      event.params.config.toHexString()
    );
    let optionContractInstance = BufferBinaryOptions.bind(contractAddress);

    optionContract.token0 = event.params.token0;
    optionContract.token1 = event.params.token1;
    optionContract.config = configContractEntity.id;
    optionContract.poolContract = optionContractInstance.pool();
    // optionContract.routerContract = Address.fromHexString(RouterAddress);
    optionContract.save();
  }
}

export function _handleCreate(event: Create): void {
  let contractAddress = event.address;
  let contractAddressString = contractAddress.toHexString();
  const optionContract = OptionContract.load(contractAddressString);

  if (optionContract !== null) {
    let userOptionData = _loadOrCreateOptionDataEntity(
      event.params.id,
      contractAddressString
    );
    userOptionData.totalFee = event.params.totalFee;
    userOptionData.settlementFee = event.params.settlementFee;
    userOptionData.amount = event.params.amount;

    userOptionData.save();

    const market = _loadOrCreateMarket(
      event.params.marketId.concat(contractAddress)
    );
    if (market.skew !== event.params.skew) {
      market.skew = event.params.skew;
      market.save();
    }

    updateOpeningStats(
      event.block.timestamp,
      contractAddress.toHexString(),
      userOptionData.totalFee,
      userOptionData.settlementFee,
      userOptionData.isAbove
    );
  }
}

export function _handleExpire(event: Expire): void {
  const contractAddressString = event.address.toHexString();

  const optionContract = OptionContract.load(contractAddressString);

  if (optionContract !== null) {
    let userOptionData = _loadOrCreateOptionDataEntity(
      event.params.id,
      contractAddressString
    );
    userOptionData.state = State.expired;
    userOptionData.expirationPrice = event.params.priceAtExpiration;
    userOptionData.save();

    updateClosingStats(
      contractAddressString,
      userOptionData.totalFee,
      userOptionData.isAbove
    );
  }
}

export function _handleExercise(event: Exercise): void {
  const contractAddressString = event.address.toHexString();

  const optionContract = OptionContract.load(contractAddressString);

  if (optionContract !== null) {
    let userOptionData = _loadOrCreateOptionDataEntity(
      event.params.id,
      contractAddressString
    );
    userOptionData.state = State.exercised;
    userOptionData.payout = event.params.profit;
    userOptionData.expirationPrice = event.params.priceAtExpiration;
    userOptionData.save();

    updateClosingStats(
      contractAddressString,
      userOptionData.totalFee,
      userOptionData.isAbove
    );
  }
}

export function _handlePause(event: Pause): void {
  const contractAddressString = event.address.toHexString();

  const optionContract = OptionContract.load(contractAddressString);

  if (optionContract !== null) {
    let optionContract = _loadOrCreateOptionContractEntity(
      event.address.toHexString()
    );

    optionContract.isPaused = event.params.isPaused;
    optionContract.save();
  }
}

export function _handleCreateMarket(event: CreateMarket): void {
  const contractAddressString = event.address.toHexString();

  const optionContract = OptionContract.load(contractAddressString);

  if (optionContract !== null) {
    const optionContract = _loadOrCreateOptionContractEntity(
      event.params.optionsContract.toHexString()
    );
    const market = _loadOrCreateMarket(
      event.params.marketId.concat(event.params.optionsContract)
    );
    market.optionContract = optionContract.id;
    market.strike = event.params.strike;
    market.expiration = event.params.expiration;
    market.marketId = event.params.marketId;

    market.save();
  }
}
