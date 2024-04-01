<template>
  <div class="chat-box">
    <el-card class="chat-box-history">
      <el-scrollbar wrap-class="chat-box-scrollbar-wrap">
        <!-- 聊天记录列表 -->
        <div class="chat-box-message" v-for="(message, index) in chatHistory" :key="index">
          <div :class="{ 'latest-message' : index == (chatHistory.length - 1)}">
            <el-tag class="chat-box-message-content">
              {{ message.content }}
            </el-tag>

            <el-tag class="chat-box-message-time" type="info">
                {{ message.time }}
            </el-tag>
          </div>
        </div>

      </el-scrollbar>
    </el-card>

    <div class="chat-box-input">
      <el-input v-model="message" placeholder="请输入对话内容" @keyup.enter="submitMessage()" clearable></el-input>
      <el-button type="primary" @click="submitMessage">发送</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref, onMounted} from 'vue'
import {ElInput, ElButton, ElCard, ElScrollbar, ElTag, ElLoading} from 'element-plus'
import {useSlidesStore} from '@/store'
import {storeToRefs} from 'pinia'

interface ChatHistoryItem {
  time: string;
  content: string;
  success: boolean;
}

export default defineComponent({
  name: 'ChatBox',
  components: {
    ElInput,
    ElButton,
    ElCard,
    ElScrollbar,
    ElTag
  },
  props: {
    height: {
      type: String,
      default: '300px',
    },
  },
  setup(props) {
    const loading = ref(false)
    // const svg = `
    //     <path class="path" d="
    //       M 30 15
    //       L 28 17
    //       M 25.61 25.61
    //       A 15 15, 0, 0, 1, 15 30
    //       A 15 15, 0, 1, 1, 27.99 7.5
    //       L 15 15
    //     " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
    //   `

    const chatHistory = ref<ChatHistoryItem[]>([])
    const message = ref('')

    const slidesStore = useSlidesStore()
    const {currentSlide} = storeToRefs(slidesStore)

    // slidesStore.request_update_slides('请帮我把这个ppt修改为论语主题')

    const submitMessage = async () => {
      // 加载时禁止发送信息
      if (loading.value) {
        return
      }

      // 确保发送的信息不为空
      if (message.value) {
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        chatHistory.value.push({
          time: currentTime,
          content: message.value,
          success: true
        })

        // 信息清零
        message.value = ''

        // 保证DOM更新后再加载Loading动画
        await Promise.resolve()

        loading.value = true
        const loadingInstance = ElLoading.service({
          target: '.latest-message',
          fullscreen: false,
          // text: 'Loading...',
          // spinner: svg,
          background: 'rgba(255, 255, 255, 0.5)'
        })

        // slidesStore.request_update_slides(chatHistory.value[chatHistory.value.length - 1].content).then(() => {
        //   loading.value = false
        //   loadingInstance.close()
        // })
        // slidesStore.request_update_style(chatHistory.value[chatHistory.value.length - 1].content).then(() => {
        //   loading.value = false
        //   loadingInstance.close()
        // })
        slidesStore.request_insert_text(chatHistory.value[chatHistory.value.length - 1].content).then(() => {
          loading.value = false
          loadingInstance.close()
        })
        scrollToBottom()
      }
    }

    const scrollToBottom = () => {
      const historyEl = document.querySelector('.chat-box-history')
      if (historyEl) {
        historyEl.scrollTop = historyEl.scrollHeight
      }
    }

    onMounted(() => {
      scrollToBottom()
    })

    return {
      chatHistory,
      message,
      submitMessage
    }
  },
})
</script>

<style scoped>
.example-showcase .el-loading-mask {
  z-index: 9;
}

.chat-box {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 480px;
}

.chat-box-history {
  flex: 1;
  overflow-y: auto;
}

.chat-box-scrollbar-wrap {
  height: 100%;
}

.chat-box-message {
  display: block;
  margin-bottom: 1%;
}

.chat-box-message::after {
  /* 清除浮动，用于正确计算父级元素高度 */
  content: "";
  display: table;
  clear: both;
}

.chat-box-loading {
  display: inline;
  height: 100%;
  color: pink;
  aspect-ratio: 1;
}

.chat-box-message-content {
  padding-top: 10px;
  padding-bottom: 10px;
  font-size: 100%;
  height: fit-content;
  white-space: pre-wrap;
}

.chat-box-message-time {
  float: right;
  margin-top: 5px;
}

.chat-box-input {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 10px;
}

.chat-item {
  color: blue;
  font-size: 18px;
  margin: 10px 0;
}
</style>
