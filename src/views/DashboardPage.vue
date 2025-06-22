<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 统计数据
const stats = ref([
  { label: 'Tasks in Progress', value: '5' },
  { label: 'Reports Completed This Month', value: '23' },
  { label: 'Total Data Sources Connected', value: '8' }
])

// 数据源列表
const dataSources = ref([
  {
    id: 1,
    name: 'Sales Data',
    type: 'CSV',
    typeIcon: 'description',
    iconColor: 'text-green-500',
    status: 'Active',
    statusColor: 'bg-green-100 text-green-800',
    created: '2024-01-15'
  },
  {
    id: 2,
    name: 'Customer Feedback',
    type: 'PostgreSQL',
    typeIcon: 'storage',
    iconColor: 'text-blue-500',
    status: 'Active',
    statusColor: 'bg-green-100 text-green-800',
    created: '2024-02-20'
  },
  {
    id: 3,
    name: 'Marketing Campaigns',
    type: 'API',
    typeIcon: 'api',
    iconColor: 'text-purple-500',
    status: 'Inactive',
    statusColor: 'bg-red-100 text-red-800',
    created: '2024-03-10'
  }
])

// 报告任务列表
const reportTasks = ref([
  {
    id: 1,
    name: 'Monthly Sales Report',
    dataSource: 'Sales Data',
    created: '2024-04-01',
    duration: '00:15:00',
    status: 'Completed',
    statusColor: 'bg-[var(--success-bg)] text-[var(--success-text)]'
  },
  {
    id: 2,
    name: 'Customer Satisfaction Analysis',
    dataSource: 'Customer Feedback',
    created: '2024-04-02',
    duration: '00:20:00',
    status: 'Processing',
    statusColor: 'bg-[var(--warning-bg)] text-[var(--warning-text)]'
  },
  {
    id: 3,
    name: 'Q1 Marketing Performance',
    dataSource: 'Marketing Campaigns',
    created: '2024-04-03',
    duration: '00:10:00',
    status: 'Completed',
    statusColor: 'bg-[var(--success-bg)] text-[var(--success-text)]'
  },
  {
    id: 4,
    name: 'Weekly Sales Update',
    dataSource: 'Sales Data',
    created: '2024-04-04',
    duration: '00:05:00',
    status: 'Pending',
    statusColor: 'bg-blue-100 text-blue-800'
  },
  {
    id: 5,
    name: 'Campaign ROI Analysis',
    dataSource: 'Marketing Campaigns',
    created: '2024-04-05',
    duration: '00:25:00',
    status: 'Failed',
    statusColor: 'bg-[var(--danger-bg)] text-[var(--danger-text)]'
  }
])

// 导航到聊天页面
const goToChat = () => {
  router.push('/chat')
}

// 注销
const handleLogout = () => {
  router.push('/')
}

// 添加数据源
const addDataSource = () => {
  console.log('添加数据源')
}

// 编辑数据源
const editDataSource = (id: number) => {
  console.log('编辑数据源:', id)
}

// 删除数据源
const deleteDataSource = (id: number) => {
  console.log('删除数据源:', id)
}

// 报告操作
const viewReport = (id: number) => {
  console.log('查看报告:', id)
}

const downloadReport = (id: number) => {
  console.log('下载报告:', id)
}

const refreshReport = (id: number) => {
  console.log('刷新报告:', id)
}
</script>

