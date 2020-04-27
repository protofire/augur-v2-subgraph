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
  getOrCreateUser
} from "../utils/helpers";
import { ZERO_ADDRESS, BIGINT_ONE, BIGINT_ZERO } from "../utils/constants";
import { toDecimal } from "../utils/decimals";

// - event: TokensMinted(indexed address,indexed address,indexed address,uint256,uint8,address,uint256)
//   handler: handleTokensMinted

export function handleTokensMinted(event: TokensMinted): void {}

// - event: TokensBurned(indexed address,indexed address,indexed address,uint256,uint8,address,uint256)
//   handler: handleTokensBurned

export function handleTokensBurned(event: TokensBurned): void {}

// - event: TokensTransferred(indexed address,address,indexed address,indexed address,uint256,uint8,address)
//   handler: handleTokensTransferred

export function handleTokensTransferred(event: TokensTransferred): void {}

// - event: TokenBalanceChanged(indexed address,indexed address,address,uint8,address,uint256,uint256)
//   handler: handleTokenBalanceChanged

export function handleTokenBalanceChanged(event: TokenBalanceChanged): void {}

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
