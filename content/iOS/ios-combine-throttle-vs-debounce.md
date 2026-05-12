---
title: "Combine 中 throttle 与 debounce 的关系与区别"
date: "2026-05-11T14:00:00+08:00"
summary: "说明 Combine 里节流与防抖的语义、对照表及公屏等高频场景下的选型；附 Apple 文档链接。"
category: "iOS"
slug: "ios-combine-throttle-vs-debounce"
tags:
  - iOS
  - Combine
  - Swift
  - Reactive
draft: false
---

# Combine 中 `throttle` 与 `debounce` 的关系与区别

## 关系

两者都是 **在时间轴上合并事件** 的算子：上游事件可以很密，下游输出变稀，用来减轻处理压力（例如减少 UI 刷新、网络请求次数）。

区别在于 **「什么时候放行一次」** 的规则不同。

---

## `throttle`（节流）

**含义**：在一个固定时间窗口内，**最多只让通过一次**（具体是窗口内第一条还是最后一条，由 API 的 `latest` 等参数决定）。

- **典型行为**：像水龙头限流——**每隔 T 最多「滴」一次**；窗口中间的大量事件会被丢弃或合并。
- **Combine**：`throttle(for:scheduler:latest:)` 中，`latest == true` 时，往往与「窗口结束时发本窗口内**最后**一条」语义一致（以 Apple 文档与版本为准）；`latest == false` 时偏「**首**条」语义。

**适合场景**：传感器采样、滚动、**WebSocket 连发**、进度更新——希望 **「持续有反馈，但别太快」**。

---

## `debounce`（防抖）

**含义**：**等「安静」一段时间 T 没有新事件**，才把 **（通常）最后一次** 交给下游。

- **典型行为**：像搜索框——用户 **停打 T 毫秒** 后才发请求；打字过程中只要还有新输入，计时器就 **重置**，**不触发**下游。
- **适合场景**：搜索联想、输入校验、窗口 `resize` 结束后再布局——希望 **「动作停下来了再处理」**。

---

## 对照表

| | **throttle（节流）** | **debounce（防抖）** |
|---|----------------------|----------------------|
| **触发节奏** | 按 **固定间隔** 采样（有「节拍」） | 等 **静默 T** 再触发 |
| **事件很密时** | 每隔 T 仍可能输出 | 若一直无静默，可能 **很久不输出** |
| **常见场景** | 列表刷新、日志、高频推送降频 | 搜索、表单、尺寸变化结束后再算布局 |

---

## 一句话总结

- **throttle**：**「每隔多久最多处理一次」**（有上限频率）。
- **debounce**：**「停多久没动静再处理一次」**（看静默，不看固定节拍）。

---

## 与公屏刷新的关系（PartyClub 场景）

公屏在 WS 洪峰时若用 **`debounce`**：消息一直不断进来时，可能长时间达不到「静默」，**列表会卡很久不刷新**。

使用 **`throttle`（如 `latest: true`）** 更贴切：消息持续进入时仍按间隔 **周期性刷新到较新状态**，同时 **降低** `filteredPayloads` → TableView 的刷新频率。

实现参考（路径相对 **PartyClub** 仓库根目录）：`FeatureModules/PCVoxing/Sources/Main/PublicChat/ViewModel/PCRoomPublicChatViewModel.swift` 中对 `publicChatPayloadsPublisher` 的节流配置。

---

## 参考

- Apple Documentation: *Combine* — `Publisher.throttle(for:scheduler:latest:)`
- Apple Documentation: *Combine* — `Publisher.debounce(for:scheduler:)`
