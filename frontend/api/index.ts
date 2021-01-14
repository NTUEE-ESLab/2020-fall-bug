import axios, { AxiosInstance } from 'axios'
import config from '~/config'
import { isBrowser } from '~/util/env'
import {
  createGet,
  createPost,
  createDelete,
  Get,
  Post,
  Delete,
} from '~/api/helper'
import {
  EventRes,
  CreateDeviceReq,
  DeleteDeviceReq,
  DeviceRes,
  CreateLabelReq,
  DeleteLabelReq,
  LabelRes,
} from '~/api/type'

export type { PageQuery } from '~/api/type'

export type Api = {
  axiosInstance: AxiosInstance
  eventChannel: WebSocket
  listEvent: Get<{}, EventRes[]>
  createDevice: Post<CreateDeviceReq, DeviceRes>
  listDevice: Get<{}, DeviceRes[]>
  deleteDevice: Delete<DeleteDeviceReq>
  createLabel: Post<CreateLabelReq, LabelRes>
  listLabel: Get<{}, LabelRes[]>
  deleteLabel: Delete<DeleteLabelReq>
}

export const createApi = (host: string): Api => {
  const client = axios.create({ baseURL: `http://${host}` })

  const api = {
    axiosInstance: client,
    eventChannel: (isBrowser()
      ? new WebSocket(`ws://${host}/ws/event`)
      : undefined) as WebSocket,
    listEvent: createGet<{}, EventRes[]>(client, '/v1/events'),
    createDevice: createPost<CreateDeviceReq, DeviceRes>(client, '/v1/devices'),
    listDevice: createGet<{}, DeviceRes[]>(client, '/v1/devices'),
    deleteDevice: createDelete<DeleteDeviceReq>(client, '/v1/devices/{id}'),
    createLabel: createPost<CreateLabelReq, LabelRes>(client, '/v1/labels'),
    listLabel: createGet<{}, LabelRes[]>(client, '/v1/labels'),
    deleteLabel: createDelete<DeleteLabelReq>(client, '/v1/labels/{id}'),
  }

  return api
}

export default createApi(config.backend.host)
