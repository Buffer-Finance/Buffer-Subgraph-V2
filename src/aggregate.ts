import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { _getWeekId } from "./helpers";
import { _loadOrCreateLBFRStat } from "./initialize";
import { Slabs, NFTBasedSlabs } from "./config";
import { convertARBToUSDC } from "./convertARBToUSDC";
import { UserNFT, NFT } from "../generated/schema";

const FACTOR_OF_18 = BigInt.fromI64(1000000000000000000);
const FACTOR_OF_6 = BigInt.fromI64(1000000);
const ZERO = BigInt.fromI32(0);
const FACTOR_OF_2 = BigInt.fromI32(100);

function getLbfrAlloted(userVolume: BigInt, hasTraderNFT: boolean): BigInt {
  let newSlabIndex = 0;

  for (let i = 0; i < Slabs.length; i++) {
    let currentSlab = Slabs[i];
    // let currentMinVolume = currentSlab[0];
    if (userVolume > currentSlab[0].times(FACTOR_OF_18)) {
      newSlabIndex = i;
    } else {
      break;
    }
  }
  let newSlab = Slabs[newSlabIndex];

  if (hasTraderNFT == true) {
    newSlab = NFTBasedSlabs[newSlabIndex];
  }

  return newSlab[2].times(FACTOR_OF_18).plus(
    userVolume
      .minus(newSlab[0].times(FACTOR_OF_18))
      .times(newSlab[1])
      .div(FACTOR_OF_2)
  );
}

function getCurrentSlab(userVolume: BigInt, hasTraderNFT: boolean): BigInt {
  let slabIndex = 0;

  for (let i = 0; i < Slabs.length; i++) {
    let currentSlab = Slabs[i];
    if (userVolume > currentSlab[0].times(FACTOR_OF_18)) {
      slabIndex = i;
    } else {
      break;
    }
  }
  if (hasTraderNFT == false) {
    return Slabs[slabIndex][1];
  } else {
    return NFTBasedSlabs[slabIndex][1];
  }
}

export function updateLBFRStats(
  token: string,
  timestamp: BigInt,
  totalFee: BigInt,
  userAddress: Bytes
): void {
  let weekID = _getWeekId(timestamp);
  let LBFRStat = _loadOrCreateLBFRStat(
    "weekly",
    timestamp,
    userAddress,
    weekID
  );
  let TotalLBFRStat = _loadOrCreateLBFRStat(
    "total",
    timestamp,
    userAddress,
    "total"
  );

  if (token == "USDC") {
    totalFee = totalFee.times(FACTOR_OF_18).div(FACTOR_OF_6);
    LBFRStat.volumeUSDC = LBFRStat.volumeUSDC.plus(totalFee);
    TotalLBFRStat.volumeUSDC = TotalLBFRStat.volumeUSDC.plus(totalFee);
  } else if (token == "ARB") {
    LBFRStat.volumeARB = LBFRStat.volumeARB.plus(totalFee);
    TotalLBFRStat.volumeARB = TotalLBFRStat.volumeARB.plus(totalFee);
    totalFee = convertARBToUSDC(totalFee)
      .times(FACTOR_OF_18)
      .div(FACTOR_OF_6);
  }
  let finalVolume = LBFRStat.volume.plus(totalFee);
  LBFRStat.volume = finalVolume;
  TotalLBFRStat.volume = TotalLBFRStat.volume.plus(totalFee);

  let hasTraderNFT = getSlabBasedOnNFTs(userAddress);
  let lbfrAlloted = getLbfrAlloted(finalVolume, hasTraderNFT).minus(
    TotalLBFRStat.lBFRAlloted
  );
  LBFRStat.lBFRAlloted = LBFRStat.lBFRAlloted.plus(lbfrAlloted);
  TotalLBFRStat.lBFRAlloted = TotalLBFRStat.lBFRAlloted.plus(lbfrAlloted);
  LBFRStat.claimable = LBFRStat.claimable.plus(lbfrAlloted);
  TotalLBFRStat.claimable = TotalLBFRStat.claimable.plus(lbfrAlloted);

  let slab = getCurrentSlab(finalVolume, hasTraderNFT);
  LBFRStat.currentSlab = slab;

  LBFRStat.save();
  TotalLBFRStat.save();
}

export function getSlabBasedOnNFTs(userAddress: Bytes): boolean {
  let nftsOwned = 0;
  let userNfts = UserNFT.load(userAddress);
  if (userNfts != null) {
    nftsOwned = userNfts.tokenIds.length;
    if (nftsOwned >= 10) {
      let diamond = false;
      let gold = false;
      let silver = false;
      let platinum = false;
      for (let i = 0; i < nftsOwned; i++) {
        let nft = NFT.load(userNfts.tokenIds[i].toString());
        if (nft == null) {
          continue;
        }
        if (nft.tier == "Diamond") {
          diamond = true;
        } else if (nft.tier == "Gold") {
          gold = true;
        } else if (nft.tier == "Silver") {
          silver = true;
        } else if (nft.tier == "Platinum") {
          platinum = true;
        }
      }
      if (diamond && gold && silver && platinum) {
        return true;
      }
    }
  }
  return false;
}
