/* eslint-disable func-names */

import { Dayjs } from 'dayjs'
import {
  DAYS_PER_WEEK,
  SATURDAY,
  MILLI_SECONDS_PER_DAY,
} from '~/util/day/constant'

declare module 'dayjs' {
  interface Dayjs {
    calendar(filler?: Filler | keyof typeof FILLERS): Calendar
  }
}

export type Calendar = {
  isLeapYear: boolean
  originDay: number
  originUnixMilli: number
  weekCount: number
  weeks: Array<Array<any>>
}

export type Filler = (calendar: Calendar) => void

export const fillUnixMilli = (calendar: Calendar) => {
  const lastDay = calendar.isLeapYear
    ? (calendar.originDay + 1) % DAYS_PER_WEEK
    : calendar.originDay

  let unixMilli = calendar.originUnixMilli
  for (let week = 0; week < calendar.weekCount; week += 1) {
    let [beginDay, endDay] = [0, SATURDAY]
    if (week === 0) {
      beginDay = calendar.originDay
    } else if (week === calendar.weekCount - 1) {
      endDay = lastDay
    }

    for (let day = beginDay; day <= endDay; day += 1) {
      calendar.weeks[week][day] = unixMilli
      unixMilli += MILLI_SECONDS_PER_DAY
    }
  }
}

const FILLERS = {
  unixMilli: fillUnixMilli,
}

const pluginCalendar = (_: any, c: typeof Dayjs) => {
  c.prototype.calendar = function (filler?: Filler | keyof typeof FILLERS) {
    const originD = this.startOf('year')
    const originDay = originD.day()
    const originUnixMilli = originD.unixMilli()
    const weekCount = originD.isLeapYear() && originDay === SATURDAY ? 54 : 53
    const weeks = [...Array(weekCount)].map(() =>
      new Array(DAYS_PER_WEEK).fill(0),
    )

    const calendar = {
      isLeapYear: originD.isLeapYear(),
      originDay,
      originUnixMilli,
      weekCount,
      weeks,
    }

    if (typeof filler === 'string') {
      FILLERS[filler](calendar)
    } else {
      filler?.(calendar)
    }

    return calendar
  }
}

export default pluginCalendar
