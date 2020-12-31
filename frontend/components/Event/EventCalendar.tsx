import dayjs from 'dayjs'
import React, { useCallback, useMemo, memo } from 'react'
import {
  Box,
  HStack,
  VStack,
  Tooltip,
  AspectRatio,
  Skeleton,
} from '@chakra-ui/react'
// Hook
import { Event } from '~/store/type'
// Component
import { Calendar } from '~/util/day/pluginCalendar'

export const EventCalendarSkeleton = () => (
  <Skeleton height="7em" borderRadius="0.25em" />
)

type EventCalendarProps = {
  fetching: boolean
  events: Event[]
  selectedYear: number
  setSelectedUnixMilli: React.Dispatch<React.SetStateAction<number>>
}

const EventCalendar = ({
  fetching,
  events = [],
  selectedYear,
  setSelectedUnixMilli,
}: EventCalendarProps) => {
  // Local state
  const fillEventCount = useCallback(
    (calendar: Calendar) => {
      events.forEach((event) => {
        const { week, day } = dayjs(event.startedAt).weekAndDayOfYear()
        calendar.weeks[week][day] += 1
      })
    },
    [events],
  )
  const { weeks: weeksFilledWithTime } = useMemo(
    () => dayjs().year(selectedYear).calendar('unixMilli'),
    [selectedYear],
  )
  const { weeks: weeksFilledWithEventCount } = useMemo(
    () => dayjs().year(selectedYear).calendar(fillEventCount),
    [selectedYear, fillEventCount],
  )
  // Render
  if (fetching) {
    return <EventCalendarSkeleton />
  }
  return (
    <Box overflowX="scroll">
      <HStack display="flex" alignItems="stretch" spacing="1">
        {weeksFilledWithTime.map((weeks, week) => (
          <VStack
            // eslint-disable-next-line react/no-array-index-key
            key={`${selectedYear}-${week}`}
            flex="1"
            alignItems="stretch"
            spacing="1"
          >
            {weeks.map((unixMilli, day) => (
              <AspectRatio
                // eslint-disable-next-line react/no-array-index-key
                key={`${unixMilli}-${day}`}
                w="0.8em"
                h="0.8em"
                ratio={1}
              >
                {unixMilli ? (
                  <Tooltip
                    closeOnClick={false}
                    closeOnMouseDown={false}
                    bgColor="grayAlpha80.900"
                    borderRadius="0.5em"
                    label={
                      <HStack spacing="1">
                        <Box fontWeight="700">
                          {weeksFilledWithEventCount[week][day]} events
                        </Box>
                        <Box opacity="0.6">
                          on {dayjs(unixMilli).format('YYYY/MM/DD')}
                        </Box>
                      </HStack>
                    }
                    placement="top"
                  >
                    <Box
                      bg={
                        weeksFilledWithEventCount[week][day] > 0
                          ? 'orange.300'
                          : 'gray.200'
                      }
                      borderRadius="20%"
                      onClick={() => setSelectedUnixMilli(unixMilli)}
                    />
                  </Tooltip>
                ) : (
                  <Box bg="grayAlpha50.100" borderRadius="20%" />
                )}
              </AspectRatio>
            ))}
          </VStack>
        ))}
      </HStack>
    </Box>
  )
}

export default memo(EventCalendar)
