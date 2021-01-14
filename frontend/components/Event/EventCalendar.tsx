import dayjs from 'dayjs'
import React, { useCallback, useMemo, memo } from 'react'
import { Box, HStack, VStack, Tooltip, AspectRatio } from '@chakra-ui/react'
// Component
import { Calendar } from '~/util/day/pluginCalendar'
// Type
import { Event } from '~/store/type'

type EventCalendarProps = {
  events: Event[]
  selectedYear: number
  onDateClick: (unixMilli: number) => void
}

const EventCalendar = ({
  events,
  selectedYear,
  onDateClick,
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
  return (
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
                    onClick={() => onDateClick(unixMilli)}
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
  )
}

export default memo(EventCalendar)
