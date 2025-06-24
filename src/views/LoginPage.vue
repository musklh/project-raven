<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const activeTab = ref('login')
const error = ref('')

// 处理登录
const handleLogin = async () => {
  error.value = ''
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    console.log('Login successful, token:', data.token);
    
    // 登录成功后跳转到仪表板
    router.push('/dashboard')
  } catch (err: any) {
    error.value = err.message;
    console.error('Login error:', err);
  }
}

// 切换标签页
const switchTab = (tab: string) => {
  activeTab.value = tab
}
</script>

<template>
  <div class="login-page">
    <div class="dynamic-background"></div>
    <div class="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden" style="--checkbox-tick-svg: url('data:image/svg+xml,%3csvg viewBox=%270 0 16 16%27 fill='%23ffffff'%27 xmlns=%27http://www.w3.org/2000/svg%27%3e%3cpath d=%27M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z%27/%3e%3c/svg%3e');">
      <div class="layout-container flex h-full grow flex-col items-center justify-center">
        <div class="px-4 sm:px-6 lg:px-8 flex flex-1 justify-center py-10 w-full">
          <div class="layout-content-container flex flex-col w-full max-w-md bg-[var(--card-bg)] shadow-2xl rounded-xl overflow-hidden">
            <div class="flex flex-col items-center pt-8 pb-6">
              <img alt="DataFlow Logo" class="h-16 w-16 mb-3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDF-K7RVTCRqI45eTS4Ima6n34sUCJzXYWvYvKYzGFATN68Nj3fEjwlrCZSwtGu9mBOPMbGOb533rzMyS1hN1U-6fgqgOzR6hvvdjuGXmWiG5pRVxWKfdEaV9asDYv2RLl-tWQjstKssu7tVMM6KionHZwfKYioPt2-FfPE2hDJ9gzooEQRwd0-2PWmk5SizfOhNmAgXy6sichuco5vfDARf-BGcxpNxVAHO2GD-EZ0X7vRTiKAwYD8Y_z9MmMe6eV4WKCTZXM70I5C"/>
              <h1 class="text-[var(--text-primary)] text-3xl font-bold tracking-tight">DataFlow</h1>
            </div>
            <div class="pb-4 px-6 sm:px-8">
              <div class="flex border-b border-[var(--border-color)] gap-6">
                <a 
                  @click="switchTab('login')"
                  :class="['flex flex-col items-center justify-center border-b-[3px] pb-3 pt-2 flex-1 cursor-pointer', activeTab === 'login' ? 'active-tab' : 'inactive-tab border-b-transparent']"
                  href="#"
                >
                  <p class="text-sm font-semibold tracking-wide">Login</p>
                </a>
                <a 
                  @click="switchTab('register')"
                  :class="['flex flex-col items-center justify-center border-b-[3px] pb-3 pt-2 flex-1 cursor-pointer', activeTab === 'register' ? 'active-tab' : 'inactive-tab border-b-transparent']"
                  href="#"
                >
                  <p class="text-sm font-semibold tracking-wide">Register</p>
                </a>
              </div>
            </div>
            <div class="px-6 sm:px-8 py-6 space-y-6">
              <!-- 登录表单 -->
              <div v-if="activeTab === 'login'">
                <div>
                  <label class="flex flex-col">
                    <p class="text-[var(--text-primary)] text-sm font-medium leading-normal pb-1.5">Email</p>
                    <input 
                      v-model="email"
                      class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[var(--text-primary)] focus:outline-0 focus:ring-0 border border-[var(--border-color)] bg-white h-12 placeholder:text-[var(--text-secondary)] p-3 text-sm font-normal" 
                      placeholder="you@example.com" 
                      type="email"
                    />
                  </label>
                </div>
                <div>
                  <label class="flex flex-col">
                    <p class="text-[var(--text-primary)] text-sm font-medium leading-normal pb-1.5">Password</p>
                    <input 
                      v-model="password"
                      class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[var(--text-primary)] focus:outline-0 focus:ring-0 border border-[var(--border-color)] bg-white h-12 placeholder:text-[var(--text-secondary)] p-3 text-sm font-normal" 
                      placeholder="••••••••" 
                      type="password"
                    />
                  </label>
                </div>
                <div class="flex items-center justify-between">
                  <label class="flex items-center gap-x-2.5 py-2">
                    <input 
                      v-model="rememberMe"
                      class="h-4 w-4 rounded border-[var(--border-color)] border bg-transparent text-[var(--accent-color)] checked:bg-[var(--accent-color)] checked:border-[var(--accent-color)] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[var(--accent-color)] focus:outline-none" 
                      type="checkbox"
                    />
                    <p class="text-[var(--text-secondary)] text-sm font-normal">Remember Me</p>
                  </label>
                  <a class="text-[var(--accent-color)] text-sm font-medium hover:underline" href="#">Forgot Password?</a>
                </div>
                <div class="pt-2">
                  <button 
                    @click="handleLogin"
                    class="btn-primary flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 text-sm font-semibold tracking-wide"
                  >
                    <span class="truncate">Login</span>
                  </button>
                </div>
                <div v-if="error" class="text-red-500 text-sm text-center pt-2">
                  {{ error }}
                </div>
              </div>
              
              <!-- 注册表单 -->
              <div v-else>
                <div>
                  <label class="flex flex-col">
                    <p class="text-[var(--text-primary)] text-sm font-medium leading-normal pb-1.5">Full Name</p>
                    <input 
                      class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[var(--text-primary)] focus:outline-0 focus:ring-0 border border-[var(--border-color)] bg-white h-12 placeholder:text-[var(--text-secondary)] p-3 text-sm font-normal" 
                      placeholder="Enter your full name" 
                      type="text"
                    />
                  </label>
                </div>
                <div>
                  <label class="flex flex-col">
                    <p class="text-[var(--text-primary)] text-sm font-medium leading-normal pb-1.5">Email</p>
                    <input 
                      class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[var(--text-primary)] focus:outline-0 focus:ring-0 border border-[var(--border-color)] bg-white h-12 placeholder:text-[var(--text-secondary)] p-3 text-sm font-normal" 
                      placeholder="you@example.com" 
                      type="email"
                    />
                  </label>
                </div>
                <div>
                  <label class="flex flex-col">
                    <p class="text-[var(--text-primary)] text-sm font-medium leading-normal pb-1.5">Password</p>
                    <input 
                      class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[var(--text-primary)] focus:outline-0 focus:ring-0 border border-[var(--border-color)] bg-white h-12 placeholder:text-[var(--text-secondary)] p-3 text-sm font-normal" 
                      placeholder="••••••••" 
                      type="password"
                    />
                  </label>
                </div>
                <div class="pt-2">
                  <button 
                    class="btn-primary flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 text-sm font-semibold tracking-wide"
                  >
                    <span class="truncate">Register</span>
                  </button>
                </div>
              </div>
            </div>
            <p class="text-[var(--text-secondary)] text-xs font-normal pb-6 px-6 sm:px-8 text-center">
              <span v-if="activeTab === 'login'">
                Don't have an account? <a @click="switchTab('register')" class="font-medium text-[var(--accent-color)] hover:underline cursor-pointer">Register here</a>.
              </span>
              <span v-else>
                Already have an account? <a @click="switchTab('login')" class="font-medium text-[var(--accent-color)] hover:underline cursor-pointer">Login here</a>.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* LoginPage专用的CSS变量 - 全局作用域确保var()能正确解析 */
.login-page {
  --primary-color: #dce8f3;
  --secondary-color: #121416;
  --accent-color: #4F46E5;
  --neutral-bg: #F3F4F6;
  --card-bg: #FFFFFF;
  --text-primary: #1F2937;
  --text-secondary: #6B7280;
  --border-color: #D1D5DB;
}

.login-page body {
  font-family: Inter, "Noto Sans", sans-serif;
  background-color: var(--neutral-bg);
}

.login-page .dynamic-background {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  opacity: 0.1;
}

.login-page .active-tab {
  border-bottom-color: var(--accent-color) !important;
  color: var(--accent-color) !important;
}

.login-page .inactive-tab p {
  color: var(--text-secondary) !important;
}

.login-page .form-input:focus {
  border-color: var(--accent-color) !important;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}

.login-page .btn-primary {
  background-color: var(--accent-color);
  color: white;
  transition: background-color 0.3s ease;
}

.login-page .btn-primary:hover {
  background-color: #4338CA;
}
</style>
