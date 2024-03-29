import { Create, Expire, Exercise, BufferBinaryOptions, UpdateReferral } from '../generated/BufferBinaryOptions/BufferBinaryOptions'
import { InitiateTrade, CancelTrade, BufferRouter, OpenTrade } from '../generated/BufferRouter/BufferRouter'
import { State } from './config'
import { UserOptionData, User, OptionContract, QueuedOptionData, ReferralData, OptionStat} from '../generated/schema'
import { BigInt } from '@graphprotocol/graph-ts'


export function handleInitiateTrade(event: InitiateTrade): void {
  let routerContract = BufferRouter.bind(event.address)
  let queueID = event.params.queueId
  let queuedTradeData = routerContract.queuedTrades(queueID)
  let contractAddress = queuedTradeData.value6

  let user = User.load(event.params.account)
  if (user == null) {
    let user = new User(event.params.account)
    user.address = event.params.account
    user.allActiveTrades = 0
    user.allExercisedTrades = 0
    user.allExpiredTrades = 0
    user.allTradesCount = 0
    user.save()  
  }

  let optionContract = OptionContract.load(contractAddress)
  if (optionContract == null) {
    let optionContract = new OptionContract(contractAddress)
    optionContract.address = contractAddress
    optionContract.save()  
  } 

  if (routerContract.contractRegistry(contractAddress)) {
    let referrenceID = `${queueID}${contractAddress}`
    let userOptionData = new QueuedOptionData(referrenceID)
    userOptionData.queueID = queueID
    userOptionData.user = event.params.account
    userOptionData.state = State.queued
    userOptionData.strike = queuedTradeData.value7
    userOptionData.totalFee = queuedTradeData.value3
    userOptionData.optionContract = contractAddress
    userOptionData.slippage = queuedTradeData.value8
    userOptionData.isAbove = queuedTradeData.value5 ? true : false
    userOptionData.save()
  }
}


export function handleOpenTrade(event: OpenTrade): void {
  let routerContract = BufferRouter.bind(event.address)
  let queueID = event.params.queueId
  let queuedTradeData = routerContract.queuedTrades(queueID)
  let contractAddress = queuedTradeData.value6
  let optionID = event.params.optionId
  let optionReferrenceID = `${optionID}${contractAddress}`
  if (routerContract.contractRegistry(contractAddress)) {
    let queueReferrenceID = `${queueID}${contractAddress}`  
    let userQueuedData = QueuedOptionData.load(queueReferrenceID)
    if (userQueuedData != null) {
      userQueuedData.state = State.undefined
      userQueuedData.save()  
    } 
    let userOptionData = UserOptionData.load(optionReferrenceID)
    if (userOptionData != null) {
      userOptionData.queueID = queueID
      userOptionData.save()  
    }
  }
}


export function handleCreate(event: Create): void {
  let optionID = event.params.id
  let contractAddress = event.address
  let contract = BufferBinaryOptions.bind(contractAddress)
  let optionData = contract.options(optionID)
  let referrenceID = `${event.params.id}${contractAddress}`
  let userOptionData = new UserOptionData(referrenceID)

  let user = User.load(event.params.account)
  if (user != null) {
    user.address = event.params.account
    user.allActiveTrades = user.allActiveTrades + 1
    user.allTradesCount = user.allTradesCount + 1
    user.save()  
  }
  let optionContract = OptionContract.load(contractAddress)
  if (optionContract != null) {
    let optionContractInstance = BufferBinaryOptions.bind(event.address)
    optionContract.asset = optionContractInstance.assetPair()
    optionContract.isPaused = optionContractInstance.isPaused() ? true : false
    optionContract.address = contractAddress
    optionContract.save()  
  } 

  userOptionData.optionID = event.params.id
  userOptionData.user = event.params.account
  userOptionData.totalFee = event.params.totalFee
  userOptionData.state = optionData.value0
  userOptionData.strike = optionData.value1
  userOptionData.amount = optionData.value2
  userOptionData.expirationTime = optionData.value5
  userOptionData.isAbove = optionData.value6 ? true : false
  userOptionData.creationTime = optionData.value8
  userOptionData.optionContract = contractAddress
  userOptionData.settlementFee = event.params.settlementFee
  userOptionData.save()

  const zero = new BigInt(0)
  let tokenReferrenceID = `USDC`

  let optionStats = OptionStat.load(tokenReferrenceID)
  if (optionStats == null) {
    let optionStats = new  OptionStat(tokenReferrenceID)
    optionStats.currentAbovePositions = zero
    optionStats.currentBelowPositions = zero
    optionStats.totalSettlementFees = zero
    optionStats.totalVolume = zero
    optionStats.save()
  } 
  let optionStatsV1 = OptionStat.load(tokenReferrenceID)
  if (optionStatsV1 != null) { 
    if (optionData.value6) {
      optionStatsV1.currentAbovePositions = optionStatsV1.currentAbovePositions.plus(event.params.totalFee)
    } else {
      optionStatsV1.currentBelowPositions = optionStatsV1.currentBelowPositions.plus(event.params.totalFee)
    }
    optionStatsV1.totalVolume = optionStatsV1.totalVolume.plus(event.params.totalFee)
    optionStatsV1.totalSettlementFees = optionStatsV1.totalSettlementFees.plus(event.params.settlementFee)
    optionStatsV1.save()
  }
}


