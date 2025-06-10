//Markdown渲染工具,集成代码高亮、链接处理、表情符号等功能。
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js';
import mdLinkAttributes from 'markdown-it-link-attributes'
import { full as emoji } from 'markdown-it-emoji'
// 使用 atom-one-dark 主题
import 'highlight.js/styles/atom-one-dark.css'
import copyIcon from '@/assets/photo/复制.png'

// 创建 markdown-it 实例
const md = new MarkdownIt({
    html: true,// 启用 HTML 标签
    breaks: true,// 转换换行符为 <br>
    linkify: true,// 自动转换 URL 为链接
    //处理代码块的渲染和高亮显示: str=代码块的原始文本内容  lang=代码块指定的语言
    highlight: function (str:string, lang:string) :string{
        if (lang && hljs.getLanguage(lang)) {
            try {
                //ignoreIllegals: true 表示忽略不合法的语法，防止高亮失败，data-action是自定义属性
                const highlighted = hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
                return `<div class="code-block"><div class="code-header"><span class="code-lang">${lang}</span><button class="code-action-btn" data-action="copy" title="复制"><img src="${copyIcon}" alt="copy" /></button></div><pre class="hljs"><code>${highlighted}</code></pre></div>`
            }catch(_){}//捕捉错误但不进行处理   
        }
        //将特殊字符转换为 HTML 实体
        return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
    }
})

//让链接在新标签页中打开 
// 配置MarkdownIt的插件mdLinkAttributes，修改 Markdown 中链接的默认行为,渲染为html格式
md.use(mdLinkAttributes,{
    attrs:{
        target:'_blank',//让链接在新标签页中打开 
        rel: 'noopener',//修复 target="_blank" 可能带来的安全风险
    }
})

// 启用 emoji 支持
md.use(emoji)

// 导出渲染函数
export const rederMarkdown = (content:string)=>{
    if(!content) return " "
    return md.render(content)
}
