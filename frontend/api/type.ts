export type PageQuery = {}

export type Document<Data> = {
  data: Data | Data[]
}

export enum EventKind {}

export type EventRes = {
  id: string
  kind: 'sound' | 'posotion' | 'luminoxity'
  payload:
    | { wav_file: string }
    | { from: number; to: number }
    | { from: number[]; to: number[] }
  started_at: string
  ended_at: string
  device_id: string
}

export type DeviceRes = {
  id: string
  name: string
  description: string
}
