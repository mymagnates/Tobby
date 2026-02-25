# Web端手动测试执行单（从创建 Property 开始）

日期：2026-02-18  
适用环境：本地 Web（Quasar）

## 1. 测试前置
- 使用一个可登录账号进入系统（`/public/login`）。
- 确保账号有 Property Manager/Owner 权限（可访问创建类页面）。
- 准备 2 张图片文件（用于 Asset/Task/Transaction/Document 上传）。

## 2. 随机测试数据（本次统一使用）

### 2.1 Property
- Address: `4827 Maple Ridge Ave, Austin, TX 78704`
- Nickname: `AUS-MR-4827`
- Property Type: `Residential`
- Status: `Active`
- Spec Type: `Single Family`
- Stories: `2`
- Bedrooms: `4`
- Full Bathrooms: `3`
- Half Bathrooms: `1`
- Kitchens: `1`
- Meeting Rooms: `1`
- Offices: `1`
- Garage Spaces: `2`
- Size: `2480`
- Lot Size: `6200`
- HOA Name: `Maple Ridge HOA`
- HOA Contact: `support@mapleridge-hoa.test`

### 2.2 Asset
- Nickname: `Kitchen HVAC Vent`
- Type: `HVAC`
- Location: `Kitchen`
- Brand: `Carrier`
- Model: `CR-42A`
- Serial: `HVAC-8K2-9Q77`
- MFG Date: `2024-06-18`
- Acquired Date: `2025-01-10`
- Notes: `初次安装，噪音轻微`

### 2.3 Mx Record（Task）
- Description: `厨房通风口出现间歇性异响，夜间更明显`
- Report Date: `2026-02-18`
- Status: `open`

### 2.4 Transaction
- Type: `Rent`
- From: `Tenant`
- To: `Property Owner`
- Amount: `2850.50`
- Date: `2026-02-18`
- Note: `February rent paid via ACH`

### 2.5 Lease
- Status: `Available`
- Lease Term: `12`
- Lease Create Date: `2026-02-18`
- Rate Type: `month`
- Rate Amount: `2850`
- Deposit: `3000`
- Pet Fee: `350`
- Application Fee per Person: `45`
- Utilities Included: `Water, Trash, Sewer`
- Furnished: `Partially`
- Special Terms: `No smoking indoors`
- Additional Notes: `可接受 1 只中型宠物`

### 2.6 Tenant（后台创建）
- First/Middle/Last: `Ethan J Cole`
- Email: `ethan.cole.260218@testmail.dev`
- Phone: `(512) 398-7741`
- DOB: `1994-09-12`
- Gender: `Male`
- SSN: `372-61-9048`
- Marital: `Single`
- Current Address: `901 River St, Austin, TX 78702`
- Employer: `Delta Grid LLC`
- Position: `Electrical Engineer`
- Monthly Income: `9200`
- Emergency Contact: `Mia Cole / Sister / (512) 600-1107`
- Additional Occupant: `Nora Cole`（Spouse）
- Vehicle: `2022 Tesla Model 3 / TX7A92K`
- Pet: `Milo / Cat / 9lbs / 3 years`
- Notes: `Prefer email communication`

### 2.7 Tenant Sign Up（公开页）
- Email: `tenant.join.260218@testmail.dev`
- Password: `Tn#2026Pass9`
- Full Name: `Luna Hayes`
- Phone: `(737) 245-8890`

### 2.8 Lease Application（公开申请）
- Desired Move-in: `2026-03-15`
- Occupants: `2`
- Applicant: `Ava Marie Turner`（Female，DOB `1997-04-21`）
- Applicant Email/Phone: `ava.turner.260218@testmail.dev` / `(737) 990-1288`
- Current Address: `1208 Pine View Dr, Austin, TX 78745`
- Employment: `Blue Oak Design / Product Designer / Monthly Income 7800`
- Vehicle: `2021 Honda CR-V`
- Pet: `Dog / Shiba Inu / 28lbs / 2 years / Kiko`
- Co-applicant: `Noah Turner`
- Additional Notes: `希望 12 个月起租`

### 2.9 Reminder
- Category: `Maintenance`
- Start Date: `2026-02-20`
- Repeat By: `monthly`
- Amount: `120`
- Active: `true`
- Note: `每月HVAC滤网检查`

### 2.10 Documents（输入型操作）
- Search Query: `lease`
- Source Filter: `property`

## 3. 手动测试步骤（每个功能都有输入）

1. 登录  
访问 `/public/login`，输入 Email + Password 登录。  
预期：进入首页或 loading 跳转后进入主界面。

2. 创建 Property（起点）  
访问 `/create-property`，按 2.1 全量输入并提交。  
预期：提示创建成功；`/my-properties` 可看到新房源 `AUS-MR-4827`。

3. 编辑 Property  
进入 `/edit-property/:propertyId`，修改 `Nickname` 为 `AUS-MR-4827-V2`，`Size` 改为 `2520`，保存。  
预期：更新成功；列表和详情显示最新值。

4. 创建 Asset  
进入该房源的资产页（`/assets/:propertyId`）打开新增资产，按 2.2 输入并上传 1 张图片。  
预期：创建成功，资产卡片出现，图片可预览。

5. 创建 Mx Record（任务）  
访问 `/create-mxrecord/:propertyId`，按 2.3 输入并上传 1 张图片后提交。  
预期：创建成功；`/mx-records` 能看到新记录，状态 `open`。

6. 创建 Transaction  
访问 `/create-transaction/:propertyId`，按 2.4 输入并上传凭证图片后保存。  
预期：保存成功；`/transactions` 列表可检索到该金额和备注。

7. 创建 Lease  
访问 `/create-lease`，先选择该 property，再按 2.5 输入提交。  
预期：创建成功；`/leases` 出现对应租约记录。

8. 创建 Tenant（后台）  
访问 `/create-tenant`，按 2.6 输入（含附加住户、车辆、宠物、文档上传）并提交。  
预期：创建成功；`/tenants` 能看到该租客和关联 property。

9. Tenant Sign Up（公开链接）  
访问 `/public/tenant-signup/:propertyId`，在 Sign Up 页输入 2.7 数据提交。  
预期：注册成功并创建 tenant profile，跳转租客首页或提示成功。

10. Lease Application（公开申请）  
访问 `/apply/lease-application/:leaseId`，按 2.8 填写并添加 1 个 document 后提交。  
预期：提交成功；可跳转 `/public/application-detail/:applicationId` 查看明细。

11. 创建 Reminder  
访问 `/reminders`，点击 Create Reminder，输入 2.9 并保存。  
预期：提醒创建成功，列表展示 category/repeat/amount，状态为 Active。

12. Documents 输入操作（搜索+过滤）  
访问 `/documents`，输入 2.10 的查询和筛选条件并执行 Search。  
预期：列表按关键字和来源过滤；清空条件后恢复全部文档。

## 4. 缺陷记录模板（执行时填写）
- Case:  
- 输入数据:  
- 实际结果:  
- 预期结果:  
- 结论: Pass / Fail  
- 截图路径:

