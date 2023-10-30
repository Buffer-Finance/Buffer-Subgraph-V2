import {
  Create,
  CreateContract,
  Exercise,
  Expire,
  Pause,
} from "../generated/BufferBinaryOptions/BufferBinaryOptions";
import {
  CancelTrade,
  InitiateTrade,
  OpenTrade,
} from "../generated/BufferRouter/BufferRouter";
import {
  UpdateMaxFee,
  UpdateMaxPeriod,
  UpdateMinFee,
  UpdateMinPeriod,
} from "../generated/Config/Config";
import {
  CloseTournament,
  CreateTournament,
  EndTournament,
  StartTournament,
  VerifyTournament,
} from "../generated/TournamentManager/TournamentManager";
import {
  _handleUpdateMaxFee,
  _handleUpdateMaxPeriod,
  _handleUpdateMinFee,
  _handlehandleUpdateMinPeriod,
} from "./configContractHandlers";
import {
  _handleCreate,
  _handleCreateContract,
  _handleExercise,
  _handleExpire,
  _handlePause,
} from "./optionContractHandlers";
import {
  _handleCancelTrade,
  _handleInitiateTrade,
  _handleOpenTrade,
} from "./routerContractHandlers";
import { updateTournamentState } from "./tournamentManagerHandlers";

export function handleCreateContract(event: CreateContract): void {
  _handleCreateContract(event);
}

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

export function handlePause(event: Pause): void {
  _handlePause(event);
}

export function handleCreateTournament(event: CreateTournament): void {
  updateTournamentState(
    event.params.tournamentId,
    "Created",
    event.block.timestamp
  );
}

export function handleVerifyTournament(event: VerifyTournament): void {
  updateTournamentState(
    event.params.tournamentId,
    "Upcoming",
    event.block.timestamp
  );
}

export function handleStartTournament(event: StartTournament): void {
  updateTournamentState(
    event.params.tournamentId,
    "Live",
    event.block.timestamp
  );
}

export function handleCloseTournament(event: CloseTournament): void {
  updateTournamentState(
    event.params.tournamentId,
    "Closed",
    event.block.timestamp
  );
}

export function handleEndTournament(event: EndTournament): void {
  updateTournamentState(
    event.params.tournamentId,
    "Closed",
    event.block.timestamp
  );
}

export function handleUpdateMinPeriod(event: UpdateMinPeriod): void {
  _handlehandleUpdateMinPeriod(event);
}

export function handleUpdateMaxPeriod(event: UpdateMaxPeriod): void {
  _handleUpdateMaxPeriod(event);
}

export function handleUpdateMinFee(event: UpdateMinFee): void {
  _handleUpdateMinFee(event);
}

export function handleUpdateMaxFee(event: UpdateMaxFee): void {
  _handleUpdateMaxFee(event);
}
