# 项目开发过程回顾与最佳实践

本文档旨在记录 "Project Raven" 从零到一的完整开发流程，并沉淀一套可供参考的最佳实践。我们遵循了 API-First 的设计哲学，并借助 Mock Server 实现了前后端的并行开发与高效迭代。

## 第一阶段：需求分析与 API 设计

在项目启动初期，我们并未直接着手编写前端代码，而是首先分析核心页面 (`ChatPage.vue`) 的功能需求，并以此为基础，推导出后端需要提供的 API 接口。

1.  **功能点识别**:
    *   获取会话列表
    *   获取指定会话的消息历史
    *   发送消息并接收 Agent 回复
    *   获取可用数据源列表
    *   获取可用 Agent 列表

2.  **API-First 设计**:
    *   我们将上述功能点转化为 RESTful API 接口定义。
    *   明确了每个接口的 **URL、HTTP Method、请求参数、以及成功和失败的响应数据结构**。
    *   所有这些设计都被详细地记录在了 `document/api.md` 文件中。这份文档成为了前后端开发的"契约"，确保了双方工作的一致性。

**核心收益**:
*   **解耦**：前后端团队可以基于同一份 API 文档并行工作，无需等待对方完成。
*   **明确性**：接口定义清晰，减少了沟通成本和后期集成风险。

## 第二阶段：搭建 Mock Server

在 API "契约" 确定后，我们立即使用 `json-server` 搭建了一个轻量级的 Mock Server，用以模拟所有已定义的 API 接口。

1.  **安装与配置**:
    *   通过 `pnpm add -D json-server` 将其添加为开发依赖。
    *   创建 `mock/db.json` 文件，将所有前端页面中使用的静态数据（如会话列表、消息、数据源等）迁移至此，作为 Mock API 的数据源。
    *   创建 `mock/routes.json`，配置自定义路由规则，将 API 文档中定义的复杂路由（如 `/api/conversations/:id/messages`）映射到 `json-server` 能理解的查询上。

2.  **版本问题与解决**:
    *   **问题**: 我们最初安装了 `json-server` 的 `1.0.0-beta.3` 版本，但启动时发现它不支持 `--routes` 参数，导致服务失败。
    *   **解决**: 通过 `pnpm add -D json-server@0.17.4` 将其降级到一个功能完整的稳定版本，问题得以解决。

3.  **脚本集成**:
    *   在 `package.json` 的 `scripts` 中添加 `"mock:api": "json-server --watch mock/db.json --routes mock/routes.json --port 3001"`，实现一键启动 Mock Server。

**核心收益**:
*   **前端独立**：前端开发者无需真实的后端环境，即可进行完整的开发和调试。
*   **快速验证**：可以快速验证 API 设计的合理性，并根据前端的实际需求进行调整。

## 第三阶段：前端重构与 API 对接

有了可用的 Mock API，我们开始对前端页面进行全面的重构，使其从依赖本地静态数据转变为通过网络请求获取动态数据。

1.  **代理配置**:
    *   在 `vite.config.ts` 中配置了 `server.proxy`，将所有发往 `/api` 的请求都代理到 `http://localhost:3001` 的 Mock Server 上。这避免了跨域问题，并简化了前端代码中的 API 调用。

2.  **组件重构**:
    *   移除了 `ChatPage.vue` 和 `DashboardPage.vue` 中所有硬编码的 `ref` 数据。
    *   使用 `onMounted`生命周期钩子和 `fetch` API，在组件加载时从 Mock API 获取数据来填充页面。
    *   将所有与用户交互相关的操作（如发送消息、切换会话）都改造为对 Mock API 的调用。

## 第四阶段：功能迭代与 Mock Server 增强

在基础框架搭建完毕后，我们进入了快速的功能迭代阶段，重点实现了 Dashboard 页面的完整 CRUD（创建、读取、更新、删除）功能。

1.  **数据源管理 (CRUD)**:
    *   **API 扩展**: 首先在 `document/api.md` 中定义了 `POST`, `PUT`, `DELETE` 数据源的接口。
    *   **前端实现**:
        *   在 `DashboardPage.vue` 中添加了一个模态框（Modal）作为表单，用于添加和编辑数据源。
        *   实现了 `addDataSource`、`editDataSource`、`deleteDataSource` 等方法，使其能够调用对应的 Mock API，并在操作成功后重新获取列表数据，实现页面刷新。

2.  **报告任务功能**:
    *   **API 扩展**: 在 API 文档中定义了获取单个报告详情 (`GET /reports/:id`) 和刷新报告 (`POST /reports/:id/refresh`) 的接口。
    *   **自定义 Mock 服务逻辑**:
        *   **问题**: `json-server` 默认不支持为特定路由添加复杂的业务逻辑（如模拟异步刷新）。
        *   **解决**:
            *   创建了 `mock/server.cjs` 脚本，通过编程方式启动 `json-server`。
            *   在该脚本中，我们为 `/api/login` 和 `/api/reports/:id/refresh` 添加了自定义的路由处理器，实现了登录验证和模拟异步刷新报告的逻辑。
            *   由于项目使用 ES Module (`"type": "module"`)，我们将脚本从 `.js` 重命名为 `.cjs` 以兼容 CommonJS 的 `require` 语法，解决了模块加载错误。
    *   **前端实现**:
        *   实现了 `viewReport` (弹窗显示报告内容), `downloadReport` (生成并下载文件), 和 `refreshReport` (调用刷新接口并乐观更新 UI) 的功能。

3.  **样式优化**:
    *   **问题**: 报告预览模态框中由 `v-html` 渲染的 Markdown 内容样式简陋。
    *   **解决**:
        *   安装了 `@tailwindcss/typography` 插件。
        *   在 `tailwind.config.js` 中启用该插件。
        *   为报告内容容器添加 `prose` class，轻松实现了一套优美、专业的排版样式。

## 总结

"Project Raven" 的开发过程充分证明了 API-First 和 Mock Server 驱动开发模式的优越性。它不仅**提高了开发效率、降低了前后端耦合度**，还使得整个开发流程**更加规范、迭代更加敏捷**。我们遇到的版本兼容和模块系统问题，也为未来的项目提供了宝贵的避坑经验。这套流程和方法论值得在未来的项目中继续推广和应用。 