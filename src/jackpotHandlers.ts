import { JackpotTriggered } from "../generated/IncentivePool/IncentivePool";
import { _loadorCreateJackpotData } from "./initialize";
import { RebateClaimed } from "../generated/TraderRebate/TraderRebate";

const zeroAddress = "0x0000000000000000000000000000000000000000";

export function _handleJackpotWinningsTransferred(
  event: JackpotTriggered
): void {
  const jackpotInstance = _loadorCreateJackpotData(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString(),
    event.params.optionContract,
    event.params.amount,
    event.params.userAddress,
    event.params.optionId,
    event.block.timestamp,
    event.params.jackpotWinAmount,
    event.params.router,
    event.transaction.hash
  );
}


export function _handleTraderRebate(
  event: RebateClaimed
): void {
  const jackpotInstance = _loadorCreateJackpotData(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString(),
    event.params.optionContract,
    event.params.amount,
    event.params.userAddress,
    event.params.optionId,
    event.block.timestamp,
    event.params.jackpotWinAmount,
    event.params.router,
    event.transaction.hash
  );
}
