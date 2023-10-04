import { Address } from "@graphprotocol/graph-ts";
import { Transfer } from "../generated/BFR/BFR";
import { BURN_ADDRESS } from "./config";
import { _getDayId } from "./helpers";
import { _loadOrCreateBurnedBFR } from "./initialize";

export function _handleTransfer(event: Transfer): void {
  let timestamp = event.block.timestamp;
  if (event.params.to == Address.fromString(BURN_ADDRESS)) {
    //update total value
    const totalEntity = _loadOrCreateBurnedBFR("total", "total");
    totalEntity.amount = totalEntity.amount.plus(event.params.value);
    totalEntity.timestamp = timestamp;
    totalEntity.cumulativeAmount = totalEntity.cumulativeAmount.plus(
      event.params.value
    );
    totalEntity.save();

    //update daily value
    let id = _getDayId(timestamp);
    let entity = _loadOrCreateBurnedBFR("daily", id);
    entity.amount = entity.amount.plus(event.params.value);
    entity.timestamp = timestamp;

    //current cumulative amount is total cumulative amount till now
    entity.cumulativeAmount = totalEntity.cumulativeAmount;
    entity.save();
  }
}
