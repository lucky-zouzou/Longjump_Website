const $ = (selector) => document.querySelector(selector);
const e = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ],
  );
const date = (value) =>
  value
    ? new Intl.DateTimeFormat('zh-CN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value))
    : '—';
const roles = {
  owner: '所有者',
  manager: '外贸经理',
  editor: '内容运营',
  sales: '销售顾问',
  analyst: '数据分析',
};
const kinds = {
  product: '产品',
  news: '新闻',
  banner: '节日 Banner',
  image: '图片',
  video: '视频',
};
const statuses = {
  new: '待跟进',
  contacted: '已联系',
  quoted: '已报价',
  closed: '已完成',
};
const contentStates = {
  draft: '草稿',
  published: '已发布',
  archived: '已下架',
};
const labels = {
  unknown: '未获取',
  direct: '直接访问',
  desktop: '电脑',
  mobile: '手机',
  tablet: '平板',
  website: '网站表单',
  email: '邮件',
  whatsapp: 'WhatsApp',
  phone: '电话',
  exhibition: '展会',
  other: '其他',
  internal: '内部备注',
  ...statuses,
};
const state = {
  user: null,
  team: [],
  leads: [],
  content: [],
  tab: 'dashboard',
  days: 30,
  offset: 0,
  status: '',
  scope: '',
  q: '',
  kind: '',
  load: 0,
};
const manager = () => ['owner', 'manager'].includes(state.user?.role);
const allowed = (key) =>
  ({
    dashboard: ['owner', 'manager', 'analyst'],
    leads: ['owner', 'manager', 'sales'],
    content: ['owner', 'manager', 'editor'],
    team: ['owner', 'manager'],
    analytics: ['owner', 'manager', 'analyst'],
    search: ['owner', 'manager', 'analyst'],
    settings: ['owner', 'manager'],
    audit: ['owner', 'manager'],
  })[key]?.includes(state.user?.role);
const tabs = {
  dashboard: ['◫', '运营总览'],
  leads: ['↗', '询盘与客户'],
  content: ['▤', '内容与素材'],
  team: ['♧', '团队管理'],
  analytics: ['▥', '全球数据分析'],
  search: ['◎', '搜索表现'],
  settings: ['⚙', '客服与表单'],
  audit: ['≡', '操作记录'],
};
async function api(path, method = 'GET', body) {
  const response = await fetch(`/api/ops/${path}`, {
    method,
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401 || (response.status === 403 && !state.user))
      location.href = '/signin-with-chatgpt?return_to=%2Fmanage%2F';
    throw new Error(data.error || '操作失败，请重试');
  }
  return data;
}
function toast(message) {
  $('#toast').textContent = message;
  $('#toast').hidden = false;
  clearTimeout(state.toast);
  state.toast = setTimeout(() => ($('#toast').hidden = true), 5000);
}
const button = (label, action, id = '', primary = false) =>
  `<button class="btn ${primary ? 'primary' : ''}" data-action="${action}" data-id="${e(id)}">${label}</button>`;
const empty = (message) => `<div class="empty">${message}</div>`;
const tag = (label, style = '') =>
  `<span class="tag ${style}">${e(label)}</span>`;
const field = (label, name, value = '', type = 'text', required = false) =>
  `<label>${label}<input type="${type}" name="${name}" value="${e(value)}" ${required ? 'required' : ''} ${type === 'password' ? 'minlength="12" maxlength="256" autocomplete="new-password"' : ''}></label>`;
const textarea = (label, name, value = '', rows = 4) =>
  `<label>${label}<textarea name="${name}" rows="${rows}">${e(value)}</textarea></label>`;
const options = (values, selected) =>
  Object.entries(values)
    .map(
      ([v, l]) =>
        `<option value="${e(v)}" ${v === String(selected) ? 'selected' : ''}>${e(l)}</option>`,
    )
    .join('');
const select = (label, name, values, selected = '') =>
  `<label>${label}<select name="${name}">${options(values, selected)}</select></label>`;
const check = (label, name, value) =>
  `<label class="check"><input type="checkbox" name="${name}" ${value ? 'checked' : ''}>${label}</label>`;
const assignees = (content = false) =>
  Object.fromEntries([
    ['', content ? '未分配' : '公共池'],
    ...state.team
      .filter(
        (m) =>
          m.active &&
          (content
            ? ['owner', 'manager', 'editor']
            : ['owner', 'manager', 'sales']
          ).includes(m.role),
      )
      .map((m) => [m.id, m.name]),
  ]);
const person = (id) =>
  state.team.find((m) => m.id === id)?.name || (id ? '已停用成员' : '公共池');
const heading = (title, subtitle, actions = '') =>
  `<div class="heading"><div><p class="eyebrow">WORKSPACE / ${e(state.tab.toUpperCase())}</p><h1>${title}</h1><p class="subtitle">${subtitle}</p></div><div class="actions">${actions}</div></div>`;
const table = (headers, rows) =>
  rows.length
    ? `<div class="table-wrap"><table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td data-label="${e(headers[i])}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
    : empty('暂无记录。真实数据产生后会在这里显示。');
const period = () =>
  `<select id="period" aria-label="统计时间">${options({ 7: '最近 7 天', 30: '最近 30 天', 90: '最近 90 天', 180: '最近 180 天' }, state.days)}</select>`;
function modal(title, html) {
  $('#dialog-title').textContent = title;
  $('#dialog-body').innerHTML = html;
  $('#editor').showModal();
}
function form(action, html) {
  return `<form data-form="${action}">${html}<p class="form-error" role="alert"></p><div class="form-actions"><button type="button" class="btn" data-action="close">取消</button><button class="btn primary" type="submit">保存</button></div></form>`;
}
function bars(rows, key = 'views') {
  if (!rows.length) return empty('等待访客授权统计后的真实访问数据');
  const max = Math.max(...rows.map((r) => r[key]), 1),
    width = 600 / rows.length;
  return `<svg class="bars" viewBox="0 0 600 170" role="img" aria-label="每日访问趋势">${[40, 90, 140].map((y) => `<path d="M0 ${y}H600" stroke="#edf0e7"/>`).join('')}${rows.map((r, i) => `<rect x="${i * width + width * 0.18}" y="${150 - (r[key] / max) * 130}" width="${width * 0.64}" height="${(r[key] / max) * 130}" rx="2" fill="#718c58"><title>${e(r.day)}：${r[key]}</title></rect>`).join('')}</svg><div class="chart-labels"><span>${e(rows[0].day)}</span><span>最高 ${max}</span><span>${e(rows.at(-1).day)}</span></div>`;
}
function breakdown(title, rows) {
  const total = rows.reduce((s, r) => s + r.count, 0);
  return `<section class="panel"><h2>${title}</h2>${rows.length ? rows.map((r) => `<div class="list-row"><span>${e(labels[r.label] || r.label)}<svg class="barline" viewBox="0 0 180 5" aria-hidden="true"><rect width="180" height="5" fill="#f0f3e8"/><rect width="${Math.max(1, (180 * r.count) / total)}" height="5" fill="#879e68"/></svg></span><strong>${r.count}</strong></div>`).join('') : empty('暂无数据')}</section>`;
}
function assessment(d) {
  const checks = [
    [
      d.unassigned === 0,
      '公共池分配',
      d.unassigned
        ? `${d.unassigned} 条询盘尚未分配。请安排负责人或启用自动分配。`
        : '所有待处理询盘均有负责人。',
    ],
    [
      d.overdue === 0,
      '首次响应',
      d.overdue
        ? `${d.overdue} 条新询盘超过 24 小时未更新，建议优先跟进。`
        : '没有超过 24 小时仍未跟进的新询盘。',
    ],
    [
      d.sessions > 0,
      '访问统计',
      d.sessions
        ? `已记录 ${d.sessions} 个同意统计的访问会话。`
        : '尚无授权访问数据，请确认访客能够正常打开网站。',
    ],
    [
      d.bounceRate === null || d.bounceRate <= 70,
      '访问参与度',
      d.bounceRate === null
        ? '样本不足，暂不评分。'
        : `跳出率 ${d.bounceRate}%。单页且没有 10 秒参与事件的会话计为跳出。`,
    ],
    [
      !!d.content.find((c) => c.kind === 'news' && c.state === 'published'),
      '内容更新',
      d.content.find((c) => c.kind === 'news' && c.state === 'published')
        ? '已有发布新闻，建议持续更新工厂与产品动态。'
        : '尚未发布新闻，可添加工厂动态或采购指南。',
    ],
  ];
  return checks
    .map(
      ([ok, title, text], i) =>
        `<div class="suggestion"><i>${ok ? '✓' : i + 1}</i><div><b>${title}</b><p>${e(text)}</p></div></div>`,
    )
    .join('');
}
async function dashboard() {
  const d = await api(`analytics?days=${state.days}`);
  return (
    heading(
      '把生意进展，掌握在手。',
      `最近 ${state.days} 天 · ${date(d.updatedAt)} 更新`,
      period() + button('↻ 刷新', 'refresh'),
    ) +
    `<div class="cards">${[
      ['网站浏览', d.views, '授权采集的页面浏览量'],
      ['访问会话', d.sessions, '同一浏览器 30 分钟内计为一次'],
      ['收到询盘', d.inquiries, '网站及人工录入的询盘'],
      ['待分配询盘', d.unassigned, '全部未完成询盘中的公共池'],
    ]
      .map(
        ([l, n, h]) =>
          `<article class="metric"><span>${l}</span><strong>${n.toLocaleString()}</strong><small>${h}</small></article>`,
      )
      .join(
        '',
      )}</div><div class="grid"><section class="panel"><div class="panel-head"><h2>访问趋势</h2>${tag('真实访问 · UTC 日界')}</div>${bars(d.trend)}</section><section class="panel"><div class="panel-head"><h2>今日运营建议</h2>${tag('规则评估')}</div>${assessment(d)}</section></div><div class="grid equal">${breakdown('询盘状态', d.status)}${breakdown('访问来源', d.sources)}</div><section class="panel"><h2>网站内容</h2><div class="actions">${Object.entries(kinds).map(([kind,label])=>tag(`${label} · ${d.content.filter(c=>c.kind===kind&&c.state==='published').reduce((sum,c)=>sum+c.count,0)} 已设置发布`)).join('')}</div></section><p class="mobile-hint">手机浏览器菜单 → 添加到主屏幕，即可使用移动工作台。需要联网，不离线保存客户资料。<a href="/signout-with-chatgpt">退出登录 ↗</a></p>`
  );
}
async function leads() {
  const d = await api(
    `leads?status=${state.status}&scope=${state.scope}&offset=${state.offset}&q=${encodeURIComponent(state.q)}`,
  );
  state.leads = d.leads;
  return (
    heading(
      '每一次询盘，都有下一步。',
      '统一记录网站、WhatsApp、邮件、电话与展会线索。',
      button('＋ 录入询盘', 'new-lead', '', true),
    ) +
    `<section class="panel leads-panel"><form id="lead-filter" class="toolbar"><input name="q" value="${e(state.q)}" placeholder="搜索联系人、公司或询盘编号" aria-label="搜索询盘"><select name="status" aria-label="询盘状态">${options({ '': '全部状态', ...statuses }, state.status)}</select><select name="scope" aria-label="归属">${options(manager() ? { '': '全部询盘', mine: '我负责的', pool: '公共池' } : { '': '我负责的' }, state.scope)}</select><button class="btn">筛选</button>${button('↻', 'refresh')}</form>${table(
      [
        '客户 / 编号',
        '采购需求',
        '状态',
        '负责人',
        '来源 / 地区',
        '收到时间',
        '操作',
      ],
      d.leads.map((l) => [
        `<span class="title">${e(l.details.name)}</span><small>${e(l.details.company || l.id)}</small>`,
        `${e(l.topic)}<small>${l.details.items?.length || 0} 款产品</small>`,
        tag(statuses[l.status], l.status === 'new' ? 'warn' : ''),
        e(person(l.assignee)),
        `${e(labels[l.source] || l.source)}<small>${e(labels[l.country] || l.country)}</small>`,
        e(date(l.created_at)),
        button('查看 / 跟进', 'lead', l.id),
      ]),
    )}<div class="pagination"><span>共 ${d.total} 条 · 第 ${Math.floor(state.offset / 50) + 1} 页</span><div class="actions"><button class="btn" data-action="prev" ${!state.offset ? 'disabled' : ''}>上一页</button><button class="btn" data-action="next" ${!d.hasMore ? 'disabled' : ''}>下一页</button></div></div></section>`
  );
}
async function content() {
  const d = await api('content');
  state.content = d.content;
  const rows = d.content.filter((c) => !state.kind || c.kind === state.kind);
  return (
    heading(
      '内容常新，品牌常在。',
      '编辑产品、新闻与素材，定时展示节日活动。',
      button('＋ 新建内容', 'new-content', '', true),
    ) +
    `<section class="panel"><div class="toolbar"><select id="kind-filter" aria-label="内容分类">${options({ '': '全部内容', ...kinds }, state.kind)}</select><span class="subtitle">${rows.length} 条内容</span>${button('↻ 刷新', 'refresh')}</div>${table(
      ['标题', '分类', '状态', '负责人', '展示时间', '更新', '操作'],
      rows.map((c) => [
        `<span class="title">${e(c.title)}</span><small>${e(c.id)}</small>`,
        e(kinds[c.kind]),
        tag(
          contentStates[c.state],
          c.state === 'draft' ? 'warn' : c.state === 'archived' ? 'gray' : '',
        ),
        e(person(c.assignee)),
        `${c.starts_at ? e(date(c.starts_at)) : '立即'}<small>${c.ends_at ? e(date(c.ends_at)) : '持续展示'}</small>`,
        e(date(c.updated_at)),
        button('编辑', 'content', c.id),
      ]),
    )}</section>`
  );
}
async function team() {
  state.team = (await api('team')).members;
  return (
    heading(
      '各司其职，协同向前。',
      '权限在服务端生效；自动分配只轮转到启用接单的销售成员。',
      button('＋ 添加成员', 'new-member', '', true),
    ) +
    `<section class="panel">${table(
      ['成员', '角色', '账号', '自动接单', '操作'],
      state.team.map((m) => [
        `<span class="title">${e(m.name)}</span><small>${e(m.email)}</small>`,
        e(roles[m.role]),
        tag(m.active ? '启用' : '停用', m.active ? '' : 'gray'),
        m.receive_leads ? tag('参与轮流分配') : tag('不接单', 'gray'),
        button('管理', 'member', m.id),
      ]),
    )}</section><div class="notice">所有者管理全部功能；经理管理团队、分配与内容；销售仅查看自己的询盘；运营仅编辑分配给自己的内容；分析员查看汇总数据与搜索表现。停用账号会立即退出登录，其询盘回到公共池。</div>`
  );
}
async function analytics() {
  const d = await api(`analytics?days=${state.days}`);
  return (
    heading(
      '看见访客，也看见机会。',
      '仅统计同意分析的访客；未提供的地区显示“未获取”，不推测。',
      period() + button('↻ 刷新', 'refresh'),
    ) +
    `<div class="cards">${[
      ['浏览量', d.views],
      ['会话数', d.sessions],
      ['询盘', d.inquiries],
      ['跳出率', d.bounceRate === null ? '—' : `${d.bounceRate}%`],
    ]
      .map(
        ([l, v]) =>
          `<div class="metric"><span>${l}</span><strong>${v}</strong><small>最近 ${state.days} 天</small></div>`,
      )
      .join(
        '',
      )}</div><div class="grid equal"><section class="panel"><h2>访问趋势</h2>${bars(d.trend)}</section><section class="panel"><h2>询盘趋势</h2>${bars(d.leadTrend, 'count')}</section>${breakdown('访问国家 / 地区', d.countries)}${breakdown('访问来源', d.sources)}${breakdown('访问终端', d.devices)}${breakdown('浏览页面', d.pages)}${breakdown('询盘国家 / 地区', d.leadCountries)}${breakdown('询盘来源', d.leadSources)}${breakdown('询盘终端', d.leadDevices)}</div><section class="panel"><h2>最近访问明细（最多 50 条）</h2>${table(
      ['时间', '页面', '来源', '地区', '终端'],
      d.recentVisits.map((r) => [
        e(date(r.created_at)),
        e(r.path),
        e(labels[r.source] || r.source),
        e(labels[r.country] || r.country),
        e(labels[r.device] || r.device),
      ]),
    )}</section><p class="subtitle">跳出：单页且没有 10 秒参与事件的会话。访客可撤回统计同意；拒绝统计、浏览器拦截、机器人访问均可能造成统计低于服务器请求数。按 UTC 汇总，原始访问明细保留 180 天。</p>`
  );
}
async function search() {
  const { rows } = await api('search');
  const clicks = rows.reduce((s, r) => s + r.clicks, 0),
    impressions = rows.reduce((s, r) => s + r.impressions, 0),
    position = impressions
      ? rows.reduce((s, r) => s + r.position * r.impressions, 0) / impressions
      : null;
  return (
    heading(
      '搜索表现，有据可查。',
      '导入 Google Search Console / Bing 报表，保留来源和统计日期。',
      button('导入 CSV 报表', 'search-import', '', true),
    ) +
    `<div class="cards">${[
      ['报表点击', clicks],
      ['展示', impressions],
      [
        '点击率',
        impressions ? `${((100 * clicks) / impressions).toFixed(1)}%` : '—',
      ],
      ['平均排名', position ? position.toFixed(1) : '—'],
    ]
      .map(
        ([l, v]) =>
          `<div class="metric"><span>${l}</span><strong>${v}</strong><small>当前显示的最新 300 行报表汇总</small></div>`,
      )
      .join('')}</div><section class="panel">${table(
      ['日期', '搜索引擎', '关键词', '点击', '展示', '平均排名', '来源页面'],
      rows.map((r) => [
        e(r.day),
        e(r.engine),
        e(r.query),
        r.clicks,
        r.impressions,
        r.position.toFixed(1),
        e(r.page),
      ]),
    )}</section><div class="notice">排名来自导入的搜索引擎报表，不是实时抓取的搜索结果。相同引擎、日期、关键词、页面重复导入会更新原记录。尚未连接搜索引擎账号，不会展示推测排名。</div>`
  );
}
async function settingsPage() {
  const s = await api('settings');
  state.settings = s;
  return (
    heading(
      '让沟通，适合你的客户。',
      '前台文案建议使用印尼语或目标市场语言。',
    ) +
    `<section class="panel">${form('settings', `<div class="form-grid">${select('客服样式', 'chatStyle', { bubble: '悬浮气泡', panel: '侧边面板', minimal: '简洁按钮' }, s.chatStyle)}${field('客服标题', 'chatTitle', s.chatTitle, 'text', true)}${field('询盘标题', 'formTitle', s.formTitle, 'text', true)}${field('询盘引导语', 'formIntro', s.formIntro, 'text', true)}</div>${check('新询盘自动轮流分配', 'autoAssign', s.autoAssign)}${check('启用 AI 助手', 'aiEnabled', s.aiEnabled)}<div class="notice">AI 服务：${state.aiConfigured ? '服务器已配置接口密钥和模型' : '尚未配置。需要在服务器设置 OPENAI_API_KEY 和 LOONGJUMP_AI_MODEL'}。没有配置时前台仅提供人工联系方式。客户同意后才调用 AI，每日有调用上限，报价、库存和交期仍由人工确认。</div>${textarea('自定义询盘字段（每行：英文标识 | 显示名称 | required 或 optional，最多 6 个）', 'fields', s.extraFields.map((f) => `${f.id} | ${f.label} | ${f.required ? 'required' : 'optional'}`).join('\n'), 5)}`)}</section>`
  );
}
async function audit() {
  const { rows } = await api('audit');
  return (
    heading(
      '每一次变更，都有记录。',
      '最近 100 条团队、内容、询盘与配置操作。',
    ) +
    `<section class="panel">${table(
      ['时间', '操作人', '操作', '对象'],
      rows.map((r) => [
        e(date(r.created_at)),
        e(r.name || r.actor),
        e(r.action),
        e(r.target),
      ]),
    )}</section>`
  );
}
const renderers = {
  dashboard,
  leads,
  content,
  team,
  analytics,
  search,
  settings: settingsPage,
  audit,
};
async function render(quiet = false) {
  const seq = ++state.load;
  const tab = location.hash.slice(1);
  state.tab = allowed(tab) ? tab : Object.keys(tabs).find(allowed);
  $('#nav').innerHTML = Object.entries(tabs)
    .filter(([key]) => allowed(key))
    .map(
      ([key, [icon, title]]) =>
        `<a href="#${key}" ${key === state.tab ? 'aria-current="page"' : ''} class="${key === state.tab ? 'active' : ''}"><span>${icon}</span>${title}</a>`,
    )
    .join('');
  $('#breadcrumb').textContent = tabs[state.tab][1];
  if (!quiet) $('#main').innerHTML = empty('正在读取数据…');
  try {
    const html = await renderers[state.tab]();
    if (seq === state.load) $('#main').innerHTML = html;
  } catch (error) {
    if (seq === state.load) {
      if (quiet) toast(error.message);
      else
        $('#main').innerHTML = heading(
          '暂时无法加载',
          e(error.message),
          button('重试', 'refresh'),
        );
    }
  }
}
async function openLead(id) {
  const l = state.leads.find((l) => l.id === id);
  state.editing = l;
  const { notes } = await api(`notes?id=${encodeURIComponent(id)}`),
    d = l.details;
  const message = `Halo ${d.name}, kami dari LOONG JUMP menindaklanjuti permintaan ${l.id}.`;
  const href =
    d.contactType === 'Email'
      ? `mailto:${encodeURIComponent(d.contact)}?subject=${encodeURIComponent(`LOONG JUMP ${l.id}`)}&body=${encodeURIComponent(message)}`
      : `https://wa.me/${d.contact.replace(/\D/g, '').replace(/^0/, '62')}?text=${encodeURIComponent(message)}`;
  modal(
    '询盘详情与跟进',
    `<div class="detail"><strong>${e(d.name)} · ${e(d.company)}</strong>\n${e(d.contactType)}：${e(d.contact)}\n${e(d.city)} · ${e(l.country)}\n${e(l.id)}\n${e(d.note)}\n${e((d.items || []).map((i) => `${i.name || i.productId} × ${i.quantity}`).join('\n'))}\n${e(
      Object.entries(d.customFields || {})
        .map(([k, v]) => `${k}：${v}`)
        .join('\n'),
    )}</div><div class="actions"><a class="btn" href="${e(href)}" target="_blank" rel="noreferrer">打开 ${e(d.contactType)} 回复 ↗</a></div><p class="subtitle">打开回复草稿后，由你在邮件或 WhatsApp 中确认发送。</p>${form('lead', `<div class="form-grid">${select('跟进状态', 'status', statuses, l.status)}${manager() ? select('分配负责人', 'assignee', assignees(), l.assignee || '') : ''}</div>${textarea('内部摘要', 'note', l.sales_note)}`)}<hr><h3>沟通记录</h3>${notes.length ? notes.map((n) => `<div class="note"><small>${e(n.name || n.actor)} · ${e(labels[n.channel])} · ${e(date(n.created_at))}</small>${e(n.message)}</div>`).join('') : empty('暂无沟通记录')}<form data-form="note">${select('沟通渠道', 'channel', { internal: '内部备注', email: '邮件', whatsapp: 'WhatsApp', phone: '电话' })}${textarea('记录沟通内容（保存记录，不发送消息）', 'message')}<p class="form-error" role="alert"></p><button class="btn primary">保存沟通记录</button></form>`,
  );
}
function openContent(id) {
  const c = state.content.find((c) => c.id === id) || {
    kind: state.kind || 'product',
    state: 'draft',
  };
  state.editing = c;
  const local = (v) =>
    v
      ? new Date(
          new Date(v).getTime() - new Date(v).getTimezoneOffset() * 60000,
        )
          .toISOString()
          .slice(0, 16)
      : '';
  modal(
    c.id ? '编辑内容' : '新建内容',
    form(
      'content',
      `<div class="form-grid">${select('类型', 'kind', kinds, c.kind)}${select('发布状态', 'state', contentStates, c.state)}${field('标题 / 产品名', 'title', c.title || '', 'text', true)}${field('产品分类', 'category', c.category || '')}${manager() ? select('负责人', 'assignee', assignees(true), c.assignee || '') : ''}${field('链接（HTTPS 或本站路径）', 'link_url', c.link_url || '')}<div class="full">${textarea('正文 / 产品描述（纯文本）', 'body', c.body || '', 6)}</div><div class="full">${field('图片 / 视频地址', 'media_url', c.media_url || '')}${field('视频字幕地址（VTT，视频有旁白时请提供）', 'caption_url', c.caption_url || '')}<label>上传图片、MP4 或 VTT（最大 12 MB）<input type="file" id="media-upload" accept="image/jpeg,image/png,image/webp,video/mp4,.vtt"></label><p class="subtitle" id="upload-status"></p></div>${field('开始展示时间（本机时区，留空立即）', 'starts_at', local(c.starts_at), 'datetime-local')}${field('结束展示时间（留空持续）', 'ends_at', local(c.ends_at), 'datetime-local')}</div><div class="notice">草稿不会出现在网站。已发布的内容按时间范围展示；下架后保留记录。图片与视频上传后存储于服务器数据卷。</div>`,
    ),
  );
  if (c.id) $('#dialog-body [name=kind]').disabled = true;
}
function openMember(id) {
  const m = state.team.find((m) => m.id === id) || {
    active: true,
    role: 'sales',
    receive_leads: true,
  };
  state.editing = m;
  modal(
    m.id ? '管理团队成员' : '添加团队成员',
    form(
      'member',
      `<div class="form-grid">${field('姓名', 'name', m.name || '', 'text', true)}${field('登录邮箱', 'email', m.email || '', 'email', true)}${select('角色', 'role', manager() && state.user.role === 'owner' ? roles : { editor: '内容运营', sales: '销售顾问', analyst: '数据分析' }, m.role)}${field(m.id ? '新密码（留空不变）' : '初始密码（至少 12 位）', 'password', '', 'password', !m.id)}</div>${check('启用账号', 'active', m.active)}${check('参与询盘自动分配', 'receive_leads', m.receive_leads)}<div class="notice">更改成员信息会撤销其已有登录会话。请通过你自己的安全渠道提供初始密码。</div>`,
    ),
  );
}
function newLead() {
  modal(
    '录入外部渠道询盘',
    form(
      'new-lead',
      `<div class="form-grid">${field('联系人', 'name', '', 'text', true)}${field('公司 / 店铺', 'company')}${select('询盘来源', 'source', { email: '邮件', whatsapp: 'WhatsApp', phone: '电话', exhibition: '展会', other: '其他' })}${select('联系方式类型', 'contactType', { Email: '邮箱', WhatsApp: 'WhatsApp' })}${field('联系方式', 'contact', '', 'text', true)}${field('城市', 'city')}${field('国家 / 地区', 'country')}${select('需求类型', 'topic', { Grosir: '批发', 'OEM & Custom': 'OEM 定制' })}</div>${textarea('采购需求', 'note')}<p class="subtitle">仅录入客户已提供给你的商业联系资料。销售录入的询盘归本人，经理录入的询盘遵循自动分配设置。</p>`,
    ),
  );
}
function importSearch() {
  modal(
    '导入搜索表现报表',
    form(
      'search',
      `${select('搜索引擎', 'engine', { Google: 'Google Search Console', Bing: 'Bing Webmaster', Other: '其他报表' })}${field('统计日期（报表无日期列时使用）', 'day', new Date().toISOString().slice(0, 10), 'date', true)}<label>CSV 文件<input type="file" name="file" accept=".csv,text/csv" required></label><p class="notice">支持表头 query / Top queries / Query / 关键词、clicks / 点击、impressions / 展示、position / 排名；可选 day / date、page / url。每次最多 500 行。Google 的平均排名代表选定日期或区间的平均位置，不是固定排名。请先按单日导出或在上方标记报表日期。</p>`,
    ),
  );
}
function parseCsv(text) {
  const rows = [];
  let row = [],
    cell = '',
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else quoted = !quoted;
    } else if (c === ',' && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((c === '\n' || c === '\r') && !quoted) {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      if (row.some((v) => v.trim())) rows.push(row);
      row = [];
      cell = '';
    } else cell += c;
  }
  if (quoted) throw Error('CSV 引号不完整');
  row.push(cell);
  if (row.some((v) => v.trim())) rows.push(row);
  return rows;
}
document.addEventListener('click', async (event) => {
  const b = event.target.closest('[data-action]');
  if (!b) return;
  const action = b.dataset.action,
    id = b.dataset.id;
  try {
    if (action === 'refresh') await render();
    if (action === 'close') $('#editor').close();
    if (action === 'lead') await openLead(id);
    if (action === 'content' || action === 'new-content') openContent(id);
    if (action === 'member' || action === 'new-member') openMember(id);
    if (action === 'new-lead') newLead();
    if (action === 'search-import') importSearch();
    if (action === 'prev' || action === 'next') {
      state.offset = Math.max(0, state.offset + (action === 'next' ? 50 : -50));
      await render();
    }
  } catch (error) {
    toast(error.message);
  }
});
document.addEventListener('change', async (event) => {
  const t = event.target;
  if (t.id === 'period') {
    state.days = Number(t.value);
    void render();
  }
  if (t.id === 'kind-filter') {
    state.kind = t.value;
    void render();
  }
  if (t.id === 'media-upload' && t.files[0]) {
    const file = t.files[0];
    if (file.size > 12 * 1024 * 1024) {
      toast('文件不能超过 12 MB');
      return;
    }
    const form = t.closest('form'),
      save = form.querySelector('button[type=submit]');
    save.disabled = true;
    $('#upload-status').textContent = '正在上传…';
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const r = await api('upload', 'POST', { base64 });
      form.elements[
        file.name.toLowerCase().endsWith('.vtt') ? 'caption_url' : 'media_url'
      ].value = r.url;
      $('#upload-status').textContent = '上传成功，保存内容后生效。';
    } catch (error) {
      $('#upload-status').textContent = error.message;
    } finally {
      save.disabled = false;
    }
  }
});
document.addEventListener('submit', async (event) => {
  const f = event.target;
  if (f.id === 'lead-filter') {
    event.preventDefault();
    const d = new FormData(f);
    state.q = d.get('q');
    state.status = d.get('status');
    state.scope = d.get('scope');
    state.offset = 0;
    void render();
    return;
  }
  if (!f.dataset.form) return;
  event.preventDefault();
  const b = f.querySelector('button[type=submit],button:last-child'),
    d = Object.fromEntries(new FormData(f)),
    action = f.dataset.form;
  b.disabled = true;
  f.querySelector('.form-error').textContent = '';
  try {
    if (action === 'lead')
      await api('leads', 'PATCH', {
        ...d,
        id: state.editing.id,
        revision: state.editing.revision,
        assignee: manager() ? d.assignee || null : undefined,
      });
    if (action === 'new-lead') await api('leads', 'POST', d);
    if (action === 'note') {
      await api('notes', 'POST', { ...d, id: state.editing.id });
      await openLead(state.editing.id);
      toast('沟通记录已保存');
      return;
    }
    if (action === 'member')
      await api('team', 'POST', {
        ...d,
        id: state.editing.id,
        active: f.elements.active.checked,
        receive_leads: f.elements.receive_leads.checked,
      });
    if (action === 'content')
      await api('content', 'POST', {
        ...d,
        id: state.editing.id,
        kind: state.editing.id ? state.editing.kind : d.kind,
        revision: state.editing.revision,
        assignee: d.assignee || null,
        starts_at: d.starts_at ? new Date(d.starts_at).toISOString() : null,
        ends_at: d.ends_at ? new Date(d.ends_at).toISOString() : null,
      });
    if (action === 'settings') {
      const fields = d.fields.trim()
        ? d.fields
            .split('\n')
            .filter((s) => s.trim())
            .map((line) => {
              const parts = line.split('|').map((s) => s.trim());
              if (
                parts.length !== 3 ||
                !['required', 'optional'].includes(parts[2])
              )
                throw Error(
                  '请按“字段标识 | 显示名称 | required 或 optional”填写',
                );
              return {
                id: parts[0],
                label: parts[1],
                required: parts[2] === 'required',
              };
            })
        : [];
      await api('settings', 'PATCH', {
        ...d,
        revision: state.settings.revision,
        extraFields: fields,
        autoAssign: f.elements.autoAssign.checked,
        aiEnabled: f.elements.aiEnabled.checked,
      });
    }
    if (action === 'search') {
      const file = f.elements.file.files[0];
      if (!file || file.size > 100000) throw Error('CSV 必须小于 100 KB');
      const rows = parseCsv((await file.text()).replace(/^\uFEFF/, ''));
      const header = rows.shift().map((h) => h.trim().toLowerCase());
      const requiredHeaders = [
        [
          'query',
          'top queries',
          'keyword',
          '关键词',
          '熱門查詢項目',
          '热门查询',
        ],
        ['clicks', '点击', '点击次数'],
        ['impressions', '展示', '展示次数'],
        ['position', 'average position', '排名', '平均排名'],
      ];
      if (requiredHeaders.some((keys) => !header.some((h) => keys.includes(h))))
        throw Error('CSV 缺少关键词、点击、展示或排名列');
      const read = (row, keys) => {
        const i = header.findIndex((h) => keys.includes(h));
        return i < 0 ? '' : row[i]?.trim() || '';
      };
      await api('search', 'POST', {
        rows: rows.map((r) => ({
          engine: d.engine,
          day: read(r, ['day', 'date', '日期']) || d.day,
          query: read(r, [
            'query',
            'top queries',
            'keyword',
            '关键词',
            '熱門查詢項目',
            '热门查询',
          ]),
          page: read(r, ['page', 'url', '页面']),
          clicks: Number(read(r, ['clicks', '点击', '点击次数'])),
          impressions: Number(read(r, ['impressions', '展示', '展示次数'])),
          position: Number(
            read(r, ['position', 'average position', '排名', '平均排名']),
          ),
        })),
      });
    }
    $('#editor').close();
    toast('保存成功');
    await render();
  } catch (error) {
    f.querySelector('.form-error').textContent = error.message;
  } finally {
    b.disabled = false;
  }
});
$('#close-dialog').addEventListener('click', () => $('#editor').close());
window.addEventListener('hashchange', () => {
  state.offset = 0;
  void render();
});
let installPrompt;
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  installPrompt = event;
  $('#install').hidden = false;
});
$('#install').addEventListener('click', async () => {
  if (installPrompt) {
    await installPrompt.prompt();
    installPrompt = null;
    $('#install').hidden = true;
  }
});
async function boot() {
  try {
    const me = await api('me');
    state.user = me.user;
    state.aiConfigured = me.aiConfigured;
    state.team = (await api('team')).members;
    $('#identity').textContent =
      `${state.user.name} · ${roles[state.user.role]}`;
    await render();
    if ('serviceWorker' in navigator)
      navigator.serviceWorker
        .register('/manage/sw.js', { scope: '/manage/' })
        .catch(() => {});
  } catch (error) {
    $('#main').innerHTML = empty(e(error.message));
  }
}
void boot();
// Live dashboards refresh every 30 seconds; editing forms are never replaced.
setInterval(() => {
  if (
    !document.hidden &&
    !$('#editor').open &&
    ['dashboard', 'analytics'].includes(state.tab) &&
    state.user
  )
    void render(true);
}, 30000);
