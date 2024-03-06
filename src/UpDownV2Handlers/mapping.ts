import {
  CancelTrade,
  ContractRegistryUpdated,
  OpenTrade,
} from "../../generated/V2_Router/V2_Router";
import {
  CancelTrade as CancelTrade_2,
  ContractRegistryUpdated as ContractRegistryUpdated_2,
  OpenTrade as OpenTrade_2,
} from "../../generated/V2_Router_2/V2_Router_2";
import {
  CancelTrade as CancelTrade_3,
  ContractRegistryUpdated as ContractRegistryUpdated_3,
  OpenTrade as OpenTrade_3,
} from "../../generated/V2_Router_3/V2_Router_3";
import { registerAmarket } from "../commons";

// V2 Router 1
export function handleV2ContractRegistryUpdated(
  event: ContractRegistryUpdated
): void {
  if (event.params.register) {
    registerAmarket(event.params.targetContract, event.address);
  }
}

export function handleV2CancelTrade(event: CancelTrade): void {}

export function handleV2OpenTrade(event: OpenTrade): void {}

//V2 Router 2
export function handleV2ContractRegistryUpdated_2(
  event: ContractRegistryUpdated_2
): void {
  if (event.params.register) {
    registerAmarket(event.params.targetContract, event.address);
  }
}

export function handleV2CancelTrade_2(event: CancelTrade_2): void {}

export function handleV2OpenTrade_2(event: OpenTrade_2): void {}

// V2 Router 3
export function handleV2ContractRegistryUpdated_3(
  event: ContractRegistryUpdated_3
): void {
  if (event.params.register) {
    registerAmarket(event.params.targetContract, event.address);
  }
}

export function handleV2CancelTrade_3(event: CancelTrade_3): void {}

export function handleV2OpenTrade_3(event: OpenTrade_3): void {}
