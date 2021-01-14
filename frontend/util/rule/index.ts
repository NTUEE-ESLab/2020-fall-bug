import {
  NumberEq,
  NumberGt,
  NumberLt,
  NumberGte,
  NumberLte,
  NumberOperator,
} from '~/util/rule/type'

// eslint-disable-next-line import/prefer-default-export
export const operatorToString = (operator: NumberOperator): string => {
  if ((operator as NumberEq).eq) {
    return `= ${(operator as NumberEq).eq}`
  }
  if ((operator as NumberGt).gt) {
    return `> ${(operator as NumberGt).gt}`
  }
  if ((operator as NumberLt).lt) {
    return `< ${(operator as NumberLt).lt}`
  }
  if ((operator as NumberGte).gte) {
    return `>= ${(operator as NumberGte).gte}`
  }
  if ((operator as NumberLte).lte) {
    return `<= ${(operator as NumberLte).lte}`
  }
  throw new Error(`unexpected operator ${JSON.stringify(operator, null, 2)}`)
}

export * from '~/util/rule/type'
