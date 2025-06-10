<!-- 左侧侧边栏的每一条对话的确认删除框框 -->
<script setup lang="ts">
import { ref } from 'vue'
import type { Ref} from 'vue'
import { useChatStore } from '@/stores/chat'
import { WarningFilled } from '@element-plus/icons-vue'


const chatStore = useChatStore()
const dialogVisible = ref(false)
const currentConversationId:Ref<string | null>  = ref(null)

// 打开对话框
const openDialog = (conversationId:string) => {
  currentConversationId.value = conversationId
  dialogVisible.value = true
}

// 确认删除操作
const handleConfirm = () => {
    const targetId = currentConversationId.value;
    if(targetId){
        chatStore.deleteConversation(targetId)
        dialogVisible.value = false
    }
}

// 取消操作
const handleCancel = () => {
  dialogVisible.value = false
}


// 导出方法供父组件调用
defineExpose({
  openDialog,
})
</script>


<template>
  <!-- v-model:是否显示 Dialog框   -->
    <el-dialog v-model="dialogVisible" :title="'确定删除对话?'" width="30%">
        <!-- 显示警告文本 -->
        <div class="delete-warning">
            <el-icon class="warning-icon"><WarningFilled /></el-icon>
            <span>删除后，聊天记录将不可恢复。</span>
        </div>
        <!-- 下面按钮 -->
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="handleCancel">取消</el-button>
                <!--:type="'danger'" 红色按钮  -->
                <el-button type='danger' @click="handleConfirm">删除</el-button>
            </span>
        </template>
    </el-dialog>


</template>