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
  deviceId: string
}

export type EventSound = EventBase & {
  kind: 'sound'
  payload: { wavFile: string }
}

export type EventPosition = EventBase & {
  kind: 'position'
  payload: { from: number[]; to: number[] }
}

export type EventLuminoxity = EventBase & {
  kind: 'luminoxity'
  payload: { from: number; to: number }
}

export type Event = EventSound | EventPosition | EventLuminoxity

export type Device = {
  id: string
  name: string
  description: string
  secret?: string
}
