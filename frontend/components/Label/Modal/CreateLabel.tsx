import React, { useCallback } from 'react'
import { useForm, SubmitHandler, Controller } from 'react-hook-form'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  HStack,
  VStack,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react'
import Select from 'react-select'
// Selector
import { actions as labelActions } from '~/store/label'
// Component
import EventKindTag from '~/components/UI/Tag/EventKind'
import DeviceTag from '~/components/UI/Tag/Device'
import SelectOperator from '~/components/UI/Input/SelectOperator'
// Type
import {
  Device,
  Event,
  EventKind,
  EventSound,
  LabelRuleKind,
} from '~/store/type'

const ruleKindOptionsByEventKind: Record<
  EventKind,
  Array<{ value: LabelRuleKind; label: any }>
> = {
  sound: [
    {
      value: 'sound_similarity',
      label: 'Sound Similarity',
    },
  ],
  position: [
    {
      value: 'position_difference',
      label: 'Position Difference',
    },
  ],
  luminosity: [
    {
      value: 'luminosity_difference',
      label: 'Luminosity Difference',
    },
  ],
}

const RulePayloadSoundSimilarity = ({ control, register }: any) => (
  <HStack flex={1}>
    <Text fontWeight="bold">Similarity</Text>
    <SelectOperator
      name="rulePayload.operator"
      control={control}
      styles={{ container: () => ({ flex: 2 }) }}
    />
    <Input
      name="rulePayload.value"
      placeholder="50"
      width={0}
      flex={1}
      type="number"
      ref={register({ required: true, min: 0, max: 100 })}
    />
    <Text>%</Text>
  </HStack>
)

const RulePayloadPositionDifference = ({
  eventPayload,
  control,
  register,
}: any) => (
  <VStack alignItems="stretch">
    {['x', 'y', 'z'].map((axis, idx) => {
      const diff = eventPayload?.to[idx] - eventPayload?.from[idx]
      return (
        <HStack flex={1} key={axis}>
          <Text fontWeight="bold">d{axis.toUpperCase()}</Text>
          <SelectOperator
            name={`rulePayload.${axis}.operator`}
            control={control}
            styles={{ container: () => ({ flex: 2 }) }}
            // eslint-disable-next-line no-nested-ternary
            defaultValue={diff > 0 ? 'gt' : diff < 0 ? 'lt' : undefined}
          />
          <Input
            name={`rulePayload.${axis}.value`}
            width={0}
            flex={1}
            type="number"
            defaultValue={diff}
            ref={register()}
          />
        </HStack>
      )
    })}
  </VStack>
)

type CreateLabelModalProps = {
  isOpen: boolean
  onClose: () => void
  event?: Event
  onSubmit: SubmitHandler<Parameters<typeof labelActions.create>[0]>
  pending: boolean
}

const CreateLabelModal = ({
  isOpen,
  onClose,
  event,
  onSubmit,
  pending,
}: CreateLabelModalProps) => {
  // Local state
  const { handleSubmit, register, control, watch, trigger } = useForm()
  const ruleKind: LabelRuleKind | undefined = watch('ruleKind')?.value
  // Event
  const onValid = useCallback(
    ({ name, description, rulePayload }) => {
      let payload = {}
      switch (ruleKind) {
        case 'sound_similarity':
          payload = {
            wav_file: (event as EventSound).payload.wavFile,
            operator: {
              [rulePayload.operator.value]: parseInt(rulePayload.value, 10),
            },
          }
          break
        case 'position_difference':
          payload = {
            ...(rulePayload.x.operator
              ? {
                  x: {
                    [rulePayload.x.operator.value]: parseInt(
                      rulePayload.x.value,
                      10,
                    ),
                  },
                }
              : {}),
            ...(rulePayload.y.operator
              ? {
                  y: {
                    [rulePayload.y.operator.value]: parseInt(
                      rulePayload.y.value,
                      10,
                    ),
                  },
                }
              : {}),
            ...(rulePayload.z.operator
              ? {
                  z: {
                    [rulePayload.z.operator.value]: parseInt(
                      rulePayload.z.value,
                      10,
                    ),
                  },
                }
              : {}),
          }
          break
        case 'luminosity_difference':
          // TODO:
          break
        default:
          throw new Error(`unexpected rule kind ${ruleKind}`)
      }
      onSubmit({
        name,
        description,
        rule: {
          kind: ruleKind,
          payload,
        },
        event,
      } as Parameters<typeof labelActions.create>[0])
    },
    [event, ruleKind, onSubmit],
  )
  // Render
  return (
    <Modal isCentered isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onValid)}>
          <ModalHeader>Create Label Specification</ModalHeader>
          <ModalBody>
            <VStack>
              <FormControl isRequired>
                <FormLabel>Event Kind</FormLabel>
                <Controller
                  as={Select}
                  name="eventKind"
                  defaultValue={{
                    value: event?.kind,
                    label: <EventKindTag kind={event?.kind as EventKind} />,
                  }}
                  isDisabled
                  control={control}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Device</FormLabel>
                <Controller
                  as={Select}
                  name="device"
                  defaultValue={{
                    value: event?.device.id,
                    label: (
                      <DeviceTag
                        device={event?.device as Device}
                        variant="symbol"
                      />
                    ),
                  }}
                  isDisabled
                  control={control}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  placeholder="door-opened"
                  ref={register({ required: true })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Input
                  name="description"
                  placeholder="door is opened"
                  ref={register({ required: true })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Rule Kind</FormLabel>
                <Controller
                  as={Select}
                  name="ruleKind"
                  options={ruleKindOptionsByEventKind[event?.kind as EventKind]}
                  control={control}
                  onChange={() => trigger('ruleKind')}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Rule Payload</FormLabel>
                {ruleKind
                  ? {
                      sound_similarity: (
                        <RulePayloadSoundSimilarity
                          control={control}
                          register={register}
                        />
                      ),
                      position_difference: (
                        <RulePayloadPositionDifference
                          eventPayload={event?.payload}
                          control={control}
                          register={register}
                        />
                      ),
                      // TODO:
                      luminosity_difference: <Box />,
                    }[ruleKind]
                  : null}
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing="3">
              <Button onClick={onClose} disabled={pending}>
                No
              </Button>
              <Button colorScheme="green" isLoading={pending} type="submit">
                CREATE
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export default CreateLabelModal
