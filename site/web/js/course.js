// 课程数据：课程首页（hub.js）和项目地图（atlas.js）都读这里。加一集 = 在 EPISODES 里加一项。
//
// status: ready = 材料齐了；partial = 只有部分材料（比如只有视频）；planned = 还没做，只在课程地图里占位
// part:   拆成几篇的一集（ep11a…ep11d）：n 相同，part 写 'a' 'b'…，显示成“第 11a 集”；map 写 page: 第一篇的 id，共用地图进度
// steps:  按顺序列出这一集有的步骤，可选 video / reading / lab / flow / map / assignment
//   video       需要 content/<id>/video.mp4 和 chapters.json（dev/sync_content.py 生成）
//   reading     {title, url?, urlLabel?, urlNote?, notes?, notesLabel?, links?: [{label, url, note?}], time?, read: [...], ask: [...]}
//   lab         {questions: 预测题个数, desc, time?, page?} → content/<page 或 id>/lab.html（page：几集共用一页时写那一集的 id）；实验台把答过的题号存进 localStorage 'course.<id>.lab.answered'
//   flow        {questions: 想一想题数, desc, time?} → content/<id>/flow.html；流程图页把答过的题号存进 'course.<id>.flow.answered'
//               （给看不懂代码的学员：用可点击的流程图讲结构）
//   map         {questions: 本集地图题数, desc, time?} → atlas.html#<id>（项目地图，整门课一张，见 references/atlas.md）；答对的题号存进 'course.<id>.map.answered'
//   assignment  {title, url, urlLabel?, short?（如 'Lab 1'）, desc?, notes: [...], time?} 真正的课程作业 / Lab
//
// 双语：这里写中文；英文写在 course.en.js 里，按 id 覆盖同名字段，没写英文的字段沿用中文。
// 加一集或改了这里的文字，都要同步改 course.en.js。
window.COURSE_META = {
  title: '分布式系统从零读懂',
  subtitle: 'MIT 6.5840（2026 春）自学路线',
  mapNote: '按 MIT 6.5840 2026 春季的课表和 Lab 顺序排列，一集讲清一个核心机制；集数是估计，制作时还会拆分。',
  footer: '论文和作业链接指向原课程官网。这里的视频和课件是自学用的辅助材料，讲解和题目均为原创，不包含 Lab 的答案。',
  atlas: false,   // 视频优先（2026-10-19）：每集只有视频 + 课件，没有实验台和项目地图。true = 课程有项目地图（web/atlas.html + js/atlas.data.js），首页顶部显示入口
  source: {dir: '6.5840'},   // 6.5840-golabs-2026，固定在 513cac0
};

