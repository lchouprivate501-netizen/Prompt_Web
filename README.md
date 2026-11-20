# Prompt Studio｜指令工坊

> 將零散的需求整理成具備目標、脈絡、執行步驟、限制與驗收標準的結構化 AI 指令。

Prompt Studio 是一個純前端、免建置的提示詞編輯器。使用者透過表單描述任務，應用程式會即時組合成 Markdown 格式的專業指令，並提供複製與下載功能。

- **線上版本**：<https://lchouprivate501-netizen.github.io/Prompt_Web/>
- **原始碼**：<https://github.com/lchouprivate501-netizen/Prompt_Web>

---

## 1. 專案資訊

| 項目 | 說明 |
|---|---|
| 專案名稱 | Prompt Studio — 指令工坊 |
| 專案類型 | Static Web Application |
| 前端技術 | HTML5、CSS3、Vanilla JavaScript |
| 執行環境 | 現代桌面與行動瀏覽器 |
| 建置工具 | 不需要 |
| 後端服務 | 不需要 |
| API Key | 不需要 |
| 資料保存 | 瀏覽器 `localStorage` |
| 介面語言 | 繁體中文、英文 |
| 部署方式 | GitHub Pages（GitHub Actions 自動部署） |
| 授權 | 尚未指定；請勿自行假設本專案採用特定開源授權 |

本專案不依賴 React、Vue、Angular、Node.js、npm 或任何第三方執行期套件。網站的 HTML、CSS 與 JavaScript 全部集中於 `index.html`，可直接由瀏覽器載入。

## 2. 功能總覽

### 2.1 需求輸入模組

表單將使用者的任務拆分為以下九個區塊：

1. **核心目標（Objective）**：描述預期成果，是生成指令的唯一必要欄位。
2. **角色與專業視角（Role）**：指定 AI 應採取的專業立場。
3. **背景與脈絡（Context）**：補充現況、對象、資源及已知資訊。
4. **執行流程（Execution Plan）**：將工作拆成有順序的步驟。
5. **參考資料與範例（References）**：提供參考網址、既有資料或風格範例。
6. **規則與限制（Constraints）**：定義預算、時程、技術條件及不可違反的界線。
7. **輸出規格（Output Specification）**：選擇輸出格式、內容深度、語氣及輸出語言。
8. **完成與驗收標準（Success Criteria）**：定義可檢查的成果條件。
9. **工作原則（Operating Rules）**：四個 Checkbox，控制資訊不足時的處理、不虛構事實、邏輯檢查與交付前自我檢查。預設全部勾選。

### 2.2 快速範本

內建五種常見任務範本，以及空白表單：

| 範本 ID | 使用情境 |
|---|---|
| `research` | 研究、資料蒐集、證據與策略分析 |
| `writing` | 文章、內容企劃與文字編輯 |
| `build` | 網站、介面與產品開發 |
| `learn` | 學習路徑、課程與能力培養 |
| `data` | 資料整理、品質檢查與分析 |
| `blank` | 清空表單並從頭建立需求 |

- 範本會將預先定義的欄位填入表單，之後仍可由使用者修改。
- 範本未指定的欄位**不會**自動清除既有值；若要完全重新開始，請使用「清空內容」或「從空白開始」。
- 範本內容目前只有繁體中文版本；切換為英文介面時，載入的範本文字仍為中文。
- 預覽面板的「載入示範」會先載入 `build` 範本，再以一組「個人作品集網站」的示範需求覆寫目標、背景、流程、限制與驗收標準。

### 2.3 指令產生與匯出

- 監聽表單的 `input` 與 `change` 事件，即時更新指令預覽。
- 依使用者輸入組成 Markdown 標題及段落。
- 顯示需求完整度、已填寫的核心欄位數與生成文字字元數。
- 使用 Clipboard API 複製完整指令；失敗時改用暫存 `textarea` 搭配 `document.execCommand('copy')`，兩者皆失敗時提示使用者手動選取文字。
- 以 `.md` 檔案下載生成結果，檔名固定為 `structured-prompt.md`。
- 核心目標未填寫時，複製與下載按鈕不會輸出內容，而是顯示提示並將焦點移到核心目標欄位。
- 使用 `textContent` 顯示生成內容，避免將使用者輸入直接解讀為 HTML。

### 2.4 語言處理

