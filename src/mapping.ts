// export function handleInitiateTrade(event: InitiateTrade): void {
//   _handleInitiateTrade(event);
// }

import {
  Create,
  Exercise,
  Expire,
  Pause,
} from "../generated/BufferBinaryOptions/BufferBinaryOptions";
import {
  _handleCreate,
  _handleExercise,
  _handleExpire,
  _handlePause,
} from "./optionContractHandlers";

// export function handleOpenTrade(event: OpenTrade): void {
//   _handleOpenTrade(event);
// }

// export function handleCancelTrade(event: CancelTrade): void {
//   _handleCancelTrade(event);
// }

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
