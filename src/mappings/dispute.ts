import { Address, BigInt, Bytes, Value, log } from "@graphprotocol/graph-ts";
import {
  InitialReportSubmitted,
  DisputeCrowdsourcerCompleted,
  DisputeCrowdsourcerContribution,
  DisputeCrowdsourcerCreated,
  DisputeCrowdsourcerRedeemed,
  DisputeWindowCreated
} from "../../generated/Augur/Augur";
import {
  getOrCreateUser,
  getOrCreateMarket,
  getOrCreateMarketReport,
  getOrCreateDispute,
  getOrCreateDisputeRound,
  getOrCreateDisputeWindow,
  getOrCreateDisputeCrowdsourcer
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

// - event: InitialReportSubmitted(indexed address,indexed address,indexed address,address,uint256,bool,uint256[],string,uint256,uint256,uint256)(indexed address,indexed address,indexed address,uint256,uint256)
//   handler: handleInitialReportSubmitted

// event InitialReportSubmitted(address indexed universe, address indexed reporter, address indexed market, address initialReporter, uint256 amountStaked, bool isDesignatedReporter, uint256[] payoutNumerators, string description, uint256 nextWindowStartTime, uint256 nextWindowEndTime, uint256 timestamp);

export function handleInitialReportSubmitted(
  event: InitialReportSubmitted
): void {
  let market = getOrCreateMarket(event.params.market.toHexString());
  let reporter = getOrCreateUser(event.params.reporter.toHexString());
  let marketReport = getOrCreateMarketReport(event.params.market.toHexString());
  let dispute = getOrCreateDispute(event.params.market.toHexString());

  market.status = STATUS_REPORTING;

  marketReport.payoutNumerators = event.params.payoutNumerators;
  marketReport.reportedAt = event.block.timestamp;
  marketReport.reporter = reporter.id;
  marketReport.isDesignatedReporter = event.params.isDesignatedReporter;

  dispute.market = market.id;
  dispute.currentReport = marketReport.id;
  dispute.universe = event.params.universe.toHexString();
  dispute.currentDisputeRound = 0;
  dispute.creationTimestamp = event.block.timestamp;
  dispute.block = event.block.number;
  dispute.tx_hash = event.transaction.hash.toHexString();

  dispute.save();
  market.save();
  marketReport.save();
}

// - event: DisputeCrowdsourcerCompleted(indexed address,indexed address,address,uint256[],uint256,uint256,bool,uint256,uint256,uint256,uint256)
//   handler: handleDisputeCrowdsourcerCompleted

// event DisputeCrowdsourcerCompleted(address indexed universe, address indexed market, address disputeCrowdsourcer, uint256[] payoutNumerators, uint256 nextWindowStartTime, uint256 nextWindowEndTime, bool pacingOn, uint256 totalRepStakedInPayout, uint256 totalRepStakedInMarket, uint256 disputeRound, uint256 timestamp);

export function handleDisputeCrowdsourcerCompleted(
  event: DisputeCrowdsourcerCompleted
): void {}

// - event: DisputeCrowdsourcerContribution(indexed address,indexed address,indexed address,address,uint256,string,uint256[],uint256,uint256,uint256,uint256)
//   handler: handleDisputeCrowdsourcerContribution

// event DisputeCrowdsourcerContribution(address indexed universe, address indexed reporter, address indexed market, address disputeCrowdsourcer, uint256 amountStaked, string description, uint256[] payoutNumerators, uint256 currentStake, uint256 stakeRemaining, uint256 disputeRound, uint256 timestamp);

export function handleDisputeCrowdsourcerContribution(
  event: DisputeCrowdsourcerContribution
): void {}

// - event: DisputeCrowdsourcerCreated(indexed address,indexed address,address,uint256[],uint256,uint256)
//   handler: handleDisputeCrowdsourcerCreated

// event DisputeCrowdsourcerCreated(address indexed universe, address indexed market, address disputeCrowdsourcer, uint256[] payoutNumerators, uint256 size, uint256 disputeRound);

export function handleDisputeCrowdsourcerCreated(
  event: DisputeCrowdsourcerCreated
): void {}

// - event: DisputeCrowdsourcerRedeemed(indexed address,indexed address,indexed address,address,uint256,uint256,uint256[],uint256)
//   handler: handleDisputeCrowdsourcerRedeemed

// event DisputeCrowdsourcerRedeemed(address indexed universe, address indexed reporter, address indexed market, address disputeCrowdsourcer, uint256 amountRedeemed, uint256 repReceived, uint256[] payoutNumerators, uint256 timestamp);

export function handleDisputeCrowdsourcerRedeemed(
  event: DisputeCrowdsourcerRedeemed
): void {}

// - event: DisputeWindowCreated(indexed address,address,uint256,uint256,uint256,bool)
//   handler: handleDisputeWindowCreated

// event DisputeWindowCreated(address indexed universe, address disputeWindow, uint256 startTime, uint256 endTime, uint256 id, bool initial);

export function handleDisputeWindowCreated(event: DisputeWindowCreated): void {
  let disputeWindow = getOrCreateDisputeWindow(
    event.params.disputeWindow.toHexString()
  );

  disputeWindow.startTime = event.params.startTime;
  disputeWindow.endTime = event.params.endTime;
  disputeWindow.universe = event.params.universe.toHexString();

  disputeWindow.save();
}
