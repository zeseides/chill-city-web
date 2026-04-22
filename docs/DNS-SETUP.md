# DNS / GitHub Pages 設定教學

把 `chill-city.twfivem.com` 指到你的 GitHub Pages。

---

## 前提

- 你有 `chill-city-web` 這個 GitHub repo，且已把專案 push 上去（分支 `main`）。
- `twfivem.com` 的 DNS 管理後台你有權限（或能請得到）。
- repo 根目錄有 `CNAME` 檔案，內容就是 `chill-city.twfivem.com`（本專案已附）。

---

## 步驟 1｜GitHub 開啟 Pages

1. 進入 repo：**Settings** → 左側 **Pages**
2. **Source**：選 `Deploy from a branch`
3. **Branch**：`main`、Folder `/ (root)` → **Save**
4. 等 1~2 分鐘，頁面會出現 `Your site is live at https://<你的帳號>.github.io/chill-city-web/`
5. 在 **Custom domain** 欄位輸入：`chill-city.twfivem.com` → **Save**
   - GitHub 會自動把 `CNAME` 檔案的內容更新成這個網域（若你已手動建好，會保留）
6. **Enforce HTTPS**：DNS 生效 + 憑證簽發完成後，這個勾勾會變可勾，**務必打勾**

---

## 步驟 2｜DNS 新增 CNAME 紀錄

到 `twfivem.com` 的 DNS 管理後台（Cloudflare / Route53 / Gandi / 中華電信…依實際而定），新增一筆 **CNAME** 紀錄：

| 欄位         | 值                          |
| ------------ | --------------------------- |
| Type         | `CNAME`                     |
| Name / Host  | `chill-city`                |
| Target / Value | `zeseides.github.io`      |
| TTL          | `3600`（或留預設 auto）      |
| Proxy (CF)   | ❌ **關掉 Cloudflare 橘色雲**，用灰色雲（DNS only）。否則 HTTPS 憑證會簽不出來。 |

> ⚠️ **CNAME 目標是 `zeseides.github.io`，不是 `zeseides.github.io/chill-city-web`**，沒有路徑。

> 若 twfivem.com 不是你管理的，把上表直接丟給對方、請他幫忙加一筆 CNAME 即可。

---

## 步驟 3｜等 DNS 生效 + 驗證

DNS 生效可能要 **10 分鐘 ~ 24 小時**，通常很快。

**檢查 DNS**：
```bash
nslookup chill-city.twfivem.com
```
正確結果會看到：
```
Non-authoritative answer:
chill-city.twfivem.com    canonical name = zeseides.github.io.
Addresses: 185.199.108.153
           185.199.109.153
           185.199.110.153
           185.199.111.153
```

**檢查網站**：瀏覽器打開 <https://chill-city.twfivem.com>，應該看到網站（可能要等憑證簽出，剛設定好前幾分鐘會顯示憑證警告是正常的）。

**回到 GitHub**：Settings → Pages 應顯示綠色勾勾與「Your site is published at https://chill-city.twfivem.com」，這時就可以勾 **Enforce HTTPS**。

---

## 常見問題

### Q: Pages 頁面顯示 `DNS_PROBE_FINISHED_NXDOMAIN` / `Domain's DNS record could not be retrieved`
A: DNS 還沒生效，或 CNAME 設錯目標。重看步驟 2，用 `nslookup` 再確認。

### Q: 顯示 `Both www.foo.com and foo.com are pointed to another apex domain`
A: 代表你只需要設定子網域（`chill-city`），不用加 www。本站用子網域不需要 A 記錄。

### Q: HTTPS 憑證沒簽出來，勾不了 Enforce HTTPS
A: 回到 Pages 設定，把 Custom domain 欄位清空 → Save → 再輸入一次 → Save。這會觸發 GitHub 重新驗證與簽證。

### Q: 用 Cloudflare，怎麼設？
A: 加一筆 `CNAME chill-city → zeseides.github.io`，**代理狀態切成「僅限 DNS」**（灰色雲）。GitHub Pages 自己會處理 TLS，你不需要 Cloudflare 的 Proxy。若你堅持要 Proxy，要改用 Cloudflare 的 Full SSL 模式，並確保邊緣憑證設定正確，但不建議。

### Q: 我有 `www.chill-city.twfivem.com` 也要導過去？
A: 本站只用 `chill-city.twfivem.com`，不需要 www 子網域。若將來要加，再設一筆 `CNAME www.chill-city → chill-city.twfivem.com` 並在 Pages 設定中新增 alias 即可。

### Q: 怎麼確認部署真的更新了？
A: push 完 30 秒內通常上線。repo 的 Actions 分頁會看到 "pages build and deployment"。Hard reload（`Ctrl+Shift+R`）避免瀏覽器快取。

---

## 官方文件

- [GitHub Pages · Custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [Lanyard · GitHub](https://github.com/Phineas/lanyard)
