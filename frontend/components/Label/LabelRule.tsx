import React, { Fragment } from 'react'
import { Box, Text, HStack } from '@chakra-ui/react'
// Util
import { operatorToString, NumberOperator } from '~/util/rule'
// Type
import * as type from '~/store/type'

type LabelRuleProps = {
  rule: type.LabelRule
}

const LabelRule = ({ rule }: LabelRuleProps) => {
  switch (rule.kind) {
    case 'sound_similarity':
      return (
        <HStack>
          <Text>
            similarity to {rule.payload.wavFile.slice(0, 8)}...
            {rule.payload.wavFile.slice(-8)}
          </Text>
          <Text fontWeight="bold">
            {operatorToString(rule.payload.operator as NumberOperator)}%{' '}
          </Text>
        </HStack>
      )
    case 'position_difference':
      return (
        <HStack>
          {['x', 'y', 'z']
            .map((axis) => ({
              axis,
              operator: rule.payload[axis as 'x' | 'y' | 'z'],
            }))
            .filter((value) => value.operator)
            .map(({ axis, operator }, i) => (
              <Fragment key={axis}>
                {i > 0 ? <Text>&</Text> : null}
                <Text fontWeight="bold">
                  d{axis.toUpperCase()}{' '}
                  {operatorToString(operator as NumberOperator)}
                </Text>
              </Fragment>
            ))}
        </HStack>
      )
    case 'luminosity_difference':
      return <Box>TODO</Box>
    default:
      throw new Error(`unexpected rule ${JSON.stringify(rule)}`)
  }
}

export default LabelRule
