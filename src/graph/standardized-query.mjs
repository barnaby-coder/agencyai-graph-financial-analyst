export const STANDARDIZED_LENDING_QUERY = String.raw`query StandardizedLendingUsdc($protocolSlug: String!, $tokenId: Bytes!, $dailyFrom: Int!) {
  _meta { block { number timestamp } hasIndexingErrors }
  lendingProtocols(where: { slug: $protocolSlug }, first: 1) {
    id protocol name slug schemaVersion subgraphVersion methodologyVersion network totalValueLockedUSD
    markets(where: { inputToken: $tokenId }, first: 100) {
      id name inputToken { id symbol decimals } outputToken { id symbol decimals }
      inputTokenBalance totalValueLockedUSD variableBorrowedTokenBalance stableBorrowedTokenBalance
      rates { rate side type }
      indexLastUpdatedTimestamp
    }
  }
  marketDailySnapshots(where: { market_: { inputToken: $tokenId }, timestamp_gte: $dailyFrom }, orderBy: timestamp, orderDirection: desc, first: 30) {
    id market { id inputToken { id symbol decimals } } inputTokenBalance variableBorrowedTokenBalance
    stableBorrowedTokenBalance totalValueLockedUSD timestamp blockNumber
  }
}`;
