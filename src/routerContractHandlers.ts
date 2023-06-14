import { Address } from "@graphprotocol/graph-ts";
import { _getDayId, _getHourId, _getWeekId } from "./helpers";
import {
  _loadOrCreateOptionContractEntity,
  _loadOrCreateOptionDataEntity,
  _loadOrCreateReferralData,
} from "./initialize";
import {
  BufferRouter,
  OpenTrade,
} from "../generated/BufferRouter/BufferRouter";
import { State, RouterAddress, ARBITRUM_SOLANA_ADDRESS } from "./config";
import { updateClosingStats } from "./aggregate";
import { UserOptionData } from "../generated/schema";

export function _handleOpenTrade(event: OpenTrade): void {
  let queueID = event.params.queueId;
  let contractAddress = event.params.targetContract;
  let userOptionData = UserOptionData.load(
    `${event.params.optionId}${contractAddress}`
  );
  if (userOptionData != null) {
    userOptionData.queueID = queueID;
    userOptionData.save();
  }
}
