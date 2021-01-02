import axios, { AxiosInstance } from 'axios'
import config from '~/config'
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
} from '~/api/type'

export type { PageQuery } from '~/api/type'

export type Api = {
  _instance: AxiosInstance
  listEvent: Get<{}, EventRes[]>
  createDevice: Post<CreateDeviceReq, DeviceRes>
  listDevice: Get<{}, DeviceRes[]>
  deleteDevice: Delete<DeleteDeviceReq>
}

export const createApi = (endpoint: string): Api => {
  const client = axios.create({ baseURL: endpoint })

  const api = {
    _instance: client,
    listEvent: createGet<{}, EventRes[]>(client, '/v1/events'),
    createDevice: createPost<CreateDeviceReq, DeviceRes>(client, '/v1/devices'),
    listDevice: createGet<{}, DeviceRes[]>(client, '/v1/devices'),
    deleteDevice: createDelete<DeleteDeviceReq>(client, '/v1/devices/{id}'),
  }

  return api
}

export default createApi(config.backend.endpoint)
