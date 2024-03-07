import {
  CancelTrade,
  InitiateTrade,
  OpenTrade,
} from "../../generated/V1_Router/V1_Router";
import { _handleV1InitiateTrade } from "./routerHandlers";

export function handleV1InitiateTrade(event: InitiateTrade): void {
  _handleV1InitiateTrade(event);
}

export function handleV1CancelTrade(event: CancelTrade): void {}

export function handleV1OpenTrade(event: OpenTrade): void {}
