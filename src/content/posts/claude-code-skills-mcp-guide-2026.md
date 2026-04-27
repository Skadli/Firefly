---
title: "Claude Code 进阶配置实战：把 Skills、MCP、Hooks 和插件真正用起来"
published: 2026-04-27
updated: 2026-04-27
description: "基于 2026 年 4 月官方文档与实际使用经验，系统梳理 Claude Code 的 Skills、MCP、Hooks、插件与配置层级，附一套更适合长期维护的项目配置模板。"
image: "/images/posts/claude-code-skills-mcp-cover.svg"
tags: ["Claude Code", "MCP", "Skills", "Hooks", "插件系统", "AI 编程"]
category: "技术教程"
draft: false
lang: "zh_CN"
---

**TL;DR** — 真正把 Claude Code 用顺手的人，早就不再把一切都塞进 `CLAUDE.md`。项目事实写在 `CLAUDE.md`，高频工作流写成 Skill，外部系统走 MCP，确定性约束交给 Hooks，可复用能力再打包成 Plugin。配置对了，它像一个长期能协作的工程搭子；配置乱了，它就只是一台很贵的聊天终端。

> **适合谁阅读**：已经在用 Claude Code，但想把它从“能跑”提升到“可维护、可扩展、能复用”的开发者。尤其适合 Windows / PowerShell 用户，以及正在用第三方 API 或团队共享配置的人。

## 目录

