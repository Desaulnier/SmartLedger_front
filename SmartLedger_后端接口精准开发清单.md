# SmartLedger 后端接口精准开发清单

> **文档说明**：本文档基于前端代码 `TODO [后端接口]` 注释及组件实际逻辑提取，确保与前端 100% 匹配。
> **统计结果**：共提取 **35** 个接口。
> **数据库策略**：**绝对不新建表**，仅在现有表（users, bills, category_rules）增加必要字段。

---

## 一、 用户认证与中心模块 (User & Auth)

| # | 接口路径 | 方法 | 优先级 | 对应前端文件 | 说明 |
|---|---|---|---|---|---|
| 1 | `/users/login` | POST | ⭐⭐⭐ | `Login.vue` | **用户登录**（返回 Token, UserInfo） |
| 2 | `/user/register` | POST | ⭐⭐⭐ | `Register.vue` | **用户注册** |
| 3 | `/user/send-code` | GET | ⭐⭐⭐ | `Register.vue` / `ForgotPassword.vue` | **发送邮箱验证码** |
| 4 | `/user/reset-password` | POST | ⭐⭐ | `ForgotPassword.vue` | 忘记密码重置 |
| 5 | `/api/user/profile` | GET | ⭐⭐ | `UserProfile.vue` | **获取个人中心信息** |
| 6 | `/api/user/profile` | PUT | ⭐ | `UserProfile.vue` | 修改个人信息（昵称/手机） |
| 7 | `/api/user/password` | PUT | ⭐ | `UserProfile.vue` | 修改密码 |

---

## 二、 账单与分类模块 (Bill & Category)

| # | 接口路径 | 方法 | 优先级 | 对应前端文件 | 说明 |
|---|---|---|---|---|---|
| 8 | `/api/bill` | POST | ⭐⭐⭐ | `AddBill.vue` | **新增账单**（手动记账） |
| 9 | `/api/bill/list` | GET | ⭐⭐⭐ | `History.vue` | **账单列表查询**（分页、搜索） |
| 10 | `/api/bill/{id}` | DELETE | ⭐⭐ | `History.vue` | 删除账单 |
| 11 | `/api/bill/import` | POST | ⭐⭐ | `AddBill.vue` | **账单导入**（解析 CSV/Excel） |
| 12 | `/api/category` | GET | ⭐⭐ | `AddBill.vue` | **获取分类列表**（36 个） |
| 13 | `/api/category` | POST | ⭐ | `AddBill.vue` | 新增自定义分类 |
| 14 | `/api/category/{id}` | DELETE | ⭐ | `AddBill.vue` | 删除自定义分类 |

---

## 三、 预算与预警模块 (Budget & Warning) ⭐ 核心

| # | 接口路径 | 方法 | 优先级 | 对应前端文件 | 说明 |
|---|---|---|---|---|---|
| 15 | `/api/budget/info` | GET | ⭐⭐⭐ | `BudgetSetting.vue` | **获取预算/生活费状态信息** |
| 16 | `/api/budget` | PUT | ⭐⭐⭐ | `BudgetSetting.vue` | **保存月度预算设置** |
| 17 | `/api/budget/allowance` | PUT | ⭐⭐⭐ | `BudgetSetting.vue` | **保存生活费/应急资金设置** |
| 18 | `/api/budget/status` | GET | ⭐⭐⭐ | `WarningCenter.vue` | **获取当前预算状态**（计算进度用） |
| 19 | `/api/budget/category` | GET | ⭐ | `BudgetSetting.vue` | 获取分类预算列表（可选功能） |
| 20 | `/api/budget/category` | POST | ⭐ | `BudgetSetting.vue` | 设置分类预算（可选功能） |
| 21 | `/api/warning/check` | POST | ⭐⭐⭐⭐⭐| `WarningCenter.vue` | **消费前预警检查（红黄绿灯判断）** |
| 22 | `/api/warning/records` | GET | ⭐⭐ | `WarningCenter.vue` | 获取预警记录列表 |
| 23 | `/api/warning/count` | GET | ⭐ | `UserLayout.vue` | **获取未读预警数量**（角标） |

---

## 四、 消费分析与排行模块 (Analysis & Rank)

| # | 接口路径 | 方法 | 优先级 | 对应前端文件 | 说明 |
|---|---|---|---|---|---|
| 24 | `/api/analysis/monthly` | GET | ⭐⭐⭐ | `AnalysisReport.vue` | **月度消费统计**（总收支、占比） |
| 25 | `/api/analysis/attribute` | GET | ⭐ | `AnalysisReport.vue` | 必需 vs 非必需对比数据 |
| 26 | `/api/analysis/trend` | GET | ⭐⭐ | `AnalysisReport.vue` | 每日消费趋势数据（折线图） |
| 27 | `/api/analysis/suggestions` | GET | ⭐ | `AnalysisReport.vue` | 智能消费建议文本 |
| 28 | `/api/analysis/anomaly` | GET | ⭐⭐ | `AnalysisReport.vue` | **孤立森林异常检测结果展示** |
| 29 | `/api/rank/my-grade` | GET | ⭐ | `ConsumptionRank.vue` | 获取我的评级/健康分 |
| 30 | `/api/rank/records` | GET | ⭐ | `ConsumptionRank.vue` | 获取排行榜数据 |

---

## 五、 管理员模块 (Admin)

| # | 接口路径 | 方法 | 优先级 | 对应前端文件 | 说明 |
|---|---|---|---|---|---|
| 31 | `/api/admin/stats` | GET | ⭐ | `Dashboard.vue` | **系统总览统计** |
| 32 | `/api/admin/trend` | GET | ⭐ | `Dashboard.vue` | 用户增长趋势 |
| 33 | `/api/admin/category-stats`| GET | ⭐ | `Dashboard.vue` | 分类消费统计 |
| 34 | `/api/admin/users` | GET | ⭐ | `UserManage.vue` | **用户列表**（分页） |
| 35 | `/api/admin/users/{id}/status`| PUT | ⭐ | `UserManage.vue` | 禁用/启用用户 |
| 36 | `/api/admin/users/{id}` | DELETE| ⭐ | `UserManage.vue` | 删除用户 |
| 37 | `/api/admin/bills` | GET | ⭐ | `BillManage.vue` | **全局账单列表** |
| 38 | `/api/admin/bills/{id}` | DELETE| ⭐ | `BillManage.vue` | 管理员删除账单 |

---

## 六、 数据库字段变更确认

**承诺：绝不新建任何数据表。仅对现有表执行 ALTER 语句补充字段。**

### 1. 用户表 (users)
```sql
ALTER TABLE `users` 
ADD COLUMN `weekly_budget` decimal(10,2) DEFAULT NULL COMMENT '周预算',
ADD COLUMN `emergency_fund` decimal(10,2) DEFAULT 0.00 COMMENT '应急资金';
```

### 2. 账单表 (bills)
```sql
ALTER TABLE `bills`
ADD COLUMN `bill_date` date NOT NULL COMMENT '账单日期',
ADD COLUMN `anomaly_score` decimal(5,2) DEFAULT NULL COMMENT '异常得分(0-1)',
ADD COLUMN `anomaly_type` varchar(50) DEFAULT NULL COMMENT '异常类型',
ADD COLUMN `anomaly_reason` varchar(500) DEFAULT NULL COMMENT '异常原因';
```

### 3. 分类规则表 (category_rules)
```sql
ALTER TABLE `category_rules`
ADD COLUMN `priority` int NOT NULL DEFAULT 1 COMMENT '优先级';
```
