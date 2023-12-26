import {
  DeregisterAccount,
  RegisterAccount,
} from "../generated/AccountRegistrar/AccountRegistrar";
import { Transfer } from "../generated/BFR/BFR";
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
import {
  UpdateCreationWindowContract,
  UpdateEarlyClose,
  UpdateEarlyCloseThreshold,
  UpdateIV,
  UpdateIVFactorITM,
  UpdateIVFactorOTM,
  UpdateMarketOIConfigContract,
  UpdateMaxPeriod,
  UpdateMinFee,
  UpdateMinPeriod,
  UpdatePlatformFee,
  UpdatePoolOIConfigContract,
  UpdateSpreadConfig1,
  UpdateSpreadConfig2,
  UpdateSpreadFactor,
} from "../generated/BufferConfigUpdates/BufferConfig";
import {
  OpenTrade,
  RevokeRouter,
} from "../generated/BufferRouter/BufferRouter";
import {
  Transfer as NFTtransfer,
  TokensClaimed,
  TokensLazyMinted,
} from "../generated/DropERC721/DropERC721";
import { TokenURIRevealed } from "../generated/OldDropERC721/DropERC721";
import {
  Exercise as ExerciseV1,
  Expire as ExpireV1,
} from "../generated/V1Options/V1Options";
import { _handleTransfer } from "./BFRTracking";
import {
  _handleCreateOptionsContract,
  _handleUpdateCreationWindowContract,
  _handleUpdateEarlyClose,
  _handleUpdateEarlyCloseThreshold,
  _handleUpdateIV,
  _handleUpdateIVFactorITM,
  _handleUpdateIVFactorOTM,
  _handleUpdateMaxPeriod,
  _handleUpdateMinFee,
  _handleUpdateMinPeriod,
  _handleUpdateOiconfigContract,
  _handleUpdatePlatformFee,
  _handleUpdatePoolOIContract,
  _handleUpdateSpreadConfig1,
  _handleUpdateSpreadConfig2,
  _handleUpdateSpreadFactor,
} from "./configContractHandlers";
import {
  _handleLazyMint,
  _handleNftTransfer,
  _handleReveal,
  _handleTokenClaim,
} from "./nftContractHandletrs";
import {
  _handleCreate,
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
  _handleDeregisterAccount,
  _handleOpenTrade,
  _handleRegisterAccount,
  _handleRevokeRouter,
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

export function handleLpProfit(event: LpProfit): void {
  _handleLpProfit(event);
}

export function handleLpLoss(event: LpLoss): void {
  _handleLpLoss(event);
}

export function handleUpdateIVFactorOTM(event: UpdateIVFactorOTM): void {
  _handleUpdateIVFactorOTM(event);
}

export function handleUpdateIVFactorITM(event: UpdateIVFactorITM): void {
  _handleUpdateIVFactorITM(event);
}

export function handleUpdateSpreadConfig1(event: UpdateSpreadConfig1): void {
  _handleUpdateSpreadConfig1(event);
}

export function handleUpdateSpreadConfig2(event: UpdateSpreadConfig2): void {
  _handleUpdateSpreadConfig2(event);
}
export function handleUpdateSpreadFactor(event: UpdateSpreadFactor): void {
  _handleUpdateSpreadFactor(event);
}
export function handleTransfer(event: Transfer): void {
  _handleTransfer(event);
}

export function handleRevokeRouter(event: RevokeRouter): void {
  _handleRevokeRouter(event);
}

export function handleNftTransfer(event: NFTtransfer): void {
  _handleNftTransfer(event);
}

export function handleTokenClaim(event: TokensClaimed): void {
  _handleTokenClaim(event);
}
export const handleReveal = (event: TokenURIRevealed): void => {
  _handleReveal(event);
};
export function handleLazyMint(event: TokensLazyMinted): void {
  _handleLazyMint(event);
}
