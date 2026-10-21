# Git 安装 · GitHub 接入步骤

> **最新情况（2026-10-21 08:50 实测）：你不需要安装 Git 了。**
> 工作台自带一个 PortableGit（`git version 2.55.0.windows.3`），我已经用它把仓库初始化并完成了第一次提交。
> 唯一的麻烦是：**它不在系统 PATH 上**，所以你自己的终端里直接敲 `git` 会报"找不到命令"。
> 两条路：① 不管它，用我给的完整路径执行（第 0 节）② 装一个官方版，让 `git` 变成随处可用（第 1 节）。

---

## 一、Git 安装地址（Windows）

> 先看第 0 节——你可能根本不用装。装官方版的唯一好处是 `git` 在任何终端里都能直接用，不用记长路径。

### 0 · 用工作台自带的那个（零安装）

```bash
# 完整路径（每次都要写这么长，所以建议在 PowerShell 里先定义一个变量）
C:/Users/ShingoChen/.workbuddy/binaries/PortableGit/versions/1.3.0/cmd/git.exe --version
```

已经帮你做好的事：仓库初始化、主分支改成 `main`、首次提交 `feat: 首页 + 无限气泡纸（01）`。

**代价**：① 路径里带版本号 `versions/1.3.0`，工作台升级后可能变，到时路径要跟着改 ② 你自己敲命令很啰嗦 ③ 换电脑就没有了。

### 1 · 装官方版（可选，但建议）

**官网下载页**：https://git-scm.com/download/win

页面会自动给出最新版。当前最新是 **2.56.0(2)**（2026-10-05 发布），64 位 Windows 直接下载：

```
https://github.com/git-for-windows/git/releases/download/v2.56.0.windows.2/Git-2.56.0.2-64-bit.exe
```

也可以用 winget 一行装（Win10/11 自带 winget）：

```powershell
winget install --id Git.Git -e --source winget
```

### 安装时只有三处值得停一下

| 安装页 | 选什么 | 为什么 |
|---|---|---|
| Adjusting your PATH | **Git from the command line and also from 3rd-party software**（默认项） | 不选这个，终端里就找不到 `git` |
| Choosing the default editor | 不会用 Vim 就选 **Use Notepad as Git's default editor** | 否则每次提交会掉进 Vim，退不出来 |
| Configuring line endings | **Checkout as-is, commit Unix-style**（默认第二项） | 跨平台最稳，以后接 Cloudflare 不会因换行符抽风 |

其余一路 Next 即可。

### 装完必须做的一步

**关掉当前终端，重新开一个**（PATH 要重新加载，这是最常见的"装了但说找不到"的原因）。然后：

```bash
git --version
# 应该输出 git version 2.56.0.windows.2

git config --global user.name "你的名字"
git config --global user.email "你的GitHub邮箱"
```

这两行是提交记录里的作者信息，不配的话第一次提交会报错。

---

## 二、用 GitHub 网页上传（不装 Git 也能做）

**这条路仍然是 GitHub，只是不用本地 Git 工具。**

### 第一次：建仓库

1. 登录 https://github.com
2. 右上角 **+** → **New repository**
3. **Repository name** 填 `moyu-site`
4. 选 **Public** 或 **Private** 都行（Cloudflare Pages 免费版两者都能连，私有仓库需要授权一次 GitHub App）
5. ⚠️ **不要**勾 Add a README / .gitignore / license —— 会和你本地文件打架
6. 点 **Create repository**

### 第二次：把文件传上去

7. 在新建的空仓库页面上，找到中间那行 **"uploading an existing file"** 并点它
   （或点 **Add file → Upload files**）
8. 打开 `D:\moyu-site`，全选这些东西拖进浏览器：
   - `index.html`
   - `games` 文件夹
   - `assets` 文件夹
   - `README.md`
   - `.gitignore`
9. ⚠️ `.gitignore` 是隐藏文件：资源管理器 → **查看 → 显示 → 隐藏的项目**，勾上才能选中
10. 拖**文件夹**进去会自动保留目录结构，不用手动建
11. 页面下方 Commit changes 的说明框填：`feat: 首页 + 无限气泡纸`
12. 点 **Commit changes**

传完在仓库首页应该能看到 `index.html`、`games/`、`assets/`。

### 以后每次改代码

**Add file → Upload files → 拖同名文件覆盖 → Commit changes**。

GitHub 会自动覆盖同名文件，你不需要先删。

### 这条路有四个真实的坑

1. **本地和线上会打架**：你在网页上改了一处，本地那份不知道；下次从本地再上传，就把网页的改动覆盖掉了。**必须只在一处改**。
2. **删除很麻烦**：网页删不掉整个文件夹，要进去逐个文件删，每个删完都要 commit。
3. **单文件 25MB 上限**（网页上传通道的限制）。
4. **练不到真正值钱的操作**：分支、PR、回滚在网页上不是不能做，是要点很多下、很容易点错。

---

## 三、三条路到底差在哪（你问的第 3 点）

先直接回答：**"现在说不用"指的是第 3 条，第 2 条仍然在用 GitHub。**

| | 用 GitHub 吗 | 能学到什么 | 安装量 | 适合 |
|---|---|---|---|---|
| ① 装 Git | 用 | commit、分支、PR、回滚，**行业标准做法** | 一个软件，5 分钟 | 想真正学会 |
| ② 网页上传 | **用**（只是不用本地 Git） | 只会"提交"这一个动作；分支/回滚要硬点网页 | 零 | 只想先上线 |
| ③ 先不碰 GitHub | 不用 | 学不到 GitHub 相关的东西 | 零 | 只想验证流量 |

### ②的真实定位

它解决的是"**让站能被 Cloudflare 部署上线**"，不是"**学会 Git**"。

如果你选 ②，实际分工是：我在本地改好文件，你负责把它们拖上网页。**每次上传等于一次全量替换**，所以必须保证"本地是最新版"——一旦你在网页上直接改过东西，两边就不一致了，这是 ② 最容易出事的地方。

### 我的建议

**装 Git（①）**。理由很实在：

- 这是**一次性投入**，5 分钟，之后一辈子用
- 你目标里写的是"跑通链路 + 学 GitHub"，而 ② 恰好把"学"这一半掏空了
- 装完不用重来：**网页建好的仓库可以 clone 下来接着用，历史不会丢**。所以就算先走 ②，也不是死路

装好之后告诉我，我给你逐条命令，你粘贴着做，每一步我解释它在干嘛。
