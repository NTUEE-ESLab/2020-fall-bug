export type NumberEq = { eq: number }

export type NumberGt = { gt: number }

export type NumberLt = { lt: number }

export type NumberGte = { gte: number }

export type NumberLte = { lte: number }

export type NumberOperator =
  | NumberEq
  | NumberGt
  | NumberLt
  | NumberGte
  | NumberLte