- [1. 先把边界画对：CLAUDE.md、Skill、MCP、Hook、Plugin 各管什么](#1-先把边界画对claudemdskillmcphookplugin-各管什么)
- [2. Skills：Claude Code 最容易被低估的一层](#2-skillsclaude-code-最容易被低估的一层)
- [3. MCP：别再把它当成“更多工具”](#3-mcp别再把它当成更多工具)
- [4. Hooks 与权限：把“最好这样做”变成“必须这样做”](#4-hooks-与权限把最好这样做变成必须这样做)
- [5. 我现在更推荐的配置结构](#5-我现在更推荐的配置结构)
- [6. 什么时候该从 .claude 升级成 Plugin](#6-什么时候该从-claude-升级成-plugin)
- [总结](#总结)

---

## 1. 先把边界画对：CLAUDE.md、Skill、MCP、Hook、Plugin 各管什么

很多人第一次把 Claude Code 配乱，都是因为**边界没画清楚**。最常见的反模式有三个：

- 把几十页 SOP 全塞进 `CLAUDE.md`
- 把 MCP 当成“多装几个工具”
- 把“应该这样做”写成提示词，而不是 Hook

我现在更愿意用下面这张图来理解它：

![Claude Code extension map](/images/posts/claude-code-extension-map.svg)

对应到落地层，大致可以这么分：

| 层 | 解决的问题 | 适合放什么 | 不适合放什么 |
| --- | --- | --- | --- |
| `CLAUDE.md` | 项目事实是什么 | 构建命令、目录结构、架构约束、已知坑 | 细碎流程、一次性任务脚本 |
| Skill | 这类任务该怎么做 | 审查清单、发布流程、迁移 playbook、模板 | 整个团队的外部系统凭据 |
| MCP | Claude 需要连到什么外部世界 | GitHub、Playwright、文档库、数据库、工单系统 | 项目内部编码规范 |
| Hook | 哪些动作必须自动发生 | 格式化、危险命令拦截、收尾校验、回调通知 | 大段启发式写作说明 |
| Plugin | 怎么把上面这些打包共享 | 跨项目复用的 skills、hooks、MCP、agents | 当前仓库私有的小实验 |

一句话记住：

- **事实**写进 `CLAUDE.md`
- **流程**写成 Skill
- **系统连接**交给 MCP
- **确定性约束**交给 Hook
- **共享与分发**交给 Plugin

这套分工是我这半年里体感最明显的一个变化。Claude Code 现在的文档和功能已经不鼓励“用一份超长系统提示词管理一切”，而是鼓励把上下文拆成**按需装载**的几层。

---

## 2. Skills：Claude Code 最容易被低估的一层

如果只能选一个最值得花时间配置的特性，我会选 **Skills**。

原因很简单：模型本身越来越强，但你真正能复用的，不是一次回答，而是**一整套做事方法**。Skill 的价值恰好就在这里。

### 2.1 先说一个很多旧文章已经过时的点

现在 Claude Code 里的 **自定义 slash commands 已经和 skills 合流**了。你仍然可以在 `.claude/commands/` 下放 Markdown 文件，也可以在 `.claude/skills/<name>/SKILL.md` 下做完整 Skill。我的建议是：

- **轻量入口**放 `commands/`
- **带示例、模板、参考资料的工作流**放 `skills/`

也就是说，Skill 不只是“一个命令别名”。它更像是一个**懒加载的任务包**。

### 2.2 Skill 最适合解决什么问题

最适合写成 Skill 的，一般有这几个特征：

- 你会反复做
- 每次都需要同一套检查顺序
- 你希望 Claude 输出固定形态，而不是临场发挥
- 这套流程最好和主会话上下文解耦

比如：

- 发布前检查
- PR 风险审查
- 数据库迁移验证
- API 兼容性巡检
- 文档同步和 changelog 生成

反过来说，**别把 Skill 写成第二个 `CLAUDE.md`**。Skill 最好只做一件事，而且做得很像一个经验丰富的同事留下来的 playbook。

### 2.3 一个更像工程现场的 Skill 例子

下面这类写法，比“你是一个专业代码审查助手”这种空泛指令强太多了：

```md
---
name: release-check
description: 发布前对版本差异做一次工程化检查，输出风险、回滚点和需要人工确认的事项
argument-hint: "[base-ref]"
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(git diff --stat *)
  - Bash(pnpm test *)
  - Bash(pnpm build *)
paths:
  - src/**
  - package.json
  - pnpm-lock.yaml
shell: powershell
---

1. 如果用户没传参数，默认把 `main` 作为基线。
2. 先看依赖和 schema 变化，再看环境变量、脚本和 breaking change。
3. 只输出三类信息：风险、回滚点、需要人工确认的地方。
4. 没有发现问题时，直接说“本次变更没有发现显著发布风险”，不要灌水。
```

这段配置里，真正有价值的不是 YAML，而是后面那 4 条步骤。因为它们把“怎么审发布”这件事，从一种模糊能力，变成了一种可以稳定复现的工作方式。

### 2.4 Skill 的几个新习惯，值得尽早养成

截至 2026 年 4 月，官方这套 Skill 设计已经很成熟了。我现在的习惯是：

1. **描述写得短，但触发条件写得准**  
`description` 不是宣传文案，而是路由线索。它要告诉 Claude“什么时候应该调我”，而不是“我有多强”。

2. **把长参考资料拆成旁路文件**  
Skill 目录里可以放 `examples.md`、`templates/`、`references/`。这样主会话不会一直背着这些内容，只有触发 Skill 时才读进来。

3. **用 `paths` 限制作用域**  
路径越准，误触发越少。做前端设计类 Skill，就别让它在 `infra/` 或 `migrations/` 目录里到处乱转。

4. **需要固定外壳时，直接用 `shell: powershell`**  
这对 Windows 用户尤其舒服。你可以让 Skill 里的命令示例和脚本片段天然走 PowerShell，不用再把对象管道硬翻译成 Bash。

5. **把“不需要模型自由发挥”的 Skill 关紧一点**  
像 changelog、依赖审计、发布检查这类任务，我会更倾向于限制工具、缩小路径，必要时直接把它写成接近流程脚本的样子。

:::tip[我的判断标准]
如果一个任务你已经在脑子里形成了“先看 A，再看 B，最后按 C 格式输出”的顺序，那它就很适合被写成 Skill。
:::

### 2.5 Windows / PowerShell 用户多看一眼

2026 年 3 月底，Claude Code 给 Windows 加上了**原生 PowerShell 工具预览**。要启用它，可以在 `settings.json` 里加：

```json
{
  "env": {
    "CLAUDE_CODE_USE_POWERSHELL_TOOL": "1"
  }
}
```

这件事的意义不只是“能跑 PowerShell”，而是：

- Windows 路径终于不用老是绕 Git Bash 翻译
- 管道对象、`Get-ChildItem`、`Select-String` 这些原生命令更自然
- 写 Skill 和 Hook 时，Windows 项目的表达成本明显下降

不过它截至 **2026 年 4 月**仍然还是预览能力，自动模式、profile 加载和沙箱行为都还有边界，团队里如果是混合环境，最好还是把关键流程写得更显式一点。

---

## 3. MCP：别再把它当成“更多工具”

MCP 最容易被误解的地方，在于很多人只看到“Claude 能多调几个函数”，却没看到它真正解决的是**外部上下文的接入方式**。

我对 MCP 的理解是：

> 它不是工具市场，而是 Claude Code 接入 GitHub、浏览器、文档、数据库、工单和内部平台的统一总线。

### 3.1 2026 年这套 MCP 配法，和很多旧文已经不同了

最重要的变化是：**MCP 服务器定义不该再一股脑塞进 `settings.json`。**

现在更清楚的做法是：

- **项目共享配置**：放在仓库根目录的 `.mcp.json`
- **用户级私有配置**：放在 `~/.claude.json`
- **本地项目私有配置**：放在项目的 `.claude.json`

而 `settings.json` 更像是**策略层**，比如：

- 允许启用哪些项目级 MCP server
- 是否默认启用 `.mcp.json` 里的 server
- 权限系统如何约束 MCP 工具

这和旧版本那种“`settings.json` 既是服务器目录，又是权限配置，又是运行时偏好”的思路，已经明显不一样了。

### 3.2 我更推荐的 `.mcp.json` 长这样

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

这套组合很朴素，但很好用：

- `github` 解决 issue、PR、review、release 和代码上下文
- `playwright` 解决页面验证、交互回归和截图

如果你的项目再接一个内部文档库、Sentry 或数据库，Claude 基本就能自己把“看代码 + 看错误 + 看页面 + 看工单”串起来了。

### 3.3 MCP 里最值钱的，常常不是 tool，而是 resource 和 prompt

很多人配完 MCP 以后，只盯着 `tool` 看，其实有点亏。

MCP 一般能暴露三类东西：

- **Tools**：可执行动作
- **Resources**：可直接拉进上下文的结构化材料
- **Prompts**：可复用的命令入口

这意味着一个好的 MCP server，不只是“让 Claude 点按钮”，而是能把：

- GitHub issue
- 设计规范
- 数据表定义
- 运维 runbook
- 内部接口文档

都变成 Claude 可以**稳定引用**的上下文对象。

这才是 MCP 最强的地方。它把“我去另一个系统里查一眼再回来”变成了“这个系统本来就在我的上下文总线上”。

### 3.4 Tool Search 解决的是上下文膨胀，不只是性能

MCP server 一多，上下文爆炸是迟早的事。Claude Code 现在的做法非常务实：**先只带轻量描述，真正要调用时再按需展开 schema**。

![Claude Code loading flow](/images/posts/claude-code-loading-flow.svg)

这也是为什么我现在不太担心“装太多 MCP 会不会把上下文吃满”。只要你的服务器支持得好，真正的成本主要发生在**实际用到那几个工具**上，而不是启动时全背进来。

但这里有个很现实的坑，国内用户尤其容易踩：

如果你走的是第三方 `ANTHROPIC_BASE_URL`，**MCP Tool Search 往往默认会被关掉**。原因不是 Claude Code 小气，而是有些代理层根本不透传 `tool_reference`。这时你只有在确认代理完全兼容之后，再手动开 `ENABLE_TOOL_SEARCH=true` 才稳。

### 3.5 还有两个值得记住的小点

1. **优先新 server 的 HTTP transport，SSE 已经是旧路子了**  
如果你现在还在照着旧教程新配一堆 SSE server，后面迟早要回头改。

2. **Claude Code 本身也能反过来当 MCP server**  
如果你想让别的客户端复用 Claude Code 的能力，可以直接用 `claude mcp serve`。这招很适合把 Claude Code 当作“本地智能中枢”，再接到桌面端、IDE 或其他代理框架上。

---

## 4. Hooks 与权限：把“最好这样做”变成“必须这样做”

如果说 Skill 负责方法论，MCP 负责外部世界，那么 Hook 和权限负责的就是**工程秩序**。

这两层不性感，但极其重要。

### 4.1 Hook 最大的价值，是把提示词做不到的事做实

提示词只能“建议”Claude 这么做，Hook 才能**保证**某个动作一定发生。

目前这套机制已经不只是一句 shell 命令那么简单了。你可以用：

- `command`
- `prompt`
- `agent`
- `http`
- `mcp_tool`

来响应不同生命周期事件。常用的触发点依然是：

- `PreToolUse`
- `PostToolUse`
- `PostToolUseFailure`
- `Stop`

我最常见的分工是：

- **PreToolUse** 拦危险命令、限制高风险路径
- **PostToolUse** 做格式化、lint、变更摘要
- **Stop** 做收尾检查和通知

### 4.2 一个够用的项目级 Hook 配置

下面这套不花哨，但实战里很顶用：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "if ($env:TOOL_INPUT -match 'git push --force|rm -rf|git reset --hard') { Write-Error 'Blocked dangerous command'; exit 2 }"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "pnpm lint"
          }
        ]
      }
    ]
  }
}
```

重点不是命令本身，而是思路：

- 危险动作在入口拦住
- 低成本的质量检查在写完后自动跑
- 把“每次都得记得做”的事情，降级成机器默认完成

### 4.3 权限别只会开 `bypass`

Claude Code 这套权限系统，真正好用的地方是它可以把规则收敛成**项目策略**。我的基本原则一直没变：

- **本地可回滚操作**尽量自动化
- **远程不可逆操作**尽量保守

一个更靠谱的起点是：

```json
{
  "permissions": {
    "defaultMode": "normal",
    "allow": [
      "Read",
      "Edit",
      "Glob",
      "Grep",
      "Bash(git status)",
      "Bash(pnpm test *)",
      "Bash(pnpm build *)",
      "mcp__github__*"
    ],
    "deny": [
      "Bash(git push --force *)",
      "Bash(rm -rf *)",
      "Read(**/.env)"
    ]
  }
}
```

这里我有两个经验：

1. **永远先写 deny，再考虑 allow**  
因为 deny 的收益是立刻可见的，尤其对团队协作和新成员最友好。

2. **别把远程能力默认全放开**  
GitHub、CI、云平台和生产数据库这类 MCP server，权限一定要单独看。

顺便提一句，Claude Code 在 2026 年 3 月还加了一个 **`auto` 模式** 预览，让分类器帮你吃掉一部分低风险确认。这个模式对老项目提速很明显，但我不建议你在陌生仓库里一上来就开到底。

---

## 5. 我现在更推荐的配置结构

如果你让我今天从零给一个中型项目配 Claude Code，我大概会这样摆：

```text
.claude/
├── CLAUDE.md
├── settings.json
├── settings.local.json
├── skills/
│   ├── release-check/
│   │   ├── SKILL.md
│   │   └── checklist.md
│   └── docs-sync/
│       ├── SKILL.md
│       └── template.md
└── agents/
    └── code-reviewer.md

.mcp.json
```

我的分层原则很简单：

- `CLAUDE.md` 放项目事实和约束
- `.claude/settings.json` 放团队共享策略
- `.claude/settings.local.json` 放个人偏好和本地实验
- `.mcp.json` 放项目愿意共享的外部系统连接
- `skills/` 放团队会反复执行的任务方法

### 5.1 一个比较稳的 `.claude/settings.json`

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "forceLoginMethod": "console",
  "permissions": {
    "defaultMode": "normal",
    "allow": [
      "Read",
      "Edit",
      "Glob",
      "Grep",
      "Bash(git status)",
      "Bash(pnpm test *)",
      "Bash(pnpm build *)",
      "mcp__github__*",
      "mcp__playwright__*"
    ],
    "deny": [
      "Bash(git push --force *)",
      "Bash(rm -rf *)",
      "Read(**/.env)"
    ]
  },
  "env": {
    "CLAUDE_CODE_USE_POWERSHELL_TOOL": "1"
  },
  "enabledMcpjsonServers": ["github", "playwright"]
}
```

这里有两个细节很值得说：

- 如果你走 **Claude Console / API 计费**，`forceLoginMethod` 的最新值是 `console`，不是很多旧教程里还在写的 `api-key`
- `enabledMcpjsonServers` 这种配置是**策略开关**，不是 server 定义本身；server 定义还是该放到 `.mcp.json`

### 5.2 如果你在用第三方 API 代理

这类环境建议额外记住三件事：

1. **先确认代理是否完整支持 `tool_reference`**  
不支持的话，MCP Tool Search 会有兼容性问题。

2. **模型别名覆盖要一次配清楚**  
尤其是 Opus / Sonnet / Haiku 三档默认模型，如果代理层做了重映射，最好统一写明。

3. **不要把密钥塞进共享仓库**  
项目共享的 `settings.json` 放策略，本地凭据放 `settings.local.json` 或用户目录。

### 5.3 文章之外，我自己的一个土办法

我现在会定期检查一次 `CLAUDE.md`、Skill 和 Hook 之间有没有职责漂移。判断方法很粗暴：

- 如果一条规则每次会话都必须知道，它应该进 `CLAUDE.md`
- 如果一套流程只有某类任务才需要，它应该进 Skill
- 如果某个动作必须自动发生，它不该停留在文字说明里，而该进 Hook

这一轮梳理做完，Claude Code 的“乱说”和“忘做”会明显少很多。

---

## 6. 什么时候该从 `.claude` 升级成 Plugin

对于单个项目来说，`.claude/` 基本已经够用了。

但一旦出现下面这些情况，我就会考虑升成 Plugin：

- 这套 Skill / Hook / MCP 你想在多个仓库复用
- 你想给团队统一发版本，而不是复制粘贴目录
- 你想把能力做成有名字、可安装、可升级的组件

Plugin 的核心价值不是“更高级”，而是**更适合分发**。

一个最小可用结构大概像这样：

```text
my-team-plugin/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── release-check/
│       └── SKILL.md
├── hooks/
│   └── hooks.json
└── .mcp.json
```

安装后，命令通常会带命名空间，比如：

```text
/my-team-plugin:release-check
```

这对团队协作很重要，因为它解决了两个老问题：

- 不同项目的命令名冲突
- 每个人本地改一套、最后谁也不知道谁在跑什么

所以我自己的判断很直接：

- **只在一个仓库里用**：留在 `.claude/`
- **准备跨仓库共享**：尽快 Plugin 化

---

## 总结

如果你已经能熟练用 Claude Code 修 Bug、写功能、跑命令，那下一阶段真正拉开差距的，就不是“会不会下 prompt”，而是你有没有把扩展层理顺。

我现在的结论是：

- `CLAUDE.md` 负责项目事实，不负责所有流程
- Skill 负责高频工作流，是最值得投入的一层
- MCP 的价值在外部上下文接入，不只是更多工具
- Hook 和权限负责把口头约定变成工程约束
- 需要跨项目复用时，再把这套东西升级成 Plugin

如果你愿意，我建议下一步就做两件事：

1. 把你当前仓库里那些“总要重复提醒 Claude 的流程”先抽一个出来，做成第一个 Skill  
2. 把 issue、页面验证或内部文档接进来，认真配一个能长期用的 `.mcp.json`

这两步做完之后，你会明显感觉到：Claude Code 不再只是“回答问题”，而是真的开始进入你的开发系统。

## 延伸阅读

- [Claude Code 配置文档](https://code.claude.com/docs/en/configuration)
- [Claude Code Skills / Slash Commands](https://code.claude.com/docs/en/slash-commands)
- [Claude Code MCP 文档](https://code.claude.com/docs/en/mcp)
- [Claude Code Hooks 文档](https://code.claude.com/docs/en/hooks)
- [Claude Code Plugins 文档](https://code.claude.com/docs/en/plugins)
- [Claude Code What’s New](https://code.claude.com/docs/en/whats-new)
