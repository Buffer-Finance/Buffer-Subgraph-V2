import { V1_Market } from "../../generated/V1_Router/V1_Market";
import { InitiateTrade, V1_Router } from "../../generated/V1_Router/V1_Router";
import { OptionContract } from "../../generated/schema";
import { getPoolNameFromAddress } from "../commons";
import { ZERO } from "../config";

export function _handleV1InitiateTrade(event: InitiateTrade): void {
  const router = V1_Router.bind(event.address);
  const queuedTradeData = router.queuedTrades(event.params.queueId);
  const marketAddress = queuedTradeData.value6;

  let market = OptionContract.load(marketAddress.toHexString());

  if (market == null) {
    market = new OptionContract(marketAddress.toHexString());

    const marketContractInstance = V1_Market.bind(marketAddress);
    const poolContract = marketContractInstance.pool();

    market.address = marketAddress;
    market.category = marketContractInstance.assetCategory();
    market.isPaused = false;
    market.asset = marketContractInstance.assetPair();
    market.poolContract = poolContract;
    market.pool = getPoolNameFromAddress(poolContract);
    market.token = market.pool.split("_")[0];
    market.routerContract = event.address;
    market.tradeCount = ZERO;
    market.volume = ZERO;
    market.openUp = ZERO;
    market.openDown = ZERO;
    market.openInterestUp = ZERO;
    market.openInterestDown = ZERO;
    market.save();
  }
}