- 介面語言依 `navigator.language` 初始判斷：瀏覽器語言以 `zh` 開頭時使用繁體中文，其他情況預設英文。
- 使用者可以在頁首手動切換繁體中文與英文介面；此選擇不會被保存，重新整理後會再次依瀏覽器語言判斷。
- 輸出語言欄位支援「跟隨使用者語言」、繁體中文、英文及日文。
- 介面語言和輸出語言是兩個獨立設定：
  - **介面語言**決定畫面文字，以及生成指令的區塊標題、格式與深度描述、工作原則和最後指示的語言。
  - **輸出語言**會寫入指令中，用來要求 AI 以該語言產出成果。

### 2.5 響應式版面

| 視窗寬度 | 版面 |
|---|---|
| > 980px（筆電、桌機、橫向平板） | 雙欄：左側表單、右側預覽；預覽面板以 `position: sticky` 固定於畫面 |
| 621–980px（直立平板） | 單欄：預覽面板移至表單下方；欄位仍可兩兩並排 |
| ≤ 620px（手機） | 單欄，所有欄位與 Checkbox 改為單行排列，並放大說明文字與按鈕 |

在 980px 以下或觸控裝置（`hover: none` 且 `pointer: coarse`）上，輸入框、文字區與下拉選單字體為 16px，以避免 iOS Safari 在聚焦時自動放大畫面。

## 3. 專案結構

```text
Prompt_Web/
├── .github/
│   └── workflows/
│       └── pages.yml   # 推送至 main 時自動部署到 GitHub Pages
├── .nojekyll           # 讓 GitHub Pages 直接提供檔案，不經 Jekyll 處理
├── index.html          # 網站入口：版面樣式、表單及前端互動邏輯
└── README.md           # 專案說明與開發文件
```

`index.html` 採單檔架構：

- **HTML**：定義頁首、需求表單、範本按鈕、預覽面板及通知訊息（toast）。
- **CSS**：使用 CSS Custom Properties 管理色彩、陰影與圓角；透過 Media Queries 處理桌面、平板及手機版面（見 2.5）。
- **JavaScript**：使用 IIFE 封裝程式作用域，負責表單讀取、語言切換、範本載入、指令組裝、草稿保存及匯出。

如未來功能持續增加，可考慮將 CSS 與 JavaScript 拆成獨立檔案，並依模組職責分層；目前不需要額外建置流程。

## 4. 本機執行

### 方法 A：直接開啟

1. 複製本專案：

   ```bash
   git clone https://github.com/lchouprivate501-netizen/Prompt_Web.git
   ```

2. 使用現代瀏覽器開啟 `index.html`。
3. 開始填寫需求，預覽會即時更新（桌面版在右側，平板與手機在表單下方）。

### 方法 B：使用本機 HTTP Server

若要測試瀏覽器剪貼簿權限或模擬網站部署環境，可以在專案根目錄啟動簡易伺服器：

```bash
python3 -m http.server 8000
```

接著瀏覽 <http://localhost:8000>。

不需要執行 `npm install`、編譯 CSS 或打包 JavaScript。

## 5. 核心實作說明

### 5.1 表單欄位定義

JavaScript 的 `fields` 陣列集中管理表單欄位 ID：

```js
const fields = [
  'goal', 'role', 'context', 'steps', 'examples', 'constraints',
  'format', 'depth', 'tone', 'outputLang', 'criteria',
  'askMissing', 'noGuess', 'checkLogic', 'selfReview'
];
```

新增欄位時，需同步確認：

1. HTML 元素具有唯一且正確的 `id`。
2. 欄位 ID 已加入 `fields`（草稿保存與還原都依賴此陣列）。
3. `buildPrompt()` 已處理該欄位的輸出規則。
4. 若欄位有介面文字，需加入 `translations.zh` 與 `translations.en`，並在 HTML 加上 `data-i18n`（或 `data-i18n-placeholder`）。
5. 若欄位屬於範本內容，需評估是否更新 `presetData`。
6. 若欄位應計入完整度，需更新 `updatePreview()` 的欄位清單與 `progress` 文案中的分母。

Checkbox 透過 `checked` 讀取布林值，其餘欄位透過 `value` 讀取並移除前後空白。

### 5.2 指令組裝流程

主要入口為 `buildPrompt()`：

