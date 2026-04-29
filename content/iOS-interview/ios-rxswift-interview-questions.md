---
title: "iOS RxSwift 面试题（高频版）"
date: "2026-04-28T02:38:00+08:00"
summary: "覆盖 RxSwift 常见面试问题、追问方向与回答要点，包含操作符、线程、内存、架构与实战排障。"
category: "iOS"
slug: "ios-rxswift-interview-questions"
tags:
  - iOS
  - RxSwift
  - Interview
  - Architecture
draft: false
---

# iOS RxSwift 面试题（高频版）

本文整理 iOS 面试中最常见的 RxSwift 题目，并给出可直接复述的回答骨架。

## 1. 基础认知题

### 1.1 RxSwift 的核心是什么？

可回答点：

- 用可观察序列描述异步事件流
- 用操作符进行声明式组合与变换
- 用订阅消费结果，并通过 Dispose 管理生命周期

追问：

- 为什么 RxSwift 适合处理复杂页面状态？

### 1.2 `Observable`、`Single`、`Completable`、`Maybe` 的区别？

可回答点：

- `Observable`：0..N 个元素 + 完成/错误
- `Single`：要么成功一个元素，要么错误
- `Completable`：只关心完成或错误，不关心元素
- `Maybe`：0 或 1 个元素，再完成或错误

追问：

- 登录接口、上传接口、本地缓存写入分别更适合哪种 Trait？

### 1.3 `PublishSubject`、`BehaviorSubject`、`ReplaySubject` 差异？

可回答点：

- `PublishSubject`：不保留历史，仅转发订阅后的事件
- `BehaviorSubject`：保留最新值，新订阅先收到最新值
- `ReplaySubject`：按缓存策略回放历史事件

追问：

- 在表单状态和事件通知里分别怎么选？

---

## 2. 操作符与场景题

### 2.1 `flatMap` 和 `flatMapLatest` 区别？

可回答点：

- `flatMap`：保留所有内部序列并合并输出
- `flatMapLatest`：只保留最新内部序列，自动忽略旧请求结果

典型场景：

- 搜索联想优先用 `flatMapLatest`，避免旧请求覆盖新结果

### 2.2 `merge`、`zip`、`combineLatest` 怎么区分？

可回答点：

- `merge`：多路同类型流直接合并
- `zip`：按配对节奏输出
- `combineLatest`：任一路更新时输出最新组合

追问：

- 表单校验为什么常用 `combineLatest` 而不是 `zip`？

### 2.3 为什么常配 `debounce` + `distinctUntilChanged`？

可回答点：

- `debounce`：抑制高频输入，减少请求次数
- `distinctUntilChanged`：输入无变化时不重复触发

---

## 3. 线程与调度器题

### 3.1 `subscribeOn` 和 `observeOn`（或 `observe(on:)`）区别？

可回答点：

- `subscribeOn` 控制上游订阅与生产线程
- `observeOn/observe(on:)` 控制下游观察回调线程

面试表达建议：

- 网络/解析在后台执行，UI 绑定前切回主线程

### 3.2 常见 Scheduler 怎么选？

- `MainScheduler`：UI 更新
- `ConcurrentDispatchQueueScheduler`：并发计算或后台任务
- `SerialDispatchQueueScheduler`：串行化状态更新

---

## 4. 内存与生命周期题

### 4.1 为什么需要 `DisposeBag`？

可回答点：

- 订阅需要显式释放，不然会持续持有资源
- `DisposeBag` 随对象释放时自动 dispose，常用于 VC/VM 生命周期绑定

### 4.2 怎么避免循环引用？

可回答点：

- 在闭包中使用 `[weak self]`
- 明确订阅链路的持有关系，避免 self 强持有 bag，bag 持有订阅，订阅再强持有 self

### 4.3 `takeUntil`、`take(1)`、`disposed(by:)` 的使用边界？

可回答点：

- `disposed(by:)`：通用生命周期管理
- `takeUntil`：由另一个结束信号驱动取消
- `take(1)`：只消费一次场景（例如首个有效回包）

---

## 5. RxCocoa 高频题

### 5.1 `Driver` 的特性是什么？

可回答点：

- 不会 error out
- 主线程观察
- 共享订阅副作用（`share(replay:1, scope:.whileConnected)`语义）

适用场景：

- UI 状态流（列表数据、按钮是否可用、标题文案）

### 5.2 `Signal` 与 `Driver` 的区别？

可回答点：

- 都面向 UI 且不出错
- `Signal` 不回放最新值，适合一次性事件（toast、导航）
- `Driver` 会共享并可提供最近状态，适合状态绑定

---

## 6. 架构与工程化题

### 6.1 RxSwift 在 MVVM 中怎么设计输入输出？

可回答点：

- Input：用户行为流（点击、输入、下拉刷新）
- Output：界面状态流（loading、dataSource、error、empty）
- View 只做绑定，业务规则放 ViewModel/UseCase

### 6.2 为什么要做类型擦除和模块边界隔离？

可回答点：

- 对外暴露稳定协议/trait，隐藏内部操作符细节
- 降低跨模块耦合，支持内部自由重构

### 6.3 如何做 Rx 链路可测试？

可回答点：

- 用 `TestScheduler` 驱动虚拟时间
- 给定输入事件序列，断言输出事件序列
- 覆盖错误、重试、取消、超时分支

---

## 7. 排障与性能题

### 7.1 出现重复请求或重复回调怎么查？

排查思路：

- 是否重复绑定（`bind`/`subscribe` 被多次调用）
- 是否缺失 `share` 导致多订阅触发多次副作用
- 是否页面重入时未清理旧订阅

### 7.2 高频流导致卡顿怎么优化？

可回答点：

- 限流：`throttle`/`debounce`
- 合并：减少细粒度 UI 刷新次数
- 线程：重计算放后台，主线程只做最小 UI 更新

### 7.3 `share(replay:scope:)` 的风险是什么？

可回答点：

- `replay` 过大可能增加内存压力
- 不恰当共享可能引入脏数据或生命周期不符合预期

---

## 8. 手写题（常考）

1. 搜索框联想：`debounce + distinctUntilChanged + flatMapLatest`  
2. 登录按钮状态：`combineLatest(username, password, loading)`  
3. 下拉刷新 + 分页加载合流：区分首刷/加载更多状态  
4. 错误重试：最多三次指数退避，最终错误抛给 UI  

---

## 9. 30 秒回答模板

被问 RxSwift 实战题时，用这个结构回答：

1. 业务目标：这条流要解决什么问题  
2. 操作符选择：为什么是它而不是替代项  
3. 线程与生命周期：主线程回写 + 释放策略  
4. 工程化：可测试、可扩展、可观测

这套结构能明显拉开“会 API”和“有架构思维”的差距。
