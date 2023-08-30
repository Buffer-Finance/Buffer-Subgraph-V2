import {
  Create,
  Expire,
  Exercise,
  UpdateReferral,
  Pause,
  CreateOptionsContract,
} from "../generated/BufferBinaryOptions/BufferBinaryOptions";
import {
  UpdateCreationWindowContract,
  UpdateEarlyClose,
  UpdateEarlyCloseThreshold,
  UpdateIV,
  UpdateMarketOIConfigContract,
  UpdateMaxPeriod,
  UpdateMinFee,
  UpdateMinPeriod,
  UpdatePlatformFee,
  UpdatePoolOIConfigContract,
} from "../generated/BufferConfigUpdates/BufferConfig";
import {
  _handleCreate,
  _handleExpire,
  _handleExercise,
  _handleUpdateReferral,
  _handlePause,
  _handleExpireV1,
  _handleExerciseV1,
} from "./optionContractHandlers";
import {
  _handleOpenTrade,
  _handleDeregisterAccount,
  _handleRegisterAccount,
} from "./routerContractHandlers";
import {
  _handleCreateOptionsContract,
  _handleUpdateCreationWindowContract,
  _handleUpdateEarlyClose,
  _handleUpdateEarlyCloseThreshold,
  _handleUpdateIV,
  _handleUpdateMaxPeriod,
  _handleUpdateMinFee,
  _handleUpdateMinPeriod,
  _handleUpdateOiconfigContract,
  _handleUpdatePlatformFee,
  _handleUpdatePoolOIContract,
} from "./configContractHandlers";
import { OpenTrade } from "../generated/BufferRouter/BufferRouter";
import {
  RegisterAccount,
  DeregisterAccount,
} from "../generated/AccountRegistrar/AccountRegistrar";
import {
  Expire as ExpireV1,
  Exercise as ExerciseV1,
} from "../generated/V1Options/V1Options";

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

export function handleRegisterAccount(event: RegisterAccount): void {
  _handleRegisterAccount(event);
}

export function handleDeregisterAccount(event: DeregisterAccount): void {
  _handleDeregisterAccount(event);
}

export function handleUpdateEarlyCloseThreshold(
  event: UpdateEarlyCloseThreshold
): void {
  _handleUpdateEarlyCloseThreshold(event);
}

export function handleUpdateEarlyClose(event: UpdateEarlyClose): void {
  _handleUpdateEarlyClose(event);
}

export function handleUpdateOiconfigContract(
  event: UpdateMarketOIConfigContract
): void {
  _handleUpdateOiconfigContract(event);
}
export function handleUpdatePoolOIContract(
  event: UpdatePoolOIConfigContract
): void {
  _handleUpdatePoolOIContract(event);
}

export function handleUpdateIV(event: UpdateIV): void {
  _handleUpdateIV(event);
}

export function handleExpireV1(event: ExpireV1): void {
  _handleExpireV1(event);
}

export function handleExerciseV1(event: ExerciseV1): void {
  _handleExerciseV1(event);
}

export function handleUpdateCreationWindowContract(
  event: UpdateCreationWindowContract
): void {
  _handleUpdateCreationWindowContract(event);
}
