/* eslint-disable func-names */

import { Dayjs } from 'dayjs'
import { DAYS_PER_WEEK } from '~/util/day/constant'

declare module 'dayjs' {
  interface Dayjs {
    weekAndDayOfYear(): { week: number; day: number }
  }
}

const pluginWeekAndDayOfYear = (_: any, c: typeof Dayjs) => {
  c.prototype.weekAndDayOfYear = function () {
    const originDay = this.startOf('year').day()
    const day = this.day()
    return {
      week:
        (this.dayOfYear() - (DAYS_PER_WEEK - originDay) - day - 1) /
          DAYS_PER_WEEK +
        1,
      day,
    }
  }
}

export default pluginWeekAndDayOfYear
