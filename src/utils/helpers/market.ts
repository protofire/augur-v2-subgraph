import {
  Market,
  MigrateMarketEvent,
  FinalizeMarketEvent,
  CreateMarketEvent,
  TransferMarketEvent,
  OIChangeMarketEvent,
  MarketReport,
  Outcome
} from "../../../generated/schema";
import {
  MarketCreated,
  MarketTransferred,
  MarketMigrated,
  MarketFinalized,
  MarketOIChanged
} from "../../../generated/Augur/Augur";
import { ethereum, Bytes, BigInt, log } from "@graphprotocol/graph-ts";
import { marketTypes, YES_NO, SCALAR, CATEGORICAL } from "../constants";

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

export function getEventId(event: ethereum.Event): String {
  return event.transaction.hash
    .toHexString()
    .concat("-")
    .concat(event.logIndex.toHexString());
}

export function getMarketTypeFromInt(numericalType: i32): String {
  return marketTypes[numericalType];
}

export function getOrCreateMarketReport(
  id: String,
  createIfNotFound: boolean = true
): MarketReport {
  let marketReport = MarketReport.load(id);

  if (marketReport == null && createIfNotFound) {
    marketReport = new MarketReport(id);

    marketReport.market = id;
    marketReport.isFinal = false;
    marketReport.isInitialReport = true;
  }

  return marketReport as MarketReport;
}

function getOutcomesAmountForMarketType(
  outcomes: Bytes[],
  marketType: String
): i32 {
  if (marketType == SCALAR || marketType == YES_NO) {
    return 3;
  } else {
    return outcomes.length;
  }
}

function createInvalidOutcome(marketId: String): String {
  let outcome = getOrCreateOutcome(marketId.concat("-0"));
  outcome.market = marketId;
  outcome.value = "INVALID";

  outcome.save();
  return outcome.id;
}

export function getOrCreateOutcome(
  id: String,
  createIfNotFound: boolean = true
): Outcome {
  let outcome = Outcome.load(id);

  if (outcome == null && createIfNotFound) {
    outcome = new Outcome(id);

    outcome.isFinalNumerator = false;
  }

  return outcome as Outcome;
}

export function createOutcomesForMarket(
  outcomes: Bytes[],
  marketType: String,
  marketId: String
): i32 {
  let outcomeAmount = getOutcomesAmountForMarketType(outcomes, marketType);
  let numOutcomes = 1;
  createInvalidOutcome(marketId);

  if (marketType == SCALAR) {
    let shortOutcome = getOrCreateOutcome(marketId.concat("-1"));
    let longOutcome = getOrCreateOutcome(marketId.concat("-2"));

    shortOutcome.market = marketId;
    shortOutcome.value = "SHORT";

    longOutcome.market = marketId;
    longOutcome.value = "LONG";

    shortOutcome.save();
    longOutcome.save();

    numOutcomes = 3;
  } else if (marketType == YES_NO) {
    let noOutcome = getOrCreateOutcome(marketId.concat("-1"));
    let yesOutcome = getOrCreateOutcome(marketId.concat("-2"));

    noOutcome.market = marketId;
    noOutcome.value = "NO";

    yesOutcome.market = marketId;
    yesOutcome.value = "YES";

    noOutcome.save();
    yesOutcome.save();

    numOutcomes = 3;
  } else if (marketType == CATEGORICAL) {
    let outcomeId = "";
    for (let i = 0; i < outcomeAmount; i++) {
      let id = i + 1; // because invalid is not present in the outcome list for categoricals
      outcomeId = marketId.concat("-").concat(id.toString());

      let outcome = getOrCreateOutcome(outcomeId);
      outcome.value = outcomes[i].toString();
      outcome.valueRaw = outcomes[i];
      outcome.market = marketId;
      outcome.save();

      numOutcomes++;
    }
  } else {
    log.error("Market type invalid: {}. Market ID: {}", [marketType, marketId]);
    return 0;
  }
  return numOutcomes;
}

export function updateOutcomesForMarket(
  marketId: String,
  payoutNumerators: BigInt[],
  isFinal: boolean
): void {
  let market = getOrCreateMarket(marketId);
  for (let i = 0; i < payoutNumerators.length; i++) {
    let outcomeId = marketId.concat("-").concat(i.toString());
    let outcome = getOrCreateOutcome(outcomeId, false);
    if (outcome == null) {
      log.error("Outcome {} doesn't exist...", [outcomeId]);
    } else {
      outcome.payoutNumerator = payoutNumerators[i];
      outcome.isFinalNumerator = isFinal;
      outcome.save();
    }
  }
}

export function getOrCreateMarketTemplate(
  id: String,
  createIfNotFound: boolean = true
): MarketTemplate {
  let template = MarketTemplate.load(id);

  if (template == null && createIfNotFound) {
    template = new MarketTemplate(id);
  }

  return template as MarketTemplate;
}

export function getOrCreateMarketTemplateInput(
  id: String,
  createIfNotFound: boolean = true
): MarketTemplateInput {
  let input = MarketTemplateInput.load(id);

  if (input == null && createIfNotFound) {
    input = new MarketTemplateInput(id);
  }

  return input as MarketTemplateInput;
}