1. 讀取 `fields` 定義的欄位。
2. 檢查必要欄位 `goal` 是否有內容；未填寫時回傳空字串。
3. 依介面語言選取區塊標題與說明文字。
4. 將有內容的文字欄位加入對應區塊；空白的選填區塊會略過。
5. 將輸出格式、內容深度與指定語言轉換為文字規格（項目標籤固定為英文 `Format`、`Detail`、`Language`、`Tone and style`，內容則依介面語言）。
6. 依四個 Checkbox 狀態建立工作原則；全部取消時省略此區塊。
7. 加入最後指示，並回傳完整 Markdown 文字。

生成區塊的順序如下（「核心目標」、「輸出規格」與「最後指示」一定會出現，其餘依內容決定）：

```text
角色與專業視角
核心目標
背景與脈絡
執行流程
參考資料與範例
規則與限制
輸出規格
完成與驗收標準
工作原則
最後指示
```

### 5.3 即時預覽與完整度

`updatePreview()` 負責呼叫 `buildPrompt()`、更新預覽、進度條、已完成欄位數及字元數，並觸發草稿保存。

完整度以七個文字欄位計算，每個欄位權重相同：

- `goal`
- `role`
- `context`
- `steps`
- `examples`
- `constraints`
- `criteria`

輸出格式、內容深度、語氣、輸出語言及工作原則不列入完整度分數。完整度是填寫進度提示，不代表 AI 指令品質的客觀評分。

### 5.4 草稿保存

草稿使用以下儲存鍵：

```js
const storageKey = 'prompt-studio-v1';
```

保存方式：

- 每次 `updatePreview()` 執行時（表單變更、載入範本、切換介面語言），將 `fields` 的欄位值序列化成 JSON。
- 使用 `localStorage.setItem()` 寫入目前網站來源的瀏覽器儲存空間。
- 網頁載入時透過 `restoreDraft()` 讀取並還原欄位。
- 「清空內容」與「從空白開始」會透過 `localStorage.removeItem()` 刪除草稿。
- 若瀏覽器停用或限制 `localStorage`，程式會忽略儲存錯誤，網站仍可繼續使用，但無法保存草稿。

**隱私與資料注意事項：** 目前沒有後端 API，也沒有將表單內容傳送至伺服器的程式。草稿保存在使用者目前瀏覽器、目前網站來源的本機儲存空間，未經加密。請勿在共用裝置輸入密碼、存取權杖或其他機密資訊。清除瀏覽器網站資料也會移除草稿。

### 5.5 下載與複製

- 複製：優先呼叫 `navigator.clipboard.writeText()`；失敗時使用暫存 `textarea` 搭配 `document.execCommand('copy')`，並依其回傳值顯示成功或失敗訊息。
- 下載：使用 `Blob` 建立 `text/markdown` 檔案，透過 `URL.createObjectURL()` 產生下載連結。
- Clipboard API 在部分瀏覽器中要求 HTTPS 或 localhost 等安全情境；若複製功能受限，請改用本機 HTTP Server 或手動選取預覽文字。

## 6. GitHub Pages 部署

本專案透過 GitHub Actions 部署，工作流程定義於 `.github/workflows/pages.yml`。

### 6.1 觸發條件

- 推送到 `main` 分支時自動部署。
- 也可在 **Actions → Deploy to GitHub Pages → Run workflow** 手動執行。

工作流程只會將 `index.html` 與 `.nojekyll` 複製到發佈目錄，`README.md` 與 `.github/` 不會被發佈。

### 6.2 首次設定（Repository 管理者）

1. 進入 **Settings → Pages**，在 **Build and deployment → Source** 選擇 **GitHub Actions**。
2. 進入 **Settings → Environments → github-pages**，確認 **Deployment branches and tags** 允許 `main` 分支部署。
3. 建議將 Repository 的預設分支設為 `main`（**Settings → General → Default branch**）。

部署完成後的網址為：

```text
https://lchouprivate501-netizen.github.io/Prompt_Web/
```

實際網址以 **Settings → Pages** 頁面顯示為準。若日後改用自訂網域，請依 GitHub Pages 的網域設定流程操作。

### 6.3 開發流程

1. 從 `main` 建立功能分支並修改。
2. 本機依第 8 節檢查清單驗證。
3. 開啟 Pull Request 合併至 `main`，合併後自動部署。

## 7. 維護與擴充建議

### 新增一種任務範本

1. 在 `presetData` 加入新的唯一 key。
2. 定義需要預填的欄位，欄位名稱必須與 HTML ID 一致。
3. 在範本區新增 `data-preset="<key>"` 的按鈕。
4. 為按鈕補上繁中及英文的 `data-i18n` 文案。
5. 測試載入、修改、清空及草稿還原行為。

