# 摸鱼室（moyu-site）

给上班的人打开一下的小站。**目标不是流量，是跑通「假设 → 制作 → 部署 → 上线 → 宣传 → 有流量」这条链路。**

## 现在有什么

| 编号 | 名字 | 状态 |
|---|---|---|
| 01 | 无限气泡纸 | ✅ 可玩 |
| 02 | 今日摸鱼结算 | ⬜ 未开始 |
| 03 | 假装很忙 | ⬜ 未开始 |

## 本地跑起来

不需要任何依赖、不需要构建。

```bash
# 方式一：直接双击 index.html（大部分功能可用）
# 方式二：起一个本地服务器（推荐，行为和线上一致）
python -m http.server 8080
# 然后打开 http://localhost:8080
```

## 目录

```
index.html              首页（三个入口）
games/bubble.html       游戏 01
assets/style.css        全局样式（纸感配色、排版、首页卡片）
assets/bubble.css       气泡纸专属样式
assets/audio.js         Web Audio 合成音效（无 mp3、无版权风险）
assets/bubble.js        气泡纸逻辑
```

## 三个设计约束（改代码前先看）

1. **零依赖**：不引任何 CDN、不加 npm 包。离线打开必须能用。
2. **零后端**：不上传文件、不连数据库。所以"隐私"不是宣传话术，是事实。
3. **看起来不像游戏**：配色和排版按"记事本"来，不加闪烁、不加弹窗、不加满屏数字。这是《项目方案》里的假设要求的。

## 加一个新游戏

1. 复制 `games/bubble.html` 改名，改掉两个 `<link>` 和两个 `<script>` 的路径
2. 新建 `assets/<名字>.css` / `assets/<名字>.js`
3. 首页把对应的 `.card.soon` 去掉 `soon` 类，改成 `<a href="games/<名字>.html">`

## 第一次用 GitHub（要学的四件事）

```bash
git init
git add .
git commit -m "feat: 首页 + 无限气泡纸"

# 在 GitHub 网页上建一个空仓库（不要勾 README），然后：
git branch -M main
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

之后每做一个游戏：

```bash
git checkout -b feat/busy-mode     # 开分支
# ...改代码...
git add .
git commit -m "feat: 假装很忙"
git push -u origin feat/busy-mode  # 推上去，开 PR
# 在网页上点 Merge
git checkout main && git pull
```

**回滚（必修）**：

```bash
git log --oneline          # 找到要回退到的那个提交
git revert <commit-hash>   # 安全回滚：生成一个新提交，历史不丢
```

## 部署

Cloudflare Pages 连这个仓库，构建命令留空，输出目录填 `/`。

## 数据

- 气泡计数存在 `localStorage`，只在本机，不上传。
- 站点统计用 Cloudflare Web Analytics（免费、无 cookie）。**不装统计，"有流量"就无法验证。**
