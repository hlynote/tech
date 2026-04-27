---
title: "iOS Combine 面试题（基于 PartyClub 项目）"
date: "2026-04-27T17:37:00+08:00"
summary: "结合 PartyClub 项目代码场景整理 Combine 高频面试题、追问方向与回答框架。"
category: "iOS"
slug: "partyclub-ios-combine-interview-questions"
tags:
  - iOS
  - Combine
  - Interview
  - PartyClub
draft: false
---

# iOS Combine 面试题（基于 PartyClub 项目）

本文档基于当前项目（重点是 `PCVoxing`、`PCShared`）的实际代码场景，整理 iOS 面试中常见的 Combine 题目与追问方向。

## 1. 基础认知题

### 1.1 Combine 的三要素是什么？
- `Publisher`：负责发出数据流
- `Subscriber`：负责接收数据流
- `Subscription`：连接发布者与订阅者，管理生命周期与取消

追问：
- `AnyCancellable` 在这个体系里扮演什么角色？
- 为什么通常要把 `AnyCancellable` 存到 `Set<AnyCancellable>`？

### 1.2 `@Published` 的行为是什么？
- 标记在 `ObservableObject` 属性上，属性变化会自动发出事件。
- 在 MVVM 中常用于驱动 UI 状态刷新。

结合项目：
- `PCBaseViewModel` 使用 `ObservableObject`，子类通过 `@Published` 暴露状态（例如登录页面中的输入和校验状态）。

追问：
- `@Published` 会不会发初始值？
- `@Published` 和 `CurrentValueSubject` 的差异是什么？

---

## 2. 结合项目的高频题

### 2.1 为什么登录校验用 `CombineLatest`？
场景：`PCVoxingAccountLoginViewModel` 中基于 `userId`、`password` 两个输入动态计算 `isValid`。

可回答点：
- `CombineLatest` 适合“任一输入变化即重新计算整体状态”
- 表单有效性本质上是多个输入的实时组合
- 若用 `zip` 会要求成对事件，交互上不符合输入框实时校验

追问：
- `CombineLatest` 与 `zip`、`merge` 的区别？

### 2.2 `assign(to: &$isValid)` 和 `sink` 有什么区别？
可回答点：
- `assign` 更适合“把上游值直接绑定到属性”
- `sink` 更灵活，适合包含副作用、分支逻辑、日志埋点等场景
- `assign` 代码更简洁，可读性更高

追问：
- `assign(to:on:)` 和 `assign(to: &$x)` 的生命周期差异？

### 2.3 聊天消息为什么常用 `CurrentValueSubject`？
场景：`PCVoxingService+PublicChat` 里维护 `publicChatMessagesPublisher`、`all/chat/gift/event` 多个消息流。

可回答点：
- 新订阅者进入时需要“立刻拿到当前快照”，`CurrentValueSubject` 符合这个需求
- 聊天列表、分 tab 场景依赖“当前状态 + 后续增量”
- `PassthroughSubject` 更像事件总线，不保存当前值

追问：
- 如果是“纯事件通知”（比如 toast），是否更适合 `PassthroughSubject`？

### 2.4 多个 Publisher（all/chat/gift/event）设计的优缺点？
优点：
- 每个 UI 区域可按需订阅，减少无效渲染
- 逻辑职责更清晰，调试更直观

风险：
- 多份状态维护容易出现一致性问题
- 清理、截断（如上限 500 条）逻辑要保证多流同步

追问：
- 如何在扩展消息类型时避免漏更新？
- 如何设计统一入口减少重复逻辑？

---

## 3. 线程与调度题

### 3.1 `receive(on:)` 和 `subscribe(on:)` 区别？
- `subscribe(on:)`：决定上游订阅和生产执行上下文
- `receive(on:)`：决定下游接收回调执行上下文

面试回答建议：
- 涉及 UI 更新时，下游最终要切到主线程
- 网络/解析可放后台，UI 合流在主线程

### 3.2 `send` 是否线程安全？如何避免竞态？
结合聊天室场景可回答：
- 若消息来自 WebSocket、多线程回调，需保证状态更新路径一致
- 常见策略：串行队列封装写入，或统一在主线程更新共享状态

---

## 4. 内存管理与生命周期题

### 4.1 为什么必须持有 `AnyCancellable`？
- 不持有会导致订阅立即释放，流不再回调
- 在 ViewModel 中通常由 `Set<AnyCancellable>` 管理

### 4.2 如何避免循环引用？
- `sink` 闭包里涉及 `self` 常用 `[weak self]`
- 当闭包生命周期受控且不形成环时可不写，但要能说明理由

### 4.3 取消时机怎么设计？
- 页面销毁自动释放（容器释放）
- 手动取消（例如用户离开频道、切换业务上下文）

---

## 5. Combine 与 Swift Concurrency 混用题

场景：项目中存在 `@Published` + `Task` 的组合。

面试常问：
- 为什么这里用 `Task` 发起异步请求而不是全部用 Combine 链路？
- 混用时如何保证状态只在主线程更新？
- 如何避免多个并发请求导致旧结果覆盖新结果？

可回答点：
- Combine 擅长状态流组合，Concurrency 擅长异步请求表达
- 关键在于边界清晰：网络层 async/await，状态层 Combine 驱动 UI

---

## 6. 常见手写题（贴近项目）

1. 登录按钮可点击状态流  
输入：`userId`、`password`、`isLoading`  
输出：`isLoginEnabled`

2. 公屏消息分流  
输入：总消息流  
输出：`all/chat/gift/event` 四路流，保证顺序与容量裁剪一致

3. 搜索防抖  
输入：文本输入  
要求：`debounce` + `removeDuplicates` + 自动取消上一次请求

4. 错误重试  
要求：指数退避（1s/2s/4s）最多 3 次，最终失败再回传 UI

---

## 7. 面试官高频追问清单（速记）

- `CombineLatest`、`zip`、`merge` 何时用？
- `CurrentValueSubject` 和 `PassthroughSubject` 的业务边界？
- `eraseToAnyPublisher()` 为什么在模块化工程有价值？
- 如何做 Combine 单元测试（时序、取消、重试）？
- 如何定位“重复订阅导致多次回调”问题？
- 如何评估高频流（聊天室/IM）下的性能风险？

---

## 8. 回答模板（30 秒版）

可以按下面结构回答任意 Combine 业务题：

1. **先讲业务目标**：这个流要解决什么 UI 或状态问题  
2. **再讲操作符选择**：为什么用这个操作符而不是其他  
3. **补充线程与内存**：主线程更新、取消时机、循环引用  
4. **最后讲工程化**：可测试性、可扩展性、边界清晰

这样回答通常更像“有项目经验的工程师”，而不是只背 API。
