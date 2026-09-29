# 上线横幅、印尼语文案与搜索优化

## 已确认的宣传口径

用户确认：不提爱马仕，保留35年经验。这里表达的是团队经验，不是公司成立35年，不使用“百年企业”“40+年”或第三方品牌背书。

红底白字横幅：

- SITUS RESMI KINI HADIR：官网正式上线。
- Akhirnya, kami hadir!：我们终于来了！
- 35 tahun keahlian dalam pembuatan tas：35年箱包制作经验。
- Kualitas premium, harga bersahabat.：品质出众，价格亲民。
- Rayakan bersama kami：与我们一起庆贺（链接到产品）。

未加入折扣、限时倒计时等未经确认的促销承诺。

## 印尼语润色

- Cara Pengadaan → Cara Pesan：导航使用更贴近客户的“如何订购”。
- Tinggalkan Kebutuhan Pembelian → Ceritakan Kebutuhan Anda：从生硬的“留下采购需求”改为“聊聊您的需求”。
- Ajukan brief OEM → Ceritakan ide Anda：减少英文术语堆叠。
- official shop → toko resmi：统一为自然的印尼语“官方店铺”。
- 系列和分类改为 Pilihan Sehari-hari、Tekstur & Motif、Koleksi Mini、Tas Bahu、Tas Selempang、Ransel 等易懂词汇；保留产品专有名称。
- FAQ明确“保存选择”“帮我选择”等真实按钮操作，减少重复、官样表达。
- 首页、批发说明、OEM说明、订购流程、联系区域、统计同意提示均做语句润色。
- 保留事实边界：OEM最低起订量单独商议；视频为工艺参考；生成图片仍标注AI；未虚构价格、库存和客户评价。

这是对印尼语自然表达与网站语境的编辑审阅，不等同于已完成印尼母语编辑签审。

## 搜索意图与页面

这些是根据实际业务选择的目标词，不是来自付费工具的搜索量排名。

| 页面 | 核心搜索词 |
|---|---|
| 首页 | pabrik tas Yogyakarta、grosir tas、tas custom OEM |
| /layanan/grosir-tas | grosir tas mulai 1 pcs、supplier tas、tas untuk reseller |
| /layanan/tas-custom-oem | tas custom、tas dengan logo sendiri、OEM tas |
| /layanan/pabrik-tas-yogyakarta | pabrik tas Sleman、pabrik tas Yogyakarta |
| 产品详情 | 产品名称＋印尼语品类＋grosir |

实测发现现有框架客户端路由有预取初始化异常，部分链接点击无法跳转。此次涉及的公开页面改用标准HTML链接，避免依赖该客户端跳转。

首页增加真实可见的服务介绍入口；产品名称改为服务端HTML中存在的详情页链接，图片仍可打开快捷详情。各页面具有独立标题、描述、canonical、Open Graph和分享卡片。

首页输出企业、网站与产品列表JSON-LD；产品页输出真实产品信息及面包屑；新闻页输出文章与面包屑。未设置虚构价格、评分、评论、日期。没有价格等必要交易信息时，不承诺产品富媒体搜索结果。

sitemap采用正式域名，覆盖三个服务页、当前公开产品、公开新闻以及静态页。修复了空数据库使用内置产品时遗漏产品URL的问题。robots继续排除后台/API；后台仍有noindex。

## 核验与后续

运行 `node scripts/check-seo.mjs` 检查服务端HTML、标题、描述、canonical、JSON-LD、产品入口、sitemap、robots和缺失页面404。可用 `SEO_CHECK_ORIGIN=https://loongjump.com` 检查线上。

Google Search Console需要已验证的站点权限才能提交站点地图、请求编入索引、查看真实搜索词。此次代码优化不代表已经提交Search Console，也不能保证具体收录时间或排名。

参考Google官方文档：
- https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- https://developers.google.com/search/docs/crawling-indexing/special-tags
- https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data

Google不使用meta keywords作为排名因素；工作重点是可读的真实内容、标题、站内链接和可抓取性，避免堆砌关键词。