window.EPISODES = [
  {id: 'ep01', n: 1, title: '分布式系统难在哪：一台机器数完八本书', group: '总览', status: 'ready', slides: true,
   desc: '用 Lab 自带的 mrsequential.go 和 wc.go 数八本书：3.3 MB、623,948 个词、22,107 个不同的词，一台笔记本零点几秒。按比例推算 1 TB 要超过十个小时，而且词对全在内存里装不下，所以要分到多台机器上。一拆开就多出四个难题：worker 崩了没人知道（死和慢看起来一样，crash.go 故意让三分之一的调用退出）；两个 worker 写同一个文件；labrpc 丢请求和丢回复都让 Call 返回 false，分不出服务器做没做；协调者本身要多副本，副本还得一致。最后对上五个 Lab，认清 src/ 里哪些是发给你的、哪十个文件归你写。你来试：自己跑一遍，猜 "Sherlock" 出现几次。',
   steps: ['video'],
   videoTime: '约 12 分钟 · 暂无配音，只有中英字幕'},
  {id: 'ep02', n: 2, title: 'MapReduce 模型：Map、分桶、Reduce', group: 'MapReduce · Lab 1', status: 'ready', slides: true,
   desc: '跟着一个词 "of" 走完 Lab 1 的数据路径。mrsequential 的注释自己承认：真正的 MapReduce 要把中间数据分成 N×M 个桶。M = 8（一本书一个 map 任务），R = 10（mrcoordinator.go 写死的 nReduce），所以有 8 × 10 = 80 个中间文件 mr-X-Y。按首字母分桶不行（s 开头 2,691 个词，z 开头 12 个）；worker.go 的 ihash 是 FNV-1a，手算 "of" → 1,765,031,016 → 6 号桶。同一个词在每一行都进同一列，所以 6 号 reduce 读 mr-0-6 到 mr-7-6，排序、分组、Reduce，写出 of 13536。真实运行：每桶不同单词数很均匀（2,173–2,251），词对数却从 39,508 到 105,743——哈希平衡的是键，不是工作量。TestWc 把合并排序后的输出和 mrsequential 逐字节比较；reduce 必须等所有 map 完成。你来试：手算 "the"，这次掩码有用。',
   steps: ['video'],
   videoTime: '约 11 分钟 · 暂无配音，只有中英字幕'},
  {id: 'ep03', n: 3, title: "协调者和 Worker：崩溃、重派和原子改名", group: "MapReduce · Lab 1", status: 'planned'},
  {id: 'ep04', n: 4, title: "Go 并发：goroutine、锁和数据竞争", group: "Go 与 RPC", status: 'planned'},
  {id: 'ep05', n: 5, title: "labrpc：实验里的“假网络”", group: "Go 与 RPC", status: 'planned'},
  {id: 'ep06', n: 6, title: "Go 模式：channel、select 和定时器", group: "Go 与 RPC", status: 'planned'},
  {id: 'ep07', n: 7, title: "带版本号的 Put：单机 KV 服务", group: "KV 服务 · Lab 2", status: 'planned'},
  {id: 'ep08', n: 8, title: "重试和 ErrMaybe：不可靠网络上的至多一次", group: "KV 服务 · Lab 2", status: 'planned'},
  {id: 'ep09', n: 9, title: "用 Put 造一把锁", group: "KV 服务 · Lab 2", status: 'planned'},
  {id: 'ep10', n: 10, title: "线性一致性：什么叫“对”", group: "一致性与复制", status: 'planned'},
  {id: 'ep11', n: 11, title: "测试怎么判对错：Porcupine 检查器", group: "一致性与复制", status: 'planned'},
  {id: 'ep12', n: 12, title: "GFS：一个弱一致的真实系统", group: "一致性与复制", status: 'planned'},
  {id: 'ep13', n: 13, title: "Paxos（上）：一个值怎么达成一致", group: "一致性与复制", status: 'planned'},
  {id: 'ep14', n: 14, title: "Paxos（下）：从一个值到一条日志", group: "一致性与复制", status: 'planned'},
  {id: 'ep15', n: 15, title: "Raft 全景：任期、多数派和脑裂", group: "Raft · Lab 3", status: 'planned'},
  {id: 'ep16', n: 16, title: "领导者选举", group: "Raft · Lab 3", status: 'planned'},
  {id: 'ep17', n: 17, title: "日志复制：AppendEntries 的一致性检查", group: "Raft · Lab 3", status: 'planned'},
  {id: 'ep18', n: 18, title: "nextIndex 快速回退", group: "Raft · Lab 3", status: 'planned'},
  {id: 'ep19', n: 19, title: "提交规则和图 8：为什么不能提交旧任期的日志", group: "Raft · Lab 3", status: 'planned'},
  {id: 'ep20', n: 20, title: "持久化和崩溃恢复", group: "Raft · Lab 3", status: 'planned'},
  {id: 'ep21', n: 21, title: "快照和 InstallSnapshot", group: "Raft · Lab 3", status: 'planned'},
  {id: 'ep22', n: 22, title: "在 Go 里写 Raft：锁、apply 线程和调试", group: "Raft · Lab 3", status: 'planned'},
  {id: 'ep23', n: 23, title: "复制状态机层 RSM", group: "Raft 上的 KV · Lab 4", status: 'planned'},
  {id: 'ep24', n: 24, title: "Raft 上的 KV：重复请求和线性一致的读", group: "Raft 上的 KV · Lab 4", status: 'planned'},
  {id: 'ep25', n: 25, title: "KV 服务的快照", group: "Raft 上的 KV · Lab 4", status: 'planned'},
  {id: 'ep26', n: 26, title: "ZooKeeper（上）：API 和顺序保证", group: "一致性与复制", status: 'planned'},
  {id: 'ep27', n: 27, title: "ZooKeeper（下）：用它搭锁和配置", group: "一致性与复制", status: 'planned'},
  {id: 'ep28', n: 28, title: "分片和配置：shardcfg 与 shardctrler", group: "分片 KV · Lab 5", status: 'planned'},
  {id: 'ep29', n: 29, title: "搬迁分片：Freeze、Install、Delete", group: "分片 KV · Lab 5", status: 'planned'},
  {id: 'ep30', n: 30, title: "重配置中途出错怎么办", group: "分片 KV · Lab 5", status: 'planned'},
  {id: 'ep31', n: 31, title: "分布式事务：两阶段锁", group: "事务", status: 'planned'},
  {id: 'ep32', n: 32, title: "两阶段提交", group: "事务", status: 'planned'},
  {id: 'ep33', n: 33, title: "Spanner（上）：TrueTime 和外部一致性", group: "事务", status: 'planned'},
  {id: 'ep34', n: 34, title: "Spanner（下）：无锁的只读事务", group: "事务", status: 'planned'},
  {id: 'ep35', n: 35, title: "链式复制", group: "真实系统", status: 'planned'},
  {id: 'ep36', n: 36, title: "FaRM：乐观并发控制", group: "事务", status: 'planned'},
  {id: 'ep37', n: 37, title: "验证分布式系统：IronFleet", group: "真实系统", status: 'planned'},
  {id: 'ep38', n: 38, title: "Facebook 的 Memcache：缓存一致性", group: "真实系统", status: 'planned'},
  {id: 'ep39', n: 39, title: "AWS Lambda：按需加载容器", group: "真实系统", status: 'planned'},
  {id: 'ep40', n: 40, title: "Ray：分布式任务和 actor", group: "真实系统", status: 'planned'},
  {id: 'ep41', n: 41, title: "SUNDR：分叉一致性", group: "不可信的参与者", status: 'planned'},
  {id: 'ep42', n: 42, title: "比特币：没有身份的共识", group: "不可信的参与者", status: 'planned'},
  {id: 'ep43', n: 43, title: "拜占庭容错 PBFT", group: "不可信的参与者", status: 'planned'},
];
