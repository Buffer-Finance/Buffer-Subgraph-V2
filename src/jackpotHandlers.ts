import { Address } from "@graphprotocol/graph-ts";
import { JackpotWinningsTransferred } from "../generated/IncentivePool/IncentivePool";
import { ConfigContract, OptionContract } from "../generated/schema";
import { ADDRESS_ZERO } from "./config";
import {
  _loadorCreateJackpotData
} from "./initialize";

const zeroAddress = "0x0000000000000000000000000000000000000000";


export function _handleJackpotWinningsTransferred(
    event: JackpotWinningsTransferred
  ): void {
    const jackpotInstance = _loadorCreateJackpotData(
      event.transaction.hash.toHexString() + "-" + event.logIndex.toString(),
      Address.fromBytes(event.params.token).toHexString(),
      event.params.amount,
      event.params.to.toString(),
      event.params.queueId,
      event.block.timestamp
    );
  }
