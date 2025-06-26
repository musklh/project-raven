<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { marked } from 'marked'
import type { DashboardStat, DataSource, ReportTask } from '../types'

const router = useRouter()

// 响应式状态
const stats = ref<DashboardStat[]>([])
const dataSources = ref<DataSource[]>([])
const reportTasks = ref<ReportTask[]>([])

// 数据源模态框
const isDataSourceModalOpen = ref(false)
const dataSourceModalError = ref('')
const initialDataSource: Partial<DataSource> = { id: undefined, name: '', type: 'CSV', status: 'Active' };
let activeDataSource = reactive({ ...initialDataSource });

// 报告模态框
const isReportModalOpen = ref(false)
const activeReport = ref<ReportTask | null>(null)
const reportContentHtml = computed(() => {
  if (activeReport.value && activeReport.value.content) {
    return marked(activeReport.value.content);
  }
  return '';
});

// 数据获取
const fetchDashboardData = async () => {
  try {
    const [statsRes, dataSourcesRes, reportsRes] = await Promise.all([
      fetch('/api/stats'),
      fetch('/api/dashboard/datasources'),
      fetch('/api/reports')
    ]);

    if (!statsRes.ok || !dataSourcesRes.ok || !reportsRes.ok) {
        throw new Error('Failed to fetch dashboard data');
    }

    stats.value = await statsRes.json();
    dataSources.value = await dataSourcesRes.json();
    reportTasks.value = await reportsRes.json();
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  }
};

onMounted(fetchDashboardData);

// 数据源模态框操作
const openAddModal = () => {
  Object.assign(activeDataSource, initialDataSource);
  isDataSourceModalOpen.value = true
  dataSourceModalError.value = ''
}

const openEditModal = (dataSource: DataSource) => {
  Object.assign(activeDataSource, dataSource);
  isDataSourceModalOpen.value = true
  dataSourceModalError.value = ''
}

const closeDataSourceModal = () => {
  isDataSourceModalOpen.value = false
}

// CRUD 操作
const saveDataSource = async () => {
  if (!activeDataSource.name?.trim()) {
    dataSourceModalError.value = 'Data source name is required.';
    return;
  }
  
  const isEditing = activeDataSource.id !== undefined;
  const url = isEditing ? `/api/dashboard/datasources/${activeDataSource.id}` : '/api/dashboard/datasources';
  const method = isEditing ? 'PUT' : 'POST';

  const body: any = { ...activeDataSource };
  if (!isEditing) {
    body.created = new Date().toISOString().split('T')[0];
    body.typeIcon = body.type === 'CSV' ? 'description' : (body.type === 'API' ? 'api' : 'storage');
    body.iconColor = body.type === 'CSV' ? 'text-green-500' : (body.type === 'API' ? 'text-purple-500' : 'text-blue-500');
    body.statusColor = body.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }

  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Failed to save data source');
    }

    await fetchDashboardData();
    closeDataSourceModal();
  } catch (error) {
    console.error(error);
    dataSourceModalError.value = 'An error occurred while saving.';
  }
};

