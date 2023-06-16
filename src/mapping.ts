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
  UpdatePlatformFee,
} from "../generated/BufferConfigUpdates/BufferConfig";
import {
  _handleCreate,
  _handleExpire,
  _handleExercise,
  _handleUpdateReferral,
  _handlePause,
} from "./optionContractHandlers";
import { _handleOpenTrade } from "./routerContractHandlers";
import {
  _handleCreateOptionsContract,
  _handleUpdateMaxPeriod,
  _handleUpdateMinFee,
  _handleUpdateMinPeriod,
  _handleUpdatePlatformFee,
} from "./configContractHandlers";
import { OpenTrade } from "../generated/BufferRouter/BufferRouter";

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

export function handleUpdateMinFee(event: UpdateMinFee): void {
  _handleUpdateMinFee(event);
}

export function handleUpdateMaxPeriod(event: UpdateMaxPeriod): void {
  _handleUpdateMaxPeriod(event);
}

export function handleUpdateMinPeriod(event: UpdateMinPeriod): void {
  _handleUpdateMinPeriod(event);
}

export function handleUpdatePlatformFee(event: UpdatePlatformFee): void {
  _handleUpdatePlatformFee(event);
}
