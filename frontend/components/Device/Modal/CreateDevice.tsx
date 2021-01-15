import React from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  HStack,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react'

type CreateDeviceModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: SubmitHandler<{ name: 'string'; description: 'string' }>
  pending: boolean
}

const CreateDeviceModal = ({
  isOpen,
  onClose,
  onSubmit,
  pending,
}: CreateDeviceModalProps) => {
  // Local state
  const { handleSubmit, register } = useForm()
  // Render
  return (
    <Modal isCentered isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
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

export default CreateDeviceModal
