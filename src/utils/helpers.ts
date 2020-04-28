import {
  Universe,
  Market,
  User,
  MigrateMarketEvent,
  FinalizeMarketEvent,
  CreateMarketEvent,
  TransferMarketEvent,
  OIChangeMarketEvent,
  ShareToken
} from "../../generated/schema";
import {
  MarketCreated,
  MarketTransferred,
  MarketMigrated,
  MarketFinalized,
  MarketOIChanged
} from "../../generated/Augur/Augur";
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
  BIGDECIMAL_ZERO,
  marketTypes,
  tokenTypes
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

export function getOrCreateUserTokenBalance(
  id: String,
  createIfNotFound: boolean = true
): UserTokenBalance {
  let balance = UserTokenBalance.load(id);

  if (balance == null && createIfNotFound) {
    balance = new UserTokenBalance(id);

    balance.balance = BIGINT_ZERO;
  }

  return balance as UserTokenBalance;
}

export function getOrCreateShareToken(
  id: String,
  createIfNotFound: boolean = true
): ShareToken {
  let token = ShareToken.load(id);

  if (token == null && createIfNotFound) {
    token = new ShareToken(id);

    token.balance = BIGINT_ZERO;
  }

  return token as ShareToken;
}

export function createAndSaveCreateMarketEvent(
  ethereumEvent: MarketCreated
): void {
  let id = getEventId(ethereumEvent);
  let event = new CreateMarketEvent(id);

  event.market = ethereumEvent.params.market.toHexString();
  event.timestamp = ethereumEvent.block.timestamp;
  event.block = ethereumEvent.block.number;
  event.tx_hash = ethereumEvent.transaction.hash.toHexString();
  event.universe = ethereumEvent.params.universe.toHexString();
  event.endTime = ethereumEvent.params.endTime;
  event.extraInfo = ethereumEvent.params.extraInfo;
  event.marketCreator = ethereumEvent.params.marketCreator.toHexString();
  event.designatedReporter = ethereumEvent.params.designatedReporter.toHexString();
  event.feePerCashInAttoCash = ethereumEvent.params.feePerCashInAttoCash;
  event.prices = ethereumEvent.params.prices;
  event.marketTypeRaw = ethereumEvent.params.marketType;
  event.marketType = getMarketTypeFromInt(ethereumEvent.params.marketType);
  event.numTicks = ethereumEvent.params.numTicks;
  event.outcomes = ethereumEvent.params.outcomes;
  event.noShowBond = ethereumEvent.params.noShowBond;
  event.creationTimestamp = ethereumEvent.params.timestamp;

  event.save();
}

export function createAndSaveFinalizeMarketEvent(
  ethereumEvent: MarketFinalized
): void {
  let id = getEventId(ethereumEvent);
  let event = new FinalizeMarketEvent(id);

  event.market = ethereumEvent.params.market.toHexString();
  event.timestamp = ethereumEvent.block.timestamp;
  event.block = ethereumEvent.block.number;
  event.tx_hash = ethereumEvent.transaction.hash.toHexString();
  event.finalizeTimestamp = ethereumEvent.params.timestamp;
  event.winningPayoutNumerators = ethereumEvent.params.winningPayoutNumerators;

  event.save();
}

export function createAndSaveTransferMarketEvent(
  ethereumEvent: MarketTransferred
): void {
  let id = getEventId(ethereumEvent);
  let event = new TransferMarketEvent(id);

  event.market = ethereumEvent.params.market.toHexString();
  event.timestamp = ethereumEvent.block.timestamp;
  event.block = ethereumEvent.block.number;
  event.tx_hash = ethereumEvent.transaction.hash.toHexString();

  event.universe = ethereumEvent.params.universe.toHexString();
  event.from = ethereumEvent.params.from.toHexString();
  event.to = ethereumEvent.params.to.toHexString();

  event.save();
}

export function createAndSaveMigrateMarketEvent(
  ethereumEvent: MarketMigrated
): void {
  let id = getEventId(ethereumEvent);
  let event = new MigrateMarketEvent(id);

  event.market = ethereumEvent.params.market.toHexString();
  event.timestamp = ethereumEvent.block.timestamp;
  event.block = ethereumEvent.block.number;
  event.tx_hash = ethereumEvent.transaction.hash.toHexString();

  event.originalUniverse = ethereumEvent.params.originalUniverse.toHexString();
  event.newUniverse = ethereumEvent.params.newUniverse.toHexString();

  event.save();
}

export function createAndSaveOIChangeMarketEvent(
  ethereumEvent: MarketOIChanged
): void {
  let id = getEventId(ethereumEvent);
  let event = new OIChangeMarketEvent(id);

  event.market = ethereumEvent.params.market.toHexString();
  event.timestamp = ethereumEvent.block.timestamp;
  event.block = ethereumEvent.block.number;
  event.tx_hash = ethereumEvent.transaction.hash.toHexString();

  event.openInterest = ethereumEvent.params.marketOI;

  event.save();
}

export function getEventId(event: EthereumEvent): String {
  return event.transaction.hash
    .toHexString()
    .concat("-")
    .concat(event.logIndex.toHexString());
}

export function getMarketTypeFromInt(numericalType: i32): String {
  return marketTypes[numericalType];
}

export function getTokenTypeFromInt(numericalType: i32): String {
  return tokenTypes[numericalType];
}
