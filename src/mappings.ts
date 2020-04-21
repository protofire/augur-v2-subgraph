import { Address, BigInt, Bytes, Value, log } from "@graphprotocol/graph-ts";
import {
  MarketCreated,
  MarketTransferred,
  MarketMigrated,
  MarketFinalized,
  UniverseCreated,
  UniverseForked
} from "../generated/Augur/Augur";
import {
  getOrCreateUniverse,
  getOrCreateUser,
  getOrCreateMarket
} from "./utils/helpers";
import { ZERO_ADDRESS, BIGINT_ONE, BIGINT_ZERO } from "./utils/constants";
import { toDecimal } from "./utils/decimals";

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

  market.creator = creator.id;
  market.universe = universe.id;
  market.owner = creator.id;
  market.save();

  universe.save();

  creator.save();
}

// - event: MarketFinalized(indexed address,indexed address,uint256,uint256[])
//   handler: handleMarketFinalized

// MarketFinalized(address universe, address market, uint256 timestamp, uint256[] winningPayoutNumerators)

export function handleMarketFinalized(event: MarketFinalized): void {}

// - event: MarketTransferred(indexed address,indexed address,address,address)
//   handler: handleMarketTransferred

// MarketTransferred(address universe, address market, address from, address to)

export function handleMarketTransferred(event: MarketTransferred): void {
  let market = getOrCreateMarket(event.params.market.toHexString());
  let newOwner = getOrCreateUser(event.params.to.toHexString());

  market.owner = newOwner.id;
  market.save();

  newOwner.save();
}

// - event: MarketMigrated(indexed address,indexed address,address)
//   handler: handleMarketTransferred

// MarketMigrated(address market, address originalUniverse, address newUniverse)

export function handleMarketMigrated(event: MarketMigrated): void {}

// - event: UniverseCreated(indexed address,indexed address,uint256[],uint256)
//   handler: handleUniverseCreated

// UniverseCreated(address parentUniverse, address childUniverse, uint256[] payoutNumerators, uint256 creationTimestamp)

export function handleUniverseCreated(event: UniverseCreated): void {
  let childUniverse = getOrCreateUniverse(
    event.params.childUniverse.toHexString()
  );

  if (event.params.parentUniverse.toHexString() != ZERO_ADDRESS) {
    let parentUniverse = getOrCreateUniverse(
      event.params.parentUniverse.toHexString()
    );
    parentUniverse.save();

    childUniverse.parentUniverse = parentUniverse.id;
  }

  childUniverse.payoutNumerators = event.params.payoutNumerators;
  childUniverse.creationTimestamp = event.params.creationTimestamp;
  childUniverse.save();
}

// - event: UniverseForked(indexed address,address)
//   handler: handleUniverseForked

// UniverseForked(address universe, contract IMarket forkingMarket)

export function handleUniverseForked(event: UniverseForked): void {}
