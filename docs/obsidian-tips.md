# 📖 Obsidian 使用指南 - Duckiki 项目文档

> 使用 Obsidian 浏览和管理 Duckiki 项目文档，充分利用双向链接和关系图功能

---

## 🎯 为什么用 Obsidian？

### 1. Markdown 原生支持
- 完全兼容标准 Markdown 语法
- 实时预览，所见即所得
- 支持代码块语法高亮

### 2. 强大的双向链接
- **正向链接**：`[[文件名#章节]]` 快速跳转
- **反向链接（Backlinks）**：自动显示哪些文档引用了当前文档
- **关系图（Graph View）**：可视化文档间的引用关系

### 3. 本地优先，隐私安全
- 所有数据存储在本地
- 无需登录，无需同步到云端
- 完全离线工作

### 4. 丰富的插件生态
- 社区插件市场
- 可定制化程度高
- 支持主题切换

---

## 🚀 快速开始

### 1. 安装 Obsidian

**下载地址**：https://obsidian.md/

**支持平台**：
- macOS（Intel + Apple Silicon）
- Windows
- Linux
- iOS / Android（移动端）

### 2. 打开项目作为 Vault

#### 方法 1：直接打开整个项目

1. 启动 Obsidian
2. 点击左下角 "Open another vault"
3. 选择 "Open folder as vault"
4. 导航到 `/Users/chenmq/Documents/duckiki`
5. 点击 "Open"

#### 方法 2：只打开 docs/ 文件夹

1. 启动 Obsidian
2. 选择 "Open folder as vault"
3. 导航到 `/Users/chenmq/Documents/duckiki/docs`
4. 点击 "Open"

**两种方法的对比**：

| 方法 | 优点 | 缺点 |
|------|------|------|
| 打开整个项目 | 可以链接到代码文件（如 config.js） | 会看到所有代码文件（node_modules、dist 等） |
| 只打开 docs/ | 界面干净，只显示文档 | 无法直接链接到项目外的代码文件 |

**推荐**：打开整个项目，然后配置文件过滤（见下一步）。

### 3. 配置文件过滤

打开 Obsidian 后：

1. 点击左下角设置图标 ⚙️
2. 进入 "Files & Links"
3. 在 "Excluded files" 中添加：

```
node_modules
dist
backend/venv
.git
*.db
*.pyc
__pycache__
```

这样 Obsidian 就只会显示文档文件，不会显示代码和构建产物。

---

## 🔗 双向链接语法

### 基础语法

```markdown
[[文件名]]                    # 链接到文件
[[文件名#标题]]               # 链接到特定章节
[[文件名#标题|显示文本]]      # 自定义显示文本
```

### 本项目实例

```markdown
查看 [[gym-roi-requirements#3.2.2 游泳距离动态权重公式|权重公式]]
详见 [[development-guide#10.8 文档重构实战案例|重构案例]]
参考 [[gym-roi-architecture#整体架构|架构图]]
```

### 与标准 Markdown 链接的区别

| 特性 | 标准 Markdown | Obsidian 双链 |
|------|--------------|--------------|
| 语法 | `[文本](./file.md#anchor)` | `[[file#章节\|文本]]` |
| 跨文件夹 | 需要相对路径 | 自动查找（无需路径） |
| 反向链接 | ❌ 不支持 | ✅ 自动生成 |
| 关系图 | ❌ 不支持 | ✅ 自动生成 |
| Cursor 兼容 | ✅ 完全支持 | ❌ 不支持 |
| GitHub 兼容 | ✅ 完全支持 | ❌ 不支持 |

**最佳实践**：本项目使用**双链接语法**：
```markdown
[标准链接](./file.md#anchor) 或 [[file#章节|文本]]
```
- 第一个链接：Cursor 和 GitHub 识别
- 第二个链接：Obsidian 识别，提供反向链接和关系图

---

## ⌨️ 快捷键

### macOS

