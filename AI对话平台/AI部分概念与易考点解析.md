# AI 部分概念与易考点解析

## Some Question of AI
这一节会详细讲讲一些面试中会被问到的 AI 问题

### Some thought
> 引用至“从前端到 AI: LangChain 入门和实战”
>
> llm 本质上是一个语言模型，其基于预训练的模型，根据用户输入的 Prompt 去生成最大概率的下一个字符（token）。换句话说，其最擅长的是把话说圆。可以知道的是，llm 展现出来的是涌现的智能，他并不理解输出内容的意义，而是一个根据概率吐出 token 的机器。
>

> 在说到 agent 的时候，我们尝试了用 llm 作为推理引擎去制作 agent，也就是让 llm 有逻辑的去处理事情。在 ReAct 框架中，我们会强制让 llm 将自己的思考过程和 Action 记录下来，是为了在生成下一个步骤的时候，模型会根据此信息去计算概率生成，让涌现的智能可控。即，虽然在 Agent 中，模型展现出了足够的逻辑能力，但这并不是模型天然具有的，是我们通过各种方式在模型基于概率的基础上，更好的激发其涌现的智能
>

> 之后，我们又说到了模型目前非常棘手的问题，幻觉问题。RAG 是解决幻觉问题非常好用的手段，因为它可以把 ground truth 作为上下文嵌入到模型输入中，来减少模型输出错误信息的概率。即，我们依旧在跟模型没有逻辑这件事做斗争，依靠各种提高概率的方式去让模型更大程度的输出正确信息。回到幻觉的本质，也就是因为模型没有逻辑，它只是根据你的上下文去做完型填空的任务，所有容易出现语意上合理，但偏离事实的情况。就像你让它写代码，它经常会出现不存在的 API，但它介绍 API 的时候一本正经，API 也很合理，就像真实存在一样
>

### RAG 是什么
<font style="color:rgb(31, 35, 40);">大型语言模型（LLM）相较于传统的语言模型具有更强大的能力，然而在某些情况下，它们仍可能无法提供准确的答案。为了解决大型语言模型在生成文本时面临的一系列挑战，提高模型的性能和输出质量，研究人员提出了一种新的模型架构：</font>**<font style="color:rgb(31, 35, 40);">检索增强生成（RAG, Retrieval-Augmented Generation）</font>**<font style="color:rgb(31, 35, 40);">。该架构巧妙地</font>**<font style="color:rgb(31, 35, 40);">整合了从庞大知识库中检索到的相关信息，并以此为基础，指导大型语言模型生成更为精准的答案</font>**<font style="color:rgb(31, 35, 40);">，从而显著提升了回答的准确性与深度</font>



**作用：**

<font style="color:rgb(31, 35, 40);">目前 LLM 面临的主要问题有：</font>

        * **<font style="color:rgb(31, 35, 40);">信息偏差/幻觉：</font>**<font style="color:rgb(31, 35, 40);"> LLM 有时会产生与客观事实不符的信息，导致用户接收到的信息不准确。RAG 通过检索数据源，辅助模型生成过程，确保输出内容的精确性和可信度，减少信息偏差</font>
        * **<font style="color:rgb(31, 35, 40);">知识更新滞后性：</font>**<font style="color:rgb(31, 35, 40);"> LLM 基于静态的数据集训练，这可能导致模型的知识更新滞后，无法及时反映最新的信息动态。RAG 通过实时检索最新数据，保持内容的时效性，确保信息的持续更新和准确性</font>
        * **<font style="color:rgb(31, 35, 40);">内容不可追溯：</font>**<font style="color:rgb(31, 35, 40);"> LLM 生成的内容往往缺乏明确的信息来源，影响内容的可信度。RAG 将生成内容与检索到的原始资料建立链接，增强了内容的可追溯性，从而提升了用户对生成内容的信任度</font>
        * **<font style="color:rgb(31, 35, 40);">领域专业知识能力欠缺：</font>**<font style="color:rgb(31, 35, 40);"> LLM 在处理特定领域的专业知识时，效果可能不太理想，这可能会影响到其在相关领域的回答质量。RAG 通过检索特定领域的相关文档，为模型提供丰富的上下文信息，从而提升了在专业领域内的问题回答质量和深度</font>
        * **<font style="color:rgb(31, 35, 40);">推理能力限制：</font>**<font style="color:rgb(31, 35, 40);"> 面对复杂问题时，LLM 可能缺乏必要的推理能力，这影响了其对问题的理解和回答。RAG 结合检索到的信息和模型的生成能力，通过提供额外的背景知识和数据支持，增强了模型的推理和理解能力</font>
        * **<font style="color:rgb(31, 35, 40);">应用场景适应性受限：</font>**<font style="color:rgb(31, 35, 40);"> LLM 需在多样化的应用场景中保持高效和准确，但单一模型可能难以全面适应所有场景。RAG 使得 LLM 能够通过检索对应应用场景数据的方式，灵活适应问答系统、推荐系统等多种应用场景</font>
        * **<font style="color:rgb(31, 35, 40);">长文本处理能力较弱：</font>**<font style="color:rgb(31, 35, 40);"> LLM 在理解和生成长篇内容时受限于有限的上下文窗口，且必须按顺序处理内容，输入越长，速度越慢。RAG 通过检索和整合长文本信息，强化了模型对长上下文的理解和生成，有效突破了输入长度的限制，同时降低了调用成本，并提升了整体的处理效率</font>

