import { Transfer } from "../generated/BFR/BFR";

export function handleTransfer(event: Transfer): void {
  _handleTransfer(event);
}



function loadOrCreateBFRHolderData(timestamp: BigInt, period: string, id: string): BFRHolderData {
  let entity = BFRHolderData.load(id);
  if (!entity) {
    entity = new BFRHolderData(id);
    entity.holders = 0;
    entity.period = period;
    entity.timestamp = timestamp;
    entity.save();
  }
  return entity;
}