import { JackpotTriggered } from "../generated/Jackpot/Jackpot";
import { RebateClaimed } from "../generated/TraderRebate/TraderRebate";
import { JackpotData, Rebate } from "../generated/schema";

export function handleRebateClaimed(event: RebateClaimed): void {
  const rebateEntity = new Rebate(
    event.params.weekId.toString() + event.params.user.toHexString()
  );

  rebateEntity.user = event.params.user;
  rebateEntity.amount = event.params.amount;
  rebateEntity.weekId = event.params.weekId;
  rebateEntity.timestamp = event.block.timestamp;
  rebateEntity.type = "Rebates";
  rebateEntity.save();
}

export function handleJackpotTriggered(event: JackpotTriggered): void {
  const jackpotEntity = new JackpotData(event.transaction.hash.toHexString());

  jackpotEntity.optionContract = event.params.optionContract;
  jackpotEntity.optionID = event.params.optionId;
  jackpotEntity.user = event.params.userAddress;
  jackpotEntity.timestamp = event.block.timestamp;
  jackpotEntity.amount = event.params.amount;
  jackpotEntity.routerContract = event.params.router;
  jackpotEntity.jackpotAmount = event.params.jackpotWinAmount;
  jackpotEntity.txn_hash = event.transaction.hash;
  jackpotEntity.save();
}
