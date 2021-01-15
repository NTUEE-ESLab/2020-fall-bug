import { AxiosInstance, AxiosRequestConfig } from 'axios'
import { PageQuery, Document } from '~/api/type'
import { createTemplateExecutor } from '~/util/template'

export type Get<Query, Data> = (
  query: PageQuery & Query,
  config?: AxiosRequestConfig,
) => Promise<Document<Data>>

export type Post<Body, Data> = (
  body: Body,
  config?: AxiosRequestConfig,
) => Promise<Document<Data>>

export type Delete<Param> = (
  param: Param,
  config?: AxiosRequestConfig,
) => Promise<void>

export function createGet<Query, Data>(
  client: AxiosInstance,
  url: string,
): Get<Query, Data> {
  return (query: PageQuery, config?: AxiosRequestConfig) =>
    client({
      ...config,
      url,
      method: 'GET',
      params: query,
    }).then(({ data }) => data)
}

export function createPost<Body, Data>(
  client: AxiosInstance,
  url: string,
): Post<Body, Data> {
  return (body: Body, config?: AxiosRequestConfig) =>
    client({
      ...config,
      url,
      method: 'POST',
      data: body,
    }).then(({ data }) => data)
}

export function createDelete<Param extends Record<string, string>>(
  client: AxiosInstance,
  url: string,
): Delete<Param> {
  const templateExecutor = createTemplateExecutor<Param>(url)
  return (param: Param, config?: AxiosRequestConfig) =>
    client({
      ...config,
      url: templateExecutor.execute(param),
      method: 'DELETE',
    }).then()
}
