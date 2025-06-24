# Project Raven API 文档

本文档定义了 Project Raven 前后端交互的 API 接口。所有接口都基于 RESTful 风格设计，并使用 JSON 格式进行数据交换。所有响应都将使用 mock 数据。

## 根 URL

所有 API 的根路径为 `/api`。

---

## 1. 会话 (Conversations)

### 1.1 获取会话列表

获取当前用户的所有会话列表。

- **URL**: `/conversations`
- **Method**: `GET`
- **Auth required**: Yes

**成功响应 (200 OK)**

```json
[
  {
    "id": 1,
    "title": "Analyze sales data",
    "date": "2024-01-20"
  },
  {
    "id": 2,
    "title": "Customer feedback analysis",
    "date": "2024-01-19"
  }
]
```

---

## 2. 消息 (Messages)

### 2.1 获取指定会话的消息列表

获取特定会话下的所有消息。

- **URL**: `/conversations/:conversationId/messages`
- **Method**: `GET`
- **Auth required**: Yes

**URL 参数**

- `conversationId` (number, required): 会话的唯一标识符。

**成功响应 (200 OK)**

```json
[
  {
    "id": 1,
    "type": "agent",
    "content": "Hello, I'm ready to assist with your data analysis. Please provide your instructions and select a data source.",
    "avatar": "https://lh3.googleusercontent.com/aida-public/AB6AXuA4n3DwFF_4CNdc8KTvA2uXnmTH-I7iEupK77SfzgVWYK6v-FjOSOhvjwEkGvqMN9B8r86A1Q-LF4YtROUFNBbWTtvCpBGN2DK3zy14M-iXKd9ou5NrsnOhjL8Qb6vSU3xNnmEfM5aRUyanRT44g-zl-AZjh8JUr9SsXWIYmXzPWm4KKzmR6Y8bagxnBuOGpO5-P2ub-KovZJqiPTtEUwfZm2mrz1tbfHs3Tg_gOYKxa2G35mcmStmYpeQjsIUKyDo9LryrblyB1-07"
  },
  {
    "id": 2,
    "type": "user",
    "content": "Analyze sales data for the last quarter.",
    "avatar": "https://lh3.googleusercontent.com/aida-public/AB6AXuDVUBlNg0ACI3inGKAOmj4WWYKHk5t7mFjgzcf0dHCWQqXjV8WGh4n8OUWp7k-qmDg_9hQYkAnPoBQNPlwY62pZ0-x0A9A_YxLKSOnVTVk4H03HrMDQ6S-Zo-i5tq7K3iMc8amMCGAn6XqOrZPHagqRVgmEQFswCtccKdsIVK6A0rQ137HDvnUo20YIbADYiXphdg0BBQoCV58Fnw5ZC_v9lJW5loaqlsWa61j2MNoulSsFivZPxKMQbU9c3sIKl5XpWRGiTqasBz8D"
  },
  {
    "id": 3,
    "type": "agent",
    "content": "Here's the sales data analysis for the last quarter:\n\n**销售数据分析表格**\n\n| Product | Sales | Revenue |\n|---|---|---|\n| Product A | 1000 | $50,000 |\n| Product B | 1500 | $75,000 |\n| Product C | 800 | $40,000 |\n\n**总计统计:**\n- Total Sales: 3300\n- Total Revenue: $165,000",
    "avatar": "https://lh3.googleusercontent.com/aida-public/AB6AXuCtSYF8Yxc5_NrvJcw0ezjYV5rluO05Uo-y0cSf8LFtyeYvy8gjtzsVQZnse1lxKFtgwC_XAXUX93QBR_8J3ew6kwkaRubup5ZA2CM_9R879EM6ZzKCRZ77QfnHrl44ytByl-cjnJf8M4Yid4Gfue0PcnWLuVUT-FCi-uZHI0JizgRG7ySeosWL9RCUjZtPUJ0N412zAoCEdycYCX5FCJommYKM9dIz7PcXiu8NgTLOUk4zIcRAgZXq87QW59CVGjyHMXBmd4sTmKWK",
    "isTable": true
  }
]
```

### 2.2 发送消息

在指定会话中发送一条新消息。

- **URL**: `/conversations/:conversationId/messages`
- **Method**: `POST`
- **Auth required**: Yes

**URL 参数**

- `conversationId` (number, required): 会话的唯一标识符。

