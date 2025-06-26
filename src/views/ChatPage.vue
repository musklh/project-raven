<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { marked } from 'marked'

const router = useRouter()

// 配置marked选项
marked.setOptions({
  breaks: true, // 支持换行
  gfm: true, // 支持GitHub风格的markdown
  silent: true // 静默错误
})

// 当前消息输入
const currentMessage = ref('')
const selectedDataSource = ref('')

// 会话列表
const conversations = ref<any[]>([])

// 聊天消息列表
const messages = ref<any[]>([])

// 数据源选项
const dataSourceOptions = ref<any[]>([])

// Agent选项
const agentOptions = ref<any[]>([])

const activeConversationId = ref<number | null>(null);

// 存储打字机效果的定时器，用于跳过动画
const typingTimeouts = ref<Map<number, number>>(new Map());

const fetchConversations = async () => {
  const response = await fetch('/api/conversations')
  conversations.value = await response.json()
  if (conversations.value.length > 0) {
    const activeConv = conversations.value.find(c => c.active) || conversations.value[0];
    await switchConversation(activeConv.id);
  }
}

const fetchMessages = async (conversationId: number) => {
  const response = await fetch(`/api/conversations/${conversationId}/messages`)
  messages.value = await response.json()
}

const fetchDataSourceOptions = async () => {
  const response = await fetch('/api/datasources')
  dataSourceOptions.value = await response.json()
}

const fetchAgentOptions = async () => {
  const response = await fetch('/api/agents')
  agentOptions.value = await response.json()
}

// 切换会话
const switchConversation = async (id: number) => {
  activeConversationId.value = id;
  conversations.value.forEach(conv => {
    conv.active = conv.id === id
  })
  await fetchMessages(id);
}

// 发送消息
const sendMessage = async () => {
  if (!currentMessage.value.trim() || !activeConversationId.value) return

  const userMessage = {
    type: 'user',
    content: currentMessage.value,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVUBlNg0ACI3inGKAOmj4WWYKHk5t7mFjgzcf0dHCWQqXjV8WGh4n8OUWp7k-qmDg_9hQYkAnPoBQNPlwY62pZ0-x0A9A_YxLKSOnVTVk4H03HrMDQ6S-Zo-i5tq7K3iMc8amMCGAn6XqOrZPHagqRVgmEQFswCtccKdsIVK6A0rQ137HDvnUo20YIbADYiXphdg0BBQoCV58Fnw5ZC_v9lJW5loaqlsWa61j2MNoulSsFivZPxKMQbU9c3sIKl5XpWRGiTqasBz8D'
  };

  messages.value.push({
    id: messages.value.length + 1,
    ...userMessage
  });

  // 清空输入框
  currentMessage.value = ''

  // 创建一个空的 Agent 消息作为占位符
  const agentMessage = {
    id: messages.value.length + 1,
    type: 'agent',
    content: '',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVUBlNg0ACI3inGKAOmj4WWYKHk5t7mFjgzcf0dHCWQqXjV8WGh4n8OUWp7k-qmDg_9hQYkAnPoBQNPlwY62pZ0-x0A9A_YxLKSOnVTVk4H03HrMDQ6S-Zo-i5tq7K3iMc8amMCGAn6XqOrZPHagqRVgmEQFswCtccKdsIVK6A0rQ137HDvnUo20YIbADYiXphdg0BBQoCV58Fnw5ZC_v9lJW5loaqlsWa61j2MNoulSsFivZPxKMQbU9c3sIKl5XpWRGiTqasBz8D',
    isStreaming: true,
    isTable: false
  };

  messages.value.push(agentMessage);
  const messageIndex = messages.value.length - 1;

  try {
    const response = await fetch(`/api/conversations/${activeConversationId.value}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: userMessage.content,
        dataSource: selectedDataSource.value
      })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const agentResponse = await response.json();

    // 开始打字机效果显示完整响应
    await typewriterEffect(agentResponse, messageIndex);

  } catch (error) {
    console.error('Error sending message:', error);
    messages.value[messageIndex].content = '抱歉，发送消息时出现错误，请稍后重试。';
    messages.value[messageIndex].isStreaming = false;
  }
}

// 打字机效果函数
const typewriterEffect = async (agentResponse: any, messageIndex: number) => {
  const fullContent = agentResponse.content || '';
  const isTable = agentResponse.isTable || false;

  // 设置消息属性
  messages.value[messageIndex].isTable = isTable;
  messages.value[messageIndex].fullContent = fullContent; // 存储完整内容

  // 如果是表格，直接显示完整内容
  if (isTable) {
    messages.value[messageIndex].content = fullContent;
    messages.value[messageIndex].isStreaming = false;
    return;
  }

  // 对于普通文本，实现打字机效果
  // 将文本按句子或段落分割，确保markdown语法的完整性
  const sentences = splitIntoSentences(fullContent);
  let currentSentenceIndex = 0;
  let currentContent = '';

  const typeNextSentence = () => {
    if (currentSentenceIndex < sentences.length) {
      const sentence = sentences[currentSentenceIndex];
      currentContent += sentence;
      messages.value[messageIndex].content = currentContent;
      currentSentenceIndex++;

      // 根据句子长度调整延迟
      const delay = Math.max(50, Math.min(sentence.length * 20, 800));
      const timeoutId = setTimeout(typeNextSentence, delay);
      typingTimeouts.value.set(messageIndex, timeoutId);
    } else {
      // 打字完成，隐藏光标
      messages.value[messageIndex].isStreaming = false;
      typingTimeouts.value.delete(messageIndex);
    }
  };

  // 开始打字效果
  typeNextSentence();
}

// 将内容按合理的单位分割，保持markdown语法完整性
const splitIntoSentences = (content: string): string[] => {
  const sentences: string[] = [];

  // 按行分割
  const lines = content.split('\n');

  for (const line of lines) {
    if (line.trim() === '') {
      sentences.push('\n');
      continue;
    }

    // 如果是markdown特殊语法行（标题、列表、引用等），整行作为一个单位
    if (line.match(/^(#{1,6}\s|>\s|-\s|\*\s|\d+\.\s|```|---)/)) {
      sentences.push(line + '\n');
    } else {
      // 普通文本按句子分割
      const lineSentences = line.split(/([。！？.!?]+)/).filter(s => s.trim() !== '');
      for (let i = 0; i < lineSentences.length; i += 2) {
        const sentence = lineSentences[i] + (lineSentences[i + 1] || '');
        if (sentence.trim()) {
          sentences.push(sentence);
        }
      }
      sentences.push('\n');
    }
  }

  return sentences.filter(s => s !== '');
}

