import { ref} from 'vue'
import { defineStore } from 'pinia'//定义一个store

const DEFAULT_DASHSCOPE_MODEL = 'qwen-plus'

//创建叫useSettingStore的pinia仓库  llm-setting:这个store的id，标识这个 Store
export const useSettingStore = defineStore('llm-setting', 
  () => {
  // 创建响应式对象settings
  const settings = ref({
    model: DEFAULT_DASHSCOPE_MODEL, 
    apiKey: '', 
    stream: true,
    maxTokens: 4096, 
    temperature: 0.7, 
    topP: 0.7, 
    topK: 50, 
  })

  return { settings }// 暴露状态供组件使用
},

{
    persist: true, // 开启数据持久化（自动将状态保存到本地存储，如 localStorage）
}
)

//设置里model的下拉菜单:创建 普通的 modelOptions对象，不在pinia仓库里
export const modelOptions = [
  {
    label: 'Qwen-Plus',
    value: 'qwen-plus',
    maxTokens: 8192,
  },
  {
    label: 'Qwen-Turbo',
    value: 'qwen-turbo',
    maxTokens: 4096,
  },
  {
    label: 'Qwen-Max',
    value: 'qwen-max',
    maxTokens: 8192,
  },
  {
    label: 'Qwen-Long',
    value: 'qwen-long',
    maxTokens: 32000,
  },
  {
    label: 'Qwen3-Coder-Plus',
    value: 'qwen3-coder-plus',
    maxTokens: 8192,
  },
]
