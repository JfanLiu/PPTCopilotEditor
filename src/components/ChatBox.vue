<template>
  <div class="chat-box">
    <el-card class="chat-box-history">
      <el-scrollbar wrap-class="chat-box-scrollbar-wrap">
        <!-- 聊天记录列表 -->
        <div class="chat-box-message" v-for="(message, index) in chatHistory" :key="index">
          <template v-if="message.messageType === MessageType.TEXT">
            <!-- 普通消息 -->
            <div :class="{ 'latest-message': index === (chatHistory.length - 1)}">
              <el-tag :type="message.sender_type === sender_t.AGENT ? 'success' : 'primary'"
                class="chat-box-message-content">
                {{ message.content }}
              </el-tag>
              <el-tag class="chat-box-message-time" type="info">
                {{ message.time }}
              </el-tag>
            </div>
          </template>
          <template v-else-if="message.messageType === MessageType.IMAGE_SELECTOR">
            <!-- 图片选择框 -->
            <el-scrollbar style="width: 100%;">
              <el-tag :type="message.sender_type === sender_t.AGENT ? 'success' : 'primary'"
                  class="chat-box-image-content">
                  <!-- <span>这是我为你找到的图片</span> -->
                  <div class="chat-select-container">
                    <div v-for="image in message.content" :key="image">
                      <el-card @click="addImage(image)" shadow="hover" class="chat-select-image">
                        <div class="chat-image-container">
                          <img :src="image" alt="">
                        </div>
                      </el-card>
                    </div>
                  </div>
              </el-tag>
            </el-scrollbar>
          </template>
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
import { defineComponent, ref, Ref, onMounted } from 'vue'
import { ElInput, ElButton, ElCard, ElScrollbar, ElTag, ElLoading, ElPopover } from 'element-plus'
import { useSlidesStore } from '@/store'
import { storeToRefs } from 'pinia'
import useCreateElement from '@/hooks/useCreateElement'
import url2dataurl from '@/hooks/url2dataurl'

enum sender_t {
  AGENT = 0,
  USER = 1
}

enum MessageType {
  TEXT, // 文本消息
  IMAGE_SELECTOR, // 图片选择框消息
}


interface ChatHistoryItem {
  sender_type: sender_t;
  time: string;
  content: string | string[];
  messageType: MessageType; // 添加 messageType 字段
}

