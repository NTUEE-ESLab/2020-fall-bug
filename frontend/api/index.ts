import axios, { AxiosInstance } from 'axios'
import config from '~/config'
import { createGet, Get } from '~/api/helper'
import { EventRes, DeviceRes } from '~/api/type'

export type { PageQuery } from '~/api/type'

export type Api = {
  _instance: AxiosInstance
  listEvent: Get<{}, EventRes>
  listDevice: Get<{}, DeviceRes>
}

export const createApi = (endpoint: string): Api => {
  const client = axios.create({ baseURL: endpoint })

  const api = {
    _instance: client,
    listEvent: createGet<{}, EventRes>(client, '/v1/events'),
    listDevice: createGet<{}, DeviceRes>(client, '/v1/devices'),
  }

  return api
}

export default createApi(config.backend.endpoint)
