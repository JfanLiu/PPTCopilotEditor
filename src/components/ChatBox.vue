<template>
  <div class="chat-box">
    <el-card class="chat-box-history">
      <el-scrollbar wrap-class="chat-box-scrollbar-wrap">
        <!-- 聊天记录列表 -->
        <div class="chat-box-message" v-for="(message, index) in chatHistory" :key="index">
          <el-tag class="chat-box-message-content">
            {{ message.content }}
          </el-tag>

          <div class="chat-box-message-time">
            <el-tag type="info">
              {{ message.time }}
            </el-tag>
          </div>
        </div>

      </el-scrollbar>
    </el-card>

    <div class="chat-box-input">
      <el-input v-model="message" placeholder="请输入对话内容" @keyup.enter="submitMessage()" clearable></el-input>
      <el-button type="primary" @click="submitMessage">发送</el-button>
      <el-loading :visible="loading" :full-screen="true" :text="loadingText" :background="loadingBackground" v-if="loading">
        <div style="padding: 20px; text-align: center;">
          <span>加载中...</span>
        </div>
      </el-loading>
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
}

export default defineComponent({
  name: 'ChatBox',
  components: {
    ElInput,
    ElButton,
    ElCard,
    ElScrollbar,
    ElTag,
    ElLoading
  },
  props: {
    height: {
      type: String,
      default: '300px',
    },
  },
  setup(props) {
    const loading = ref(true)
    const loadingText = ref('Loading...')
    const loadingBackground = ref('rgba(255, 255, 255, 0.7)') // 加载动画的背景色

    const chatHistory = ref<ChatHistoryItem[]>([])
    const message = ref('')

    const slidesStore = useSlidesStore()
    const {currentSlide} = storeToRefs(slidesStore)

    // slidesStore.request_update_slides('请帮我把这个ppt修改为论语主题')

    const submitMessage = () => {
      if (message.value) {
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        chatHistory.value.push({
          time: currentTime,
          content: message.value,
        })
        // console.log(currentTime)
        // console.log('log info:')
        // for (const msg of chatHistory.value) {
        //   console.log(msg)
        // }

        // console.log(chatHistory)
        message.value = ''
        loading.value = true
        console.log('loading')
        slidesStore.request_update_slides(chatHistory.value[chatHistory.value.length - 1].content)
        // loading.value = false
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
      submitMessage,
      loading,
      loadingText,
      loadingBackground
    }
  },
})
</script>

<style scoped>
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
