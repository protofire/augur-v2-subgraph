import { Universe, Market } from "../../generated/schema";
import {
  Address,
  EthereumEvent,
  BigInt,
  Bytes,
  log
} from "@graphprotocol/graph-ts";
import { DEFAULT_DECIMALS, toDecimal } from "./decimals";
import {
  ZERO_ADDRESS,
  BIGINT_ZERO,
  BIGINT_ONE,
  BIGDECIMAL_ZERO
} from "./constants";

export function getOrCreateUniverse(
  id: String,
  createIfNotFound: boolean = true,
  save: boolean = true
): Universe {
  let universe = Universe.load(id);

  if (universe == null && createIfNotFound) {
    universe = new Universe(id);

    if (save) {
      universe.save();
    }
  }

  return universe as Universe;
}

export function getOrCreateMarket(
  id: String,
  createIfNotFound: boolean = true,
  save: boolean = true
): Market {
  let market = Market.load(id);

  if (market == null && createIfNotFound) {
    market = new Market(id);

    if (save) {
      market.save();
    }
  }

  return market as Market;
}