**请求体**

```json
{
  "content": "Your message content here",
  "dataSource": "sales_q4_2023"
}
```

**成功响应 (200 OK)**

服务器收到消息后，会进行处理，并返回一个或多个 Agent 的消息。为简化，这里同步返回一个 "正在处理" 的消息，真实的业务消息可以通过 WebSocket 或轮询获取。

```json
{
  "id": 4,
  "type": "agent",
  "content": "我已收到您的请求，正在分析数据...",
  "avatar": "https://lh3.googleusercontent.com/aida-public/AB6AXuCtSYF8Yxc5_NrvJcw0ezjYV5rluO05Uo-y0cSf8LFtyeYvy8gjtzsVQZnse1lxKFtgwC_XAXUX93QBR_8J3ew6kwkaRubup5ZA2CM_9R879EM6ZzKCRZ77QfnHrl44ytByl-cjnJf8M4Yid4Gfue0PcnWLuVUT-FCi-uZHI0JizgRG7ySeosWL9RCUjZtPUJ0N412zAoCEdycYCX5FCJommYKM9dIz7PcXiu8NgTLOUk4zIcRAgZXq87QW59CVGjyHMXBmd4sTmKWK"
}
```

---

## 3. 数据源 (Data Sources)

### 3.1 获取数据源列表

获取所有可用的数据源选项。

- **URL**: `/datasources`
- **Method**: `GET`
- **Auth required**: Yes

**成功响应 (200 OK)**

```json
[
  { "value": "", "label": "Select Data Source (e.g., Sales Q4 2023)" },
  { "value": "sales_q4_2023", "label": "Sales Q4 2023" },
  { "value": "customer_feedback_jan", "label": "Customer Feedback Jan" },
  { "value": "market_trends_report", "label": "Market Trends Report" }
]
```

---

## 4. Agents

### 4.1 获取 Agent 列表

获取所有可用的 Agent。

- **URL**: `/agents`
- **Method**: `GET`
- **Auth required**: Yes

**成功响应 (200 OK)**

```json
[
  {
    "id": 1,
    "name": "Sales Analyst",
    "description": "Analyzes sales data and provides insights.",
    "compatible": "Sales Data, CRM Exports",
    "avatar": "https://lh3.googleusercontent.com/aida-public/AB6AXuB0tsX4smz7Riiv0KuBo0i6NXSRKYEywD9FQHdO1zM2UpZSHAXlJB5OEvqhte8rnoNh7HKM7ZVZKoGVmNyhArUDVvsZvBedEggO2GPWa71t0b9Wd1GUJbXWBAKHp8j1qr6FCPNJQoPegqOiHeazan90M_EE6CBzLh5Js8j3_zX-hdXPrPvB_kOOuhL7GxBz4NjSA0GwbDc4XoKzK-dRgJH7p_XOsOOcpXWCQzvoWM-vZzt3uqkBx6Ufb8mHnaug5RBfyCi94qMb-R52"
  },
  {
    "id": 2,
    "name": "Customer Feedback Analyzer",
    "description": "Analyzes customer feedback and identifies trends.",
    "compatible": "Survey Results, Support Tickets",
    "avatar": "https://lh3.googleusercontent.com/aida-public/AB6AXuCD2phqUzWJO9i-WQsmmB5cqNo55OXOa1jpVvpiTX-ebZlmIAb9dzL8rXZcVAPwZfIWFroKSVfzaEeIExsoz4IrYn7cb0hzTTJFClWAviNQDYQVFKwFRz8puqioHyEou4cm7DiA1NGm2lZ7sqXbykyWeV2RAe3V-wjNcUn6L0-dBCSIHrO2Rf8BnM2kZAjKysgGi9Ij8cyTqRB_XRuuEf6xo4B6BENJbPWXAz0VYvFvlKPKdGCDGZNCFEIAqUlTx4M5NqtzZ3tWXuhP"
  }
]
```

### 4.2 选择 Agent

为一个会话选择一个 Agent。

- **URL**: `/conversations/:conversationId/agent`
- **Method**: `POST`
- **Auth required**: Yes

**URL 参数**

- `conversationId` (number, required): 会话的唯一标识符。

**请求体**

```json
{
  "agentId": 2
}
```

**成功响应 (204 No Content)**

请求成功，但没有返回内容。

--- 