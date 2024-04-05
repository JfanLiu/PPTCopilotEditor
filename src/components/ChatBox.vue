<template>
  <div class="chat-box">
    <el-card class="chat-box-history">
      <el-scrollbar wrap-class="chat-box-scrollbar-wrap">
        <!-- 聊天记录列表 -->
        <div class="chat-box-message" v-for="(message, index) in chatHistory" :key="index">
          <div :class="{ 'latest-message': index == (chatHistory.length - 1) }">
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
import { defineComponent, ref, onMounted } from 'vue'
import { ElInput, ElButton, ElCard, ElScrollbar, ElTag, ElLoading } from 'element-plus'
import { useSlidesStore } from '@/store'
import { storeToRefs } from 'pinia'

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
    const loading = ref(false)
    const loadingConfig = {
      target: '.latest-message',
      fullscreen: false,
      background: 'rgba(255, 255, 255, 0.5)'
    }

    const chatHistory = ref<ChatHistoryItem[]>([])
    const message = ref('')

    const slidesStore = useSlidesStore()
    const { currentSlide } = storeToRefs(slidesStore)

    // slidesStore.request_update_slides('请帮我把这个ppt修改为论语主题')

    const submitMessage2 = async () => {
      // 加载时不发送信息，消息为空不发送消息
      if (loading.value || !message.value) {
        return
      }

      // 向聊天记录中添加一条记录，添加完成后将记录清零
      const currentTime = new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
      const prompt = message.value
      chatHistory.value.push({
        time: currentTime,
        content: prompt
      })
      message.value = ''

      // 保证DOM更新后再加载Loading动画
      await Promise.resolve()

      loading.value = true
      const loadingInstance = ElLoading.service(loadingConfig)

      // 生成工作流
      // const workflow_response = await slidesStore.request_workflow(prompt)
      // const workflow = workflow_response.data

      // 逐个执行工作流中的人物修改ppt
      // for (const task in workflow) {
      //   await slidesStore.request_task(task).then(() => {

      //   })
      // }

      slidesStore.request_update_slides(prompt).then(() => {
        loading.value = false
        loadingInstance.close()
      })

      // 拉到聊天框底部
      scrollToBottom()
    }

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
          content: message.value
        })

        // 信息清零
        message.value = ''

        // 保证DOM更新后再加载Loading动画
        await Promise.resolve()

        loading.value = true
        const loadingInstance = ElLoading.service(loadingConfig)

        // slidesStore.request_update_slides(chatHistory.value[chatHistory.value.length - 1].content).then(() => {
        //   loading.value = false
        //   loadingInstance.close()
        // })
        slidesStore.request_update_style(chatHistory.value[chatHistory.value.length - 1].content).then(() => {
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
      submitMessage,
      submitMessage2
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
