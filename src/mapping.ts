import { Transfer } from "../generated/BFR/BFR";
import { _handleTransfer } from "./bfrHolders";

// export function handleSetFeeProtocol(event: SetFeeProtocol): void {
//   let a = "a";
// }

export function handleTransfer(event: Transfer): void {
  _handleTransfer(event);
}