// 跳过打字机效果，直接显示完整内容
const skipTyping = (messageIndex: number) => {
  const message = messages.value[messageIndex];
  if (message && message.isStreaming && message.fullContent) {
    // 清除定时器
    const timeoutId = typingTimeouts.value.get(messageIndex);
    if (timeoutId) {
      clearTimeout(timeoutId);
      typingTimeouts.value.delete(messageIndex);
    }

    // 直接显示完整内容
    message.content = message.fullContent;
    message.isStreaming = false;
  }
}

// 选择Agent
const selectAgent = async (id: number) => {
  agentOptions.value.forEach(agent => {
    agent.selected = agent.id === id
  })
  // 可以在这里增加API调用来通知后端Agent的选择
  // await fetch(`/api/conversations/${activeConversationId.value}/agent`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ agentId: id })
  // });
}

onMounted(async () => {
  await fetchConversations();
  await fetchDataSourceOptions();
  await fetchAgentOptions();
});

// 返回Dashboard
const goToDashboard = () => {
  router.push('/dashboard')
}

// 格式化支持Markdown的消息
const formatMessage = (content: string) => {
  try {
    // 使用marked解析markdown
    let html = marked.parse(content) as string;

    // 添加Tailwind CSS样式
    html = html
        // 标题样式
        .replace(/<h1>/g, '<h1 class="text-2xl font-bold mt-6 mb-4 text-gray-800">')
        .replace(/<h2>/g, '<h2 class="text-xl font-semibold mt-5 mb-3 text-gray-800">')
        .replace(/<h3>/g, '<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-800">')
        .replace(/<h4>/g, '<h4 class="text-base font-semibold mt-3 mb-2 text-gray-800">')
        .replace(/<h5>/g, '<h5 class="text-sm font-semibold mt-3 mb-2 text-gray-800">')
        .replace(/<h6>/g, '<h6 class="text-xs font-semibold mt-3 mb-2 text-gray-800">')

        // 段落样式
        .replace(/<p>/g, '<p class="mb-3 text-gray-700 leading-relaxed">')

        // 列表样式
        .replace(/<ul>/g, '<ul class="list-disc list-inside my-3 space-y-1 text-gray-700">')
        .replace(/<ol>/g, '<ol class="list-decimal list-inside my-3 space-y-1 text-gray-700">')
        .replace(/<li>/g, '<li class="ml-2">')

        // 强调样式
        .replace(/<strong>/g, '<strong class="font-semibold text-gray-900">')
        .replace(/<em>/g, '<em class="italic text-gray-800">')

        // 代码样式
        .replace(/<code>/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800">')
        .replace(/<pre><code>/g, '<pre class="bg-gray-100 p-4 rounded-lg my-3 overflow-x-auto"><code class="text-sm font-mono text-gray-800">')
        .replace(/<\/code><\/pre>/g, '</code></pre>')

        // 引用样式
        .replace(/<blockquote>/g, '<blockquote class="border-l-4 border-gray-300 pl-4 my-3 text-gray-600 italic">')

        // 分割线样式
        .replace(/<hr>/g, '<hr class="my-6 border-gray-300">')

        // 链接样式
        .replace(/<a href=/g, '<a class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer" href=')

        // 表格样式
        .replace(/<table>/g, '<table class="min-w-full divide-y divide-gray-300 my-4 border border-gray-200 rounded-lg">')
        .replace(/<thead>/g, '<thead class="bg-gray-50">')
        .replace(/<th>/g, '<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">')
        .replace(/<tbody>/g, '<tbody class="bg-white divide-y divide-gray-200">')
        .replace(/<tr>/g, '<tr class="hover:bg-gray-50">')
        .replace(/<td>/g, '<td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900 border-b border-gray-100">');

    return html;
  } catch (error) {
    console.error('Markdown parsing error:', error);
    // 如果解析失败，回退到简单的换行处理
    return content.replace(/\n/g, '<br>');
  }
}

// 格式化表格消息
const formatTableMessage = (content: string) => {
  // 简单的Markdown表格解析
  const lines = content.split('\n')
  let html = ''
  let inTable = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (line.includes('|') && !inTable) {
      // 表格开始
      inTable = true
      html += '<table class="min-w-full divide-y divide-gray-300 my-2"><thead class="bg-gray-100">'
      const headers = line.split('|').filter(cell => cell.trim()).map(cell => cell.trim())
      html += '<tr>'
      headers.forEach(header => {
        html += `<th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">${header}</th>`
      })
      html += '</tr></thead><tbody class="bg-white divide-y divide-gray-200">'
    } else if (line.includes('|') && inTable && !line.includes('---')) {
      // 表格行
      const cells = line.split('|').filter(cell => cell.trim()).map(cell => cell.trim())
      html += '<tr>'
      cells.forEach(cell => {
        html += `<td class="px-3 py-2 whitespace-nowrap text-sm text-gray-900">${cell}</td>`
      })
      html += '</tr>'
    } else if (line.includes('---') && inTable) {
      // 表格分隔符，跳过
      continue
    } else if (line && !line.includes('|') && inTable) {
      // 表格结束
      html += '</tbody></table>'
      inTable = false
      html += `<p>${line}</p>`
    } else if (line && !inTable) {
      // 普通段落
      if (line.startsWith('**') && line.endsWith('**')) {
        html += `<p><strong>${line.slice(2, -2)}</strong></p>`
      } else if (line.startsWith('- ')) {
        html += `<p>${line}</p>`
      } else {
        html += `<p>${line}</p>`
      }
    }
  }

  if (inTable) {
    html += '</tbody></table>'
  }

  return html
}
</script>

