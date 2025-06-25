<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 响应式状态
const dataSources = ref<any[]>([])
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// 表单数据
const reportForm = ref({
  name: '',
  dataSourceId: ''
})

// 表单验证错误
const formErrors = ref({
  name: '',
  dataSourceId: ''
})

// 获取数据源选项
const fetchDataSources = async () => {
  try {
    const response = await fetch('/api/datasources')
    if (!response.ok) throw new Error('Failed to fetch data sources')
    dataSources.value = await response.json()
  } catch (error) {
    console.error('Error fetching data sources:', error)
    errorMessage.value = 'Failed to load data sources. Please try again.'
  }
}

// 表单验证
const validateForm = () => {
  formErrors.value = { name: '', dataSourceId: '' }
  let isValid = true

  if (!reportForm.value.name.trim()) {
    formErrors.value.name = 'Report name is required'
    isValid = false
  }

  if (!reportForm.value.dataSourceId) {
    formErrors.value.dataSourceId = 'Please select a data source'
    isValid = false
  }

  return isValid
}

// 创建报表
const createReport = async () => {
  if (!validateForm()) return

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await fetch('/api/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: reportForm.value.name.trim(),
        dataSourceId: parseInt(reportForm.value.dataSourceId)
      })
    })

    if (!response.ok) {
      throw new Error('Failed to create report')
    }

    successMessage.value = 'Report creation initiated! It will be processed in the background.'
    
    // 重置表单
    reportForm.value = { name: '', dataSourceId: '' }
    
    // 3秒后跳转到仪表板
    setTimeout(() => {
      router.push('/dashboard')
    }, 3000)

  } catch (error) {
    console.error('Error creating report:', error)
    errorMessage.value = 'Failed to create report. Please try again.'
  } finally {
    loading.value = false
  }
}

// 返回仪表板
const goToDashboard = () => {
  router.push('/dashboard')
}

// 页面初始化
onMounted(fetchDataSources)
</script>

<template>
  <div class="report-generation-page bg-slate-50 min-h-screen">
    <div class="relative flex size-full flex-col group/design-root overflow-x-hidden" style='font-family: Inter, "Noto Sans", sans-serif;'>
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
            <a @click="goToDashboard" class="flex items-center gap-3 rounded-lg px-4 py-3 text-[var(--text-secondary)] transition-colors hover:bg-slate-100 hover:text-[var(--text-primary)] cursor-pointer">
              <span class="material-icons">dashboard</span>
              <span class="text-sm font-medium">Dashboard</span>
            </a>
            <a class="flex items-center gap-3 rounded-lg bg-[var(--secondary-color)] px-4 py-3 text-[var(--primary-color)] transition-colors hover:bg-slate-200">
              <span class="material-icons">add_box</span>
              <span class="text-sm font-medium">Generate Report</span>
            </a>
            <a @click="$router.push('/chat')" class="flex items-center gap-3 rounded-lg px-4 py-3 text-[var(--text-secondary)] transition-colors hover:bg-slate-100 hover:text-[var(--text-primary)] cursor-pointer">
              <span class="material-icons">smart_toy</span>
              <span class="text-sm font-medium">Chat Agent</span>
            </a>
          </nav>
        </div>

        <!-- 主内容区域 -->
        <main class="ml-72 flex-1 p-8">
          <div class="max-w-2xl mx-auto">
            <header class="mb-8">
              <h2 class="text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-2">Generate New Report</h2>
              <p class="text-[var(--text-secondary)]">Create a comprehensive data analysis report using AI-powered insights.</p>
            </header>

            <!-- 成功/错误消息 -->
            <div v-if="successMessage" class="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
              <div class="flex items-center">
                <span class="material-icons text-green-600 mr-3">check_circle</span>
                <p class="text-green-700">{{ successMessage }}</p>
              </div>
            </div>

            <div v-if="errorMessage" class="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
              <div class="flex items-center">
                <span class="material-icons text-red-600 mr-3">error</span>
                <p class="text-red-700">{{ errorMessage }}</p>
              </div>
            </div>

            <!-- 报表创建表单 -->
            <div class="bg-white rounded-xl border border-[var(--border-color)] shadow-sm p-8">
              <form @submit.prevent="createReport" class="space-y-6">
                <!-- 报表名称 -->
                <div>
                  <label for="report-name" class="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Report Name *
                  </label>
                  <input
                    id="report-name"
                    v-model="reportForm.name"
                    type="text"
                    class="block w-full rounded-lg border border-slate-300 px-4 py-3 text-sm placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g., Q4 Sales Performance Analysis"
                    :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': formErrors.name }"
                  />
                  <p v-if="formErrors.name" class="mt-1 text-sm text-red-600">{{ formErrors.name }}</p>
                </div>

                <!-- 数据源选择 -->
                <div>
                  <label for="data-source" class="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Data Source *
                  </label>
                  <select
                    id="data-source"
                    v-model="reportForm.dataSourceId"
                    class="block w-full rounded-lg border border-slate-300 px-4 py-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500': formErrors.dataSourceId }"
                  >
                    <option v-for="source in dataSources" :key="source.value" :value="source.value">
                      {{ source.label }}
                    </option>
                  </select>
                  <p v-if="formErrors.dataSourceId" class="mt-1 text-sm text-red-600">{{ formErrors.dataSourceId }}</p>
                  <p class="mt-1 text-sm text-slate-500">Select the data source for your analysis</p>
                </div>

                <!-- 报表描述 -->
                <div class="bg-slate-50 rounded-lg p-4">
                  <h3 class="text-sm font-medium text-[var(--text-primary)] mb-2">What will be included in your report:</h3>
                  <ul class="text-sm text-slate-600 space-y-1">
                    <li class="flex items-center gap-2">
                      <span class="material-icons text-xs text-green-500">check</span>
                      Executive Summary with key findings
                    </li>
                    <li class="flex items-center gap-2">
                      <span class="material-icons text-xs text-green-500">check</span>
                      Detailed data analysis and insights
                    </li>
                    <li class="flex items-center gap-2">
                      <span class="material-icons text-xs text-green-500">check</span>
                      Performance metrics and trends
                    </li>
                    <li class="flex items-center gap-2">
                      <span class="material-icons text-xs text-green-500">check</span>
                      Actionable recommendations
                    </li>
                    <li class="flex items-center gap-2">
                      <span class="material-icons text-xs text-green-500">check</span>
                      Visualization suggestions
                    </li>
                  </ul>
                </div>

                <!-- 提交按钮 -->
                <div class="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    @click="goToDashboard"
                    class="px-6 py-3 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    :disabled="loading"
                    class="px-6 py-3 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span v-if="loading" class="material-icons animate-spin text-sm">refresh</span>
                    {{ loading ? 'Generating...' : 'Generate Report' }}
                  </button>
                </div>
              </form>
            </div>

            <!-- 处理时间说明 -->
            <div class="mt-6 text-center">
              <p class="text-sm text-slate-500">
                <span class="material-icons text-sm mr-1">info</span>
                Report generation typically takes 1-3 minutes. You'll be able to view the results in your dashboard.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<style>
.report-generation-page {
  --primary-color: #4f46e5;
  --secondary-color: #f3f4f6;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
}

.report-generation-page .material-icons {
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

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 