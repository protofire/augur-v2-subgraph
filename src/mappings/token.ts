import { Address, BigInt, Bytes, Value, log } from "@graphprotocol/graph-ts";
import {
  TokensMinted,
  TokensBurned,
  TokensTransferred,
  TokenBalanceChanged,
  ShareTokenBalanceChanged
} from "../../generated/Augur/Augur";
import {
  getOrCreateShareToken,
  getOrCreateUser,
  getTokenTypeFromInt,
  createAndSaveTokenBurnedEvent,
  createAndSaveTokenMintedEvent,
  createAndSaveTokenTransferredEvents,
  getOrCreateUserReputationTokenBalance
} from "../utils/helpers";
import {
  ZERO_ADDRESS,
  BIGINT_ONE,
  BIGINT_ZERO,
  REPUTATION_TOKEN,
  PARTICIPATION_TOKEN,
  DISPUTE_CROWDSOURCER
} from "../utils/constants";
import { toDecimal } from "../utils/decimals";

// - event: TokensMinted(indexed address,indexed address,indexed address,uint256,uint8,address,uint256)
//   handler: handleTokensMinted

// TokensMinted(address universe, address token, address target, uint256 amount,
// enum Augur.TokenType tokenType, address market, uint256 totalSupply)

export function handleTokensMinted(event: TokensMinted): void {
  // let tokenType = getTokenTypeFromInt(event.params.tokenType);
  // let targetUser = getOrCreateUser(event.params.target.toHexString());
  //
  // if (tokenType == REPUTATION_TOKEN) {
  //   let userTokenBalance = getOrCreateUserReputationTokenBalance(targetUser.id)
  //   userTokenBalance.balance = userTokenBalance.balance + event.params.amount;
  //   userTokenBalance.save();
  // } else if (tokenType == DISPUTE_CROWDSOURCER) {
  // } else if (tokenType == PARTICIPATION_TOKEN) {
  // }

  createAndSaveTokenMintedEvent(event);
}

// - event: TokensBurned(indexed address,indexed address,indexed address,uint256,uint8,address,uint256)
//   handler: handleTokensBurned

// TokensBurned(address universe, address token, address target, uint256 amount,
// enum Augur.TokenType tokenType, address market, uint256 totalSupply)

export function handleTokensBurned(event: TokensBurned): void {
  // let tokenType = getTokenTypeFromInt(event.params.tokenType);
  // let targetUser = getOrCreateUser(event.params.target.toHexString());
  //
  // if (tokenType == REPUTATION_TOKEN) {
  //   let userTokenBalance = getOrCreateUserReputationTokenBalance(targetUser.id)
  //   userTokenBalance.balance = userTokenBalance.balance - event.params.amount;
  //   userTokenBalance.save();
  // } else if (tokenType == DISPUTE_CROWDSOURCER) {
  // } else if (tokenType == PARTICIPATION_TOKEN) {
  // }

  createAndSaveTokenBurnedEvent(event);
}

// - event: TokensTransferred(indexed address,address,indexed address,indexed address,uint256,uint8,address)
//   handler: handleTokensTransferred

// TokensTransferred(address universe, address token, address from, address to,
// uint256 value, enum Augur.TokenType tokenType, address market)

export function handleTokensTransferred(event: TokensTransferred): void {
  // let tokenType = getTokenTypeFromInt(event.params.tokenType);
  // let fromUser = getOrCreateUser(event.params.from.toHexString());
  // let toUser = getOrCreateUser(event.params.to.toHexString());
  //
  // if (tokenType == REPUTATION_TOKEN) {
  //   let userTokenBalanceFrom = getOrCreateUserReputationTokenBalance(fromUser.id)
  //   let userTokenBalanceTo = getOrCreateUserReputationTokenBalance(toUser.id)
  //   userTokenBalanceFrom.balance = userTokenBalanceFrom.balance - event.params.value;
  //   userTokenBalanceTo.balance = userTokenBalanceTo.balance + event.params.value;
  //   userTokenBalanceFrom.save();
  //   userTokenBalanceTo.save();
  // } else if (tokenType == DISPUTE_CROWDSOURCER) {
  // } else if (tokenType == PARTICIPATION_TOKEN) {
  // }

  createAndSaveTokenTransferredEvents(event);
}

// - event: TokenBalanceChanged(indexed address,indexed address,address,uint8,address,uint256,uint256)
//   handler: handleTokenBalanceChanged

// TokenBalanceChanged(address universe, address owner, address token,
// enum Augur.TokenType tokenType, address market, uint256 balance, uint256 outcome)

export function handleTokenBalanceChanged(event: TokenBalanceChanged): void {
  let tokenType = getTokenTypeFromInt(event.params.tokenType);
  let targetUser = getOrCreateUser(event.params.owner.toHexString());

  if (tokenType == REPUTATION_TOKEN) {
    let userTokenBalance = getOrCreateUserReputationTokenBalance(targetUser.id)
    userTokenBalance.balance = event.params.balance;
    userTokenBalance.save();
  } else if (tokenType == DISPUTE_CROWDSOURCER) {
  } else if (tokenType == PARTICIPATION_TOKEN) {
  }
}

// - event: ShareTokenBalanceChanged(indexed address,indexed address,indexed address,uint256,uint256)
//   handler: handleShareTokenBalanceChanged

export function handleShareTokenBalanceChanged(
  event: ShareTokenBalanceChanged
): void {
  let user = getOrCreateUser(event.params.account.toHexString());
  let shareTokenId = event.params.market
    .toHexString()
    .concat("-")
    .concat(user.id)
    .concat("-")
    .concat(event.params.outcome.toString());
  let shareToken = getOrCreateShareToken(shareTokenId);
  shareToken.balance = event.params.balance;
  shareToken.outcome = event.params.outcome;
  shareToken.market = event.params.market.toHexString();
  shareToken.owner = user.id;
  shareToken.save();
}
