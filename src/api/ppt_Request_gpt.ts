import axios from '@/utils/axiosRequest'

export interface UpdateSlidesRequest {
  'prompt': string,
  'slide': string,
}

export interface UpdateStyleRequest {
  'prompt': string,
  'slide': { id: string, content: string }[],
}

export interface InsertTextRequest {
  'prompt': string,
  'textnow': {top: number, left: number, width:number, height:number, rotate:number, content: string}[],
}

export const update_slides = (params: UpdateSlidesRequest) => {
  return axios.post<object>('/gpt/update_slide', params)
}

export const update_styles = (params: UpdateStyleRequest) => {
  return axios.post<object>('/agent/change_style', params)
}

export const insert_text = (params: InsertTextRequest) => {
  return axios.post<object>('/agent/insert_text', params)
}

export const guide_slide = (params: object) => {
  return axios.post<object>('/gpt/guide_slide', params)
}
