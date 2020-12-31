/* eslint-disable func-names */

import { Dayjs } from 'dayjs'

declare module 'dayjs' {
  interface Dayjs {
    unixMilli(): number
  }
}

const pluginUnixMilli = (_: any, c: typeof Dayjs) => {
  c.prototype.unixMilli = function () {
    return this.unix() * 1e3
  }
}

export default pluginUnixMilli
