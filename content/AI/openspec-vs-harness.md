---
title: "OpenSpec 和 Harness 有什么区别"
date: "2026-04-20T09:00:00+08:00"
summary: "从定位、适用阶段和协作方式解释 OpenSpec 与 Harness 的核心差异。"
category: "AI"
slug: "openspec-vs-harness"
tags:
  - OpenSpec
  - Harness
  - AI
  - DevOps
draft: false
---

# OpenSpec 和 Harness 有什么区别

很多人第一次接触 OpenSpec 时，会把它和 Harness 放在同一类工具里比较。  
实际上它们**不是替代关系**，而是服务于研发链路的不同环节。

## 核心定位

- **OpenSpec**
  - 核心是规范驱动（Spec-driven）开发流程
  - 强调先定义需求、设计和任务，再让 AI 执行实现
  - 适合解决“AI 写代码不稳定、需求易漂移”的问题

- **Harness**
  - 核心是工程交付与发布治理平台
  - 强调 CI/CD、环境管理、发布策略、回滚与可观测性
  - 适合解决“如何稳定构建、测试、发布到生产”的问题

## 它们分别回答什么问题

- OpenSpec 更关注：**做什么、为什么做、如何拆解任务**
- Harness 更关注：**怎么安全高效地交付上线**

## 实际落地怎么配合

一个常见组合是：

1. 在 OpenSpec 中完成需求、设计和任务拆解
2. 用 AI 编程助手按任务实现代码
3. 通过 Harness 跑 CI/CD、灰度发布和回滚策略

这样可以形成从“需求定义”到“上线交付”的连续链路，而不是只优化单一环节。

---

## 系列导航

- 下一篇：[OpenSpec + Harness + LLM 能覆盖完整开发流程吗](./openspec-harness-llm-full-flow.md)