export default defineComponent({
  name: 'ChatBox',
  components: {
    ElInput,
    ElButton,
    ElCard,
    ElScrollbar,
    ElTag,
    // ElPopover
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

    const imgBoxOpen = ref(false)
    const images = ref<string[]>([])

    const chatHistory = ref<ChatHistoryItem[]>([])
    const message = ref('')

    const slidesStore = useSlidesStore()
    const { currentSlide } = storeToRefs(slidesStore)

    const {
      createImageElement,
    } = useCreateElement()
    const { urlToBase64 } = url2dataurl()

    const addTextMessage = async (str: string) => {
      const currentTime = new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
      chatHistory.value.push({
        sender_type: sender_t.AGENT,
        time: currentTime,
        content: '',
        messageType: MessageType.TEXT
      })
      const characters = str.split('')
      const len = chatHistory.value.length
      // 逐个字符添加到 chatHistory 中
      const promises = characters.map((char, index) => {
        return new Promise(resolve => {
          setTimeout(() => {
            chatHistory.value[len - 1].content += char
            resolve(0)
          }, index * 100)
        })
      })
      // 等待所有的 setTimeout 完成
      await Promise.all(promises)
      scrollToBottom()
    }

    const submitMessage = async () => {
      // 加载时禁止发送信息
      if (loading.value) {
        return
      }

      // 确保发送的信息不为空
      if (message.value) {
        const currentTime = new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
        const prompt = message.value
        chatHistory.value.push({
          sender_type: sender_t.USER,
          time: currentTime,
          content: prompt,
          messageType: MessageType.TEXT
        })

        // 信息清零
        message.value = ''

        // 保证DOM更新后再加载Loading动画
        await Promise.resolve()

        loading.value = true
        const loadingInstance = ElLoading.service(loadingConfig)

        // mocking
        const debug = 0
        if (debug) {
          const finishLoading = () => {
            return new Promise(resolve => {
              setTimeout(() => {
                loading.value = false
                loadingInstance.close()
                resolve(1) // 执行成功后，解析 Promise
              }, 1000)
            })
          }
          await finishLoading() // 等待异步操作完成

          const agent_msg_num = Math.floor(Math.random() * 4 + 1)
          const agent_msg = [
            'Hello.',
            'I am your copilot.',
            'Ask my anything if you want.',
            'I will help you finish your work.'
          ]
          for (let i = 0; i < agent_msg_num; i += 1) {
            const currentTime = new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
            chatHistory.value.push({
              sender_type: sender_t.AGENT,
              time: currentTime,
              content: agent_msg[i],
              messageType: MessageType.TEXT
            })
          }

          images.value = ['url']

          const url = 'https://ts2.cn.mm.bing.net/th?id=ORMS.f3c78f7bbccef2472af2af7e98baf1bf&pid=Wdp&w=300&h=156&qlt=90&c=1&rs=1&dpr=1.5&p=0'
          urlToBase64(url).then(res => {
            images.value[0] = res as string
          })

          console.log('here')
          chatHistory.value.push({
            sender_type: sender_t.AGENT,
            time: currentTime,
            content: images.value,
            messageType: MessageType.IMAGE_SELECTOR
          })

        }
        else {

          slidesStore.request_gen_tasks(prompt).then(async (tasks: { task_name: string, prompt: string }[]) => {
            loading.value = false
            loadingInstance.close()
            console.log(tasks)
            let gen_task = '根据您的描述生成了以下任务:'
            for (const task of tasks) {
              gen_task += ('\n' + task.task_name + ':' + task.prompt)
            }
            gen_task += ('\n' + '下面开始执行:')
            await addTextMessage(gen_task)

            return tasks
          }).then(async (tasks: { task_name: string, prompt: string }[]) => {
            // 遍历任务序列
            for (const task of tasks) {
              console.log(task.task_name)
              console.log(task.prompt)
              await addTextMessage(task.prompt)

              await Promise.resolve()

              // 开启加载动画
              loading.value = true
              const loadingInstance = ElLoading.service(loadingConfig)

              const debug = 0
              if (debug) {
                const finishLoading = () => {
                  return new Promise(resolve => {
                    setTimeout(() => {
                      loading.value = false
                      loadingInstance.close()
                      resolve(1) // 执行成功后，解析 Promise
                    }, 1000)
                  })
                }
                await finishLoading() // 等待异步操作完成
              }
              else {
                if (task.task_name === '文本修改') {
                  await slidesStore.request_update_slides(task.prompt).then(() => {
                    loading.value = false
                    loadingInstance.close()
                  })
                }
                else if (task.task_name === '样式修改') {
                  await slidesStore.request_update_style(task.prompt).then(() => {
                    loading.value = false
                    loadingInstance.close()
                  })
                }
                else if (task.task_name === '添加文本框') {
                  await slidesStore.request_insert_text(task.prompt).then(() => {
                    loading.value = false
                    loadingInstance.close()
                  })
                }
                else if (task.task_name === '图片插入') {
                  await slidesStore.request_add_image(task.prompt).then(async (data: void | string[]) => {
                    if (!data) {
                      return
                    }
                    // console.log(data)
                    images.value = []
                    data?.forEach(img => {
                      urlToBase64(img).then((res: string) => {
                        images.value.push(res)
                      })
                    })

                    await addTextMessage('以下为搜索到的图片')
                    chatHistory.value.push({
                      sender_type: sender_t.AGENT,
                      time: currentTime,
                      content: images.value,
                      messageType: MessageType.IMAGE_SELECTOR
                    })
                  }).then(() => {
                    loading.value = false
                    loadingInstance.close()
                  })
                }
                else {
                  loading.value = false
                  loadingInstance.close()
                }
              }
            } 
          })
        }

        // 保证DOM加载完毕后再滚动到底部
        await Promise.resolve()
        scrollToBottom()
      }
    }

    const addImage = (image_url: string) => {
      console.log('成功添加图片')
      createImageElement(image_url)
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
      sender_t,
      chatHistory,
      message,
      imgBoxOpen,
      images,
      MessageType,
      submitMessage,
      // submitMessage2
      addImage,
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

.chat-box-image-content{
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

.chat-select-container {
  display: flex;
  /* max-width: 1000px; */
  max-width: 100%;
}

.chat-select-image {
  margin: auto 10px;
}

.chat-image-container {
  /* background-color: pink; */
  width: 300px;
  height: 225px;

  display: flex;            /* 使用 Flexbox 布局 */
  justify-content: center;  /* 水平居中 */
  align-items: center;      /* 垂直居中 */
}

.chat-image-container img{
  max-width: 100%;  /* 图片最大宽度为父元素的宽度 */
  max-height: 100%; /* 图片最大高度为父元素的高度 */
  display: block;   /* 防止图片间隙 */
  margin: auto;     /* 居中显示 */
}

.chat-item {
  color: blue;
  font-size: 18px;
  margin: 10px 0;
}
</style>
