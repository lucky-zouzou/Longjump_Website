# LOONG JUMP — 女包批发与 OEM 询盘网站

面向印尼精品店、经销商和企业 OEM 客户的销售型独立站。主流程为浏览产品 → 多款选型或 OEM 需求 → 提交询盘 → 销售跟进，不含线上交易。

## 页面结构

本地工厂与一件批发价首屏 → 工厂规模 / 服务门店 / 起批优势 → 批发 / OEM 两条采购入口 → 四个系列与 13 款已核实商品目录 → 搜索、分类与多款询价清单 → 批发合作 → OEM 定制 → 三步询盘流程 → 工厂与品牌信任资料 → 新款预告 → 常见问题 → 联系方式。新增 `/sales` 销售跟进后台、`/privasi` 隐私说明。

## 联系方式配置

`lib/site-content.ts` 的 `siteConfig` 分别保存销售公司与工厂主体。销售及对外收款对接由 PT Harvest Makmur Lestari 负责，工厂为 PT Cipta Bakti Abadi。已录入销售 WhatsApp、电话、业务邮箱、联系人 Yudha Yudhistira、服务时间、雅加达办公室地址，以及此前确认的工厂地址与资料。来源及公开范围见 [销售公司联系方式](docs/sales-company-contact.md)。

询盘会保存到网站 D1 数据库，成功后显示询盘编号。支持填写联系人、WhatsApp 或邮箱、城市、业务类型、公司、多款数量、目标时间，以及采购 / OEM 要求。OEM 必须填写项目说明，最低生产数量仍由销售确认。客户也可不选款直接请求推荐。失败时保留填写内容，相同请求重试不会重复建档。

销售人员通过 `/sales` 查看需求，记录新询盘、已联系、已报价、完成四种状态及内部备注。入口使用平台身份认证与服务端账号允许名单，普通访客无法读取或修改记录。生产配置 `SALES_ADMIN_EMAILS` 由 Sites 环境设置保存，当前仅允许网站拥有者；源码不含管理员邮箱或密钥。系统不会自动发送邮件、WhatsApp 或报价，需销售人员进入后台跟进。

成功页提供附带编号和需求摘要的 WhatsApp 链接，由客户自行选择是否发送。仅款式 ID 和数量可保存在访客本机；联系人等资料只在用户确认提交后保存到数据库，不写入浏览器本地存储。表单说明用途并要求同意。电话、邮箱及销售办公室地图保留直接入口；工厂资料单独展示。银行账户信息仍由销售在报价确认后提供。详细使用方法见 [销售型独立站功能与使用](docs/sales-inquiries.md)。

## 内容和素材

