---
title: "iOS Swift Concurrency 面试题（高频版）"
date: "2026-04-29T00:43:00+08:00"
summary: "覆盖 Swift 并发高频面试问题与追问方向，包含 async/await、Task、Actor、Sendable、取消语义与架构落地。"
category: "iOS"
slug: "ios-swift-concurrency-interview-questions"
tags:
  - iOS
  - Swift
  - Concurrency
  - Interview
draft: false
---

# iOS Swift Concurrency 面试题（高频版）

本文整理 iOS 面试里关于 Swift Concurrency 的高频问题，并给出可直接复述的回答骨架。

配套阅读：`ios-swift-concurrency-architecture-and-structure.md`

## 1. 基础认知题

### 1.1 Swift 并发模型的核心组成是什么？

可回答点：

- `async/await`：提升异步代码可读性
- `Task`：并发执行单元，支持优先级与取消
- Structured Concurrency：父子任务生命周期可控
- `actor`：共享可变状态隔离，避免数据竞争
- `Sendable`：跨并发边界传值安全契约

追问：

- 为什么说 Swift 并发是“语言层并发安全”而不是库层方案？

### 1.2 `async/await` 和传统回调相比，优势是什么？

可回答点：

- 代码线性，错误处理统一走 `throws`
- 减少回调嵌套与状态散落
- 更容易表达取消与超时策略

追问：

- 如何把回调 API 迁移成 `async` API（`withCheckedContinuation`）？

### 1.3 `await` 会阻塞线程吗？

标准回答：

- 不会。`await` 是任务挂起（suspend）点，不是线程阻塞。
- 挂起期间线程可去执行其他任务，恢复后继续执行后续代码。

---

## 2. Task 与结构化并发

### 2.1 `Task {}` 和 `Task.detached {}` 区别？

可回答点：

- `Task {}` 继承当前上下文（优先级、任务局部值、actor 语义）
- `Task.detached {}` 不继承上下文，独立执行，使用门槛更高
- 日常优先结构化并发，慎用 detached

追问：

- 什么场景必须用 `detached`？

### 2.2 `async let` 和 `TaskGroup` 怎么选？

可回答点：

- `async let`：并行任务数量已知，代码最简洁
- `withTaskGroup`：子任务数量动态，适合批量并发
- 两者都属于 Structured Concurrency，生命周期受作用域约束

### 2.3 Structured Concurrency 的价值是什么？

可回答点：

- 任务有父子关系，避免“悬空任务”
- 错误与取消沿任务树传播，行为可预测
- 退出作用域前必须收拢子任务，资源管理更稳

---

## 3. 取消与错误传播

### 3.1 Swift 并发的取消是强制的吗？

标准回答：

- 不是，Swift 是协作式取消。
- `cancel()` 发出取消信号，任务需要主动检查并响应（如 `Task.isCancelled` / `Task.checkCancellation()`）。

### 3.2 如果父任务取消，子任务会怎样？

可回答点：

- 结构化子任务会收到取消信号
- 子任务是否立即停止，取决于子任务是否协作检查取消

### 3.3 `try await` 中错误如何传播？

可回答点：

- 错误可沿调用栈向上传播
- 在并发聚合场景中，要明确“失败策略”：快速失败、部分容错、降级返回

追问：

- 你如何实现“一个请求失败不影响其他请求”的并发聚合？

---

## 4. Actor 与数据隔离

### 4.1 为什么需要 `actor`？

可回答点：

- 用语言机制隔离共享可变状态，减少手写锁
- 保证同一 actor 内状态访问串行化
- 降低 data race 风险，提升可维护性

### 4.2 `actor` 就等于“不会有并发问题”吗？

标准回答：

- 不是。`actor` 解决的是数据竞争，不自动解决业务时序问题。
- 仍需关注 actor reentrancy（重入）带来的逻辑顺序变化。

### 4.3 `@MainActor` 的作用是什么？

可回答点：

- 声明代码应在主执行上下文语义下运行
- 常用于 ViewModel/UI 状态更新边界
- 避免后台线程直接触碰 UI

追问：

- 为什么不能把所有代码都标成 `@MainActor`？

---

## 5. Sendable 与类型安全

### 5.1 `Sendable` 是什么？

可回答点：

- 表示类型可安全跨并发域传递
- 值类型通常更容易满足 `Sendable`
- 引用类型要确保线程安全语义，否则会触发并发检查告警

### 5.2 面试里如何解释“严格并发检查”？

可回答点：

- 编译器在跨 actor / task 边界时检查不安全共享
- 目标是把并发 bug 前移到编译期暴露

---

## 6. 架构落地题（高频）

### 6.1 在 iOS 项目中如何分层使用 Swift 并发？

可回答点：

- ViewModel（常 `@MainActor`）：管理页面任务与状态
- UseCase：做并发编排（`async let` / `TaskGroup`）
- Repository：提供 `async throws` IO 接口
- Actor：承载共享状态（缓存、会话、令牌）

一句话模板：

- “并发编排放 UseCase，状态隔离进 Actor，UI 收敛到 MainActor。”

### 6.2 你如何避免重复请求和过期结果覆盖？

可回答点：

- 保存当前查询任务引用，新请求到来先取消旧任务
- 在回写 UI 前检查取消状态
- 必要时加请求标识比对，只接受最新请求结果

### 6.3 从 GCD 迁移到 Swift 并发，你的策略是什么？

可回答点：

- 先在边界层把回调 API 包成 `async`
- 新功能优先用 Swift Concurrency，旧逻辑逐步替换
- 用编译器并发检查与测试兜底，避免一次性大迁移风险

---

## 7. 代码题常见问法

### 7.1 写一个并发拉取两个接口并合并结果

答题要点：

- 使用 `async let` 并发执行
- `try await` 一次性收敛结果
- 补充错误策略（全失败 or 部分降级）

### 7.2 写一个支持取消的搜索请求

答题要点：

- ViewModel 持有 `searchTask: Task<Void, Never>?`
- 新输入到来取消旧任务，重建新任务
- 捕获 `CancellationError`，避免错误弹窗污染体验

### 7.3 用 `actor` 改造线程不安全缓存

答题要点：

- 将字典状态迁移到 `CacheActor`
- 暴露异步 `get/set/remove` 接口
- 调用方通过 `await` 访问，去掉锁散落

---

## 8. 高频追问清单（面试官常深挖）

- actor reentrancy 是什么？如何规避时序 bug？
- `nonisolated` 用在什么场景？风险是什么？
- `TaskLocal` 适合承载哪些上下文信息？
- 如何做超时控制（`withThrowingTaskGroup` + sleep race）？
- 如何在并发链路中做日志追踪和指标埋点？

---

## 9. 60 秒总结模板（可背诵）

“Swift 并发模型核心是 `async/await`、`Task`、Structured Concurrency 和 `actor`。`async/await` 让异步代码线性可读，Structured Concurrency 让任务生命周期、错误和取消传播可控，`actor` 和 `Sendable` 把共享状态安全前置到语言与类型系统。工程落地上，我会把 UI 边界放在 `@MainActor` ViewModel，把并发编排放 UseCase，把共享缓存和会话放进 Actor，通过协作式取消和测试保证性能与正确性。”
