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
import LabelTag from '~/components/UI/Tag/Label'
// Type
import { Label } from '~/store/type'

type DeleteLabelModalProps = {
  isOpen: boolean
  onClose: () => void
  label: Label
  onSubmit: () => void
  pending: boolean
}

const DeleteLabelModal = ({
  isOpen,
  onClose,
  label,
  onSubmit,
  pending,
}: DeleteLabelModalProps) => (
  <Modal isCentered isOpen={isOpen} onClose={onClose}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>Delete Label</ModalHeader>
      <ModalBody>
        Label <LabelTag variant="name" label={label} /> will be deleted forever
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

export default DeleteLabelModal
