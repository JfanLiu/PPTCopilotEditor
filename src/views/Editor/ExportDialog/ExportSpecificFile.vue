<template>
  <div class="export-pptist-dialog">
    <div class="thumbnails-view">
      <div class="thumbnails" ref="imageThumbnailsRef"  >
        <ThumbnailSlide 
          class="thumbnail" 
          v-for="slide in renderSlides" 
          :key="slide.id" 
          :slide="slide" 
          :size="1600" 
        />
      </div>
    </div>
    <div class="configs">
      <div class="row">
        <div class="title">导出范围：</div>
        <RadioGroup
          class="config-item"
          v-model:value="rangeType"
        >
          <RadioButton style="width: 33.33%;" value="all">全部</RadioButton>
          <RadioButton style="width: 33.33%;" value="current">当前页</RadioButton>
          <RadioButton style="width: 33.33%;" value="custom">自定义</RadioButton>
        </RadioGroup>
      </div>
      <div class="row" v-if="rangeType === 'custom'">
        <div class="title" :data-range="`（${range[0]} ~ ${range[1]}）`">自定义范围：</div>
        <Slider
          class="config-item"
          range
          :min="1"
          :max="slides.length"
          :step="1"
          v-model:value="range"
        />
      </div>
      <div class="tip">
        将修改内容保存到云端
      </div>
    </div>
    <!--        橙色的字, 居中-->
    <div v-show="showMessage" id="save2cloud" class="title" style="color: #ff9900; text-align: center;">
      <span>保存成功！</span>
    </div>
    <div class="btns">
      <Button class="btn export" type="primary" @click="pushSaveBtnHandler()">保存到云端</Button>
      <Button class="btn close" @click="emit('close')">关闭</Button>
    </div>
  </div>

</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useSlidesStore } from '@/store'
import useExport from '@/hooks/useExport'
const { slides, currentSlide } = storeToRefs(useSlidesStore())

import ThumbnailSlide from '@/views/components/ThumbnailSlide/index.vue'

import {
  Button,
  Slider,
  Radio,
} from 'ant-design-vue'
const { Group: RadioGroup, Button: RadioButton } = Radio

const emit = defineEmits<{
  (event: 'close'): void
}>()


const { saveToCloud } = useExport()

const rangeType = ref<'all' | 'current' | 'custom'>('all')
const range = ref<[number, number]>([1, slides.value.length])

const selectedSlides = computed(() => {
  if (rangeType.value === 'all') return slides.value
  if (rangeType.value === 'current') return [currentSlide.value]
  return slides.value.filter((item, index) => {
    const [min, max] = range.value
    return index >= min - 1 && index <= max - 1
  })
})

const showMessage = ref(false)

const pushSaveBtnHandler = () => {
  expImageCover()
  console.log(selectedSlides.value)
  saveToCloud(selectedSlides.value)
  showMessage.value = true
  // 暂停
  setTimeout(() => {
    showMessage.value = false
    emit('close')
  }, 1000)
}

const {exportImage, exportCoverImage, exporting } = useExport()
const imageThumbnailsRef = ref<HTMLElement>()
const exp_range = ref<[number, number]>([1, 1])
const renderSlides = computed(() => {
  console.log('computed:', exp_range.value)
  return slides.value.filter((item, index) => {
    const [min, max] = exp_range.value
    return index >= min - 1 && index <= max - 1
  })
})
const format = 'png'
const quality = 1
const ignoreWebfont = true
const isCover = true
const isContent = false
const expImageCover = async () => {
  console.log('expImageCover', imageThumbnailsRef.value)
  if (!imageThumbnailsRef.value) return
  exp_range.value = [1, 1]
  await exportCoverImage(imageThumbnailsRef.value, format, quality, ignoreWebfont, isCover)
  exp_range.value = [1, slides.value.length]
  exportCoverImage(imageThumbnailsRef.value, format, quality, ignoreWebfont, isContent)
  // exportImage(imageThumbnailsRef.value, format, quality, ignoreWebfont)
}

console.log('chatBox')
</script>

<style lang="scss" scoped>
.thumbnails-view{
  @include absolute-0();

  &::after {
    content: '';
    background-color: #fff;
    @include absolute-0();
  }
}
.export-pptist-dialog {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}
.configs {
  width: 350px;
  height: calc(100% - 100px);
  display: flex;
  flex-direction: column;
  justify-content: center;

  .row {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 25px;
  }

  .title {
    width: 100px;
    position: relative;

    &::after {
      content: attr(data-range);
      position: absolute;
      top: 20px;
      left: 0;
    }
  }
  .config-item {
    flex: 1;
  }

  .tip {
    font-size: 12px;
    color: #aaa;
    line-height: 1.8;
    margin-top: 25px;
  }
}
.btns {
  width: 300px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;

  .export {
    flex: 1;
  }
  .close {
    width: 100px;
    margin-left: 10px;
  }
}

</style>
