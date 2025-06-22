// 路由元信息类型
export interface RouteMeta {
  title?: string
  requiresAuth?: boolean
}

// 用户信息类型
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

// 数据源类型
export interface DataSource {
  id: string
  name: string
  type: 'CSV' | 'PostgreSQL' | 'API' | 'MySQL' | 'MongoDB'
  status: 'Active' | 'Inactive' | 'Error'
  created: string
  description?: string
}

// 报告任务类型
export interface ReportTask {
  id: string
  name: string
  dataSource: string
  created: string
  duration: string
  status: 'Completed' | 'Processing' | 'Pending' | 'Failed'
}

// 聊天消息类型
export interface ChatMessage {
  id: string
  type: 'user' | 'agent'
  content: string
  timestamp: string
  avatar?: string
}

// Agent 类型
export interface Agent {
  id: string
  name: string
  description: string
  avatar: string
  compatibleSources: string[]
}

// 登录表单类型
export interface LoginForm {
  email: string
  password: string
  rememberMe: boolean
}

// 注册表单类型
export interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
  name?: string
}
