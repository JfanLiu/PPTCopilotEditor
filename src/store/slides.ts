import { defineStore } from 'pinia'
import { nanoid } from 'nanoid'
import tinycolor from 'tinycolor2'
import { omit } from 'lodash'
import { Slide, SlideTheme, PPTElement, PPTAnimation, PPTTextElement } from '@/types/slides'
import { slides } from '@/mocks/slides'
import { theme } from '@/mocks/theme'
import { layouts } from '@/mocks/layout'
import { update_slides, UpdateSlidesRequest, UpdateStyleRequest, update_styles, AddImageRequest, add_images, InsertTextRequest, insert_text, GenTasksRequest, gen_tasks } from '@/api/ppt_Request_gpt'
import useSlide2Dom from '@/hooks/useSlide2Dom'
import useXml2Slide from '@/hooks/useXml2Slide'
import axiosRequest from '@/utils/axiosRequest'

const { convert_slide_to_dom, convert_slides_to_dom } = useSlide2Dom()
const { update_xml_to_dom_to_slide } = useXml2Slide()
interface RemoveElementPropData {
  id: string
  propName: string | string[]
}

interface UpdateElementData {
  id: string | string[]
  props: Partial<PPTElement>
}

interface FormatedAnimation {
  animations: PPTAnimation[]
  autoNext: boolean
}

export interface SlidesState {
  theme: SlideTheme
  slides: Slide[]
  slideIndex: number
  viewportRatio: number
}

