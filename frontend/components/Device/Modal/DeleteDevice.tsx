import React from 'react'
import {
  Button,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react'
// Component
import DeviceTag from '~/components/UI/Tag/Device'
// Type
import { Device } from '~/store/type'

type DeleteDeviceModalProps = {
  isOpen: boolean
  onClose: () => void
  device: Device
  onSubmit: () => void
  pending: boolean
}

const DeleteDeviceModal = ({
  isOpen,
  onClose,
  device,
  onSubmit,
  pending,
}: DeleteDeviceModalProps) => (
  <Modal isCentered isOpen={isOpen} onClose={onClose}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>Delete Device</ModalHeader>
      <ModalBody>
        Device <DeviceTag device={device} /> will be deleted forever as well as
        events collected by it
      </ModalBody>
      <ModalFooter>
        <HStack spacing="3">
          <Button onClick={onClose} disabled={pending}>
            No
          </Button>
          <Button colorScheme="red" onClick={onSubmit} isLoading={pending}>
            DELETE
          </Button>
        </HStack>
      </ModalFooter>
    </ModalContent>
  </Modal>
)

export default DeleteDeviceModal
