import { ElementTypes } from '@/types/slides'
import axios from '@/utils/axiosRequest'

export interface UpdateSlidesRequest {
  'prompt': string,
  'slide': string,
}

export interface UpdateStyleRequest {
  'prompt': string,
  'slide': { id: string, content: string }[],
}

export interface AddImageRequest {
  'keyword': string,
}
export interface InsertTextRequest {
  'prompt': string,
  'textnow': { top: number, left: number, width: number, height: number, rotate: number, content: string }[],
}

export interface GenTasksRequest {
  'slide': string,
  'prompt': string,
}

export const update_slides = (params: UpdateSlidesRequest) => {
  return axios.post<object>('/gpt/update_slide', params)
}

export const update_styles = (params: UpdateStyleRequest) => {
  return axios.post<object>('/agent/change_style', params)
}

export const insert_text = (params: InsertTextRequest) => {
  return axios.post<object>('/agent/add_text', params)
}

export const add_images = (params: AddImageRequest) => {
  return axios.post<object>('/agent/get_image', params)
}

export const guide_slide = (params: object) => {
  return axios.post<object>('/gpt/guide_slide', params)
}

export const gen_tasks = (params: GenTasksRequest) => {
  return axios.post<object>('/agent/gen_tasks', params)
}
