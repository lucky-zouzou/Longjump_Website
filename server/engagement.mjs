import { randomUUID } from 'node:crypto';
export function handleEngagement({
  db,
  path,
  method,
  data,
  user,
  url,
  clientKey,
  fail,
  str,
  choice,
  revision,
  limit,
  audit,
  transaction,
  json,
}) {
  const now = new Date().toISOString();
  const offset = Number(url.searchParams.get('offset') || 0);
  if (!Number.isSafeInteger(offset) || offset < 0 || offset > 1000000)
    fail(400, 'Invalid page');
  const publicPromos = () =>
    db
      .prepare(
        `SELECT p.id,p.title,p.cadence,p.price,p.regular_price,p.starts_at,p.ends_at,c.id product_id,c.title product_name,c.media_url image FROM ops_promotions p JOIN ops_content c ON c.id=p.product_id WHERE p.state='published' AND p.starts_at<=? AND p.ends_at>? AND c.kind='product' AND c.state='published' AND (c.starts_at IS NULL OR c.starts_at<=?) AND (c.ends_at IS NULL OR c.ends_at>?) ORDER BY p.starts_at LIMIT 1`,
      )
      .all(now, now, now, now);
  if (path === '/api/public/promotions' && method === 'GET')
    return json({ promotions: publicPromos(), serverTime: now });
  if (path === '/api/public/community' && method === 'GET') {
    const rows = db
      .prepare(
        "SELECT id,display_name,category,message,reply,created_at FROM ops_feedback WHERE state='approved' AND consent_public=1 ORDER BY created_at DESC,id DESC LIMIT 21 OFFSET ?",
      )
      .all(offset);
    return json({ feedback: rows.slice(0, 20), hasMore: rows.length > 20 });
  }
  if (path === '/api/public/community' && method === 'POST') {
    limit(db, `feedback:${clientKey}`, 5, 3600000);
    if (data.website) fail(400, 'Tidak dapat mengirim formulir.');
    if (data.consent !== true)
      fail(400, 'Mohon setujui penggunaan masukan Anda.');
    const name = str(data.displayName, 60, true),
      message = str(data.message, 2000, true),
      contact = str(data.contact || '', 200);
    if (message.length < 10) fail(400, 'Tuliskan masukan minimal 10 karakter.');
    const category = choice(data.category, ['produk', 'layanan', 'ide']);
    if (typeof data.publicConsent !== 'boolean')
      fail(400, 'Pilih izin publikasi.');
    const id = randomUUID();
    db.prepare(
      'INSERT INTO ops_feedback(id,display_name,contact,category,message,consent_public,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)',
    ).run(
      id,
      name,
      contact,
      category,
      message,
      data.publicConsent ? 1 : 0,
      now,
      now,
    );
    return json(
      {
        id,
        message: 'Terima kasih! Masukan Anda sudah diterima oleh tim kami.',
      },
      201,
    );
  }
  if (!['/api/ops/promotions', '/api/ops/community'].includes(path))
    return null;
  if (!user || !['owner', 'manager', 'editor'].includes(user.role))
    fail(403, '仅管理员、经理和内容运营可以管理此功能');
  if (path === '/api/ops/promotions') {
    if (method === 'GET')
      return json({
        promotions: db
          .prepare(
            'SELECT p.*,c.title product_name FROM ops_promotions p JOIN ops_content c ON c.id=p.product_id ORDER BY p.starts_at DESC LIMIT 51 OFFSET ?',
          )
          .all(offset),
        products: db
          .prepare(
            "SELECT id,title FROM ops_content WHERE kind='product' AND state='published' ORDER BY title",
          )
          .all(),
      });
    if (!['POST', 'PATCH'].includes(method)) fail(405, 'Method not allowed');
    const id = method === 'POST' ? randomUUID() : str(data.id, 80, true);
    const title = str(data.title, 120, true),
      productId = str(data.productId, 80, true),
      cadence = choice(data.cadence, ['daily', 'weekly']),
      state = choice(data.state, ['draft', 'published', 'archived']);
    if (
      !Number.isSafeInteger(data.price) ||
      data.price <= 0 ||
      data.price > 1000000000
    )
      fail(400, '特价必须是有效的正整数印尼盾金额');
    const regular = data.regularPrice === null ? null : data.regularPrice;
    if (
      regular !== null &&
      (!Number.isSafeInteger(regular) ||
        regular <= data.price ||
        regular > 1000000000)
    )
      fail(400, '原价必须高于特价，或留空');
    const start = new Date(str(data.startsAt, 40, true));
    if (!Number.isFinite(start.getTime())) fail(400, '开始时间无效');
    const starts = start.toISOString(),
      ends = new Date(
        start.getTime() + (cadence === 'daily' ? 1 : 7) * 86400000,
      ).toISOString();
    return transaction(db, () => {
      const product = db
        .prepare("SELECT * FROM ops_content WHERE id=? AND kind='product'")
        .get(productId);
      if (!product || (state === 'published' && product.state !== 'published'))
        fail(400, '请选择已发布的产品');
      if (state === 'published' && ends <= now)
        fail(400, '不能发布已过期的促销');
      if (
        state === 'published' &&
        db
          .prepare(
            "SELECT id FROM ops_promotions WHERE state='published' AND id<>? AND starts_at<? AND ends_at>? LIMIT 1",
          )
          .get(id, ends, starts)
      )
        fail(409, '这个时段已有促销。请调整日期，确保同时只展示一款特价产品。');
      if (method === 'POST')
        db.prepare(
          'INSERT INTO ops_promotions(id,product_id,cadence,title,price,regular_price,starts_at,ends_at,state,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
        ).run(
          id,
          productId,
          cadence,
          title,
          data.price,
          regular,
          starts,
          ends,
          state,
          now,
        );
      else if (
        !db
          .prepare(
            'UPDATE ops_promotions SET product_id=?,cadence=?,title=?,price=?,regular_price=?,starts_at=?,ends_at=?,state=?,updated_at=?,revision=revision+1 WHERE id=? AND revision=?',
          )
          .run(
            productId,
            cadence,
            title,
            data.price,
            regular,
            starts,
            ends,
            state,
            now,
            id,
            revision(data.revision),
          ).changes
      )
        fail(409, '内容已更新，请刷新后重试');
      audit(db, user, 'promotion.save', id);
      return json({ id });
    });
  }
  if (method === 'GET') {
    const state = url.searchParams.get('state') || 'pending';
    choice(state, ['pending', 'approved', 'rejected']);
    const rows = db
      .prepare(
        'SELECT * FROM ops_feedback WHERE state=? ORDER BY created_at DESC,id DESC LIMIT 51 OFFSET ?',
      )
      .all(state, offset);
    return json({ feedback: rows.slice(0, 50), hasMore: rows.length > 50 });
  }
  if (method !== 'PATCH') fail(405, 'Method not allowed');
  const id = str(data.id, 80, true),
    state = choice(data.state, ['pending', 'approved', 'rejected']),
    reply = str(data.reply || '', 2000);
  return transaction(db, () => {
    const row = db.prepare('SELECT * FROM ops_feedback WHERE id=?').get(id);
    if (!row) fail(404, '反馈不存在');
    if (state === 'approved' && !row.consent_public)
      fail(400, '客户未同意公开，不能发布');
    if (
      !db
        .prepare(
          'UPDATE ops_feedback SET state=?,reply=?,updated_at=?,revision=revision+1 WHERE id=? AND revision=?',
        )
        .run(state, reply, now, id, revision(data.revision)).changes
    )
      fail(409, '反馈已更新，请刷新后重试');
    audit(db, user, 'feedback.' + state, id);
    return json({ id });
  });
}