### 新增一種輸出格式

1. 在 HTML 的 `#format` 選單新增 option，並加上 `data-i18n`。
2. 在 `translations.zh` 及 `translations.en` 加入顯示文字。
3. 在 `buildPrompt()` 的 `formatMap` 中補上繁中與英文描述。
4. 驗證輸出的規格和所選格式一致，尤其是 JSON 等對格式有效性有要求的情境。

### 新增介面語言

目前語言切換邏輯以 `zh`、`en` 為主。新增語言時，除了新增翻譯字典，也需要調整 `applyLanguage()`、語言按鈕、`document.documentElement.lang` 設定、初始語言判斷，以及 `buildPrompt()` 中以 `en` 旗標選擇文字的所有對照表（`headings`、`formatMap`、`depthMap`、`languageMap`、工作原則與最後指示），避免只翻譯畫面卻沒有同步翻譯生成指令。

### 建議後續功能

- 匯入／匯出 JSON 格式的需求草稿。
- 多組指令版本管理與差異比較。
- 可由使用者自行新增、命名及管理範本。
- 範本內容的英文版本。
- 保存使用者手動選擇的介面語言。
- 更多輸出語言與語言偵測控制。
- 單元測試與自動化瀏覽器測試。
- 若未來加入雲端同步或 AI API，應另外設計明確的資料告知、權限與金鑰管理機制。

以上為擴充方向，並非目前版本已實作的功能。

## 8. 測試檢查清單

每次修改後，建議至少驗證以下項目：

- [ ] 首次開啟網站時，繁中／英文初始介面判斷正常。
- [ ] 手動切換介面語言後，標題、欄位標籤、按鈕文字及生成指令同步更新。
- [ ] 未填寫核心目標時，複製與下載不會輸出空白指令，並顯示提示。
- [ ] 填寫或修改各欄位時，預覽會即時更新。
- [ ] 選填欄位空白時，不會出現多餘的 Markdown 區塊。
- [ ] 四個工作原則 Checkbox 能正確影響輸出內容。
- [ ] 六種快速開始選項與「載入示範」均能正確執行。
- [ ] 載入範本後仍可手動修改內容。
- [ ] 完整度、已完成欄位數與字元數會隨表單更新。
- [ ] 複製功能在 HTTPS／localhost 環境可正常使用，並測試失敗備援。
- [ ] Markdown 下載檔案可正常開啟且內容完整。
- [ ] 重新整理頁面後，草稿能正確還原。
- [ ] 清空內容後，表單及本機草稿均已清除。
- [ ] 手機（320–430px）、平板（768px、橫向約 1194px）及桌面（1280px 以上）尺寸下沒有水平溢位、文字截斷或操作阻礙。
- [ ] iOS Safari 聚焦輸入框時不會自動放大畫面。

## 9. 已知限制

- 所有提示詞均在瀏覽器端組裝；目前沒有模型呼叫、即時網路搜尋、資料庫或帳號系統。
- 「完整度」只反映七個文字欄位的填寫狀態，不是 AI 生成品質指標。
- 範本與「載入示範」的內容只有繁體中文版本。
- 手動選擇的介面語言不會保存，重新整理後依瀏覽器語言重新判斷。
- 範本是起始草稿，不是特定產業或專業領域的完整規範；使用者仍需依實際情境檢查內容。
- 目前只有繁體中文及英文介面；日文是可選的指令輸出語言，並非日文介面。
- 草稿僅存在目前瀏覽器的 `localStorage`，不會跨裝置同步。
- 專案目前只有 GitHub Pages 部署工作流程，尚未附上自動化測試或版本發布程序。

## 10. 開發原則

- **先確保需求可理解，再增加提示詞長度。**
- **不捏造功能。** README、介面文案與實際程式行為應保持一致。
- **保持前端輕量。** 沒有明確需求前，不引入框架或外部依賴。
- **尊重使用者資料。** 預設本機處理；若加入任何網路傳輸，必須明確揭露用途。
- **重視可維護性。** 新欄位、範本與語言應同步更新程式邏輯及測試清單。

---

## License

目前未在專案中指定授權條款。若要公開作為開源專案，請由專案維護者選擇合適授權（例如 MIT），並在 Repository 根目錄新增相應的 `LICENSE` 檔案後，再於此處標示授權資訊。
