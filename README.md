## Augur v2 subgraph (Kovan)

This subgraph aims to make it simple to get data from the Augur protocol, to simplify app development by transforming the raw data from the blockchain events into entities that should make it easier to understand how the protocol works and how entities are linked together.

### Entities

Here we will provide a list of the current entities implemented, and how they are related to the event data that we extracted.

#### User

``` graphql
type User @entity {
  id: ID!

  "Balance entities for tokens such as Reputation and Participation tokens"
  userTokenBalances: [UserTokenBalance!]! @derivedFrom(field: "user")

  "Markets created by this user"
  marketsCreated: [Market!]! @derivedFrom(field: "creator")

  "Markets where this user is the designated reporter"
  marketsAsReporter: [Market!]! @derivedFrom(field: "designatedReporter")

  "Share tokens that this user has"
  shareTokens: [ShareToken!]! @derivedFrom(field: "owner")
}
```

The user entity basically depicts a user of the Augur protocol.

It will have linked data about the different balances it has for the main tokens, such as Reputation (REP), Participation tokens and DisputeCrowdsourcer contributions, as well as all the shares they own on different markets, and the different markets they have created or currently own.

The ID of the users will be the blockchain address of said User.

#### Universe

```graphql
type Universe @entity {
  id: ID!

  parentUniverse: Universe

  payoutNumerators: [BigInt!]

  "Universe creation timestamp"
  creationTimestamp: BigInt

  "Latest universal value for the noShowBond charged on market creation"
  noShowBond: BigInt

  "Latest universal value for the validityBond charged on market creation"
  validityBond: BigInt

  "Latest universal value for the reporting fee charged on settlements"
  reportingFee: BigInt

  "Latest universal value for the value a designated reported is required to stake on the initial report"
  designatedReportStake: BigInt

  "Latest warpSync file hash"
  warpSyncHash: BigInt

  ""
  markets: [Market!]! @derivedFrom(field: "universe")

  "Children universe that this universe created when it forked. It can be null if the universe hasn't forked"
  children: [Universe!] @derivedFrom(field: "parentUniverse")
}
```

Universes are an Augur entity that represent a context for the markets. On initial deployment there will be only one Universe, the Genesis Universe.
Each time a market "forks", the current universe will "stop", and it will create children universes that will represent the different disputing outcomes of the "forking market".
All Augur REP holders will then have a time window (currently 60 days) to migrate their REP to one of the children universes, and the winner universe (the one which holds the most REP) will be the new main universe.

Since universes are a context entity for markets, they hold global information used by markets, like the current value for "Validity bond", "No show bond", reporting fees, and designated report stake, which are used by markets to determine the cost of creation, base fees applied on settlement and more.

We display all those variables, and track the markets that the universe currently holds, as well as the children and parent universes (if applicable), and the warp sync file hash, used for faster syncing of the augur node, if needed.

#### Market

```graphql
type Market @entity {
  id: ID!

  "Universe that this market belongs to"
  universe: Universe!

  "User that created the market"
  creator: User!

  "Current owner of the market"
  owner: User!

  "Extra information in JSON format. Includes market description and possibly other information"
  extraInfo: String!

  "Number of Ticks in a complete set"
  numTicks: BigInt!

  "Designated user that should report the "
  designatedReporter: User!

  "Timestamp depicting the end of the real world event for that market"
  endTimestamp: BigInt!

  "Minimum and maximum price for yes/no and categorical markets. For scalar markets it depicts the min and max values of the scalar."
  prices: [BigInt!]!

  "Internal enum id of the market type"
  marketTypeRaw: Int!

  "Market type as a string enum"
  marketType: MarketType!

  "Possible outcomes of the market"
  outcomes: [Outcome!]! @derivedFrom(field:"market")

  "Amount of different outcomes for the market."
  numOutcomes: Int!

  "Creation timestamp"
  timestamp: BigInt!

  "NoShowBond payed on creation"
  noShowBond: BigInt!

  "Current status of the market"
  status: MarketStatus!

  openInterest: BigInt

  "Entity depicting the current tentative or final result of the market"
  report: MarketReport

  "List of all the market events triggered"
  events: [MarketEvent!]! @derivedFrom(field: "market")

  "Share tokens traded on this market"
  shareTokens: [ShareToken!]! @derivedFrom(field: "market")

  "Entity depicting the disputing process"
  dispute: Dispute
}
```

Markets are the heart of the Augur protocol, they represent the market prediction, and hold the information of all the trading, reporting, disputing and settlement for any prediction.

This entity tracks all the data we could find on all the Market related events, such as the fees paid on creation, the current "open interest" of the market, the current status of the dispute process (more on that later), the market type, creation timestamp, the different possible outcomes for the market, minimum and maximum prices, market trading close time, and so on.

We also track and save all the Market events that we handled to get the current status, in case it wants to be displayed, and we try to keep the raw data that we handled in them, in case it's ever needed.

We also keep track of all the share tokens for any market, so that it's easy to find the share balances for any user on that market.
