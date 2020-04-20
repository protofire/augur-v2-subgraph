import { Address, BigInt, Bytes, Value, log } from "@graphprotocol/graph-ts";
import {
  MarketCreated,
  MarketTransferred,
  MarketFinalized,
  UniverseCreated,
  UniverseForked
} from "../generated/Augur/Augur";
import {
  getOrCreateUniverse,
  getOrCreateMarket
} from "./utils/helpers";
import {
  ZERO_ADDRESS,
  BIGINT_ONE,
  BIGINT_ZERO,
} from "./utils/constants";
import { toDecimal } from "./utils/decimals";

// - event: MarketCreated(indexed address,uint256,string,address,indexed address,address,uint256,int256[],uint8,uint256,bytes32[],uint256,uint256)
//   handler: handleMarketCreated

export function handleMarketCreated(event: MarketCreated): void {

}

// - event: MarketFinalized(indexed address,indexed address,uint256,uint256[])
//   handler: handleMarketFinalized

export function handleMarketFinalized(event: MarketFinalized): void {

}

// - event: MarketTransferred(indexed address,indexed address,address,address)
//   handler: handleMarketTransferred

export function handleMarketTransferred(event: MarketTransferred): void {

}

// - event: UniverseCreated(indexed address,indexed address,uint256[],uint256)
//   handler: handleUniverseCreated

export function handleUniverseCreated(event: UniverseCreated): void {

}

// - event: UniverseForked(indexed address,address)
//   handler: handleUniverseForked

export function handleUniverseForked(event: UniverseForked): void {

}
