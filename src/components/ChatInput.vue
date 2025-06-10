<script setup lang="ts">
import { ref } from "vue";
import type { Ref } from 'vue';//ts类型注解声明
import { Close, Document, FolderOpened, PictureFilled, Promotion } from '@element-plus/icons-vue'

//定义FileItem这种类型结构
interface FileItem {
    name: string;      // 文件名
    url: string;       // 文件的临时 URL
    type: 'image' | 'file'; // 文件类型
    size: number;      // 文件大小（字节）
}
const fileList: Ref<FileItem[]> = ref([]) // 存储上传的文件列表,类型是由FileItem组成的数组
const inputValue = ref('')//输入框的值，使用 ref 实现响应式

//将文件上传移到fileList，uploadFile：文件状态发生变化得到的参数
//uploadFile类型为一个对象，里面必须有raw这个属性，这个属性的值是file对象
const handleFileUpload = (uploadFile: { raw: File }) => {
    // 获取原始文件对象
    const file = uploadFile.raw
    //如果文件不存在则终止操作
    if (!file) return false
    //将文件信息从后面添加到 fileList 中
    fileList.value.push({
        name: file.name,
        url: URL.createObjectURL(file),//创建临时内存URL，伪协议地址
        type: file.type.startsWith('image/') ? 'image' : 'file',//类型为image或file
        size: file.size,
    })
    // 阻止组件自动上传文件，el-upload组件会自动上传
    return false 
}

//删除文件 
const handleFileRemove = (file: { url: string }) => {//file是一个具有url属性的对象
    //查找文件下标，没有找到就返回-1
    const index = fileList.value.findIndex((item) => item.url === file.url )
    if (index !== -1) {
        URL.revokeObjectURL(fileList.value[index].url)//释放内存
        fileList.value.splice(index, 1)//从数组中删除
    }
}

//发送消息
// 自定义事件组件交互，子组件数据传到父组件，声明事件send
const emit = defineEmits(["send"])
const sendMessage = () => {
    //如果输入框为空或处于加载状态，则return
    if( !inputValue.value.trim() || props.loading) return
    // 构建消息对象
    const messageContent = {
        text: inputValue.value.trim(),
        files:fileList.value
    }
    // 自定义事件组件交互,触发 send 事件，将消息内容作为参数传递
    emit("send",messageContent)
    // 清空输入框和文件列表
    fileList.value = []
    inputValue.value = ""
}

// 处理换行的方法（Shift + Enter）
const handleNewline = (event: KeyboardEvent) => {
  event.preventDefault() // 阻止默认的 Enter 发送行为
  inputValue.value += '\n' // 在当前位置添加换行符
}

//props父组件传递到子组件,传递loading这个参数
const props = defineProps({
    loading:{
        type: Boolean,
        default: false
    }
})
</script>


<template>
    <div class="chat-put">
        <!-- 文件预览区域 -->
        <div class="chat-put-preview" v-if="fileList.length > 0">
            <div class="preview-item" v-for="file in fileList" :key="file.url">
                <!-- 图片预览 -->
                <div class="image-preview" v-if="file.type === 'image'">
                    <img :src="file.url">
                    <div class="remove-btn" @click="handleFileRemove(file)">
                        <el-icon>
                            <Close />
                        </el-icon>
                    </div>
                </div>
                <!-- 文件预览 -->
                <div class="file-preview" v-else>
                    <el-icon>
                        <Document />
                    </el-icon>
                    <div class="file-name">{{ file.name }}</div>
                    <!-- toFixed:转换成字符串并指定小数位数 -->
                    <div class="file-size">{{ (file.size / 1024).toFixed(1) }}KB</div>
                    <div class="remove-btn" @click="handleFileRemove(file)">
                        <el-icon>
                            <Close />
                        </el-icon>
                    </div>
                </div>
            </div>
        </div>

        <!-- 输入框＋按钮区域 -->
        <div class="chat-put-input">
            <!--placeholder:input文本框默认内容 textarea:支持换行 resize:是否能被用户缩放-->
            <el-input v-model="inputValue" type="textarea" placeholder="输入消息，Enter发送，Shihft+Enter 换行"
                :autosize="{ minRows: 1, maxRows: 6 }" resize="none"
                @keydown.enter.exact.prevent="sendMessage"
                @keydown.enter.shift="handleNewline" />
            <div class="chat-input-button">
                <!-- 文件上传按钮 on-change：文件状态改变时的钩子-->
                <el-upload class="upload-btn" :on-change="handleFileUpload" :auto-upload="false" 
                    :show-file-list="false" accept=".pdf,.doc,.docx,.txt">
                    <button class="action-btn">
                        <el-icon size="20px">
                            <FolderOpened />
                        </el-icon>
                    </button>
                </el-upload>
                <!-- 图片上传按钮 on-change：文件状态改变时的钩子-->
                <el-upload class="upload-btn" :on-change="handleFileUpload" :auto-upload="false" 
                    :show-file-list="false" accept="image/*">
                    <button class="action-btn">
                        <el-icon size="20px">
                            <PictureFilled />
                        </el-icon>
                    </button>
                </el-upload>
                <!-- 发送按钮 -->
                <button class="action-btn" :disabled="props.loading" @click="sendMessage">
                    <el-icon size="28px">
                        <Promotion />
                    </el-icon>
                </button>
            </div>
        </div>
    </div>
</template>


<style scoped lang="scss">
.chat-put {
    background-color: #f0f4f9;
    padding: 10px 20px;
    border-radius: 50px;

    //文件预览区域
    .chat-put-preview {
        margin-bottom: 8px; //与输入框的间距 
        display: flex; //使用弹性布局 
        flex-wrap: wrap; //允许多行显示
        gap: 10px; //预览项之间的间距

        .preview-item {
            display: flex;
            position: relative;//为文件删除做准备
            border-radius: 8px;
            overflow: hidden; //隐藏超出部分

            .image-preview {
                width: 60px;
                height: 60px;
                img {
                    width: 100%;
                    height: 100%;
                }
            }

            .file-preview {
                padding: 8px;
                background-color: #f4f4f5;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 8px;
                .file-name {
                    max-width: 120px;
                    overflow: hidden;
                    text-overflow: ellipsis; //超出显示省略号
                    white-space: nowrap; //不换行
                }
                .file-size {
                    color: #909399;
                    font-size: 12px;
                }
            }

            .remove-btn {
                position: absolute;
                top: 4px;
                right: 4px;
                width: 20px;
                height: 20px;
                background-color: rgba(0, 0, 0, 0.5);//半透明黑色背景
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer; //鼠标变小手
                color: white;
                &:hover {
                    background-color: rgba(0, 0, 0, 0.7);
                }
            }

        }
    }

    .chat-put-input {
        display: flex;
        //修改输入框textarea的样式
        :deep(.el-textarea__inner) {
            box-shadow: none;
            background-color: transparent;
        }

        .chat-input-button {
            display: flex;

            .upload-btn {
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .action-btn {
                margin-left: 7px;
                border: none;
                background: none;
                display: flex;
                align-items: center;
                justify-content: center;
            }


        }

    }
}
</style>