<template>
  <div class="chat-page bg-white text-[var(--text-primary)]">
    <div class="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden" style="--select-button-svg: url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2724px%27 height=%2724px%27 fill=%27rgb(106,118,129)%27 viewBox=%270 0 256 256%27%3e%3cpath d=%27M181.66,170.34a8,8,0,0,1,0,11.32l-48,48a8,8,0,0,1-11.32,0l-48-48a8,8,0,0,1,11.32-11.32L128,212.69l42.34-42.35A8,8,0,0,1,181.66,170.34Zm-96-84.68L128,43.31l42.34,42.35a8,8,0,0,0,11.32-11.32l-48-48a8,8,0,0,0-11.32,0l-48,48A8,8,0,0,0,85.66,85.66Z%27%3e%3c/path%3e%3c/svg%3e');">
      <div class="flex h-screen">
        <!-- 左侧会话列表 -->
        <aside class="w-80 bg-[var(--secondary-color)] border-r border-[var(--border-color)] flex flex-col">
          <div class="p-6 border-b border-[var(--border-color)]">
            <div class="flex items-center justify-between">
              <h2 class="text-[var(--text-primary)] text-xl font-semibold">Conversations</h2>
              <button @click="goToDashboard" class="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
              </button>
            </div>
          </div>
          <div class="flex-grow overflow-y-auto">
            <nav class="py-2">
              <a
                  v-for="conversation in conversations"
                  :key="conversation.id"
                  @click="switchConversation(conversation.id)"
                  :class="['flex items-center gap-3 px-6 py-3 hover:bg-[var(--primary-color)] transition-colors duration-150 cursor-pointer', conversation.active ? 'bg-[var(--primary-color)]' : '']"
              >
                <div class="flex items-center justify-center rounded-lg bg-white text-[var(--text-primary)] shrink-0 size-10 border border-[var(--border-color)]">
                  <svg fill="currentColor" height="20px" viewBox="0 0 256 256" width="20px" xmlns="http://www.w3.org/2000/svg">
                    <path d="M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128ZM84,116a12,12,0,1,0,12,12A12,12,0,0,0,84,116Zm88,0a12,12,0,1,0,12,12A12,12,0,0,0,172,116Zm60,12A104,104,0,0,1,79.12,219.82L45.07,231.17a16,16,0,0,1-20.24-20.24l11.35-34.05A104,104,0,1,1,232,128Zm-16,0A88,88,0,1,0,51.81,172.06a8,8,0,0,1,.66,6.54L40,216,77.4,203.53a7.85,7.85,0,0,1,2.53-.42,8,8,0,0,1,4,1.08A88,88,0,0,0,216,128Z"></path>
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-[var(--text-primary)] line-clamp-1">{{ conversation.title }}</p>
                  <p class="text-xs text-[var(--text-secondary)] line-clamp-1">{{ conversation.date }}</p>
                </div>
              </a>
            </nav>
          </div>
        </aside>

        <!-- 主聊天区域 -->
        <main class="flex-1 flex flex-col bg-white">
          <header class="p-6 border-b border-[var(--border-color)]">
            <h1 class="text-xl font-semibold text-[var(--text-primary)]">AI Agent Interaction</h1>
          </header>

          <!-- 消息区域 -->
          <div class="flex-grow p-6 space-y-6 overflow-y-auto">
            <div v-for="message in messages" :key="message.id" :class="['flex items-start gap-3', message.type === 'user' ? 'max-w-xl ml-auto justify-end' : 'max-w-xl']">
              <!-- Agent消息 -->
              <template v-if="message.type === 'agent'">
                <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 shrink-0 border border-[var(--border-color)]" :style="`background-image: url('${message.avatar}');`"></div>
                <div class="flex flex-col gap-1">
                  <p class="text-xs text-[var(--text-secondary)]">Agent</p>
                  <div
                      :class="[
                      'text-sm font-normal leading-relaxed rounded-lg px-4 py-2.5 bg-[var(--secondary-color)] text-[var(--text-primary)]',
                      message.isStreaming ? 'cursor-pointer hover:bg-opacity-80' : ''
                    ]"
                      @click="message.isStreaming ? skipTyping(messages.findIndex(m => m.id === message.id)) : null"
                      :title="message.isStreaming ? '点击跳过打字效果' : ''"
                  >
                    <!-- 表格消息特殊处理 -->
                    <div v-if="message.isTable" class="overflow-x-auto">
                      <div v-html="formatTableMessage(message.content)"></div>
                    </div>
                    <!-- 普通消息 -->
                    <div v-else>
                      <span v-html="formatMessage(message.content)"></span>
                      <span v-if="message.isStreaming" class="streaming-cursor">|</span>
                    </div>
                  </div>
                </div>
              </template>

              <!-- 用户消息 -->
              <template v-else>
                <div class="flex flex-col gap-1 items-end">
                  <p class="text-xs text-[var(--text-secondary)]">User</p>
                  <div class="text-sm font-normal leading-relaxed rounded-lg px-4 py-2.5 bg-[var(--primary-color)] text-[var(--text-primary)]">{{ message.content }}</div>
                </div>
                <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 shrink-0 border border-[var(--border-color)]" :style="`background-image: url('${message.avatar}');`"></div>
              </template>
            </div>
          </div>

          <!-- 输入区域 -->
          <div class="border-t border-[var(--border-color)] p-6 bg-white">
            <div class="space-y-4">
              <!-- 数据源选择 -->
              <div class="relative select-wrapper">
                <label class="sr-only" for="context-selector">Context Selector</label>
                <select
                    v-model="selectedDataSource"
                    class="form-select appearance-none block w-full pl-3 pr-10 py-2.5 text-sm rounded-lg border border-[var(--border-color)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                    id="context-selector"
                >
                  <option v-for="option in dataSourceOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                </select>
              </div>

              <!-- 消息输入 -->
              <div>
                <label class="sr-only" for="user-instructions">User Instructions</label>
                <textarea
                    v-model="currentMessage"
                    @keydown.enter.prevent="sendMessage"
                    class="form-textarea block w-full text-sm rounded-lg border border-[var(--border-color)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] resize-none text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] p-3"
                    id="user-instructions"
                    placeholder="Enter your instructions here..."
                    rows="3"
                ></textarea>
              </div>

              <!-- 发送按钮 -->
              <div class="flex justify-end">
                <button
                    @click="sendMessage"
                    class="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-lg bg-[var(--primary-color)] text-[var(--text-primary)] hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)] transition-colors duration-150"
                    type="button"
                >
                  Send
                  <svg class="ml-2" fill="currentColor" height="16" viewBox="0 0 256 256" width="16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M224.39,129.61l-80,80A8,8,0,0,1,128,200V136H40a8,8,0,0,1,0-16h88V56a8,8,0,0,1,16.39-5.61l80,80A8,8,0,0,1,224.39,129.61Z"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- 高级设置 - Agent选择器 -->
            <details class="mt-4 group">
              <summary class="flex items-center justify-between cursor-pointer py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                Optional: Advanced Settings (Agent Selector)
                <svg class="group-open:rotate-180 transition-transform duration-200" fill="currentColor" height="16" viewBox="0 0 256 256" width="16" xmlns="http://www.w3.org/2000/svg">
                  <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,48,88H208a8,8,0,0,1,5.66,13.66Z"></path>
                </svg>
              </summary>
              <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                    v-for="agent in agentOptions"
                    :key="agent.id"
                    @click="selectAgent(agent.id)"
                    :class="['border border-[var(--border-color)] rounded-lg p-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer', agent.selected ? 'ring-2 ring-[var(--primary-color)] shadow-lg' : '']"
                >
                  <div class="flex items-start gap-3">
                    <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-16 shrink-0 border border-[var(--border-color)]" :style="`background-image: url('${agent.avatar}');`"></div>
                    <div class="flex-1">
                      <h4 class="text-sm font-semibold text-[var(--text-primary)]">{{ agent.name }}</h4>
                      <p class="text-xs text-[var(--text-secondary)] mt-1">{{ agent.description }}</p>
                      <p class="text-xs text-[var(--text-secondary)] mt-2">
                        <span class="font-medium text-[var(--text-primary)]">Compatible:</span> {{ agent.compatible }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </details>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>



<style>
/* ChatPage专用的CSS变量 - 全局作用域确保var()能正确解析 */
.chat-page {
  --primary-color: #dce8f3;
  --secondary-color: #f1f2f4;
  --text-primary: #121416;
  --text-secondary: #6a7681;
  --border-color: #dde1e3;
}

.chat-page body {
  font-family: Inter, "Noto Sans", sans-serif;
}

.chat-page .select-wrapper::after {
  content: var(--select-button-svg);
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

/* 确保文本不会被截断 */
.chat-page .line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
}

/* 表格样式 */
.chat-page table {
  border-collapse: collapse;
}

.chat-page th, .chat-page td {
  border: 1px solid #e5e7eb;
}

/* 滚动条样式 */
.chat-page ::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.chat-page ::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.chat-page ::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.chat-page ::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 流式输出光标动画 */
.chat-page .streaming-cursor {
  display: inline-block;
  animation: blink 1s infinite;
  color: var(--text-primary);
  font-weight: bold;
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}
</style>
