# SmartLedger 后端接口开发指南

> **文档说明**：本文档面向后端开发人员（或你自己写后端时参考）。
> **当前状态**：前端页面已 100% 完成，所有交互均使用模拟数据。
> **开发目标**：实现双核心功能（自动记账、超前消费预警）及基础业务闭环。

---

## 一、 总体架构与开发策略

1.  **技术栈建议**：
    *   **后端框架**：Spring Boot 2.7.x / 3.x
    *   **持久层**：MyBatis-Plus 或 Spring Data JPA
    *   **数据库**：MySQL 8.0 (已设计好表结构)
    *   **安全认证**：Spring Security + JWT
    *   **工具库**：Lombok, Hutool (处理 Excel/CSV 导入)

2.  **开发优先级策略**：
    *   **P0 (核心路径)**：登录/注册 -> 获取分类 -> 记一笔 -> 消费前预警。*(必须先通)*
    *   **P1 (增强功能)**：账单列表查询 -> 预算设置 -> 消费分析报告。
    *   **P2 (辅助功能)**：导入账单 -> 管理员后台 -> 个人中心修改。

3.  **统一响应格式**：
    ```json
    {
      "code": 200,
      "msg": "操作成功",
      "data": { ... }
    }
    ```

---

## 二、 核心接口详细设计

### 2.1 认证模块 (Auth)

#### 1. 用户登录
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **请求体**:
  ```json
  {
    "email": "user@example.com",
    "password": "123456"
  }
  ```
- **响应**:
  ```json
  {
    "code": 200,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIs...",
      "userInfo": { "id": 1, "username": "张三", "role": "USER" }
    }
  }
  ```

### 2.2 账单与分类模块 (Bill & Category)

#### 2. 获取分类列表 (记账必用)
- **URL**: `/api/category/list`
- **Method**: `GET`
- **响应**:
  ```json
  {
    "code": 200,
    "data": [
      { "id": 1, "name": "食堂就餐", "type": "EXPENSE", "attribute": 1, "icon": "🍜" },
      { "id": 21, "name": "奶茶咖啡", "type": "EXPENSE", "attribute": 3, "icon": "🥤" }
    ]
  }
  ```
  *注：attribute: 1=必需，2=改善，3=欲望*

#### 3. 新增账单 (手动记账)
- **URL**: `/api/bill`
- **Method**: `POST`
- **请求体**:
  ```json
  {
    "amount": 15.00,
    "categoryId": 1,
    "billTime": "2023-10-25 12:00:00",
    "remark": "午餐",
    "type": "EXPENSE"
  }
  ```
- **逻辑**：保存账单后，需异步或同步更新 `users` 表中的 `current_spent` 字段，以便预警模块实时计算。

#### 4. 账单导入 (自动记账核心) ⭐
- **URL**: `/api/bill/import`
- **Method**: `POST` (Content-Type: `multipart/form-data`)
- **参数**: `file` (CSV 或 Excel 文件)
- **响应**:
  ```json
  {
    "code": 200,
    "data": {
      "total": 50,
      "success": 48,
      "fail": 2
    }
  }
  ```
- **后端实现逻辑**：
  1. 解析 CSV 每一行。
  2. 提取 `商户名称` 或 `摘要`。
  3. 查询 `category_rules` 表进行 **关键词模糊匹配** (`LIKE %keyword%`)。
  4. 匹配成功则自动填入 `category_id`，否则标记为“待分类”。
  5. 批量 Insert 到 `bills` 表。

### 2.3 预算与预警模块 (Budget & Warning) ⭐⭐⭐

#### 5. 获取预算信息
- **URL**: `/api/budget/info`
- **Method**: `GET`
- **响应**:
  ```json
  {
    "code": 200,
    "data": {
      "monthlyAllowance": 2000.00,
      "monthlyBudget": 1800.00,
      "currentSpent": 1250.00,
      "remainingDays": 10,
      "emergencyFund": 200.00
    }
  }
  ```