| 功能 | 快捷键 | 说明 |
|------|--------|------|
| 打开快速切换 | `Cmd + O` | 快速打开文件 |
| 打开命令面板 | `Cmd + P` | 执行命令 |
| 创建新笔记 | `Cmd + N` | 新建文档 |
| 打开关系图 | `Cmd + G` | 查看文档关系图 |
| 切换编辑/预览 | `Cmd + E` | 切换模式 |
| 搜索当前文件 | `Cmd + F` | 文件内搜索 |
| 全局搜索 | `Cmd + Shift + F` | 搜索所有文档 |
| 插入链接 | `Cmd + K` | 插入双向链接 |
| 返回 | `Cmd + Alt + ←` | 返回上一个位置 |
| 前进 | `Cmd + Alt + →` | 前进到下一个位置 |

### Windows/Linux

将 `Cmd` 替换为 `Ctrl` 即可。

---

## 🧭 文档导航技巧

### 1. 使用 Graph View（关系图）可视化

#### 打开关系图
1. 点击左侧工具栏的 "Graph View" 图标（🕸️）
2. 或者使用快捷键 `Cmd + G`

#### 解读关系图

**节点（圆点）**：
- 每个圆点代表一个文档
- 大小：被引用次数越多，圆点越大
- 颜色：可自定义分类颜色

**边（连线）**：
- 连线表示文档间的引用关系
- 箭头方向：从引用者指向被引用者

**本项目的关系网络**：
```
中心节点: docs/README.md（文档导航）
       ↓
主要分支：
- gym-roi-requirements.md（需求文档）
- gym-roi-architecture.md（架构文档）
- development-guide.md（开发指南）
       ↓
次级节点：
- backend/README.md
- src/apps/gym-roi/README.md
```

#### 过滤和筛选

在关系图界面：
1. 点击右上角的 "Filters"
2. 可以筛选：
   - 只显示某个文件夹的文档（如 `path:docs`）
   - 只显示包含特定标签的文档
   - 排除某些文件（如排除 README）

### 2. 使用 Backlinks（反向链接）

#### 打开反向链接面板
1. 打开任意文档（如 `gym-roi-requirements.md`）
2. 右侧自动显示 "Backlinks" 面板
3. 或者点击右侧工具栏的 "Backlinks" 图标

#### 查看引用来源

**Backlinks 面板显示**：
- **Linked mentions**：明确引用了当前文档的其他文档
- **Unlinked mentions**：提到了文档名但未添加链接的地方

**实例**：
打开 `gym-roi-requirements.md`，Backlinks 显示：
```
Linked mentions (5):
- docs/README.md（引用了 3 处）
- backend/README.md（引用了 1 处）
- src/apps/gym-roi/README.md（引用了 1 处）

Unlinked mentions (2):
- changelog.md（提到了"需求文档"）
```

### 3. 使用 Outline（大纲）快速跳转

#### 打开大纲
1. 打开文档后，右侧自动显示 "Outline" 面板
2. 或者点击右侧工具栏的 "Outline" 图标

#### 功能
- 显示当前文档的所有标题（层级结构）
- 点击任意标题，快速跳转到对应位置
- 实时更新（滚动文档时，大纲会高亮当前所在章节）

**示例**：
打开 `development-guide.md`，大纲显示：
```
📚 目录
1. 虚拟环境
2. 环境变量
3. Git 工作流
...
10. 文档写作指南
  10.1 为什么文档在 AI 时代更重要？
  10.2 需求文档 vs 架构文档
  ...
  10.8 文档重构实战案例
  10.9 Markdown 锚点最佳实践
  10.10 文档内链接快速索引
```

### 4. 使用 Search（搜索）功能

#### 全局搜索
快捷键：`Cmd + Shift + F`

**搜索语法**：
```
path:docs             # 只搜索 docs 文件夹
file:README           # 只搜索文件名包含 README 的文件
tag:#重要             # 搜索包含 #重要 标签的文档
"游泳权重"             # 精确匹配短语
line:(游泳 OR 权重)   # 包含"游泳"或"权重"的行
```

#### 文件内搜索
快捷键：`Cmd + F`

**功能**：
- 高亮所有匹配项
- 上一个/下一个匹配
- 支持正则表达式

---

## 🔌 推荐插件

### 核心插件（内置，默认启用）

1. **Graph View**（关系图）
   - 可视化文档关系
   - 发现文档间的连接

2. **Backlinks**（反向链接）
   - 查看哪些文档引用了当前文档
   - 双向导航

