/* eslint-disable func-names */

import dayjs from 'dayjs'
import dayOfYear from 'dayjs/plugin/dayOfYear'
import isBetween from 'dayjs/plugin/isBetween'
import isLeapYear from 'dayjs/plugin/isLeapYear'
import calendar from '~/util/day/pluginCalendar'
import unixMilli from '~/util/day/pluginUnixMilli'
import weekAndDayOfYear from '~/util/day/pluginWeekAndDayOfYear'

dayjs.extend(dayOfYear)
dayjs.extend(isBetween)
dayjs.extend(isLeapYear)
dayjs.extend(calendar)
dayjs.extend(unixMilli)
dayjs.extend(weekAndDayOfYear)