export function handleCreateForBFR(event: Create): void {
  let optionID = event.params.id
  let contractAddress = event.address
  let contract = BufferBinaryOptions.bind(contractAddress)
  let optionData = contract.options(optionID)
  let referrenceID = `${event.params.id}${contractAddress}`
  let userOptionData = new UserOptionData(referrenceID)

  let user = User.load(event.params.account)
  if (user != null) {
    user.address = event.params.account
    user.allActiveTrades = user.allActiveTrades + 1
    user.allTradesCount = user.allTradesCount + 1
    user.save()  
  }
  let optionContract = OptionContract.load(contractAddress)
  if (optionContract != null) {
    let optionContractInstance = BufferBinaryOptions.bind(event.address)
    optionContract.asset = optionContractInstance.assetPair()
    optionContract.isPaused = optionContractInstance.isPaused() ? true : false
    optionContract.address = contractAddress
    optionContract.save()  
  } 

  userOptionData.optionID = event.params.id
  userOptionData.user = event.params.account
  userOptionData.totalFee = event.params.totalFee
  userOptionData.state = optionData.value0
  userOptionData.strike = optionData.value1
  userOptionData.amount = optionData.value2
  userOptionData.expirationTime = optionData.value5
  userOptionData.isAbove = optionData.value6 ? true : false
  userOptionData.creationTime = optionData.value8
  userOptionData.optionContract = contractAddress
  userOptionData.settlementFee = event.params.settlementFee
  userOptionData.save()
  let tokenReferrenceID = `BFR`

  const zero = new BigInt(0)
  let optionStats = OptionStat.load(tokenReferrenceID)
  if (optionStats == null) {
    let optionStats = new  OptionStat(tokenReferrenceID)
    optionStats.currentAbovePositions = zero
    optionStats.currentBelowPositions = zero
    optionStats.totalSettlementFees = zero
    optionStats.totalVolume = zero
    optionStats.save()
  } 
  let optionStatsV1 = OptionStat.load(tokenReferrenceID)
  if (optionStatsV1 != null) { 
    if (optionData.value6) {
      optionStatsV1.currentAbovePositions = optionStatsV1.currentAbovePositions.plus(event.params.totalFee)
    } else {
      optionStatsV1.currentBelowPositions =  optionStatsV1.currentBelowPositions.plus(event.params.totalFee)
    }
    optionStatsV1.totalVolume = optionStatsV1.totalVolume.plus(event.params.totalFee)
    optionStatsV1.totalSettlementFees = optionStatsV1.totalSettlementFees.plus(event.params.settlementFee)
    optionStatsV1.save()
  }
}


export function handleCancelTrade (event: CancelTrade): void {
  let queueID = event.params.queueId
  let routerContract = BufferRouter.bind(event.address)
  let queuedTradeData = routerContract.queuedTrades(queueID)
  let contractAddress = queuedTradeData.value6
  if (routerContract.contractRegistry(contractAddress)) {
    let referrenceID = `${queueID}${contractAddress}`
    let userQueuedData = QueuedOptionData.load(referrenceID)
    if (userQueuedData != null) {
      userQueuedData.state = State.cancelled
      userQueuedData.reason = event.params.reason
      userQueuedData.save()
    } else {
      throw new Error('Corresponding queued trade does not exist')
    }
  }
}


