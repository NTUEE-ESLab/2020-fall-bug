import { NumberOperator } from '~/util/rule/type'

export type PageQuery = {}

export type Document<Data> = {
  data: Data
}

export enum EventKind {}

export type EventRes = {
  id: string
  kind: 'sound' | 'posotion' | 'luminosity'
  payload:
    | { wav_file: string }
    | { from: number; to: number }
    | { from: number[]; to: number[] }
  started_at: string
  ended_at: string
  device_id: string
}

export type CreateDeviceReq = {
  name: string
  description: string
}

export type DeleteDeviceReq = {
  id: string
}

export type DeviceRes = {
  id: string
  name: string
  description: string
}

export type CreateLabelReq = {
  event_kind: 'sound' | 'position' | 'luminosity'
  name: string
  description: string
  rule: {
    kind: 'sound_similarity' | 'position_difference' | 'luminosity_difference'
    payload:
      | {
          wav_file: String
          operator: NumberOperator
        }
      | {
          x: NumberOperator
          y: NumberOperator
          z: NumberOperator
        }
      | {
          operator: NumberOperator
        }
  }
  device_id: string
}

export type DeleteLabelReq = {
  id: string
}

export type LabelRes = CreateLabelReq & {
  id: string
}
