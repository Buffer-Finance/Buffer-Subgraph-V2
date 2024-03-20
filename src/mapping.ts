import {
  Create as CreateAB,
  CreateMarket,
} from "../generated/AboveBelowBufferBinaryOptions/AboveBelowBufferBinaryOptions";
import {
  OpenTrade as AboveBelowOpenTrade,
  CancelTrade,
  InitiateTrade,
} from "../generated/AboveBelowBufferRouter/AboveBelowBufferRouter";
import {
  Create,
  CreateOptionsContract,
  Exercise,
  Expire,
  LpLoss,
  LpProfit,
  Pause,
  UpdateReferral,
} from "../generated/BufferBinaryOptions/BufferBinaryOptions";
import { OpenTrade } from "../generated/BufferRouter/BufferRouter";
import {
  Exercise as ExerciseV1,
  Expire as ExpireV1,
} from "../generated/V1Options/V1Options";
import { _handleCreateOptionsContract } from "./configContractHandlers";
import {
  _handleCreate,
  _handleCreateAB,
  _handleCreateMarket,
  _handleExercise,
  _handleExerciseV1,
  _handleExpire,
  _handleExpireV1,
  _handleLpLoss,
  _handleLpProfit,
  _handlePause,
  _handleUpdateReferral,
} from "./optionContractHandlers";
import {
  _handleAboveBelowCancelTrade,
  _handleAboveBelowInitiateTrade,
  _handleAboveBelowOpenTrade,
  _handleOpenTrade,
} from "./routerContractHandlers";

export function handleOpenTrade(event: OpenTrade): void {
  _handleOpenTrade(event);
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

export function handleCreateOptionsContract(
  event: CreateOptionsContract
): void {
  _handleCreateOptionsContract(event);
}

export function handleExpireV1(event: ExpireV1): void {
  _handleExpireV1(event);
}

export function handleExerciseV1(event: ExerciseV1): void {
  _handleExerciseV1(event);
}

export function handleLpProfit(event: LpProfit): void {
  _handleLpProfit(event);
}

export function handleLpLoss(event: LpLoss): void {
  _handleLpLoss(event);
}

export function handleCreateAB(event: CreateAB): void {
  _handleCreateAB(event);
}

export function handleCreateMarketAB(event: CreateMarket): void {
  _handleCreateMarket(event);
}

export function handleAboveBelowInitiateTrade(event: InitiateTrade): void {
  _handleAboveBelowInitiateTrade(event);
}

export function handleAboveBelowCancelTrade(event: CancelTrade): void {
  _handleAboveBelowCancelTrade(event);
}

export function handleAboveBelowOpenTrade(event: AboveBelowOpenTrade): void {
  _handleAboveBelowOpenTrade(event);
}
