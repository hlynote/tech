---
title: "OpenSpec + Harness + LLM 的人机协同流程"
date: "2026-04-20T09:20:00+08:00"
summary: "在 AI 驱动研发中加入人的决策与审批，形成可落地的协同闭环。"
category: "AI"
slug: "openspec-harness-llm-human-in-loop"
tags:
  - OpenSpec
  - Harness
  - LLM
  - Human in the Loop
draft: false
---

# OpenSpec + Harness + LLM 的人机协同流程

要让 AI 研发流程真正可落地，关键不是“全自动”，而是把人的角色明确放在关键决策点。  
下面是一条可执行的人机协同链路。

## 1. 需求定义（人主导）

- **人**：明确业务目标、范围、优先级、验收标准
- **OpenSpec**：沉淀 `proposal/spec/design/tasks`
- **LLM**：补全边界场景、风险清单、测试建议

## 2. 方案评审（人拍板）

- **人**：做技术选型、架构权衡、风险接受决策
- **LLM**：提供备选方案与 trade-off 分析
- **OpenSpec**：记录决策过程，确保可追踪

## 3. 实现开发（LLM 执行 + 人把关）

- **LLM**：按 tasks 生成代码、测试和文档草稿
- **人**：进行代码评审，重点检查关键模块与复杂逻辑
- **OpenSpec**：核对实现是否偏离原始规格

## 4. 质量保障（人机共测）

- **LLM**：生成单元测试、集成测试、回归用例
- **人**：补充高风险业务场景、安全与探索式测试
- **Harness**：执行 CI、质量门禁和策略检查

## 5. 发布上线（平台执行 + 人审批）

- **Harness**：执行构建、部署、灰度放量与回滚策略
- **人**：审批发布窗口、判断异常信号、控制放量节奏

## 6. 反馈闭环（人主导）

- **人**：评估业务指标、用户反馈、线上事件
- **LLM**：生成复盘初稿与改进建议
- **OpenSpec**：将改进项回灌为下一轮变更输入

## 角色边界

- **OpenSpec**：保证方向正确（做对事）
- **LLM**：提升执行效率（把事做快）
- **Harness**：保障交付稳定（把事做稳）
- **人**：承担最终决策与责任闭环（把事做成）

---

## 系列导航

- 上一篇：[OpenSpec + Harness + LLM 能覆盖完整开发流程吗](./openspec-harness-llm-full-flow.md)
