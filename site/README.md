# 分布式系统从零读懂

中文 | [English](README.en.md)

MIT 6.5840（2026 春）自学路线。每一集是一个视频（目前无配音，中英双语字幕）和一份课件。讲解和题目均为原创。

## 开始

1. 安装 Node.js 22.19 或更新的版本：<https://nodejs.org/>。
2. 在这个目录下运行：

   ```bash
   npm start
   ```

3. 打开终端里打印出来的链接（会自动打开浏览器），进入**课程首页**。视频可以按章节跳着看，进度自动记录在浏览器里。网页有中文和英文两种模式，点右上角的「中 / EN」切换，默认跟随浏览器语言。

视频文件较大，没有放进 git 仓库，要自己生成：在 `../episodes/epNN-<slug>/` 里按[仓库根目录 README](../README.md#做一集)的「做一集」步骤跑到 `node record.mjs`，再运行 `python3 dev/sync_content.py epNN`，视频就会出现在 `content/epNN/video.mp4`。课件已经在仓库里，不用生成。

`npm start` 只在本机（127.0.0.1）提供这些网页，不会运行任何代码。

## 目录

| 路径 | 内容 |
|---|---|
| `server.ts` | 本地网站：提供课程首页、课件和视频（`npm start`） |
| `web/js/course.js`、`course.en.js` | 课程数据：每一集的步骤和链接（中文、英文） |
| `web/index.html`、`web/js/hub.js` | 课程首页 |
| `content/epNN/` | 各集的章节、课件和你生成的视频（`python3 dev/sync_content.py` 写入） |

## 学术诚信

这个项目帮助你理解原理，不提供原课程作业的答案。如果你正在修这门课，请遵守课程的合作政策，独立完成作业。

## 许可证

MIT
