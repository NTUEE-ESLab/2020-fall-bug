import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import {
  useDisclosure,
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  FormControl,
  FormLabel,
  Input,
  Heading,
  HStack,
  VStack,
  Spacer,
  Skeleton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react'
import DeviceIdTag from '~/components/UI/Tag/DeviceId'
// Hook
import {
  actions,
  useCreateDeviceStatus,
  useDeleteDeviceStatus,
} from '~/store/device'
// Component
import BinIcon from '~/components/Icon/Bin'
import Hoverable from '~/components/UI/Table/Hoverable'
// Type
import { Device } from '~/store/type'
import DeviceSecretTag from '../UI/Tag/DeviceSecret'

type DeviceListProps = {
  fetching: boolean
  devices: Device[]
}

const DeviceList = ({ fetching, devices }: DeviceListProps) => {
  const dispatch = useDispatch()
  // Global state
  const { pending: deleting, resolved: deleted } = useDeleteDeviceStatus()
  const { pending: creating, resolved: created } = useCreateDeviceStatus()
  // Local state
  const { handleSubmit, register } = useForm()
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure()
  const {
    isOpen: isCreateModalOpen,
    onOpen: onCreateModalOpen,
    onClose: onCreateModalClose,
  } = useDisclosure()
  const [deviceId, setDeviceId] = useState('')
  // Event
  const onDeviceCreateConfirm = useCallback(
    (device) => {
      dispatch(actions.create(device))
    },
    [dispatch],
  )
  const onDeviceDelete = useCallback(
    (id) => {
      onDeleteModalOpen()
      setDeviceId(id)
    },
    [onDeleteModalOpen, setDeviceId],
  )
  const onDeviceDeleteConfirm = useCallback(() => {
    dispatch(actions.delete({ id: deviceId }))
  }, [dispatch, deviceId])
  // Effect
  useEffect(() => {
    if (created) onCreateModalClose()
  }, [created]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (deleted) onDeleteModalClose()
  }, [deleted]) // eslint-disable-line react-hooks/exhaustive-deps
  // Render
  return (
    <>
      <Heading size="lg">Devices</Heading>
      {fetching ? (
        <Skeleton height="5em" borderRadius="0.25em" />
      ) : (
        <Box p="3" borderRadius="0.5em" bgColor="gray.100">
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>NAME</Th>
                <Th>DESCRIPTION</Th>
                <Th />
              </Tr>
            </Thead>
            <Tbody>
              {devices.map((device) => (
                <Hoverable.Tr
                  key={device.id}
                  transition="0.1s all ease"
                  _hover={{ bgColor: 'gray.200' }}
                >
                  <Td>
                    <VStack alignItems="flex-start">
                      <DeviceIdTag id={device.id} />
                      <DeviceSecretTag secret={device.secret} />
                    </VStack>
                  </Td>
                  <Td>{device.name}</Td>
                  <Td>{device.description}</Td>
                  <Td isNumeric>
                    <HStack>
                      <Spacer />
                      <Hoverable.Box>
                        <BinIcon
                          cursor="pointer"
                          onClick={() => onDeviceDelete(device.id)}
                        />
                      </Hoverable.Box>
                    </HStack>
                  </Td>
                </Hoverable.Tr>
              ))}
              <Tr transition="0.1s all ease" _hover={{ bgColor: 'gray.200' }}>
                <Td colSpan={5} p="0">
                  <Button
                    onClick={onCreateModalOpen}
                    size="s"
                    w="100%"
                    h="100%"
                    p="0.5em"
                    borderRadius="0"
                  >
                    New
                  </Button>
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>
      )}
      <Modal isCentered isOpen={isCreateModalOpen} onClose={onCreateModalClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit(onDeviceCreateConfirm)}>
            <ModalHeader>Create Device</ModalHeader>
            <ModalBody>
              <VStack>
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input
                    name="name"
                    placeholder="rpi3"
                    ref={register({ required: true })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Description</FormLabel>
                  <Input
                    name="description"
                    placeholder="the rpi3"
                    ref={register({ required: true })}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack spacing="3">
                <Button onClick={onCreateModalClose} disabled={creating}>
                  No
                </Button>
                <Button colorScheme="green" isLoading={creating} type="submit">
                  CREATE
                </Button>
              </HStack>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
      <Modal isCentered isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Device</ModalHeader>
          <ModalBody>
            Device <DeviceIdTag id={deviceId} /> will be deleted forever as well
            as events collected by it
          </ModalBody>
          <ModalFooter>
            <HStack spacing="3">
              <Button onClick={onDeleteModalClose} disabled={deleting}>
                No
              </Button>
              <Button
                colorScheme="red"
                onClick={onDeviceDeleteConfirm}
                isLoading={deleting}
              >
                DELETE
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default DeviceList
