import dayjs from 'dayjs'
import React from 'react'
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  AccordionIcon,
  VStack,
  HStack,
  Heading,
  Text,
  Spacer,
  Skeleton,
} from '@chakra-ui/react'
// Component
import EventItem from '~/components/Event/EventItem'
// Type
import { Event } from '~/store/type'
import EventKindTag from '../UI/Tag/EventKind'
import DeviceIdTag from '../UI/Tag/DeviceId'
// import LabelNameTag from '../UI/Tag/LabelName'

export const EventListInDaySkeleton = () => (
  <>
    <Skeleton height="2.5em" borderRadius="0.25em" />
    <Skeleton height="2.5em" borderRadius="0.25em" />
    <Skeleton height="2.5em" borderRadius="0.25em" />
  </>
)

type EventListInDayProps = {
  filterInDay: number
  fetching: boolean
  events: Event[]
}

const EventListInDay = ({
  filterInDay,
  fetching,
  events = [],
}: EventListInDayProps) => (
  <>
    <Heading size="lg">
      Events - {dayjs(filterInDay).format('YYYY/MM/DD')}
    </Heading>
    <Accordion allowMultiple allowToggle maxH="600px" overflowY="scroll">
      <VStack spacing="3" alignItems="stretch">
        {fetching ? ( // eslint-disable-line no-nested-ternary
          <EventListInDaySkeleton />
        ) : events.length === 0 ? (
          <Text>No event in this day</Text>
        ) : (
          events.map((event) => (
            <AccordionItem
              key={event.id}
              bgColor="gray.100"
              borderRadius="0.5em"
              outline="none"
              overflow="hidden"
              border="none"
            >
              {({ isExpanded }) => (
                <>
                  <AccordionButton _focus={{ boxShadow: 'none' }}>
                    <HStack w="100%" spacing="2">
                      <HStack spacing="2" overflowX="scroll">
                        <EventKindTag kind={event.kind} />
                        <DeviceIdTag id={event.deviceId} short showPrefix />
                        {/* <LabelNameTag
                          name="door-opened"
                          showPrefix
                          onClick={(e) => {
                            e.stopPropagation()
                          }}
                        /> */}
                      </HStack>
                      <Spacer />
                      <Text flexShrink={0}>
                        at {dayjs(event.startedAt).format('HH:mm:ss')}
                      </Text>
                      <AccordionIcon flexShrink={0} />
                    </HStack>
                  </AccordionButton>
                  <AccordionPanel px="5">
                    <EventItem event={event} isExpanded={isExpanded} />
                  </AccordionPanel>
                </>
              )}
            </AccordionItem>
          ))
        )}
      </VStack>
    </Accordion>
  </>
)

export default EventListInDay