#### 6. 消费前预警检查 (核心算法接口) ⭐⭐⭐
- **URL**: `/api/warning/check`
- **Method**: `POST`
- **请求体**:
  ```json
  {
    "amount": 50.00,
    "categoryId": 21 // 奶茶咖啡 (欲望)
  }
  ```
- **响应**:
  ```json
  {
    "code": 200,
    "data": {
      "level": "yellow",          // green / yellow / red
      "title": "谨慎消费",
      "reason": "预算已使用 85%，建议减少非必要支出",
      "suggestion": "虽然金额不大，但属于欲望消费，建议三思。",
      "predictedOverrun": 150.00  // 预计月末超支金额
    }
  }
  ```
- **逻辑说明**：
  1. 计算 `usageRate = currentSpent / monthlyBudget`。
  2. 获取分类属性 `attribute` (1/2/3)。
  3. 规则判定：
     - `currentSpent + amount > monthlyBudget` -> **RED** (必超支)。
     - `usageRate > 0.8` 且 `attribute == 3` -> **YELLOW** (预警期乱花钱)。
     - 其他 -> **GREEN**。
  4. 线性预测：`预测超支 = (currentSpent / 已过天数) * 30 - monthlyBudget`。

### 2.4 消费分析模块 (Analysis)

#### 7. 获取月度统计数据
- **URL**: `/api/analysis/monthly?month=2023-10`
- **Method**: `GET`
- **响应**:
  ```json
  {
    "code": 200,
    "data": {
      "totalIncome": 2000,
      "totalExpense": 1250,
      "categoryStats": [
        { "categoryId": 1, "name": "食堂就餐", "amount": 600, "percent": 48 },
        { "categoryId": 21, "name": "奶茶咖啡", "amount": 200, "percent": 16 }
      ],
      "dailyTrend": [
        { "date": "2023-10-01", "amount": 50 },
        { "date": "2023-10-02", "amount": 30 }
      ]
    }
  }
  ```

#### 8. 获取异常消费检测 (孤立森林算法)
- **URL**: `/api/analysis/anomaly`
- **Method**: `GET`
- **响应**:
  ```json
  {
    "code": 200,
    "data": {
      "healthScore": 75,
      "anomalies": [
        {
          "billId": 10086,
          "amount": 648.00,
          "category": "游戏充值",
          "anomalyType": "金额异常",
          "score": 0.92,
          "reason": "远超历史平均消费水平"
        }
      ]
    }
  }
  ```

---

## 三、 数据库表变更提醒

为了支持上述接口，请确保你的数据库（MySQL）中执行了以下变更（基于之前的极简方案）：

1.  **`bills` 表增加字段**：
    *   `anomaly_score` (Decimal): 存储算法得分。
    *   `anomaly_type` (Varchar): 异常类型。
    *   `anomaly_reason` (Varchar): 异常原因。
2.  **`users` 表增加字段**：
    *   `weekly_budget` (Decimal): 周预算。
    *   `emergency_fund` (Decimal): 应急资金。

---

## 四、 算法实现小贴士 (Java)

### 4.1 关键词匹配自动记账
建议在 `CategoryRuleServiceImpl` 中实现：

```java
public Long matchCategory(String merchantName) {
    if (merchantName == null) return defaultCategoryId;
    // 按优先级查询规则
    List<CategoryRule> rules = ruleMapper.selectList(new QueryWrapper<CategoryRule>().orderByDesc("priority"));
    
    for (CategoryRule rule : rules) {
        if (merchantName.contains(rule.getKeyword())) {
            return rule.getCategoryId();
        }
    }
    return null; // 未匹配
}
```

### 4.2 孤立森林 (简单方案)
如果不想引入 Python 微服务，可以在 Java 中使用 **Smile** 库或 **Weka** 库，或者为了毕设演示，写一个**基于统计规则的模拟算法**：
*   **逻辑**：如果 `当前金额 > 平均值 + 2 * 标准差`，则判定为异常。这比完全随机数更有说服力，且实现成本极低。
