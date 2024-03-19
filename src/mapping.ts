import { RebateClaimed } from "../generated/TraderRebate/TraderRebate";
import { Rebate } from "../generated/schema";

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
