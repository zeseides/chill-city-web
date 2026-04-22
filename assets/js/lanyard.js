/* chill-city — Lanyard Discord 即時狀態
   - 抓兩位管理員的即時狀態 (REST 初始 + WebSocket 後續)
   - 若 404 (對方沒加入 Lanyard 官方伺服器) 顯示靜態 fallback
   - 參考：https://github.com/Phineas/lanyard
*/
(() => {
  'use strict';

  const STAFF_ROLE_LABEL = {
    '1010436668291026944': '服主',
    '952618771674173470':  '技術員',
  };

  const STATUS_LABEL = { online: '線上', idle: '閒置', dnd: '勿擾', offline: '離線' };
  const ACTIVITY_TYPE = {
    0: '正在玩',
    1: '直播中',
    2: '正在聽',
    3: '觀看中',
    5: '正在競賽',
  };

  const grid = document.getElementById('staffGrid');
  if (!grid) return;
  const cards = new Map();
  grid.querySelectorAll('.staff-card').forEach(card => {
    const uid = card.dataset.uid;
    if (uid) cards.set(uid, card);
  });
  const ids = Array.from(cards.keys());
  if (!ids.length) return;

  // ---- 渲染 ----
  function avatarUrl(user) {
    if (!user || !user.id) return null;
    if (user.avatar) {
      const ext = user.avatar.startsWith('a_') ? 'gif' : 'png';
      return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=256`;
    }
    // Default avatar
    const idx = user.discriminator && user.discriminator !== '0'
      ? Number(user.discriminator) % 5
      : Number(BigInt(user.id) >> 22n) % 6;
    return `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
  }

  function activityText(activities = []) {
    // type=4 是 custom status，拿 state；其餘拿 name
    const primary = activities.find(a => a.type !== 4) || activities.find(a => a.type === 4);
    if (!primary) return null;
    if (primary.type === 4) {
      return primary.state || primary.name || null;
    }
    const prefix = ACTIVITY_TYPE[primary.type] || '';
    return [prefix, primary.name].filter(Boolean).join(' ');
  }

  function render(uid, data) {
    const card = cards.get(uid);
    if (!card) return;
    const user = data.discord_user || {};
    const status = data.discord_status || 'offline';
    const displayName = user.global_name || user.display_name || user.username || '未知使用者';
    const avatar = avatarUrl(user);
    const act = activityText(data.activities || []);
    const role = STAFF_ROLE_LABEL[uid] || card.dataset.role || '';

    // 轉為連結
    const href = `https://discord.com/users/${uid}`;
    const html = `
      <div class="staff-avatar">
        ${avatar ? `<img src="${avatar}" alt="${escapeHtml(displayName)} 的 Discord 頭像" loading="lazy" referrerpolicy="no-referrer" />` : ''}
        <span class="staff-status-dot ${status}" title="${STATUS_LABEL[status] || status}"></span>
      </div>
      <div class="staff-body">
        <div class="staff-role">${escapeHtml(role)}</div>
        <div class="staff-name">${escapeHtml(displayName)}</div>
        <div class="staff-activity">
          ${act ? `<span class="activity-dot"></span><span>${escapeHtml(act)}</span>` : `<span>${STATUS_LABEL[status] || status}</span>`}
        </div>
      </div>
    `;
    swapToAnchor(card, href, html);
  }

  function renderFallback(uid) {
    const card = cards.get(uid);
    if (!card) return;
    const role = STAFF_ROLE_LABEL[uid] || card.dataset.role || '';
    const href = `https://discord.com/users/${uid}`;
    const html = `
      <div class="staff-avatar">
        <img src="https://cdn.discordapp.com/embed/avatars/${Number(BigInt(uid) >> 22n) % 6}.png" alt="" loading="lazy" referrerpolicy="no-referrer" />
        <span class="staff-status-dot offline" title="未知"></span>
      </div>
      <div class="staff-body">
        <div class="staff-role">${escapeHtml(role)}</div>
        <div class="staff-name">Discord 使用者</div>
        <div class="staff-activity"><span>點擊開啟 Discord 檔案</span></div>
      </div>
    `;
    swapToAnchor(card, href, html);
  }

  function swapToAnchor(card, href, html) {
    // 以 <a> 取代 <li>，保留 li 外層
    const existing = card.querySelector('a.staff-inner');
    if (existing) {
      existing.innerHTML = html;
      existing.href = href;
      return;
    }
    card.classList.remove('staff-loading');
    const anchor = document.createElement('a');
    anchor.href = href;
    anchor.target = '_blank';
    anchor.rel = 'noopener';
    anchor.className = 'staff-inner';
    anchor.style.cssText = 'display:contents; color:inherit; text-decoration:none;';
    anchor.innerHTML = html;
    card.innerHTML = '';
    card.appendChild(anchor);
    // 讓整張卡片可 hover
    card.classList.add('is-link');
    card.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      window.open(href, '_blank', 'noopener');
    });
  }

  function escapeHtml(s = '') {
    return String(s)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  // ---- 初始載入 (REST) ----
  const initialLoads = ids.map(async (uid) => {
    try {
      const r = await fetch(`https://api.lanyard.rest/v1/users/${uid}`, { cache: 'no-store' });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const json = await r.json();
      if (!json.success || !json.data) throw new Error('no data');
      render(uid, json.data);
      return true;
    } catch (err) {
      console.warn('[lanyard] initial fetch failed for', uid, err.message);
      renderFallback(uid);
      return false;
    }
  });

  // ---- WebSocket 訂閱即時更新 ----
  Promise.allSettled(initialLoads).then(() => {
    // 任何一個載入成功就連 WS；若全部失敗就算了（對方沒加 Lanyard）
    if (!window.WebSocket) return;
    let ws, heartbeat, reconnectTimer, closedByUs = false;
    const OPEN = () => {
      ws = new WebSocket('wss://api.lanyard.rest/socket?v=1&encoding=json');
      ws.addEventListener('message', (evt) => {
        let msg;
        try { msg = JSON.parse(evt.data); } catch { return; }
        // Opcode 1 = Hello (含 heartbeat_interval) → 收到後才送 subscribe + 起心跳
        if (msg.op === 1 && msg.d && msg.d.heartbeat_interval) {
          clearInterval(heartbeat);
          heartbeat = setInterval(() => {
            if (ws && ws.readyState === 1) ws.send(JSON.stringify({ op: 3 }));
          }, msg.d.heartbeat_interval);
          ws.send(JSON.stringify({ op: 2, d: { subscribe_to_ids: ids } }));
          return;
        }
        // Opcode 0 = Event
        if (msg.op === 0) {
          if (msg.t === 'INIT_STATE') {
            const bag = msg.d || {};
            for (const uid of ids) {
              if (bag[uid]) render(uid, bag[uid]);
            }
          } else if (msg.t === 'PRESENCE_UPDATE') {
            const d = msg.d;
            if (d && d.discord_user && d.discord_user.id) {
              render(d.discord_user.id, d);
            }
          }
        }
      });
      ws.addEventListener('close', () => {
        clearInterval(heartbeat);
        if (closedByUs) return;
        // 5 秒後重連
        clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(OPEN, 5000);
      });
      ws.addEventListener('error', () => {
        try { ws.close(); } catch {}
      });
    };
    OPEN();
    // 頁面隱藏時關閉，顯示時重開，節省連線
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        closedByUs = true;
        clearInterval(heartbeat);
        try { ws && ws.close(); } catch {}
      } else {
        closedByUs = false;
        if (!ws || ws.readyState === 3) OPEN();
      }
    });
  });
})();
