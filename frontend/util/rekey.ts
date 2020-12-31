import * as R from 'ramda'

const toCamelCase = (str: string) =>
  str.replace(/[-_]([a-z])/g, ([, char]) => char.toUpperCase())

const parseValues: any = R.curry((fn, obj: object) => {
  if (R.isEmpty(R.keys(obj))) {
    return obj
  }
  return mapKeys(fn, obj) // eslint-disable-line @typescript-eslint/no-use-before-define
})

const mapKeys: any = R.curry((fn, obj: object) =>
  R.zipObj(
    R.map<string, string>(fn, R.keys(obj)),
    R.map(parseValues(fn), R.values(obj)),
  ),
)

const fold = R.curry((fn, value) =>
  R.is(Array, value) ? R.map(fn, value) : fn(value),
)

// eslint-disable-next-line import/prefer-default-export
export const rekeyCamelCase = fold(mapKeys(toCamelCase), R.__)