### Agent 是什么，怎么开发一个 Agent
Agent 又叫做**智能体**。Agent和常规的对话模型不一样，用官话来说，Agent 是具有**环境感知、决策制定和行动执行能力**的智能实体，并且能够通过独立思考和工具调用来逐步实现既定目标。随着大模型语言的出现，AI Agent又被定义为基于LLM驱动的Agent，**实现对通用问题的自动化处理**

### Function Call 是什么意思
**Function calling** 本质上就是给 LLM 了解和调用外界函数的能力，LLM 会根据他的理解，在合适的时间返回对函数的调用和参数，然后根据函数调用的结果进行回答。例如，你在构建一个旅游计划的 chatbot，用户给出问题 “规划一个 2.11 日北京的旅游行程，帮我选择最合适天气的衣服”，LLM 就会判断需要调用获取 2.11 实时天气的 API 来获取北京在 2.11 的天气，并根据返回的结果来回答问题

### 怎么才能让大模型记住上下文
【后面会总结怎么构建长短期记忆模型】

    1. 方法一：手动维护 chat history，在每一次新的对话中将 llm 历史消息手动添加到提问的上下文中
    2. 方法二：自动维护 chat history，在 langchain 中，可以使用`RunnableWithMessageHistory`给任意的 chain 包裹一层，就能添加聊天记录管理的能力，可以帮助我们自动将用户和 llm 的消息存储在 history 中，这样我们就可以对 llm 的历史记录进行更多操作，例如只传递最近的 k 条历史记录等
    3. 方法三：自动生成 chat history 摘要，也就是让 llm 根据总结后的 summary 与用户进行对话。实现方法也比较简单，下面的代码就是一个简单的总结 chain，这个 chain 接受两个参数：
        * summary：上一次总结的信息
        * new_lines：用户和 llm 新的回复

返回值是一个纯文本的信息，是根据历史的 summary 信息和用户新的对话生成的新的 summary

```javascript
const summaryModel = new ChatOpenAI();
const summaryPrompt = ChatPromptTemplate.fromTemplate(`
Progressively summarize the lines of conversation provided, adding onto the previous summary returning a new summary

Current summary:
{summary}

New lines of conversation:
{new_lines}

New summary:
`); 

const summaryChain = RunnableSequence.from([
    summaryPrompt,
    summaryModel,
    new StringOutputParser(),
])

```

### MCP 是什么
全称 Model Context Protocol，根据 MCP 官方网站，MCP 就是一个开放协议，它为应用程序向 LLM 提供上下文的方式进行了标准化。我们可以将 MCP 想象成 AI 应用程序的 USB-C 接口。就像 USB-C 为设备连接各种外设和配件提供了标准化的方式一样，MCP 为 AI 模型连接各种数据源和工具提供了标准化的接口。

### 了解 a2a 吗
Agent to Agent

### 会使用 LangChain，LangChain 的六大组件是什么
#### Models
主要分为三类，分别是：LLMS大型语言模型，为构建复杂的语言理解提供了坚实的基础；Chat Models聊天模型，能让应用程序进行流畅的对话；Text Embedding Models文本嵌入模型，提供了理解文本深度含义的能力

#### Prompts
最主要的就是Prompts Templates，也称之为提示模板，可以知道模型如何回答问题或者生成文本。提示词工程能力也是影响大模型输出的关键因素

#### Indexes
LangChain通过索引允许文档结构化，让LLM更直接有效地与文档互动

#### Memory
Memory工具类可以为Agent和Chain提供记忆能力，让智能应用能够记住前一次的交互

#### Chains（链）
Chain模块整合了大型语言模型、向量数据库、记忆系统及提示，通过Agents的能力拓展至各种工具，形成一个能够互相合作的独立模块网络

#### Agents
Agent 是一个智能代理，它的任务是听取你的需求（用户输入）和分析当前的情境（应用场景），然后从它的工具箱（一系列可用工具）中选择最合适的工具来执行操作。这些工具箱里装的是 LangChain 提供的各种积木，比如 Models、Prompts、Indexes 等。

###  向量数据库有过了解吗
faiss，主要用来持久化 chat history



> 更新: 2025-10-18 14:04:55  
> 原文: <https://www.yuque.com/u29297079/51-644/twq6phwsovp66wyd>