export function handleExercise(event: Exercise): void {
  let
  referrenceID = `${event.params.id}${event.address}`
  let userOptionData = UserOptionData.load(referrenceID)
  if (userOptionData != null) {
    let user = userOptionData.user
    userOptionData.state = State.exercised
    userOptionData.payout = event.params.profit
    userOptionData.expirationPrice = event.params.priceAtExpiration
    userOptionData.save()  

    let userObject = User.load(user)
    if (userObject != null) {
      userObject.allExercisedTrades = userObject.allExercisedTrades + 1
      userObject.allActiveTrades = userObject.allActiveTrades - 1
      userObject.save()  
    } else{
      throw new Error('Corresponding user does not exist')
    } 

  } 
}


export function handleExpire(event: Expire): void {
  let referrenceID = `${event.params.id}${event.address}`
  let userOptionData = UserOptionData.load(referrenceID)
  if (userOptionData != null) {
    let user = userOptionData.user
    userOptionData.state = State.expired
    userOptionData.expirationPrice = event.params.priceAtExpiration
    userOptionData.save()  

    let userObject = User.load(user)
    if (userObject != null) {
      userObject.allExpiredTrades = userObject.allExpiredTrades + 1
      userObject.allActiveTrades = userObject.allActiveTrades - 1
      userObject.save()  
    } else{
      throw new Error('Corresponding user does not exist')
    } 
  } 
}


export function handleUpdateReferral(event: UpdateReferral): void {
  let user = event.params.user
  let referrer = event.params.referrer
  const zero = new BigInt(0)
  
  let userReferralDataV1 = ReferralData.load(user)
  if (userReferralDataV1 == null) {
    let userReferralDataTemp = new ReferralData(user)
    userReferralDataTemp.user = user
    userReferralDataTemp.totalDiscountAvailed = zero
    userReferralDataTemp.totalRebateEarned = zero
    userReferralDataTemp.totalTradesReferred = 0
    userReferralDataTemp.totalTradingVolume = zero
    userReferralDataTemp.totalVolumeOfReferredTrades = zero
    userReferralDataTemp.save()  
  } 
  let userReferralDataV2 = ReferralData.load(user)
  if (userReferralDataV2 != null) {
    if (event.params.isReferralValid) {
      let discount = event.params.rebate.div(BigInt.fromI32(6))
      userReferralDataV2.totalDiscountAvailed = userReferralDataV2.totalDiscountAvailed.plus(discount)
      userReferralDataV2.totalTradingVolume = userReferralDataV2.totalTradingVolume.plus(event.params.totalFee)
      userReferralDataV2.save() 
    }  
  }

  let referrerReferralDataV1 = ReferralData.load(referrer)
  if (referrerReferralDataV1 == null) {
    let referrerReferralDataV1Temp = new ReferralData(referrer)
    referrerReferralDataV1Temp.user = referrer
    referrerReferralDataV1Temp.totalDiscountAvailed = zero
    referrerReferralDataV1Temp.totalRebateEarned = zero
    referrerReferralDataV1Temp.totalTradesReferred = 0
    referrerReferralDataV1Temp.totalTradingVolume = zero
    referrerReferralDataV1Temp.totalVolumeOfReferredTrades = zero
    referrerReferralDataV1Temp.save()  
  }

  let referrerReferralDataV2 = ReferralData.load(referrer)
  if (referrerReferralDataV2 != null) {
    referrerReferralDataV2.totalTradesReferred = referrerReferralDataV2.totalTradesReferred + 1
    referrerReferralDataV2.totalVolumeOfReferredTrades = referrerReferralDataV2.totalVolumeOfReferredTrades.plus(event.params.totalFee)
    referrerReferralDataV2.totalRebateEarned = referrerReferralDataV2.totalRebateEarned.plus(event.params.referrerFee)
    referrerReferralDataV2.save()   
  }
}

