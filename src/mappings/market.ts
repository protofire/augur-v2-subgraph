import { Address, BigInt, Bytes, Value, log } from "@graphprotocol/graph-ts";
import {
  MarketCreated,
  MarketTransferred,
  MarketMigrated,
  MarketFinalized,
  MarketOIChanged
} from "../../generated/Augur/Augur";
import {
  getOrCreateUniverse,
  getOrCreateUser,
  getOrCreateMarket,
  getOrCreateMarketReport,
  getOrCreateDispute,
  createAndSaveCreateMarketEvent,
  createAndSaveMigrateMarketEvent,
  createAndSaveTransferMarketEvent,
  createAndSaveFinalizeMarketEvent,
  createAndSaveOIChangeMarketEvent,
  getMarketTypeFromInt,
  createOutcomesForMarket,
  updateOutcomesForMarket
} from "../utils/helpers";
import {
  ZERO_ADDRESS,
  BIGINT_ONE,
  BIGINT_ZERO,
  STATUS_SETTLED,
  STATUS_TRADING,
  STATUS_DISPUTING,
  STATUS_FINALIZED,
  STATUS_REPORTING
} from "../utils/constants";
import { toDecimal } from "../utils/decimals";

// - event: MarketCreated(indexed address,uint256,string,address,indexed address,address,uint256,int256[],uint8,uint256,bytes32[],uint256,uint256)
//   handler: handleMarketCreated

// MarketCreated(contract IUniverse universe, uint256 endTime, string extraInfo,
// contract IMarket market, address marketCreator, address designatedReporter,
// uint256 feePerCashInAttoCash, int256[] prices, enum IMarket.MarketType marketType,
// uint256 numTicks, bytes32[] outcomes, uint256 noShowBond, uint256 timestamp)

export function handleMarketCreated(event: MarketCreated): void {
  let universe = getOrCreateUniverse(event.params.universe.toHexString());
  let market = getOrCreateMarket(event.params.market.toHexString());
  let creator = getOrCreateUser(event.params.marketCreator.toHexString());
  let designatedReporter = getOrCreateUser(
    event.params.designatedReporter.toHexString()
  );

  market.creator = creator.id;
  market.universe = universe.id;
  market.owner = creator.id;
  market.extraInfo = event.params.extraInfo;
  market.numTicks = event.params.numTicks;
  market.designatedReporter = designatedReporter.id;
  market.endTimestamp = event.params.endTime;
  market.prices = event.params.prices;
  market.marketTypeRaw = event.params.marketType;
  market.marketType = getMarketTypeFromInt(event.params.marketType);
  market.timestamp = event.params.timestamp;
  market.noShowBond = event.params.noShowBond;
  market.status = STATUS_TRADING;
  market.numOutcomes = createOutcomesForMarket(
    event.params.outcomes,
    market.marketType,
    market.id
  );

  market.save();

  universe.save();

  creator.save();

  createAndSaveCreateMarketEvent(event);
}

// - event: MarketFinalized(indexed address,indexed address,uint256,uint256[])
//   handler: handleMarketFinalized

// MarketFinalized(address universe, address market, uint256 timestamp, uint256[] winningPayoutNumerators)

export function handleMarketFinalized(event: MarketFinalized): void {
  let market = getOrCreateMarket(event.params.market.toHexString());
  let dispute = getOrCreateDispute(event.params.market.toHexString());
  let marketReport = getOrCreateMarketReport(event.params.market.toHexString());

  dispute.isDone = true;

  market.status = STATUS_FINALIZED;

  marketReport.isFinal = true;
  marketReport.payoutNumerators = event.params.winningPayoutNumerators

  marketReport.save();
  market.save();
  dispute.save();

  createAndSaveFinalizeMarketEvent(event);

  updateOutcomesForMarket(market.id, marketReport.payoutNumerators, true);
}

// - event: MarketTransferred(indexed address,indexed address,address,address)
//   handler: handleMarketTransferred

// MarketTransferred(address universe, address market, address from, address to)

export function handleMarketTransferred(event: MarketTransferred): void {
  let market = getOrCreateMarket(event.params.market.toHexString());
  let newOwner = getOrCreateUser(event.params.to.toHexString());

  market.owner = newOwner.id;
  market.save();

  newOwner.save();

  createAndSaveTransferMarketEvent(event);
}

// - event: MarketMigrated(indexed address,indexed address,address)
//   handler: handleMarketTransferred

// MarketMigrated(address market, address originalUniverse, address newUniverse)

export function handleMarketMigrated(event: MarketMigrated): void {
  let market = getOrCreateMarket(event.params.market.toHexString());
  let originalUniverse = getOrCreateUniverse(
    event.params.originalUniverse.toHexString()
  );
  let newUniverse = getOrCreateUniverse(event.params.newUniverse.toHexString());

  market.universe = newUniverse.id;
  market.save();

  originalUniverse.save();

  newUniverse.save();

  createAndSaveMigrateMarketEvent(event);
}

// - event: MarketOIChanged(indexed address,indexed address,uint256)
//   handler: handleMarketOIChanged

export function handleMarketOIChanged(event: MarketOIChanged): void {
  let market = getOrCreateMarket(event.params.market.toHexString());
  market.openInterest = event.params.marketOI;
  market.save();

  createAndSaveOIChangeMarketEvent(event);
}