export const useSlidesStore = defineStore('slides', {
  state: (): SlidesState => ({
    theme: theme, // 主题样式
    slides: slides, // 幻灯片页面数据
    slideIndex: 0, // 当前页面索引
    viewportRatio: 0.5625, // 可视区域比例，默认16:9
  }),

  getters: {
    currentSlide(state) {
      return state.slides[state.slideIndex]
    },

    currentSlideAnimations(state) {
      const currentSlide = state.slides[state.slideIndex]
      if (!currentSlide?.animations) return []

      const els = currentSlide.elements
      const elIds = els.map(el => el.id)
      return currentSlide.animations.filter(animation => elIds.includes(animation.elId))
    },

    // 格式化的当前页动画
    // 将触发条件为“与上一动画同时”的项目向上合并到序列中的同一位置
    // 为触发条件为“上一动画之后”项目的上一项添加自动向下执行标记
    formatedAnimations(state) {
      const currentSlide = state.slides[state.slideIndex]
      if (!currentSlide?.animations) return []

      const els = currentSlide.elements
      const elIds = els.map(el => el.id)
      const animations = currentSlide.animations.filter(animation => elIds.includes(animation.elId))

      const formatedAnimations: FormatedAnimation[] = []
      for (const animation of animations) {
        if (animation.trigger === 'click' || !formatedAnimations.length) {
          formatedAnimations.push({ animations: [animation], autoNext: false })
        }
        else if (animation.trigger === 'meantime') {
          const last = formatedAnimations[formatedAnimations.length - 1]
          last.animations = last.animations.filter(item => item.elId !== animation.elId)
          last.animations.push(animation)
          formatedAnimations[formatedAnimations.length - 1] = last
        }
        else if (animation.trigger === 'auto') {
          const last = formatedAnimations[formatedAnimations.length - 1]
          last.autoNext = true
          formatedAnimations[formatedAnimations.length - 1] = last
          formatedAnimations.push({ animations: [animation], autoNext: false })
        }
      }
      return formatedAnimations
    },

    layouts(state) {
      const {
        themeColor,
        fontColor,
        fontName,
        backgroundColor,
      } = state.theme

      const subColor = tinycolor(fontColor).isDark() ? 'rgba(230, 230, 230, 0.5)' : 'rgba(180, 180, 180, 0.5)'

      const layoutsString = JSON.stringify(layouts)
        .replaceAll('{{themeColor}}', themeColor)
        .replaceAll('{{fontColor}}', fontColor)
        .replaceAll('{{fontName}}', fontName)
        .replaceAll('{{backgroundColor}}', backgroundColor)
        .replaceAll('{{subColor}}', subColor)

      return JSON.parse(layoutsString)
    },
  },

  actions: {
    setTheme(themeProps: Partial<SlideTheme>) {
      this.theme = { ...this.theme, ...themeProps }
    },

    setViewportRatio(viewportRatio: number) {
      this.viewportRatio = viewportRatio
    },

    setSlides(slides: Slide[]) {
      this.slides = slides
    },

    addSlide(slide: Slide | Slide[]) {
      const slides = Array.isArray(slide) ? slide : [slide]
      const addIndex = this.slideIndex + 1
      this.slides.splice(addIndex, 0, ...slides)
      this.slideIndex = addIndex
    },

    updateSlide(props: Partial<Slide>) {
      const slideIndex = this.slideIndex
      this.slides[slideIndex] = { ...this.slides[slideIndex], ...props }
    },

    deleteSlide(slideId: string | string[]) {
      const slidesId = Array.isArray(slideId) ? slideId : [slideId]

      const deleteSlidesIndex = []
      for (let i = 0; i < slidesId.length; i++) {
        const index = this.slides.findIndex(item => item.id === slidesId[i])
        deleteSlidesIndex.push(index)
      }
      let newIndex = Math.min(...deleteSlidesIndex)

      const maxIndex = this.slides.length - slidesId.length - 1
      if (newIndex > maxIndex) newIndex = maxIndex

      this.slideIndex = newIndex
      this.slides = this.slides.filter(item => !slidesId.includes(item.id))
    },

    updateSlideIndex(index: number) {
      this.slideIndex = index
    },

    addElement(element: PPTElement | PPTElement[]) {
      const elements = Array.isArray(element) ? element : [element]
      const currentSlideEls = this.slides[this.slideIndex].elements
      const newEls = [...currentSlideEls, ...elements]
      this.slides[this.slideIndex].elements = newEls
    },

    deleteElement(elementId: string | string[]) {
      const elementIdList = Array.isArray(elementId) ? elementId : [elementId]
      const currentSlideEls = this.slides[this.slideIndex].elements
      const newEls = currentSlideEls.filter(item => !elementIdList.includes(item.id))
      this.slides[this.slideIndex].elements = newEls
    },

    updateElement(data: UpdateElementData) {
      const { id, props } = data
      const elIdList = typeof id === 'string' ? [id] : id
      // console.log('this.slides')
      // console.log(this.slides[this.slideIndex])
      // console.log(this.slides[this.slideIndex].elements)
      const slideIndex = this.slideIndex
      const slide = this.slides[slideIndex]
      const elements = slide.elements.map(el => {
        return elIdList.includes(el.id) ? { ...el, ...props } : el
      })
      this.slides[slideIndex].elements = (elements as PPTElement[])
    },

    removeElementProps(data: RemoveElementPropData) {
      const { id, propName } = data
      const propsNames = typeof propName === 'string' ? [propName] : propName

      const slideIndex = this.slideIndex
      const slide = this.slides[slideIndex]
      const elements = slide.elements.map(el => {
        return el.id === id ? omit(el, propsNames) : el
      })
      this.slides[slideIndex].elements = (elements as PPTElement[])
    },

    request_gen_tasks(prompt: string) {
      const gen_tasks_request: GenTasksRequest = {
        'slide': '',
        'prompt': '',
      }

      gen_tasks_request['prompt'] = prompt
      const target_slides = this.slides[this.slideIndex]

      const dom_top = convert_slide_to_dom(target_slides)
      gen_tasks_request['slide'] = dom_top.outerHTML

      return gen_tasks(gen_tasks_request).then((response) => {
        console.log('任务请求响应')
        console.log(JSON.stringify(response))
        return response.data as { task_name: string, prompt: string }[]
      })
    },

    // request_task(task: object) {
    //   const a = 1
    // },

    request_update_slides(prompt: string) {
      const update_slides_request: UpdateSlidesRequest = {
        'prompt': '',
        'slide': '',
      }
      update_slides_request['prompt'] = prompt

      const target_slides = this.slides[this.slideIndex]

      // const dom_top = convert_slides_to_dom(target_slides)
      const dom_top = convert_slide_to_dom(target_slides)
      console.log('显示Slide')
      console.log(target_slides)
      update_slides_request['slide'] = dom_top.outerHTML

      let receive_xml = `
      <slides>
        <slide id="test-slide-1">
          <p id="idn7Mx">论语</p>
          <p id="7stmVP">有朋自远方来，不亦乐乎。</p>
        </slide>
      </slides>
`
      console.log('要修改的页面和命令：')
      console.log(JSON.stringify(update_slides_request, null, 2))

      // const res_slides = update_xml_to_dom_to_slide(receive_xml, target_slides)
      // for (let i = 0; i < res_slides.length; i++) {
      //   target_slides[i] = res_slides[i]
      // }
      // this.slides[this.slideIndex] = res_slides[0]

      return update_slides(update_slides_request).then((response) => {
        console.log('response:', JSON.stringify(response, null, 2))
        const data = JSON.parse(JSON.stringify(response, null, 2))['data'] as string
        if (data) {
          receive_xml = data

          console.log('接收到的页面：', receive_xml)

          // 将 receive_xml 中所有的 \ 和 \\ 替换为 空串
          receive_xml = receive_xml.replace(/\\/g, '')

          // [\s\S]*? 用于匹配 <section> 和 </section> 之间的任何字符，包括换行符
          const pattern = /<section[\s\S]*?<\/section>/
          const match = receive_xml.match(pattern)
          if (match) {
            receive_xml = match[0]
          }
          else {
            console.log('No match found')
          }

          const res_slides = update_xml_to_dom_to_slide(receive_xml, [target_slides])
          // for (let i = 0; i < res_slides.length; i++) {
          //   target_slides[i] = res_slides[i]
          // }
          this.slides[this.slideIndex] = res_slides[0]
        }
      }).catch(error => {
        console.error('An error occurred:', error)
      })

    },

    request_update_style(prompt: string) {
      const update_style_requset: UpdateStyleRequest = {
        'prompt': '',
        'slide': [],
      }
      update_style_requset['prompt'] = prompt
      const target_slides = this.slides[this.slideIndex]
      const elements = target_slides.elements // 引用传值

      console.log('slides.ts中的update_style')

      for (let j = 0; j < elements.length; j++) {
        console.log(elements[j].type)
        if (elements[j].type === 'text') {
          const textElement = elements[j] as PPTTextElement
          console.log(JSON.stringify(textElement))
          const slideElement = { id: textElement.id, content: textElement.content }
          update_style_requset.slide.push(slideElement)
        }
      }

      console.log(update_style_requset)

      return update_styles(update_style_requset).then((response) => {
        console.log(response)
        const data = JSON.parse(JSON.stringify(response, null, 2))['data']
        console.log(data)

        // 现在 jsonArray 是一个包含了多个对象的数组，你可以通过遍历访问每个对象的属性
        data.forEach((item: { id: string, content: string }) => {
          console.log('ID:', item.id)
          console.log('Content:', item.content)

          const elementId = item.id
          const updatedProps: Partial<PPTElement> = {
            content: item.content,
          }
          this.updateElement({ id: elementId, props: updatedProps })
        })

      }).catch(error => {
        console.error('An error occurred:', error)
      })
    },

    request_insert_text(prompt: string) {
      const insert_requset: InsertTextRequest = {
        'prompt': '',
        'textnow': [],
      }
      insert_requset['prompt'] = prompt
      const target_slides = this.slides[this.slideIndex]
      const elements = target_slides.elements // 引用传值

      console.log('slides.ts中的request_insert_text')

      for (let j = 0; j < elements.length; j++) {
        console.log(elements[j].type)
        if (elements[j].type === 'text') {
          const textElement = elements[j] as PPTTextElement
          console.log(JSON.stringify(textElement))
          const slideElement = {
            top: textElement.top, left: textElement.left,
            width: textElement.width, height: textElement.height,
            rotate: textElement.rotate, content: textElement.content
          }
          insert_requset.textnow.push(slideElement)
        }

      }
      console.log(insert_requset.textnow)

      return insert_text(insert_requset).then((response) => {
        console.log(response)
        const data = JSON.parse(JSON.stringify(response, null, 2))['data']
        console.log(data)

        // 现在 jsonArray 是一个包含了多个对象的数组，你可以通过遍历访问每个对象的属性
        data.forEach((item: { top: number, left: number, width: number, height: number, rotate: number, content: string }) => {
          console.log('return_text:', item)
          const id = nanoid(10)
          this.addElement({
            type: 'text',
            id,
            left: item.left,
            top: item.top,
            width: item.width,
            height: item.height,
            content: item.content,
            rotate: 0,
            defaultFontName: theme.fontName,
            defaultColor: theme.fontColor,
            vertical: false,
          })
          // addHistorySnapshot()
        })

      }).catch(error => {
        console.error('An error occurred:', error)
      })
    },

    request_add_image(keyword: string) {
      const add_image_request: AddImageRequest = {
        'keyword': ''
      }

      add_image_request['keyword'] = keyword

      console.log(add_image_request)

      return add_images(add_image_request).then((response) => {
        // mocking
        // response = {
        //   'code': 0,
        //   'msg': 'success',
        //   'data': []
        // }
        console.log(response)

        if (response.code !== 0) {
          console.log('生成图片失败')
          return []
        }
        console.log(response)
        return response.data as string[]
      }).catch(error => {
        console.error('An error occurred:', error)
      })
    },
  },
})
