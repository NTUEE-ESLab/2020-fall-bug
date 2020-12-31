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
  Tag,
  Spacer,
  Skeleton,
} from '@chakra-ui/react'
// Component
import EventItem from '~/components/Event/EventItem'
// Type
import { Event } from '~/store/type'

export const EventListInDaySkeleton = () => (
  <>
    <Skeleton height="2.5em" borderRadius="0.25em" />
    <Skeleton height="2.5em" borderRadius="0.25em" />
    <Skeleton height="2.5em" borderRadius="0.25em" />
  </>
)

type EventListInDayProps = {
  fetching: boolean
  events: Event[]
}

const EventListInDay = ({ fetching, events = [] }: EventListInDayProps) => (
  <Accordion allowMultiple allowToggle>
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
                    <Heading size="s">
                      <Tag bgColor="orange.100">{event.kind}</Tag>
                    </Heading>
                    <Text>at {dayjs(event.startedAt).format('HH:mm:ss')}</Text>
                    <Spacer />
                    <AccordionIcon />
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
)

export default EventListInDay
