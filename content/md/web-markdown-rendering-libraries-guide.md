---
title: "常用 Web 端 Markdown 渲染库速查"
date: "2026-04-30T17:02:00+08:00"
summary: "按常见场景梳理 markdown-it、marked、remark/rehype、react-markdown、MDX、showdown 的定位与选型建议，并补充 XSS 安全实践。"
category: "md"
slug: "web-markdown-rendering-libraries-guide"
tags:
  - Web
  - Markdown
  - React
  - Security
  - Libraries
draft: false
---

# 常用 Web 端 Markdown 渲染库速查

这份速查按「常见场景」整理了主流 Markdown 渲染库，便于快速选型。

## 常用库与适用场景

### 1) `markdown-it`

- 定位：经典、稳定、插件生态丰富。
- 适合：需要自定义语法规则、扩展能力强的场景。
- 特点：插件多，社区成熟，长期维护友好。

### 2) `marked`

- 定位：轻量、速度快、上手简单。
- 适合：对复杂扩展需求不高，追求快速渲染的场景。
- 特点：API 直接，接入成本低。

### 3) `remark` + `rehype`（Unified 生态）

- 定位：可扩展性最强的处理链方案。
- 适合：需要做「解析 -> 转换 -> 渲染」流水线的内容系统。
- 特点：插件体系完整，适合复杂内容处理和构建流程。

### 4) `react-markdown`

- 定位：React 项目常用方案。
- 适合：在 React 应用中直接把 Markdown 渲染为 React 组件。
- 特点：与 React 生态贴合，组件化扩展自然。

### 5) `MDX`（`@mdx-js/mdx`）

- 定位：Markdown 与 React 组件混写。
- 适合：文档站、内容平台、需要“内容 + 交互组件”混排的场景。
- 特点：表达力强，适合中大型文档内容工程化。

### 6) `showdown`

- 定位：老牌、简单直接。
- 适合：维护成本优先、对新特性要求不高的老项目。
- 特点：迁移成本低，历史项目中常见。

## 安全建议（重点）

渲染用户输入的 Markdown 时，必须防范 XSS 风险。

- 通用组合：`marked` / `markdown-it` + `DOMPurify`。
- React 组合：`react-markdown` + `rehype-sanitize`。
- 实践建议：默认开启严格白名单，按需放开标签和属性，不要直接信任原始 HTML。

## 快速选型建议

- 需要“快、轻量”：
  - 选 `marked`。
- 需要“稳定 + 插件扩展”：
  - 选 `markdown-it`。
- 需要“复杂内容处理流水线”：
  - 选 `remark` + `rehype`。
- React 项目直接渲染：
  - 选 `react-markdown`。
- 需要在 Markdown 中嵌入组件：
  - 选 `MDX`。
- 老项目低成本维护：
  - 选 `showdown`。