- 最新视觉突出印尼本地工厂与价格优势：象牙白 `#FFFEF9`、深墨绿 `#124734`、品牌绿 `#18543D`，辅以浅植物绿 `#EAF2DF`。首屏采用大字号标题、工厂门头和叠放式产品视频，辅以轻量入场与悬停反馈。适配减少动态偏好，不引入自动轮播或闪烁。当前配色见 [全站配色与可读性](docs/palette.md)，结构调整见 [本地工厂主题与氛围调整](docs/factory-atmosphere.md)。
- 布局参考 [Longchamp Malta](https://longchamp.mt/) 的居中双层导航、全幅品牌首屏和图像陈列；目前在既有结构上强化本地工厂表达、清晰的询盘入口与清晰的墨绿品牌色与明亮主体；文案、产品、品牌标识和询盘功能仍为 LOONG JUMP，不引入参考站的购物车或付款。
- 形象图、工艺参考图、品牌细节图来自用户提供的品牌战略 PDF；它们是品牌视觉参考，不作为实际工厂、现有产线或库存款证明。
- 商品图片、来源页面和核实信息见 `docs/product-sources.json`。只使用用户指定 `loongjump.id` 的商品，不混用 Brand Hub。
- 目录扩展到 13 款已核实商品，分为 Everyday Essentials、Texture & Pattern、The Mini Edit、Travel & Organize 四个编辑系列。新增来源见 `docs/catalog-expansion-sources.json`。其中 5 款有精确对应的原图，另外 8 款用文字目录和官方链接呈现，不放置假图或借用其他款式的照片。Shopee 当前部分页面受访问限制；这不是实时库存或全部变体 SKU 的自动同步。
- “Koleksi baru, sedang diproduksi.” 独立新款预告区依据用户本次要求添加，指向官方店铺关注动态，不编造款式图、生产进度或上市日期；预告不作为可选商品。
- 商品名称是简短展示描述；具体参数、颜色库存、交期和价格须销售确认。
- 用户最新确认在印尼拥有自己的工厂；文案已强调“自有工厂”。厂房、设备、员工和工序效果图是 AI 生成的概念展示，所有展示位置均带清晰说明，不冒充工厂实拍；不填入未提供的面积、地址、认证、人数或产能。
- 工厂主体为 PT Cipta Bakti Abadi，中文名为创恒信印尼有限责任公司。工厂位于 Jl Magelang Km 16, Surowangsan, RT 01 RW 17, Margorejo, Tempel, Sleman, Yogyakarta，面积 1,000 平方米，已服务印尼 300 多家箱包零售及批发门店。这些资料由用户直接提供。
- 用户原话“35年爱马仕技术团队”的任职背景与年限范围待澄清；当前对外仅表述“团队拥有35年箱包及皮具工艺经验”，不表述爱马仕任职、授权、认证、供货或合作关系，也不把团队经验写成公司成立年限。
- 当前工厂图库采用用户提供的 10 张 PT Cipta Bakti Abadi 投产效果图，按厂区形象、生产工序、团队仓储发货三组展示；图片保留完整横幅，支持放大及左右切换，OEM 区复用缝制场景。编排和来源见 [当前工厂图库](docs/factory-cba-gallery.md)。包内说明这些图片为 AI 投产概念，网站保留相应标记，不将图中看板数字和设备配置当作实际经营数据。
- 首版六张效果图已从当前页面替换，原图及提示词仍保留在 [历史素材说明](docs/factory-concepts.md)。
- “印尼本地工厂直发”“1 件批发价”“OEM 定制”来自用户明确要求。OEM 最低数量单独议定，不宣称 OEM 一件起订。
- 不把战略资料中的建议、竞品资料、内部市场分析或未落地计划写成已实现的公司资质。
- 销售公司与工厂为同一集团下的不同法人主体，已分开展示。最新文档中的起批、交付、售后及域名项目不在此次更新范围内；用户明确保留当前一件起批规则。当前私有预览设为 noindex。

## 多设备适配与交付

网站已适配大屏电脑、笔记本、平板横竖屏和手机横竖屏，同一地址会自动切换布局。电脑展示完整导航，1280px 及以上用 5 列完整展示已有图片的商品；中等窗口用 3 列，大屏询价窗口分为两栏；平板和手机使用适合触摸的菜单及弹窗。详见 [适配范围与验证记录](docs/responsive-layout.md)。

当前源码包应包含 `.openai/hosting.json`，构建配置会读取它。使用 `python3 scripts/package-source.py` 可以打包当前源码、图片、视频和设备预览。下载后请按下方说明运行；源码包不是可直接双击的静态网页。

### 本地运行

使用 Node.js 22.13+ 和 pnpm，先执行 `pnpm install`。

**平台预览模式**（OpenAI Sites 托管 / Cloudflare D1）：`pnpm dev`。首次使用数据库时执行 `pnpm build`，再执行 `pnpm exec wrangler d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_lame_loners.sql`，随后运行 `pnpm dev`。该迁移只应用一次；以后用 `pnpm db:generate` 生成追加迁移。本地后台测试可在不入库的 `.dev.vars` 设置 `SALES_ADMIN_EMAILS="seedy@sites.test"`，通过预览的登录入口使用本地模拟身份。

**自托管模式**（自有服务器，生产部署即此模式）：`pnpm build:server` 产出 `dist-node/`，然后：

```bash
export LOONGJUMP_ORIGIN=https://loongjump.com        # 本地 http 测试用 http://localhost:3000 + LOONGJUMP_ALLOW_HTTP=1
export LOONGJUMP_ADMIN_EMAIL=admin@loongjump.com
export SALES_ADMIN_EMAILS=admin@loongjump.com
export LOONGJUMP_ADMIN_PASSWORD_FILE=/path/to/password.txt   # 密码至少 12 字符，首次启动自动建账
export LOONGJUMP_DATA_DIR=./data                     # SQLite 数据库与迁移自动初始化
node server/index.mjs                                # 或 pnpm start:server
```

自托管运行时位于 `server/`：`index.mjs`（HTTP 服务、密码登录页 `/signin-with-chatgpt`、会话 Cookie、仅门禁 `/sales` 与 `/api/sales/*`）、`storage.mjs`（node:sqlite 封装为 D1 兼容 API + 幂等迁移）、`accounts.mjs`（scrypt 账号与登录限流）、`backup.mjs`（每日 SQLite 备份与保留策略）、`cli.mjs`（`account:add` / `backup` / `verify` / `restore` 管理命令）。登录成功后服务器注入 `oai-authenticated-*` 请求头，应用层 ChatGPT 认证代码原样复用。

类型检查 `pnpm exec tsc --noEmit`；目录和询盘摘要检查 `node scripts/check-inquiries.mjs`；本地完整采购与后台检查 `node scripts/check-sales-flow.mjs`；多设备检查 `node scripts/check-responsive.mjs`。浏览器检查需要 Playwright 和 Chrome，可用 `PLAYWRIGHT_MODULE_PATH` 指定已安装的模块。完整销售检查只允许 localhost，生成明确标记的本地测试记录，不发送任何消息。

浏览器支持可选 WebMCP 时，提供读取目录和打开询价窗口两个工具。工具不发送消息、不生成订单。当前环境没有运行支持 WebMCP 的交互验证，因此不把该可选能力计入已验证功能。

### 服务器部署（loongjump.com）

服务器布局：`/opt/loongjump-website/` 下 `compose.yaml`、`secrets/admin_password.txt`（600 权限）、`backups/`（每日自动备份）、`app/`（源码，Docker 内构建）。容器只绑 `127.0.0.1:3001`，由现有 Caddy（V17 项目的 caddy 容器）按域名反代到 `loongjump-web:3000`（容器加入 `loong-jump-v17_default` 网络）。上线/回滚：

```bash
cd /opt/loongjump-website && docker compose up -d --build   # 构建并启动
docker logs loongjump-web -f                                 # 日志
docker exec loongjump-web node server/cli.mjs backup         # 手动备份
docker compose down                                          # 下线（数据卷 website_data 保留）
```

更新部署：重新上传源码到 `app/` 后 `docker compose up -d --build`。修改销售后台密码：`echo '新密码' | docker exec -i loongjump-web node server/cli.mjs account:add --id website-admin --email admin@loongjump.com --name 'Sales Admin'`。`www.loongjump.com` 需在阿里云解析加 A 记录后再在 Caddyfile 添加跳转块。

**自动部署（GitHub Actions）**：push 到 `main` 分支自动触发 `.github/workflows/deploy.yml`——打包源码 → SSH 上传到服务器 → 重建镜像并重启容器 → 等待健康检查 → 公网验证。仓库需要配置三个 Secrets：`DEPLOY_SSH_KEY`（CI 专用私钥，公钥在服务器 `authorized_keys`）、`SERVER_HOST`（47.238.71.113）、`SERVER_USER`（root）。构建失败时旧容器继续运行、旧源码自动还原。
