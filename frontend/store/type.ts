import { NumberOperator } from '~/util/rule/type'

export type Status = {
  pending: boolean
  resolved: boolean
  rejected: any
}

export type State<T, E = {}> = E & {
  keys: string[]
  entities: Record<string, T>
}

export type StatusState = {
  status: Record<string, Status>
}

export type AsyncState<T, E = {}> = State<T, E> & StatusState

type EventBase = {
  id: string
  startedAt: string
  endedAt: string
  device: Device
  labels: Label[]
}

export type EventSound = EventBase & {
  kind: 'sound'
  payload: { wavFile: string }
}

export type EventPosition = EventBase & {
  kind: 'position'
  payload: { from: number[]; to: number[] }
}

export type EventLuminosity = EventBase & {
  kind: 'luminosity'
  payload: { from: number; to: number }
}

export type Event = EventSound | EventPosition | EventLuminosity

export type EventKind = Event['kind']

export type NormalizedEvent = Omit<Event, 'device' | 'labels'> & {
  device: string
  labels: string[]
}

export type Device = {
  id: string
  name: string
  description: string
  secret?: string
  labels: Label[]
}

export type NormalizedDevice = Omit<Device, 'labels'> & {
  labels: string[]
}

export type LabelSoundSimilarity = {
  kind: 'sound_similarity'
  payload: {
    wavFile: String
    operator: NumberOperator
  }
}

export type LabelPositionDifference = {
  kind: 'position_difference'
  payload: {
    x?: NumberOperator
    y?: NumberOperator
    z?: NumberOperator
  }
}

export type LabelLuminosityDifference = {
  kind: 'luminosity_difference'
  payload: {
    operator: NumberOperator
  }
}

export type LabelRule =
  | LabelSoundSimilarity
  | LabelPositionDifference
  | LabelLuminosityDifference

export type LabelRuleKind = LabelRule['kind']

export type Label = {
  id: string
  eventKind: Event['kind']
  name: string
  description: string
  rule: LabelRule
  device: Device
}

export type NormalizedLabel = Omit<Label, 'device'> & {
  device: string
}
