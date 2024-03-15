<template>
  <transition name="expand">
    <div>
      <div v-show="!isExpanded">
        <div class="chat-box-top">
          <el-tag class="chat-box-prompt">召唤 Copilot</el-tag>
          <el-button circle type="primary" @click="expand">
            <!-- 上升图标 -->
            <ArrowUp />
          </el-button>
        </div>
      </div>
      <div v-show="isExpanded">
        <div class="chat-box-top">
          <el-tag class="chat-box-prompt">返回</el-tag>
          <el-button circle type="primary" @click="shrink">
            <!-- 下降图标 -->
            <ArrowDown />
          </el-button>
        </div>
        <ChatBox height="480px" />
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { ElButton, ElTag, ElInput } from 'element-plus'
import { ArrowUp, ArrowDown } from '@icon-park/vue-next'
import ChatBox from '@/components/ChatBox.vue'

export default {
  components: {
    ChatBox,
    ElButton,
    ElTag,
    // ElInput,
    ArrowUp,
    ArrowDown
  },
  props: {
    isExpanded: Boolean,
    expand: Function,
    shrink: Function,
  },
}
</script>

<style scoped>
.chat-box-top{
  display: flex;
  align-items: center;
}

.chat-box-prompt {
  background-color: #409eff;
  color: #fff;

  font-size: 100%;
  margin-right: 10px;
  margin-left: 10px;
}
</style>