import axios from '@/utils/axiosRequest'

export interface UpdateSlidesRequest {
  'prompt': string,
  'slide': string,
}

export interface UpdateStyleRequest {
  'prompt': string,
  'slide': { id: string, content: string }[],
}


export const update_slides = (params: UpdateSlidesRequest) => {
  return axios.post<object>('/gpt/update_slide', params)
}

export const update_styles = (params: UpdateStyleRequest) => {
  return axios.post<object>('/agent/change_style', params)
}

export const guide_slide = (params: object) => {
  return axios.post<object>('/gpt/guide_slide', params)
}
