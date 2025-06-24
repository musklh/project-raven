<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

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

  const response = await fetch(`/api/conversations/${activeConversationId.value}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      content: currentMessage.value,
      dataSource: selectedDataSource.value
    })
  })

  const agentResponse = await response.json();
  
  // 清空输入框
  currentMessage.value = ''
  
  // 模拟AI回复
  setTimeout(() => {
    messages.value.push({
      id: messages.value.length + 1,
      ...agentResponse
    })
  }, 1000)
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

// 格式化普通消息
const formatMessage = (content: string) => {
  return content.replace(/\n/g, '<br>')
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
                  <div class="text-sm font-normal leading-relaxed rounded-lg px-4 py-2.5 bg-[var(--secondary-color)] text-[var(--text-primary)]">
                    <!-- 表格消息特殊处理 -->
                    <div v-if="message.isTable" class="overflow-x-auto">
                      <div v-html="formatTableMessage(message.content)"></div>
                    </div>
                    <!-- 普通消息 -->
                    <div v-else v-html="formatMessage(message.content)"></div>
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
</style>
