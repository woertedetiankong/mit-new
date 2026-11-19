# 分布式系统从零读懂

中文 | [English](README.en.md)

MIT 6.5840（2026 春）的自学路线，写给会编程、但刚接触分布式系统的工程师。每一集讲一个机制、跟一个贯穿例子：先用一两句话说结论，再给一张框架图，然后按代码运行的顺序把源码一行一行走完。屏幕上的数字都来自真实运行。

这门课是**视频优先**的：每一集只有一个视频（目前无配音，中英双语字幕）和一份课件（视频截图配讲解，有网页版和 PDF）。视频逐字引用 6.5840 发给学生的代码（固定在提交 `513cac0`），不含任何作业答案。

| 集 | 标题 | 长度 |
|---|---|---|
| 1 | 分布式系统难在哪：一台机器数完八本书 | 12:27 |
| 2 | MapReduce 模型：Map、分桶、Reduce | 11:26 |

后面 41 集的计划在 [`episodes/plan.py`](episodes/plan.py)。

## 只想看课

见 [`site/README.md`](site/README.md)：装好 Node.js 22.19+，在 `site/` 下运行 `npm start`，打开 <http://127.0.0.1:7880>。

视频文件太大，没有放进 git。目前要自己生成：按下面「做一集」的步骤跑到 `record.mjs`，再同步到网站。课件（`site/content/epNN/slides.html` 和 `slides.pdf`）已经在仓库里，不用生成。

## 克隆

```bash
git clone --recurse-submodules https://github.com/woertedetiankong/mit-new.git
```

`6.5840/` 是 MIT 的课程代码（`git://g.csail.mit.edu/6.5840-golabs-2026`），作为子模块固定在 `513cac0`。视频按 `文件:行号` 引用它，所以**不要移动这个固定点**；要换版本，所有引用代码的集都得重做。有的网络会挡 `git://` 协议，子模块拉不下来时换个网络再运行 `git submodule update --init`。

## 目录

| 路径 | 内容 |
|---|---|
| `6.5840/` | 课程发的实验代码（子模块，固定在 `513cac0`） |
| `episodes/plan.py` | 全部 43 集的计划和学习者设定；改完运行 `python3 episodes/gen_course.py` 更新网站里的计划条目 |
| `episodes/epNN-<slug>/` | 一集的全部素材：`script.json`（逐句旁白）、`scenes.js`（画面）、`data.py`（真实运行和核对）、`practice.json`（练习题），以及生成视频和课件的脚本 |
| `site/` | 本地课程网站：`web/js/course.js` + `course.en.js` 是课程数据，`content/epNN/` 放每集的章节、课件（和你生成的视频） |
| `CLAUDE.md` | 做课的规则（给 AI 助手和协作者看） |

## 做一集

需要：Node.js 22.19+、Python 3、Go 1.22+（`data.py` 要编译并运行课程代码）、ffmpeg、Google Chrome（不在默认位置时设置 `CHROME_PATH`）。

在一集的目录里（比如 `episodes/ep02-map-partition-reduce/`）：

```bash
npm install                  # 第一次：录制用的 playwright-core
python3 data.py              # 重跑真实运行，核对字幕里的每个数字，写出 epNN_data.js
python3 silent_timeline.py   # 按字幕长度排时间轴（无配音）→ timeline.json
python3 build.py             # 拼出 index.html（可以直接用浏览器打开预览）
node sweep.mjs               # 每 0.1 秒渲染一次，先抓脚本错误
node frames.mjs              # 每句话结尾截一帧，拼成 frames/sheet-*.jpg，逐张看
node moments.mjs             # 句子切换的瞬间，看有没有残留的卡片和交叉淡入
node record.mjs              # 录成 video.mp4（一集约 10 分钟）
node slides.mjs              # 课件：slides.html + slides.pdf，有内容被截断会警告
cd ../../site && python3 dev/sync_content.py epNN   # 复制视频、章节和课件到网站
```

改了一句旁白，从 `silent_timeline.py` 往下全部重跑（后面的时间都会变）；只改了画面，从 `build.py` 开始。重新录制后一定要重跑 `slides.mjs` 和 `sync_content.py`，课件是从当前的视频截出来的。

## 规则

完整版在 [`CLAUDE.md`](CLAUDE.md)，要点：

- **不放作业答案。** 屏幕上和仓库里只出现课程发的代码（骨架、测试、labrpc、mrapps）和论文。讲学生自己写的代码时，真实运行来自仓库外的私有实现，只用它的运行结果和数字，代码从不出现。
- **只用真实运行。** 屏幕上的数字来自 `data.py`；手算的要在屏幕上标明。
- **每段面向学习者的文字都要同时写中文和英文。**
- **先无声。** 用 `silent_timeline.py`，等课程定下来再配音。
- **一集一个机制。** 内容一密就拆成 `ep16a`、`ep16b`。

## 踩过的坑

- **第 2 集的分桶数字要用私有实现。** `episodes/ep02-map-partition-reduce/data/runs.sh` 调用 `$MIT_LABS_PRIVATE`（默认 `~/Documents/ChatGPT/mit-labs-private`）里的工具，那是 Lab 1 答案的一部分，不在这个仓库。没有它，第 2 集的 `data.py` 会停在这一步；仓库里提交的 `ep02_data.js` 就是它上次的结果，可以直接用来 `build.py` 和录制。第 1 集只用课程自己的代码，谁都能重跑。
- **本机计时每次都不一样。** 第 1 集那次运行 10 月测是 0.25 秒，11 月测是 0.14 秒。所以字幕只说每次都成立的话（“零点几秒”），屏幕上显示这一次的数字并标明来源，`data.py` 核对的是这个性质，而不是一个固定的数。
- **`.gitignore` 的路径相对于它所在的目录。** `episodes/*/data/.gitignore` 里要写 `out/`；写成 `data/out/` 就什么也挡不住，第 1 集差点把 25 MB 的编译产物提交进来。
- **课件 PDF 截断。** 2026-10-24 之前的模板会截掉 4 行以上的讲解。现在的 `slides.mjs` 发现截断会打印 `⚠ slides.pdf: notes clipped`，看到就别发布那份 PDF。
- **macOS 没有 `timeout` 命令。** 脚本里别用它。
- **录制很慢**（一集约 10 分钟）。先跑 `sweep.mjs` 和 `frames.mjs`，别等录完才发现画面出错。

## 学术诚信

这个项目帮助你理解原理，不提供原课程作业的答案。如果你正在修这门课，请遵守课程的合作政策，独立完成作业。讲解、动画和练习题都是原创；`6.5840/` 里的代码属于 MIT 6.5840 课程。

## 许可证

`site/` 以 MIT 许可发布，见 [`site/LICENSE`](site/LICENSE)。
