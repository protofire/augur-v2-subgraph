import { Universe, Market, User } from "../../generated/schema";
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
  createIfNotFound: boolean = true
): Universe {
  let universe = Universe.load(id);

  if (universe == null && createIfNotFound) {
    universe = new Universe(id);
  }

  return universe as Universe;
}

export function getOrCreateMarket(
  id: String,
  createIfNotFound: boolean = true
): Market {
  let market = Market.load(id);

  if (market == null && createIfNotFound) {
    market = new Market(id);
  }

  return market as Market;
}

export function getOrCreateUser(
  id: String,
  createIfNotFound: boolean = true,
  save: boolean = true
): User {
  let user = User.load(id);

  if (user == null && createIfNotFound) {
    user = new User(id);

    if (save) {
      user.save();
    }
  }

  return user as User;
}