3. **Outline**（大纲）
   - 显示当前文档的标题结构
   - 快速跳转

4. **Search**（搜索）
   - 全局搜索
   - 支持高级语法

5. **Page Preview**（页面预览）
   - 悬停在链接上时，显示预览
   - 无需打开文件即可查看内容

### 社区插件（推荐安装）

#### 安装步骤
1. 设置 ⚙️ → Community plugins
2. 关闭 "Safe mode"（安全模式）
3. 点击 "Browse" 浏览插件市场
4. 搜索插件名称 → Install → Enable

#### 推荐列表

**1. Dataview**
- **功能**：查询和展示文档元数据
- **用途**：创建动态索引、任务列表

示例：列出所有文档及最后修改时间
```dataview
TABLE file.mtime as "修改时间"
FROM "docs"
SORT file.mtime DESC
```

**2. Excalidraw**
- **功能**：在 Obsidian 中绘制图表
- **用途**：绘制架构图、流程图

**3. Mind Map**
- **功能**：将文档转换为思维导图
- **用途**：可视化文档结构

**4. Advanced Tables**
- **功能**：增强 Markdown 表格编辑
- **用途**：自动对齐、快速编辑表格

**5. Sliding Panes**
- **功能**：多文档并排显示（类似 Andy Matuschak 模式）
- **用途**：同时查看多个相关文档

**6. Obsidian Git**
- **功能**：自动提交 Obsidian Vault 到 Git
- **用途**：版本控制，备份文档

---

## 🎨 主题推荐

### 安装主题
1. 设置 ⚙️ → Appearance → Themes
2. 点击 "Manage"
3. 浏览并安装喜欢的主题

### 推荐主题

**1. Minimal**
- 简洁、现代
- 高度可定制
- 支持浅色/深色模式

**2. Things**
- 灵感来自 Things 3 应用
- 清爽的配色
- 良好的可读性

**3. Blue Topaz**
- 中文友好
- 丰富的配色选项
- 适合长时间阅读

**4. Obsidian Nord**
- 基于 Nord 配色方案
- 柔和的色彩
- 护眼

---

## 🤝 与 Cursor 协作

### 编辑工作流

**Cursor**：编写和修改代码、文档
- 代码编辑功能强大
- AI 辅助编程
- Git 集成

**Obsidian**：浏览、查找、理解文档关系
- 双向链接
- 关系图可视化
- 反向链接

### 典型工作流程

#### 场景 1：实现新功能

```
1. 在 Obsidian 中打开需求文档
   - 使用 Outline 快速定位到相关章节
   - 查看 Backlinks 了解相关文档

2. 使用 Graph View 查看依赖关系
   - 需求 → 架构 → 实现的文档链

3. 切换到 Cursor 编写代码
   - 参考文档中的链接
   - 实现功能

4. 在 Obsidian 中更新文档
   - 添加新的双向链接
   - 更新文档索引
```

#### 场景 2：查找信息

```
1. 在 Obsidian 中全局搜索关键词
   Cmd + Shift + F 搜索"游泳权重"

2. 查看搜索结果
   - 需求文档有详细说明
   - 后端 README 有 Python 实现
   - 前端 README 有 JavaScript 实现

3. 使用 Graph View 查看这些文档的关系
   - 了解知识点的组织结构
```

### 链接兼容性

本项目使用双链接语法，兼容两个工具：

```markdown
[需求文档 3.2.2](./gym-roi-requirements.md#322-游泳距离动态权重公式) 或 [[gym-roi-requirements#3.2.2 游泳距离动态权重公式|权重公式]]
```

- **Cursor**：识别第一个标准 Markdown 链接
  - Cmd/Ctrl + 点击链接 → 跳转
  - 在 Markdown 预览中也可点击

- **Obsidian**：识别第二个双向链接
  - 点击链接 → 跳转
  - 自动生成反向链接
  - 在关系图中显示

---

## ❓ 常见问题

### Q1: Obsidian 显示很多代码文件怎么办？

**A**：在设置 → Files & Links → Excluded files 中添加：
```
node_modules
dist
venv
*.db
.git
*.pyc
__pycache__
```

