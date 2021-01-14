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
  Text,
  Spacer,
  Tag,
} from '@chakra-ui/react'
// Component
import EventItem from '~/components/Event/EventItem'
import EventKindTag from '~/components/UI/Tag/EventKind'
import DeviceTag from '~/components/UI/Tag/Device'
import LabelTag from '~/components/UI/Tag/Label'
// Type
import { Event } from '~/store/type'

type EventAccordionProps = {
  events: Event[]
  onLabelCreate: (event: Event) => void
}

const EventAccordion = ({ events, onLabelCreate }: EventAccordionProps) => (
  <Accordion allowMultiple allowToggle maxH="600px" overflowY="scroll">
    <VStack spacing="3" alignItems="stretch">
      {events.length === 0 ? (
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
                      <DeviceTag variant="symbol" device={event.device} />
                      {event.labels.map((label) => (
                        <LabelTag
                          key={label.id}
                          variant="symbol"
                          label={label}
                        />
                      ))}
                    </HStack>
                    <Spacer />
                    <Tag
                      colorScheme="facebook"
                      fontFamily="Courier New"
                      fontWeight="bold"
                      onClick={(e) => {
                        e.stopPropagation()
                        onLabelCreate(event)
                      }}
                    >
                      +
                    </Tag>
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
)

export default EventAccordion
