import React from 'react'
import { Controller } from 'react-hook-form'
import Select from 'react-select'

const operatorOptions = [
  {
    value: 'eq',
    label: 'equal',
  },
  {
    value: 'gt',
    label: 'greater than',
  },
  {
    value: 'lt',
    label: 'less than',
  },
  {
    value: 'gte',
    label: 'greater than or equal',
  },
  {
    value: 'lte',
    label: 'less than or equal',
  },
]

const SelectOperator = ({
  defaultValue,
  ...props
}:
  | (Omit<React.ComponentProps<typeof Controller>, 'as'> &
      Omit<React.ComponentProps<typeof Select>, 'options'> & {
        defaultValue?: 'eq' | 'gt' | 'lt' | 'gte' | 'lte'
      })
  | any) => (
  <Controller
    {...props}
    as={Select}
    defaultValue={
      defaultValue &&
      operatorOptions.find(({ value }) => value === defaultValue)
    }
    isClearable
    options={operatorOptions}
  />
)

export default SelectOperator