### Q2: 双链接跳转失败？

**A**：确保链接格式正确：
- 文件名不需要 `.md` 后缀
- 标题前需要 `#` 号
- 示例：`[[gym-roi-requirements#1. 项目概述]]`

如果还是失败，检查：
- 文件是否存在
- 章节标题是否正确（注意大小写、标点）

### Q3: 如何搜索所有文档？

**A**：使用全局搜索快捷键：
- macOS: `Cmd + Shift + F`
- Windows/Linux: `Ctrl + Shift + F`

### Q4: 关系图太乱，如何筛选？

**A**：在 Graph View 界面：
1. 点击右上角 "Filters"
2. 使用路径过滤：`path:docs` 只显示 docs 文件夹
3. 使用文件过滤：`file:README` 只显示 README 文件

### Q5: 如何导出文档为 PDF？

**A**：
1. 打开文档
2. 右键点击文档标题
3. 选择 "Export to PDF"

或者安装社区插件 "Better Export PDF" 获得更多选项。

### Q6: Obsidian 和 Cursor 的链接不同步怎么办？

**A**：本项目使用双链接语法解决这个问题：
```markdown
[标准链接](./file.md#anchor) 或 [[双链]]
```
- Cursor 识别前者
- Obsidian 识别后者
- 都能正常工作，互不影响

---

## 🔧 高级技巧

### 1. 使用 Dataview 创建动态索引

创建一个 `docs/index.md` 文件：

```markdown
# 文档索引

## 最近修改的文档

\`\`\`dataview
TABLE file.mtime as "修改时间"
FROM "docs"
WHERE file.name != "index"
SORT file.mtime DESC
LIMIT 10
\`\`\`

## 所有 README 文件

\`\`\`dataview
LIST
FROM ""
WHERE file.name = "README"
\`\`\`
```

### 2. 使用模板快速创建文档

创建模板文件 `.obsidian/templates/新文档模板.md`：

```markdown
---
创建日期: {{date}}
作者: chenmq77
标签:
---

# {{title}}

## 概述

## 详细说明

## 相关文档

- [[]]
```

使用模板：
1. 创建新文档
2. Cmd + P 打开命令面板
3. 搜索 "Insert template"
4. 选择模板

### 3. 使用别名（Aliases）

在文档开头添加别名：

```markdown
---
aliases: [权重公式, 高斯函数]
---

# 游泳距离动态权重公式
```

现在可以用别名链接到这个文档：
```markdown
详见 [[权重公式]]
详见 [[高斯函数]]
```

### 4. 使用标签（Tags）组织文档

在文档中添加标签：
```markdown
# 需求文档

#文档类型/需求 #项目/健身房回本计划 #状态/完成
```

搜索标签：
- 全局搜索：`tag:#文档类型/需求`
- 标签面板：点击左侧 "Tags" 查看所有标签

---

## 📚 学习资源

### 官方文档
- **Obsidian 官方文档**：https://help.obsidian.md/
- **社区论坛**：https://forum.obsidian.md/

### 视频教程
- **Obsidian 快速开始**：YouTube 搜索 "Obsidian tutorial"
- **中文教程**：B站搜索 "Obsidian 教程"

### 社区
- **Reddit**：r/ObsidianMD
- **Discord**：官方 Discord 服务器

---

## 🎯 开始使用 Duckiki 项目文档

### 第一步：打开项目
```bash
# 打开 Obsidian
# 选择 "Open folder as vault"
# 导航到 /Users/chenmq/Documents/duckiki
# 点击 "Open"
```

### 第二步：配置过滤
```
设置 ⚙️ → Files & Links → Excluded files
添加：node_modules, dist, venv, .git, *.db
```

### 第三步：浏览文档
```
打开 docs/README.md（文档导航）
使用 Outline 查看结构
点击链接浏览相关文档
```

### 第四步：探索关系
```
Cmd + G 打开 Graph View
查看文档间的引用关系
发现知识点的组织结构
```

### 第五步：开始学习
```
从需求文档开始
使用 Backlinks 查看哪些文档引用了它
使用双链接快速跳转
```

---

**创建日期**：2025-10-18
**作者**：chenmq77
**适用版本**：Obsidian v1.0+
