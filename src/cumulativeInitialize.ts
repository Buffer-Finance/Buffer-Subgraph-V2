import { BigInt } from "@graphprotocol/graph-ts";
import { VolumeStat } from "../generated/schema";
import { ZERO } from "./initialize";

export function _loadOrCreateCumulativeVolumeStat(
  id: string,
  period: string,
  timestamp: BigInt
): VolumeStat {
  const idSlug = period;
  let entity = VolumeStat.load(id + idSlug);
  const lastdayid = BigInt.fromString(id).minus(BigInt.fromI32(1));
  let lastDayEntity = VolumeStat.load(lastdayid.toString() + idSlug);
  if (lastDayEntity === null) {
    entity = new VolumeStat(id + idSlug);
    entity.period = period;
    entity.timestamp = timestamp;
    entity.amount = ZERO;
    entity.VolumeUSDC = ZERO;
    entity.VolumeARB = ZERO;
    entity.VolumeBFR = ZERO;
    entity.save();
  } else if (entity === null && lastDayEntity !== null) {
    entity = new VolumeStat(id + idSlug);
    entity.period = period;
    entity.timestamp = timestamp;
    entity.amount = lastDayEntity.amount;
    entity.VolumeUSDC = lastDayEntity.VolumeUSDC;
    entity.VolumeARB = lastDayEntity.VolumeARB;
    entity.VolumeBFR = lastDayEntity.VolumeBFR;
    entity.save();
  } else if (entity !== null && lastDayEntity !== null) {
    entity.amount = lastDayEntity.amount.plus(entity.amount);
    entity.VolumeUSDC = lastDayEntity.VolumeUSDC.plus(entity.VolumeUSDC);
    entity.VolumeARB = lastDayEntity.VolumeARB.plus(entity.VolumeARB);
    entity.VolumeBFR = lastDayEntity.VolumeBFR.plus(entity.VolumeBFR);
    entity.save();
  }
  return entity as VolumeStat;
}
