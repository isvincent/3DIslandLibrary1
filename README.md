# 楊梅高中圖書館島

用 3D 島嶼逛楊梅高中圖書館。十座島對應館內十個空間，點選任一座島，鏡頭會飛過去並打開分區卡片，可以查看開放時間、使用規則、常見問答，並回答闖關題收集徽章，作為新生圖書館利用教育的互動教材。

![圖書館島圖示](icons/icon-192.png)

## 功能

- **3D 互動地圖**：拖曳旋轉、滾輪或雙指縮放，點島或名牌即飛到該區域
- **分區卡片**：介紹、開放與規則、常見問答、闖關四個分頁
- **闖關徽章**：每島一題，共 10 枚，進度存在學生自己的瀏覽器中
- **日夜切換**：清晨、白天、黃昏、夜晚四種光線，夜晚檯燈與窗戶會亮起
- **清單模式**：不想操作 3D 時，可從清單直接選區域
- **RWD**：桌機、平板、手機直式與橫式各有專屬版面，支援瀏海與圓角螢幕的安全區域
- **PWA**：可安裝到手機主畫面或電腦桌面，第一次開啟後離線也能使用

## 十座島

| 島嶼 | 位置 |
|---|---|
| 讀者服務櫃台（中央） | 圖書館一樓 |
| 二樓書庫 | 圖書館二樓 |
| 期刊區 | 圖書館一樓 |
| 資訊檢索區 | 圖書館一樓 |
| 梅高特藏區 | 圖書館一樓 |
| 討論室 | 圖書館一樓 |
| 閱讀區 | 圖書館一、二樓 |
| 漫畫區 | 圖書館二樓 |
| 喜閱學堂 | 啟明樓一樓 |
| 紅土藝術空間 | 啟明樓四樓 |

規則與常見問答依「楊梅高中圖書館利用說明」整理。

## 檔案結構

```
library-isles/
├── index.html               首頁（全部程式與資料都在這一個檔案）
├── manifest.webmanifest     PWA 設定：名稱、圖示、主題色
├── sw.js                    Service Worker：離線快取與版本更新
├── .nojekyll                讓 GitHub Pages 原樣提供檔案
├── README.md                本說明
└── icons/
    ├── favicon.svg          瀏覽器分頁圖示
    ├── icon-192.png         PWA 圖示
    ├── icon-512.png         PWA 圖示（大）
    ├── icon-maskable-512.png  Android 自適應圖示
    └── apple-touch-icon.png   iPhone / iPad 主畫面圖示
```

## 部署到 GitHub Pages

1. 在 GitHub 建立新的 **Public** 儲存庫，例如 `library-isles`。
2. 進入儲存庫，按 **Add file → Upload files**，把上面所有檔案連同 `icons` 資料夾一起拖進去，按 **Commit changes**。
   - `.nojekyll` 是隱藏檔，若電腦看不到可以略過，不影響運作。
3. 到 **Settings → Pages**，Branch 選 **main**、資料夾選 **/ (root)**，按 **Save**。
4. 等 1～2 分鐘，網址會是：`https://你的帳號.github.io/library-isles/`

> PWA 與離線功能需要 HTTPS，GitHub Pages 預設就是 HTTPS。直接用滑鼠雙擊打開 `index.html`（`file://`）時 3D 地圖可以運作，但不會啟用離線與安裝功能。

## 在自己電腦測試

在專案資料夾開啟終端機，執行：

```bash
python -m http.server 8000
```

再用瀏覽器開啟 `http://localhost:8000`。

## 修改內容

所有分區資料集中在 `index.html` 裡的 `ZONES` 陣列（搜尋 `const ZONES`）。每一區的欄位：

| 欄位 | 說明 |
|---|---|
| `name` / `en` | 中文名稱 / 英文名稱 |
| `call` | 名牌上的小字代碼，例如 `1F · PER` |
| `color` | 這座島的代表色 |
| `where` | 位置 |
| `intro` | 介紹文字 |
| `hours` | 開放時間 |
| `rules` | 規則清單（陣列） |
| `faq` | 常見問答，格式為 `['問題', '答案']`；沒有就留空陣列 `[]` |
| `quiz` | 闖關題：`q` 題目、`opts` 選項、`ans` 正確選項的位置（從 0 開始）、`explain` 解說 |

`type` 決定島上的 3D 造型（`hub`、`stack`、`per`、`pc`、`special`、`grp`、`study`、`comic`、`joy`、`art`）。新增一座島時，可以先沿用現有的 `type`。島的數量改變時，環狀排列、徽章總數和清單都會自動調整。

### 更新後讓使用者拿到新版

修改任何檔案後，請打開 `sw.js`，把第一行的版本號加 1：

```js
const CACHE_VERSION = 'v2';
```

已安裝或開過網站的使用者，下次開啟時會出現「有新版本可以更新」的提示。

## 技術說明

- [Three.js](https://threejs.org/) r160（MIT 授權），由 jsDelivr CDN 以 ES Module 載入
- `OrbitControls` 鏡頭操作、`CSS2DRenderer` 島嶼名牌、`InstancedMesh` 繪製大量書本
- 所有建築都用基本幾何體組成，沒有外部 3D 模型或圖片
- 字型：Noto Serif TC、Noto Sans TC、IBM Plex Mono（Google Fonts）
- 闖關進度存在瀏覽器 `localStorage`，不會上傳到任何伺服器
- 支援深色模式與「減少動態效果」系統設定

## 瀏覽器支援

Chrome、Edge、Safari（iOS 15 以上）、Firefox 的近期版本。需支援 WebGL；學校較舊的電腦若畫面卡頓，可按下方「暫停」關閉動畫，或改用「清單」瀏覽。
