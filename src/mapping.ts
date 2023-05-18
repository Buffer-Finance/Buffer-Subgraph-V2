import {
  Create,
  Expire,
  Exercise,
  UpdateReferral,
  Pause,
  CreateOptionsContract,
} from "../generated/BufferBinaryOptions/BufferBinaryOptions";
import {
  UpdateMaxPeriod,
  UpdateMinFee,
  UpdateMinPeriod,
} from "../generated/BufferConfigUpdates/BufferConfig";
import {
  Provide,
  Withdraw,
  Profit,
  Loss,
} from "../generated/BinaryPool/BinaryPool";
import {
  InitiateTrade,
  CancelTrade,
  OpenTrade,
} from "../generated/BufferRouter/BufferRouter";
import {
  _handleCreate,
  _handleExpire,
  _handleExercise,
  _handleUpdateReferral,
  _handlePause,
} from "./optionContractHandlers";
import {
  _handleCancelTrade,
  _handleOpenTrade,
  _handleInitiateTrade,
} from "./routerContractHandlers";
import {
  _handleCreateOptionsContract,
  _handleUpdateMaxPeriod,
  _handleUpdateMinFee,
  _handleUpdateMinPeriod,
} from "./configContractHandlers";

export function handleInitiateTrade(event: InitiateTrade): void {
  _handleInitiateTrade(event);
}

export function handleOpenTrade(event: OpenTrade): void {
  _handleOpenTrade(event);
}

export function handleCancelTrade(event: CancelTrade): void {
  _handleCancelTrade(event);
}

export function handleCreate(event: Create): void {
  _handleCreate(event);
}

export function handleExercise(event: Exercise): void {
  _handleExercise(event);
}

export function handleExpire(event: Expire): void {
  _handleExpire(event);
}

export function handleUpdateReferral(event: UpdateReferral): void {
  _handleUpdateReferral(event);
}

export function handlePause(event: Pause): void {
  _handlePause(event);
}

export function handleProvide(event: Provide): void {
  let a = "a";
}

export function handleWithdraw(event: Withdraw): void {
  let a = "a";
}

export function handleProfit(event: Profit): void {
  let a = "a";
}

export function handleLoss(event: Loss): void {
  let a = "a";
}

export function handleCreateOptionsContract(
  event: CreateOptionsContract
): void {
  _handleCreateOptionsContract(event);
}

export function handleUpdateMinFee(event: UpdateMinFee): void {
  _handleUpdateMinFee(event);
}

export function handleUpdateMaxPeriod(event: UpdateMaxPeriod): void {
  _handleUpdateMaxPeriod(event);
}

export function handleUpdateMinPeriod(event: UpdateMinPeriod): void {
  _handleUpdateMinPeriod(event);
}
