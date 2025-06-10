//网络请求
import { useSettingStore } from "@/stores/settings.ts";

const API_BASE_URL = 'https://api.siliconflow.cn/v1'

// 定义消息类型
interface sendMessage {
  role: 'user' | 'assistant';
  content: string;
}

//创造网络请求方法
export const createChatCompletion = async (messages:sendMessage[]) => {
    //导入设置仓库
    const settingStore = useSettingStore()
    //发送给api的参数
    const payload = {
        model: settingStore.settings.model,
        messages,
        stream: settingStore.settings.stream,
        max_tokens: settingStore.settings.maxTokens,
        temperature: settingStore.settings.temperature,
        top_p: settingStore.settings.topP,
        top_k: settingStore.settings.topK,
    }
    //配置网络请求选项
    const options = {
        //请求方式
        method: "POST",
        //请求头
        headers: {
            //使用 API 密钥进行身份验证
            Authorization: 'Bearer ' + settingStore.settings.apiKey,
            //告知服务器请求体（Body）的数据格式:JSON
            'Content-Type': 'application/json',
        },
        body:JSON.stringify(payload)
    }
    //发送网络请求并处理响应
    try{
        // 记录开始时间
        const startTime = Date.now()
        //发送 fetch 请求,传入请求配置对象 options，得到响应对象response
        const response = await fetch(API_BASE_URL+'/chat/completions',options)
        
        //检查是否错误
        if(!response.ok){
            //抛出异常
            throw new Error ("HTTP error! status: " + response.status)
        }
        //判断是否需要流式响应
        if (settingStore.settings.stream){
            return response
        }
        else{
            const data = await response.json()
            //计算speed
            const duration = (Date.now()-startTime) /1000
            //data.usage.completion_tokens：模型生成的回复所消耗的 token 数量,toFixed：将数字转换为指定小数位数的字符串
            data.speed = (data.usage.completion_tokens/duration).toFixed(2)
            return data
        }
    }catch(error){
        console.error('Chat API Error:',error)
        throw error//向上层抛出错误
    }

}