<template>
  <div class="dashboard-page bg-slate-50">
    <div class="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden" style='font-family: Inter, "Noto Sans", sans-serif;'>
      <div class="flex h-full grow">
        <!-- 侧边栏 -->
        <div class="fixed top-0 left-0 flex h-screen w-72 flex-col border-r border-[var(--border-color)] bg-white p-6 shadow-sm">
          <div class="flex items-center gap-3 mb-8">
            <svg class="h-8 w-8 text-[var(--primary-color)]" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.355a15.097 15.097 0 01-4.5 0m4.5 0V21m0-2.252a12.06 12.06 0 003.75 0m0 0V21m0-2.252c0-2.841-1.12-5.464-2.951-7.401S12.283 3 9.75 3M5.25 7.525c1.28.92 2.934 1.5 4.5 1.5s3.22-.58 4.5-1.5m0 0V3M5.25 3v4.525M3 12.75l3 1.75m15-1.75l-3 1.75M3 16.5l3 1.75m15-1.75l-3 1.75M9.75 21a3.75 3.75 0 110-7.5 3.75 3.75 0 010 7.5zm0-11.25a3.75 3.75 0 110-7.5 3.75 3.75 0 010 7.5z" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
            <h1 class="text-xl font-semibold text-[var(--text-primary)]">Data Insights</h1>
          </div>
          <nav class="flex flex-col gap-2">
            <a class="flex items-center gap-3 rounded-lg bg-[var(--secondary-color)] px-4 py-3 text-[var(--primary-color)] transition-colors hover:bg-slate-200" href="#">
              <span class="material-icons">dashboard</span>
              <span class="text-sm font-medium">Dashboard</span>
            </a>
            <a @click="goToChat" class="flex items-center gap-3 rounded-lg px-4 py-3 text-[var(--text-secondary)] transition-colors hover:bg-slate-100 hover:text-[var(--text-primary)] cursor-pointer">
              <span class="material-icons">smart_toy</span>
              <span class="text-sm font-medium">Chat Agent</span>
            </a>
            <a class="flex items-center gap-3 rounded-lg px-4 py-3 text-[var(--text-secondary)] transition-colors hover:bg-slate-100 hover:text-[var(--text-primary)]" href="#">
              <span class="material-icons">settings</span>
              <span class="text-sm font-medium">Account Settings</span>
            </a>
          </nav>
          <div class="mt-auto flex items-center gap-3 rounded-lg border border-[var(--border-color)] p-3">
            <img alt="User Avatar" class="h-10 w-10 rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOcd2PQneGnvjzSPZcFlioYtm5dSWX4GKtZCJSnkhKjIdOEyRZbgeyr6hCor0kAnAHO4C__XW7gn-7pp8Ih2HbVik8J_ZFXF6--GcSZBTr89sJc1UiCkayAZiQrRSFs2wtRxGRPpi104ZBnewuaRpmx_-15O9Z99gn6xZ-mtJhXkWsUDPEDOomj66SFFtqCNNWe1vHQVu4Ed0JnEU71vRWc9Fy0cCE19aLTp9gJkM_pDZE7RRFygaG2S1y8CWf6UP4Dps0W0uIPvic"/>
            <div>
              <p class="text-sm font-medium text-[var(--text-primary)]">Olivia Martin</p>
              <p class="text-xs text-[var(--text-secondary)]">olivia.martin@example.com</p>
            </div>
            <button @click="handleLogout" class="ml-auto text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              <span class="material-icons text-xl">logout</span>
            </button>
          </div>
        </div>

        <!-- 主内容区域 -->
        <main class="ml-72 flex-1 p-8">
          <header class="mb-8">
            <h2 class="text-3xl font-bold tracking-tight text-[var(--text-primary)]">Dashboard</h2>
          </header>

          <!-- 统计卡片 -->
          <section class="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
            <div v-for="stat in stats" :key="stat.label" class="flex flex-col gap-2 rounded-xl border border-[var(--border-color)] bg-white p-6 shadow-sm">
              <p class="text-base font-medium text-[var(--text-secondary)]">{{ stat.label }}</p>
              <p class="text-3xl font-bold text-[var(--text-primary)]">{{ stat.value }}</p>
            </div>
          </section>

          <!-- 数据源管理 -->
          <section class="mb-8">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-2xl font-semibold text-[var(--text-primary)]">My Data Sources</h3>
              <button @click="addDataSource" class="flex items-center gap-2 rounded-lg bg-[var(--primary-color)] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <span class="material-icons text-lg">add</span>
                Add Data Source
              </button>
            </div>
            <div class="overflow-x-auto rounded-lg border border-[var(--border-color)] bg-white shadow-sm">
              <table class="min-w-full divide-y divide-[var(--border-color)]">
                <thead class="bg-slate-50">
                  <tr>
                    <th class="px-6 py-3.5 text-left text-sm font-semibold text-[var(--text-primary)]" scope="col">Name</th>
                    <th class="px-6 py-3.5 text-left text-sm font-semibold text-[var(--text-primary)]" scope="col">Type</th>
                    <th class="px-6 py-3.5 text-left text-sm font-semibold text-[var(--text-primary)]" scope="col">Status</th>
                    <th class="px-6 py-3.5 text-left text-sm font-semibold text-[var(--text-primary)]" scope="col">Created</th>
                    <th class="px-6 py-3.5 text-left text-sm font-semibold text-[var(--text-primary)]" scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[var(--border-color)] bg-white">
                  <tr v-for="source in dataSources" :key="source.id">
                    <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-[var(--text-primary)]">{{ source.name }}</td>
                    <td class="whitespace-nowrap px-6 py-4 text-sm text-[var(--text-secondary)] flex items-center gap-2">
                      <span :class="['material-icons text-base', source.iconColor]">{{ source.typeIcon }}</span> {{ source.type }}
                    </td>
                    <td class="whitespace-nowrap px-6 py-4">
                      <span :class="['inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', source.statusColor]">
                        <svg class="-ml-0.5 mr-1.5 h-2 w-2" :class="source.status === 'Active' ? 'text-green-400' : 'text-red-400'" fill="currentColor" viewBox="0 0 8 8">
                          <circle cx="4" cy="4" r="3"></circle>
                        </svg>
                        {{ source.status }}
                      </span>
                    </td>
                    <td class="whitespace-nowrap px-6 py-4 text-sm text-[var(--text-secondary)]">{{ source.created }}</td>
                    <td class="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <a @click="editDataSource(source.id)" class="text-[var(--primary-color)] hover:text-indigo-800 mr-3 cursor-pointer">Edit</a>
                      <a @click="deleteDataSource(source.id)" class="text-red-600 hover:text-red-800 cursor-pointer">Delete</a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <!-- 报告任务管理 -->
          <section>
            <h3 class="text-2xl font-semibold text-[var(--text-primary)] mb-4">Recent Report Tasks</h3>
            <div class="overflow-x-auto rounded-lg border border-[var(--border-color)] bg-white shadow-sm">
              <table class="min-w-full divide-y divide-[var(--border-color)]">
                <thead class="bg-slate-50">
                  <tr>
                    <th class="px-6 py-3.5 text-left text-sm font-semibold text-[var(--text-primary)]" scope="col">Report Name</th>
                    <th class="px-6 py-3.5 text-left text-sm font-semibold text-[var(--text-primary)]" scope="col">Data Source</th>
                    <th class="px-6 py-3.5 text-left text-sm font-semibold text-[var(--text-primary)]" scope="col">Created</th>
                    <th class="px-6 py-3.5 text-left text-sm font-semibold text-[var(--text-primary)]" scope="col">Duration</th>
                    <th class="px-6 py-3.5 text-left text-sm font-semibold text-[var(--text-primary)]" scope="col">Status</th>
                    <th class="px-6 py-3.5 text-left text-sm font-semibold text-[var(--text-primary)]" scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[var(--border-color)] bg-white">
                  <tr v-for="task in reportTasks" :key="task.id">
                    <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-[var(--text-primary)]">{{ task.name }}</td>
                    <td class="whitespace-nowrap px-6 py-4 text-sm text-[var(--text-secondary)]">{{ task.dataSource }}</td>
                    <td class="whitespace-nowrap px-6 py-4 text-sm text-[var(--text-secondary)]">{{ task.created }}</td>
                    <td class="whitespace-nowrap px-6 py-4 text-sm text-[var(--text-secondary)]">{{ task.duration }}</td>
                    <td class="whitespace-nowrap px-6 py-4">
                      <span :class="['inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', task.statusColor]">{{ task.status }}</span>
                    </td>
                    <td class="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <a @click="viewReport(task.id)" class="text-[var(--primary-color)] hover:text-indigo-800 mr-2 cursor-pointer"><span class="material-icons text-base align-middle">visibility</span></a>
                      <a @click="downloadReport(task.id)" class="text-[var(--primary-color)] hover:text-indigo-800 mr-2 cursor-pointer"><span class="material-icons text-base align-middle">download</span></a>
                      <a class="text-[var(--primary-color)] hover:text-indigo-800 mr-2 cursor-pointer"><span class="material-icons text-base align-middle">description</span></a>
                      <a @click="refreshReport(task.id)" class="text-orange-500 hover:text-orange-700 cursor-pointer"><span class="material-icons text-base align-middle">refresh</span></a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  </div>
</template>

<style>
/* DashboardPage专用的CSS变量 - 全局作用域确保var()能正确解析 */
.dashboard-page {
  --primary-color: #4f46e5;
  --secondary-color: #f3f4f6;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
  --success-bg: #d1fae5;
  --success-text: #065f46;
  --warning-bg: #fef3c7;
  --warning-text: #92400e;
  --pending-bg: #fee2e2;
  --pending-text: #991b1b;
  --danger-bg: #fee2e2;
  --danger-text: #991b1b;
}

.dashboard-page .material-icons {
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
}
</style>
