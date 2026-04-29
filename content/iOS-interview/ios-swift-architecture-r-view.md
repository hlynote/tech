---
title: "R（Reactive）视角下的 Swift 架构指南"
date: "2026-04-28T02:35:00+08:00"
summary: "面向 iOS 面试与项目落地的 Swift 架构设计指南，重点讲清 Reactive 思维下的分层、状态、依赖与演进。"
category: "iOS"
slug: "ios-swift-architecture-r-view"
tags:
  - iOS
  - Swift
  - Architecture
  - Reactive
draft: false
---

# R（Reactive）视角下的 Swift 架构指南

本文给出一套可以直接用于面试表达和工程落地的 Swift 架构框架。这里的 **R** 指的是 **Reactive（响应式）思维**：把业务看成“输入 -> 状态变换 -> 输出”的数据流系统。

## 1. 先回答：为什么要用 Reactive 视角谈架构

很多 iOS 项目的问题不在 API 不会用，而在于：

- 状态分散：同一状态在多个层重复维护
- 副作用失控：请求、缓存、埋点、跳转互相穿插
- 生命周期不清：页面销毁后仍有回调写状态

Reactive 视角的价值是把这些问题都“显式化”：

- 输入事件显式化（用户输入、网络回包、系统事件）
- 状态演进显式化（从 `idle -> loading -> success/failure`）
- 副作用边界显式化（在哪个层发起，在哪个层消费）

## 2. 推荐分层（可直接用于中大型 iOS 项目）

### 2.1 四层结构

- **View 层**：只关心渲染和转发用户动作，不做业务编排
- **ViewModel 层**：把输入转换成输出状态，是页面状态的单一可信来源
- **UseCase/Domain 层**：承载业务规则，组织多数据源和策略
- **Repository/Infra 层**：对接 API、DB、WebSocket、Cache

### 2.2 一条主线

统一遵循：

`Input -> Transform -> Output`

其中：

- `Input`：点击、输入、刷新、生命周期事件
- `Transform`：映射、过滤、组合、错误处理、调度
- `Output`：页面可直接绑定的状态（`isLoading`、`sections`、`error`）

## 3. 架构核心原则（面试高频）

### 3.1 单向数据流

任何 UI 变化都必须能追溯到输入事件和规则链路，避免“在任意位置 setState”。

### 3.2 单一可信来源（SSOT）

同一页面状态只维护一份，通常放在 ViewModel，避免 View/Service 各维护一份导致竞态覆盖。

### 3.3 边界类型稳定

模块间推荐暴露稳定契约（如 `AnyPublisher`、`Driver`、`Observable`），隐藏内部实现细节，支持内部重构而不破坏调用方。

### 3.4 副作用集中

网络请求、缓存写入、埋点上报、路由跳转不要散落在多个闭包里，应在明确边界层集中处理。

## 4. 在 Swift 中如何落地

### 4.1 ViewModel I/O 模式

建议把 ViewModel 设计成 `Input` 与 `Output`：

- `Input`：方法或流（`viewDidLoad`、`searchTextChanged`、`retryTapped`）
- `Output`：只读状态流（`items`、`emptyState`、`isRefreshing`、`toast`）

这样有三个好处：

- 易测：输入序列可控，输出可断言
- 易读：调用方知道“给什么，拿什么”
- 易演进：新增需求可通过扩展输入输出完成

### 4.2 状态建模优先于操作符堆叠

先定义状态机，再写响应式链路。例如：

- `idle -> validating -> ready`
- `ready -> loading -> success/failure`

如果先写一长串操作符，再反推状态，后期很容易不可维护。

### 4.3 错误分层

- Infra 错误：网络失败、解码失败、超时
- Domain 错误：统一映射成业务语义（如 `invalidCredential`）
- UI 错误：只关心展示策略（弹 Toast / Inline Error / Retry）

## 5. Reactive 架构下的“线程与生命周期”

### 5.1 线程边界

- 上游计算与 I/O 放后台
- 下游 UI 状态回写统一主线程

关键是“边界统一”，不是“所有代码都主线程”。

### 5.2 生命周期边界

每个订阅都要明确：

- 谁创建
- 谁持有
- 何时释放

这能显著降低幽灵订阅、重复回调、页面退出后写状态等问题。

## 6. 面试回答模板（30 秒）

当被问“你如何设计 Swift 架构”时可按这个顺序答：

1. 先讲分层：View / ViewModel / Domain / Infra  
2. 再讲主线：Input -> Transform -> Output  
3. 补充原则：单向数据流 + SSOT + 边界稳定  
4. 最后讲保障：线程边界、生命周期管理、可测试性

## 7. 常见误区

- 误区 1：把响应式当“语法技巧”，而不是状态建模方法  
- 误区 2：在 View 层拼过长链路，导致难测难维护  
- 误区 3：模块边界直接暴露内部实现类型，重构牵一发而动全身  
- 误区 4：没有取消策略，页面销毁后仍在消费流  

## 8. 一句话结论

Reactive 视角下的 Swift 架构，本质是在做三件事：  
**让状态可追踪，让副作用可控，让系统可演进。**
