# 网站询盘自动同步 Admin

此模块由网站 Node 服务运行。网页仍先保存询盘并返回原编号；Admin 暂时不可用不会丢失网站询盘。

## 配置

在网站服务器的私有环境配置中设置：

```text
LOONGJUMP_ADMIN_SYNC_URL=https://admin.loongjump.com/api/integrations/website-inquiries
LOONGJUMP_INQUIRY_SOURCE=loongjump-website
LOONGJUMP_INQUIRY_SYNC_SECRET=<两端一致的安全随机共享密钥，至少32字符>
```

Admin 先部署对应接收端，配置相同来源与密钥。密钥不要放进代码、URL、公开仓库或网站前端。生产 HTTPS 校验不可关闭；HTTP 仅允许显式打开本机联调模式。

上线前备份网站与 Admin 数据库。迁移 `0004_admin_inquiry_sync.sql` 新增投递队列及数据库触发器，并把已有询盘加入队列。未设置连接时不发送；设置不完整时 Node 服务拒绝启动，避免悄悄误投递。

## 运行规则

- 每 15 秒处理最多 20 条待投递记录，失败自动退避重试，最大间隔一小时。
- 原询盘编号保持不变，投递版本使用 outbox generation，包含自动分配与人工更新。原请求键重试不会产生新询盘。
- 每次首次发送前持久化该版本报文。回执丢失、断网、网站账号名称变化后重试仍使用同一报文，不形成“同版本不同内容”。
- 60 秒租约防止并发消费者重复处理；服务重启后可以恢复。
- 只有 Admin 返回匹配来源、原编号、版本及 lead ID 的 JSON 回执才标记送达。登录页和其他 HTTP 200 不算成功。禁止跟随重定向。
- 网站询盘更新不会覆盖 Admin 的人工归属、已核实资料和客户关联；实际销售业务在 Admin 跟进。
- 访客 IP 地区不作为收货国家。没有买家国家信息则留空，交业务核实。
- 网站产品 ID 与采购需求保留供参考，进入订单时仍由销售选择 Admin 已建档的 SKU 和核定报价。

## 查看结果

网站「询盘与客户」增加每条询盘的 Admin 投递状态。owner/manager 还可以看到已配置、待同步、已送达、自动重试计数。只读接口 `/api/ops/admin-sync` 提供队列摘要及最多 20 条待处理记录；不暴露共享密钥或远端响应正文。

Admin「印尼线下批发 → 网站询盘」由管理员对应两边销售账号。未匹配先进入待分配池；既有待分配线索逐条核对，后续新询盘按保存的对应关系自动分配。

当前范围是单向同步询盘与来源更新。网站独立沟通日志仍保存在网站；Admin 跟进、客户、订单、发货与回款保存在 Admin，不反向覆盖网站状态。若未来要求双向状态或完整沟通日志镜像，应另行定义冲突及事件归属规则。

Node 消费者是本次自动同步的运行前提。Cloudflare 构建可编译，但未配置 Cloudflare 定时消费者，不应仅部署 Cloudflare 前端就声称自动同步已上线。

## 检查

```text
node --test scripts/check-admin-sync.mjs
node --test scripts/check-operations.mjs
node scripts/check-admin-i18n.mjs
node scripts/check-inquiries.mjs
```

测试使用合成资料，覆盖签名、重试、幂等、队列触发、租约、错误回执、配置校验、历史回填和既有运营权限。两端上线后还需要通过一条明确标识的测试询盘核验真实环境。
