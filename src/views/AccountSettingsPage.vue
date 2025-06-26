<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 用户资料数据
const userProfile = ref({
  name: 'Olivia Martin',
  email: 'olivia.martin@example.com',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOcd2PQneGnvjzSPZcFlioYtm5dSWX4GKtZCJSnkhKjIdOEyRZbgeyr6hCor0kAnAHO4C__XW7gn-7pp8Ih2HbVik8J_ZFXF6--GcSZBTr89sJc1UiCkayAZiQrRSFs2wtRxGRPpi104ZBnewuaRpmx_-15O9Z99gn6xZ-mtJhXkWsUDPEDOomj66SFFtqCNNWe1vHQVu4Ed0JnEU71vRWc9Fy0cCE19aLTp9gJkM_pDZE7RRFygaG2S1y8CWf6UP4Dps0W0uIPvic',
  department: '数据分析部',
  role: '高级数据分析师',
  phone: '+86 138 0013 8000',
  location: '北京市朝阳区'
})

// 密码修改表单
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 通知设置
const notificationSettings = ref({
  emailNotifications: true,
  pushNotifications: true,
  reportAlerts: true,
  systemUpdates: false,
  marketingEmails: false
})

// 隐私设置
const privacySettings = ref({
  profileVisibility: 'team',
  activityTracking: true,
  dataSharing: false
})

// 表单状态
const isEditingProfile = ref(false)
const passwordError = ref('')
const successMessage = ref('')

// 编辑资料
const toggleEditProfile = () => {
  isEditingProfile.value = !isEditingProfile.value
}

const saveProfile = async () => {
  try {
    // 这里调用API保存用户资料
    isEditingProfile.value = false
    successMessage.value = '资料更新成功！'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('保存失败:', error)
  }
}

// 修改密码
const changePassword = async () => {
  passwordError.value = ''
  
  if (!passwordForm.value.currentPassword || !passwordForm.value.newPassword) {
    passwordError.value = '请填写所有密码字段'
    return
  }
  
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = '新密码和确认密码不匹配'
    return
  }
  
  if (passwordForm.value.newPassword.length < 6) {
    passwordError.value = '新密码长度至少为6位'
    return
  }
  
  try {
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    successMessage.value = '密码修改成功！'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    passwordError.value = '密码修改失败，请重试'
  }
}

// 保存通知设置
const saveNotificationSettings = async () => {
  try {
    successMessage.value = '通知设置已保存！'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('保存失败:', error)
  }
}

// 保存隐私设置
const savePrivacySettings = async () => {
  try {
    successMessage.value = '隐私设置已保存！'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('保存失败:', error)
  }
}

// 导航
const goToDashboard = () => {
  router.push('/dashboard')
}

const goToChat = () => {
  router.push('/chat')
}

// 注销
const handleLogout = () => {
  router.push('/')
}
</script>

<template>
  <div class="account-settings-page bg-slate-50">
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
            <a @click="goToDashboard" class="flex items-center gap-3 rounded-lg px-4 py-3 text-[var(--text-secondary)] transition-colors hover:bg-slate-100 hover:text-[var(--text-primary)] cursor-pointer">
              <span class="material-icons">dashboard</span>
              <span class="text-sm font-medium">Dashboard</span>
            </a>
            <a @click="goToChat" class="flex items-center gap-3 rounded-lg px-4 py-3 text-[var(--text-secondary)] transition-colors hover:bg-slate-100 hover:text-[var(--text-primary)] cursor-pointer">
              <span class="material-icons">smart_toy</span>
              <span class="text-sm font-medium">Chat Agent</span>
            </a>
            <a class="flex items-center gap-3 rounded-lg bg-[var(--secondary-color)] px-4 py-3 text-[var(--primary-color)] transition-colors hover:bg-slate-200" href="#">
              <span class="material-icons">settings</span>
              <span class="text-sm font-medium">Account Settings</span>
            </a>
          </nav>
          <div class="mt-auto flex items-center gap-3 rounded-lg border border-[var(--border-color)] p-3">
            <img alt="User Avatar" class="h-10 w-10 rounded-full" :src="userProfile.avatar"/>
            <div>
              <p class="text-sm font-medium text-[var(--text-primary)]">{{ userProfile.name }}</p>
              <p class="text-xs text-[var(--text-secondary)]">{{ userProfile.email }}</p>
            </div>
            <button @click="handleLogout" class="ml-auto text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              <span class="material-icons text-xl">logout</span>
            </button>
          </div>
        </div>

        <!-- 主内容区域 -->
        <main class="ml-72 flex-1 p-8">
          <header class="mb-8">
            <h2 class="text-3xl font-bold tracking-tight text-[var(--text-primary)]">账户设置</h2>
            <p class="mt-2 text-[var(--text-secondary)]">管理您的个人资料、安全设置和偏好</p>
          </header>

          <!-- 成功消息 -->
          <div v-if="successMessage" class="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
            <div class="flex">
              <span class="material-icons text-green-400 mr-3">check_circle</span>
              <p class="text-sm text-green-800">{{ successMessage }}</p>
            </div>
          </div>

          <!-- 个人资料 -->
          <section class="mb-8">
            <div class="rounded-xl border border-[var(--border-color)] bg-white shadow-sm">
              <div class="border-b border-[var(--border-color)] px-6 py-4">
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-semibold text-[var(--text-primary)]">个人资料</h3>
                  <button 
                    @click="toggleEditProfile" 
                    class="text-[var(--primary-color)] hover:text-indigo-700 text-sm font-medium"
                  >
                    {{ isEditingProfile ? '取消' : '编辑' }}
                  </button>
                </div>
              </div>
              <div class="p-6">
                <div class="flex items-start gap-6">
                  <img class="h-20 w-20 rounded-full" :src="userProfile.avatar" alt="用户头像">
                  <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1">姓名</label>
                      <input 
                        v-if="isEditingProfile"
                        v-model="userProfile.name"
                        type="text" 
                        class="block w-full rounded-md border border-[var(--border-color)] px-3 py-2 text-sm focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)]"
                      >
                      <p v-else class="text-sm text-[var(--text-primary)]">{{ userProfile.name }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1">邮箱</label>
                      <input 
                        v-if="isEditingProfile"
                        v-model="userProfile.email"
                        type="email" 
                        class="block w-full rounded-md border border-[var(--border-color)] px-3 py-2 text-sm focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)]"
                      >
                      <p v-else class="text-sm text-[var(--text-primary)]">{{ userProfile.email }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1">部门</label>
                      <input 
                        v-if="isEditingProfile"
                        v-model="userProfile.department"
                        type="text" 
                        class="block w-full rounded-md border border-[var(--border-color)] px-3 py-2 text-sm focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)]"
                      >
                      <p v-else class="text-sm text-[var(--text-primary)]">{{ userProfile.department }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1">职位</label>
                      <input 
                        v-if="isEditingProfile"
                        v-model="userProfile.role"
                        type="text" 
                        class="block w-full rounded-md border border-[var(--border-color)] px-3 py-2 text-sm focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)]"
                      >
                      <p v-else class="text-sm text-[var(--text-primary)]">{{ userProfile.role }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1">电话</label>
                      <input 
                        v-if="isEditingProfile"
                        v-model="userProfile.phone"
                        type="tel" 
                        class="block w-full rounded-md border border-[var(--border-color)] px-3 py-2 text-sm focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)]"
                      >
                      <p v-else class="text-sm text-[var(--text-primary)]">{{ userProfile.phone }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1">所在地</label>
                      <input 
                        v-if="isEditingProfile"
                        v-model="userProfile.location"
                        type="text" 
                        class="block w-full rounded-md border border-[var(--border-color)] px-3 py-2 text-sm focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)]"
                      >
                      <p v-else class="text-sm text-[var(--text-primary)]">{{ userProfile.location }}</p>
                    </div>
                  </div>
                </div>
                <div v-if="isEditingProfile" class="mt-6 flex justify-end gap-3">
                  <button 
                    @click="toggleEditProfile"
                    class="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] bg-white border border-[var(--border-color)] rounded-md hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button 
                    @click="saveProfile"
                    class="px-4 py-2 text-sm font-medium text-white bg-[var(--primary-color)] rounded-md hover:bg-indigo-700"
                  >
                    保存更改
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- 密码修改 -->
          <section class="mb-8">
            <div class="rounded-xl border border-[var(--border-color)] bg-white shadow-sm">
              <div class="border-b border-[var(--border-color)] px-6 py-4">
                <h3 class="text-lg font-semibold text-[var(--text-primary)]">修改密码</h3>
              </div>
              <div class="p-6">
                <form @submit.prevent="changePassword" class="space-y-4 max-w-md">
                  <div>
                    <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1">当前密码</label>
                    <input 
                      v-model="passwordForm.currentPassword"
                      type="password" 
                      class="block w-full rounded-md border border-[var(--border-color)] px-3 py-2 text-sm focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)]"
                      placeholder="请输入当前密码"
                    >
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1">新密码</label>
                    <input 
                      v-model="passwordForm.newPassword"
                      type="password" 
                      class="block w-full rounded-md border border-[var(--border-color)] px-3 py-2 text-sm focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)]"
                      placeholder="请输入新密码"
                    >
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-[var(--text-secondary)] mb-1">确认新密码</label>
                    <input 
                      v-model="passwordForm.confirmPassword"
                      type="password" 
                      class="block w-full rounded-md border border-[var(--border-color)] px-3 py-2 text-sm focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)]"
                      placeholder="请再次输入新密码"
                    >
                  </div>
                  <div v-if="passwordError" class="text-sm text-red-600">
                    {{ passwordError }}
                  </div>
                  <button 
                    type="submit"
                    class="px-4 py-2 text-sm font-medium text-white bg-[var(--primary-color)] rounded-md hover:bg-indigo-700"
                  >
                    修改密码
                  </button>
                </form>
              </div>
            </div>
          </section>

          <!-- 通知设置 -->
          <section class="mb-8">
            <div class="rounded-xl border border-[var(--border-color)] bg-white shadow-sm">
              <div class="border-b border-[var(--border-color)] px-6 py-4">
                <h3 class="text-lg font-semibold text-[var(--text-primary)]">通知设置</h3>
              </div>
              <div class="p-6">
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm font-medium text-[var(--text-primary)]">邮件通知</p>
                      <p class="text-xs text-[var(--text-secondary)]">接收重要更新和报告完成通知</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input v-model="notificationSettings.emailNotifications" type="checkbox" class="sr-only peer">
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                    </label>
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm font-medium text-[var(--text-primary)]">推送通知</p>
                      <p class="text-xs text-[var(--text-secondary)]">浏览器推送通知</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input v-model="notificationSettings.pushNotifications" type="checkbox" class="sr-only peer">
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                    </label>
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm font-medium text-[var(--text-primary)]">报告提醒</p>
                      <p class="text-xs text-[var(--text-secondary)]">数据分析报告完成时通知</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input v-model="notificationSettings.reportAlerts" type="checkbox" class="sr-only peer">
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                    </label>
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm font-medium text-[var(--text-primary)]">系统更新</p>
                      <p class="text-xs text-[var(--text-secondary)]">系统维护和更新通知</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input v-model="notificationSettings.systemUpdates" type="checkbox" class="sr-only peer">
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                    </label>
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm font-medium text-[var(--text-primary)]">营销邮件</p>
                      <p class="text-xs text-[var(--text-secondary)]">产品更新和优惠信息</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input v-model="notificationSettings.marketingEmails" type="checkbox" class="sr-only peer">
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                    </label>
                  </div>
                </div>
                <div class="mt-6">
                  <button 
                    @click="saveNotificationSettings"
                    class="px-4 py-2 text-sm font-medium text-white bg-[var(--primary-color)] rounded-md hover:bg-indigo-700"
                  >
                    保存通知设置
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- 隐私设置 -->
          <section class="mb-8">
            <div class="rounded-xl border border-[var(--border-color)] bg-white shadow-sm">
              <div class="border-b border-[var(--border-color)] px-6 py-4">
                <h3 class="text-lg font-semibold text-[var(--text-primary)]">隐私设置</h3>
              </div>
              <div class="p-6">
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-[var(--text-secondary)] mb-2">资料可见性</label>
                    <select 
                      v-model="privacySettings.profileVisibility"
                      class="block w-full max-w-xs rounded-md border border-[var(--border-color)] px-3 py-2 text-sm focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)]"
                    >
                      <option value="public">公开</option>
                      <option value="team">仅团队可见</option>
                      <option value="private">私有</option>
                    </select>
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm font-medium text-[var(--text-primary)]">活动跟踪</p>
                      <p class="text-xs text-[var(--text-secondary)]">允许系统跟踪使用情况以改善体验</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input v-model="privacySettings.activityTracking" type="checkbox" class="sr-only peer">
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                    </label>
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm font-medium text-[var(--text-primary)]">数据共享</p>
                      <p class="text-xs text-[var(--text-secondary)]">允许与第三方服务共享匿名数据</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input v-model="privacySettings.dataSharing" type="checkbox" class="sr-only peer">
                      <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                    </label>
                  </div>
                </div>
                <div class="mt-6">
                  <button 
                    @click="savePrivacySettings"
                    class="px-4 py-2 text-sm font-medium text-white bg-[var(--primary-color)] rounded-md hover:bg-indigo-700"
                  >
                    保存隐私设置
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- 危险操作区域 -->
          <section>
            <div class="rounded-xl border border-red-200 bg-red-50 shadow-sm">
              <div class="border-b border-red-200 px-6 py-4">
                <h3 class="text-lg font-semibold text-red-800">危险操作</h3>
              </div>
              <div class="p-6">
                <div class="space-y-4">
                  <div>
                    <h4 class="text-sm font-medium text-red-800 mb-2">删除账户</h4>
                    <p class="text-xs text-red-600 mb-4">此操作将永久删除您的账户和所有相关数据，无法恢复。</p>
                    <button 
                      class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                      onclick="alert('此功能需要额外的身份验证')"
                    >
                      删除账户
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  </div>
</template>

<style>
/* AccountSettingsPage专用的CSS变量 */
.account-settings-page {
  --primary-color: #4f46e5;
  --secondary-color: #f3f4f6;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
}

.account-settings-page .material-icons {
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