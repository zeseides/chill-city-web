# chill-city-web

FiveM 伺服器 **chill-city** 的官方網站。純靜態 HTML/CSS/JS，部署於 GitHub Pages，透過自訂網域 [chill-city.twfivem.com](https://chill-city.twfivem.com/) 對外。

---

## ✨ 特色

- 暗色霓虹設計，行動裝置順暢
- 8 大分區：Hero、關於、核心玩法、車輛、服裝、新手福利、團隊、加入我們
- 團隊卡片整合 **Lanyard API**，即時顯示服主與技術員的 Discord 在線狀態
- 無 build step — 改完 HTML/CSS/JS 直接 push 即上線
- Lighthouse 四項皆可 ≥ 90 分

---

## 📂 專案結構

```
chill-city-web/
├── index.html                 # 單頁主體
├── CNAME                      # chill-city.twfivem.com
├── .nojekyll                  # 不跑 Jekyll
├── robots.txt / sitemap.xml   # SEO
├── favicon.ico
├── assets/
│   ├── css/style.css
│   ├── js/
│   │   ├── main.js            # 導覽、行動選單、滾動動畫
│   │   └── lanyard.js         # Discord 即時狀態
│   └── img/                   # 佔位圖，請替換成實際截圖
└── docs/
    └── DNS-SETUP.md           # DNS / Pages 設定教學
```

---

## 🚀 部署到 GitHub Pages

**一次性設定**

1. repo → Settings → Pages：
   - **Source**：Deploy from a branch
   - **Branch**：`main`，folder `/ (root)`
   - 點 Save
2. **Custom domain** 欄位填 `chill-city.twfivem.com` → Save
3. 勾 **Enforce HTTPS**（要等 DNS 生效後 GitHub 簽好憑證才能勾）

**DNS 設定**：請看 [docs/DNS-SETUP.md](docs/DNS-SETUP.md)

**日後更新**：push 到 `main` 即自動部署，約 30 秒生效。

---

## 🎨 改內容

### 文字內容
全部在 `index.html` 中以語意化 section 結構呈現，按 `id` 找即可：
- `#top` Hero、`#about` 關於、`#gameplay` 玩法、`#vehicles` 車輛、`#clothing` 服裝、`#newbie` 新手、`#team` 團隊、`#join` 加入

### 顏色 / 字體
統一寫在 `assets/css/style.css` 最上方 `:root` 的 CSS 變數，改一個地方就全站生效：
```css
--bg: #0f1115;
--accent: #6aa7ff;
--accent-2: #a96aff;
```

### 圖片
把實際截圖放到 `assets/img/vehicles/` 與 `assets/img/clothing/`，並把 HTML 裡 `<div class="img-placeholder">` 換成：
```html
<img src="assets/img/vehicles/01.jpg" alt="客製跑車" loading="lazy" />
```

**OG 預覽圖**（貼連結到 Discord 時顯示的大圖）：放一張 1200×630 的圖到 `assets/img/og-cover.jpg`。

---

## 👥 Lanyard 即時狀態（服主 / 技術員）

網頁的「團隊」區塊使用 [Lanyard](https://github.com/Phineas/lanyard) 抓 Discord 的即時狀態（頭像、暱稱、線上狀態、正在玩什麼）。

**要讓狀態顯示，服主 / 技術員兩位需要先加入 Lanyard 官方 Discord 伺服器一次**（之後可退，只要 Lanyard 曾觀察到即可）：

1. 打開 Lanyard 官方伺服器邀請：<https://discord.gg/lanyard>
2. 加入後幾秒鐘，回到網站重新整理，卡片就會顯示你的即時頭像、狀態與遊戲活動
3. 如果顯示為「Discord 使用者 / 點擊開啟 Discord 檔案」，代表 Lanyard 還沒觀察到，請確認步驟 1

**換人 / 加人？**
編輯 `index.html` 的 `#staffGrid` 與 `assets/js/lanyard.js` 頂部的 `STAFF_ROLE_LABEL` 即可，兩邊 Discord ID 要一致。

---

## 🧪 本地開發

不需要安裝任何東西。

**最簡單**：直接雙擊 `index.html` 在瀏覽器打開。

**建議**（避免某些相對路徑問題）：用 VS Code 裝 Live Server 擴充，或在資料夾裡跑：
```bash
# 有 Python
python -m http.server 8080

# 或 Node
npx serve .
```
然後開 <http://localhost:8080>。

---

## ✅ 驗收 Checklist

部署完成後逐項確認：

- [ ] `https://chill-city.twfivem.com` 開得起來且有綠色鎖頭
- [ ] 手機版導覽 hamburger 正常展開
- [ ] 滑到團隊區塊，兩張卡片有頭像與狀態圓點
- [ ] 在 Discord 把自己狀態切換（線上↔閒置），重新整理網頁狀態會跟著變
- [ ] 把網址貼到 Discord 頻道，預覽有標題、描述、圖片
- [ ] 分享偵錯：
  - <https://developers.facebook.com/tools/debug/>
  - <https://cards-dev.twitter.com/validator>

---

## 📜 授權 / 聯絡

© chill-city · 內容版權所有。若有技術問題，請到 Discord 找技術員。
