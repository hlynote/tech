---
title: "多端项目从 0 到 1 落地手册（OpenSpec + LLM + Harness）"
date: "2026-04-20T10:00:00+08:00"
summary: "覆盖需求、架构、开发、测试、发布和复盘的端到端项目执行步骤。"
category: "AI"
slug: "project-0-to-1-openspec-monorepo-playbook"
tags:
  - OpenSpec
  - Monorepo
  - LLM
  - Harness
  - Playbook
draft: false
---

# 多端项目从 0 到 1 落地手册（OpenSpec + LLM + Harness）

本文把前面讨论的内容整理为一套可以直接执行的步骤，适用于包含后台管理、H5、App、小程序和后端 API 的项目。

## 阶段 0：确定目标与边界（第 1 天）

目标是避免“需求不清直接开工”。

- 明确业务目标（例如：注册转化提升 10%）
- 明确影响范围（admin/h5/app/mp/api）
- 明确非目标（本期不做的内容）
- 明确上线时间与风险级别

产出：

- 一页项目目标说明（可写入 `proposal.md`）

## 阶段 1：需求结构化（第 1-2 天）

每个需求（change）固定 4 个文件：

- `proposal.md`：为什么做（目标、范围、收益）
- `spec.md`：做成什么样（用户故事、验收标准、边界场景）
- `design.md`：技术方案（架构、接口、数据、风险）
- `tasks.md`：任务拆解（负责人、顺序、依赖）

需求粒度建议：

- 1 个需求在 1-2 周内可交付
- 3-8 个任务
- 单个任务 0.5-1 天

## 阶段 2：技术蓝图与仓库初始化（第 2-3 天）

推荐 Monorepo 起步，先统一工程底座。

建议目录：

- `apps/admin`
- `apps/h5`
- `apps/mp-wechat`
- `apps/mobile`
- `services/api`
- `packages/types`
- `packages/sdk`
- `packages/utils`
- `openspec/changes`

关键约束：

- API First（先契约后实现）
- 所有端统一走 `packages/sdk`
- 领域类型统一来自 `packages/types`

## 阶段 3：开发执行（第 1 周开始循环）

执行原则：

1. 先写/更新 OpenSpec 变更
2. LLM 按 `tasks.md` 生成代码与测试草稿
3. 人工审查关键路径（鉴权、支付、风控、数据安全）
4. 合并前必须通过测试门禁

建议最小门禁：

- lint 通过
- 单元测试通过
- 关键链路集成测试通过
- 至少 1 名人类 reviewer 审批

## 阶段 4：CI/CD 拆分与发布（第 1-2 周）

按目录拆分流水线，避免全量构建：

- 改 `apps/h5/**` 只跑 h5 job
- 改 `services/api/**` 跑 api job + contract check
- 改 `packages/sdk/**` 或 `packages/types/**` 触发多端兼容检查

发布策略建议：

- 前端端独立发布
- API 灰度发布 + 自动回滚阈值
- 高风险需求启用人工审批（TL/SRE/SEC）

## 阶段 5：验收与观测（每次发布后）

验收必须可测，避免模糊描述。

建议使用 Given/When/Then：

- Given 已登录用户
- When 在 H5 提交订单
- Then 订单在 2 秒内创建成功并返回订单号

上线后观测：

- 错误率
- 核心转化率
- 关键接口延迟
- 崩溃率（移动端）

## 阶段 6：复盘与迭代（每周固定）

每次版本都做轻量复盘：

- 目标达成情况
- 偏差与根因
- 下轮改进项（Owner + 截止时间）

复盘结果回写到 OpenSpec，形成下一个 change 输入。

## 推荐角色分工（小团队）

- PO：需求与优先级拍板
- TL：技术方案与风险拍板
- DEV：实现与测试
- QA：验收与回归（可兼职）
- SRE：发布与回滚（可兼职）
- LLM：生成与加速

原则：

- LLM 不担任最终责任人
- 关键决策必须有人拍板

## 30 天落地节奏（建议）

- 第 1 周：需求模板 + Monorepo 初始化 + API 契约
- 第 2 周：首个需求全链路跑通（OpenSpec -> 开发 -> 发布）
- 第 3 周：补齐 CI 拆分、质量门禁、观测指标
- 第 4 周：沉淀团队 SOP 与复盘机制

## 最小可执行清单

- [ ] 已有统一需求模板（proposal/spec/design/tasks）
- [ ] 已有 Monorepo 基础目录
- [ ] 已有 API 契约与 SDK 生成流程
- [ ] 已有按目录触发的 CI
- [ ] 已有发布审批与回滚机制
- [ ] 已有复盘回写机制

做到以上 6 项，就已经是一个可持续迭代的“0 到 1 完整工程体系”。
