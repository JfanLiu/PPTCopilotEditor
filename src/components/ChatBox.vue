<template>
  <div class="chat-box">
    <el-card class="chat-box-history">
      <el-scrollbar wrap-class="chat-box-scrollbar-wrap">
        <!-- 聊天记录列表 -->
        <div class="chat-box-message" v-for="(message, index) in chatHistory" :key="index">
          <el-tag class="chat-box-message-content">
            {{ message.content }}
          </el-tag>

          <el-tag type="info" class="chat-box-message-time">
            {{ message.time }}
          </el-tag>
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
import {ElInput, ElButton, ElCard, ElScrollbar, ElTag} from 'element-plus'
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
    ElTag
  },
  props: {
    height: {
      type: String,
      default: '300px',
    },
  },
  setup(props) {
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
        console.log(currentTime)
        console.log('log info:')
        for (const msg of chatHistory.value) {
          console.log(msg)
        }

        console.log(chatHistory)
        message.value = ''
        slidesStore.request_update_slides(chatHistory.value[chatHistory.value.length - 1].content)
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
