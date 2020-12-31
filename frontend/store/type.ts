export type FetchableState<T, E = {}> = {
  keys: string[]
  entities: { [key: string]: T }
  status: {
    fetching: boolean
    error: any
  }
} & E

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
}