const deleteDataSource = async (id: number) => {
  if (window.confirm('Are you sure you want to delete this data source?')) {
    try {
      const response = await fetch(`/api/dashboard/datasources/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete data source');
      }
      await fetchDashboardData(); // 重新加载数据
    } catch (error) {
      console.error(error);
      alert('Failed to delete data source.');
    }
  }
}

// 报告操作
const viewReport = async (id: number) => {
  try {
    const response = await fetch(`/api/reports/${id}`);
    if (!response.ok) throw new Error('Failed to fetch report details.');
    activeReport.value = await response.json();
    isReportModalOpen.value = true;
  } catch (error) {
    console.error(error);
    alert('Could not load report details.');
  }
}

const downloadReport = (report: ReportTask) => {
  const blob = new Blob([report.content || ''], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${report.name.replace(/\s/g, '_')}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const refreshReport = async (id: number) => {
  try {
    const response = await fetch(`/api/reports/${id}/refresh`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to start refresh.');
    
    // Optimistically update the UI
    const task = reportTasks.value.find(t => t.id === id);
    if (task) {
      task.status = 'Processing';
      task.statusColor = 'bg-[var(--warning-bg)] text-[var(--warning-text)]';
    }

    // Poll for completion
    setTimeout(() => {
        fetchDashboardData()
    }, 3500);

  } catch (error) {
    console.error(error);
    alert('Failed to refresh report.');
  }
}

const closeReportModal = () => {
    isReportModalOpen.value = false;
    activeReport.value = null;
}

// 导航
const goToChat = () => {
  router.push('/chat')
}

// 注销
const handleLogout = () => {
  router.push('/')
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
            <a @click="router.push('/account-settings')" class="flex items-center gap-3 rounded-lg px-4 py-3 text-[var(--text-secondary)] transition-colors hover:bg-slate-100 hover:text-[var(--text-primary)] cursor-pointer">
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
              <button @click="openAddModal" class="flex items-center gap-2 rounded-lg bg-[var(--primary-color)] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
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
                      <a @click="openEditModal(source)" class="text-[var(--primary-color)] hover:text-indigo-800 mr-3 cursor-pointer">Edit</a>
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
                      <span :class="['inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', task.statusColor]">
                        {{ task.status }}
                      </span>
                    </td>
                    <td class="whitespace-nowrap px-6 py-4 text-sm font-medium flex items-center gap-2">
                      <button @click="viewReport(task.id)" class="text-indigo-600 hover:text-indigo-800" title="View Report"><span class="material-icons text-base">visibility</span></button>
                      <button @click="downloadReport(task)" class="text-green-600 hover:text-green-800" title="Download Report"><span class="material-icons text-base">download</span></button>
                      <button @click="refreshReport(task.id)" class="text-blue-600 hover:text-blue-800" title="Refresh Report"><span class="material-icons text-base">refresh</span></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>

    <!-- 数据源模态框 -->
    <div v-if="isDataSourceModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
      <div class="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-8 shadow-lg">
        <h3 class="text-xl font-semibold text-slate-800 mb-6">{{ activeDataSource.id ? 'Edit' : 'Add' }} Data Source</h3>
        
        <form @submit.prevent="saveDataSource" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1" for="source-name">Name</label>
            <input v-model="activeDataSource.name" id="source-name" type="text" class="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5" placeholder="e.g., Q1 Sales Data">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-600 mb-1" for="source-type">Type</label>
            <select v-model="activeDataSource.type" id="source-type" class="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5">
              <option>CSV</option>
              <option>PostgreSQL</option>
              <option>API</option>
            </select>
          </div>

           <div>
            <label class="block text-sm font-medium text-slate-600 mb-1" for="source-status">Status</label>
            <select v-model="activeDataSource.status" id="source-status" class="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5">
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>

          <div v-if="dataSourceModalError" class="text-sm text-red-600">{{ dataSourceModalError }}</div>
          
          <div class="flex justify-end gap-4 pt-4">
            <button @click="closeDataSourceModal" type="button" class="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Cancel</button>
            <button type="submit" class="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Save</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 报告详情模态框 -->
    <div v-if="isReportModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" @click.self="closeReportModal">
        <div class="relative w-full max-w-3xl rounded-xl bg-white shadow-lg flex flex-col" style="max-height: 90vh;">
            <div class="flex items-center justify-between p-6 border-b border-slate-200">
                <h3 class="text-xl font-semibold text-slate-800">{{ activeReport?.name }}</h3>
                <button @click="closeReportModal" class="text-slate-500 hover:text-slate-800">
                    <span class="material-icons">close</span>
                </button>
            </div>
            <div class="p-6 overflow-y-auto">
              <article class="prose prose-slate max-w-none" v-html="reportContentHtml"></article>
            </div>
             <div class="flex justify-end p-4 bg-slate-50 border-t border-slate-200 rounded-b-xl">
                <button @click="activeReport && downloadReport(activeReport)" class="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    <span class="material-icons text-base">download</span>
                    Download Report
                </button>
            </div>
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

.prose table {
  width: 100%;
  border-collapse: collapse;
}

.prose th,
.prose td {
  border: 1px solid #e5e7eb;
  padding: 0.5rem 1rem;
}

.prose thead {
  background-color: #f3f4f6;
}
</style>
