---
title: "Alamofire 项目结构"
date: "2026-05-06T02:00:00+08:00"
summary: "基于 Alamofire 仓库 Documentation/ProjectStructure.md 整理，适配 tech-note 博客格式。"
category: "network"
slug: "alamofire-project-structure"
tags:
  - network
  - iOS
draft: false
---

# Alamofire 项目结构

本文档说明当前仓库的主要目录、关键文件和它们在项目中的职责。

## 1. 顶层结构

```text
Alamofire/
├── Source/                         # Alamofire library 源码
├── Tests/                          # 单元测试与集成测试
├── Documentation/                  # 手写使用文档、迁移指南和本次新增设计文档
├── docs/                           # 生成后的 Jazzy API 文档站点与 docset
├── Example/                        # iOS 示例工程
├── watchOS Example/                # watchOS 示例工程
├── Alamofire.xcodeproj/            # 主 Xcode 工程
├── Package.swift                   # Swift Package Manager manifest
├── Package@swift-6.0.swift         # Swift 6.0 专用 manifest
├── Package@swift-6.1.swift         # Swift 6.1 专用 manifest
├── Package@swift-6.2.swift         # Swift 6.2 专用 manifest
├── Alamofire.podspec               # CocoaPods 分发配置├── README.md                       # 项目介绍、安装、使用入口
├── CHANGELOG.md                    # 版本变更记录
├── CONTRIBUTING.md                 # 贡献指南
└── .github/                        # GitHub 工作流、模板和赞助配置
```

## 2. Source 目录

`Source` 是 Swift Package target `Alamofire` 的源码根目录，按 `Core`、`Features`、`Extensions` 组织。

```text
Source/
├── Alamofire.swift                 # 公共入口 AF、AFInfo 和编译器版本检查
├── Core/                           # 请求、会话、响应、编码、HTTP 基础类型
├── Features/                       # 拦截、认证、序列化、安全、缓存、并发等能力
├── Extensions/                     # Foundation / 标准库类型扩展
├── Info.plist                      # Xcode target 元数据
└── PrivacyInfo.xcprivacy           # Apple 隐私清单资源
```

### 2.1 Source/Core

```text
Source/Core/
├── AFError.swift
├── DataRequest.swift
├── DataStreamRequest.swift
├── DownloadRequest.swift
├── HTTPHeaders.swift
├── HTTPMethod.swift
├── Notifications.swift
├── ParameterEncoder.swift
├── ParameterEncoding.swift
├── Protected.swift
├── Request.swift
├── RequestTaskMap.swift
├── Response.swift
├── Session.swift
├── SessionDelegate.swift
├── UploadRequest.swift
├── URLConvertible+URLRequestConvertible.swift
└── WebSocketRequest.swift
```

| 文件 | 主要职责 |
| --- | --- |
| `Session.swift` | 会话核心，创建请求，管理 `URLSession`、队列、拦截器、信任、重定向、缓存和事件监控。 |
| `SessionDelegate.swift` | 实现 `URLSessionDelegate` / task / data / download / websocket delegate，桥接系统回调与 Alamofire 请求。 |
| `Request.swift` | 所有请求类型的基类，管理状态、进度、任务、指标、错误、验证和序列化回调。 |
| `DataRequest.swift` | 内存数据请求，封装 `URLSessionDataTask` 和响应处理。 |
| `UploadRequest.swift` | 上传请求，支持数据、文件、流和 multipart。 |
| `DownloadRequest.swift` | 下载请求，处理临时文件、目标移动和 resume data。 |
| `DataStreamRequest.swift` | 流式数据请求。 |
| `WebSocketRequest.swift` | WebSocket 请求，封装 `URLSessionWebSocketTask`。 |
| `RequestTaskMap.swift` | 维护 `Request` 与 `URLSessionTask` 的双向关系。 |
| `Protected.swift` | 提供线程安全的状态访问封装。 |
| `ParameterEncoding.swift` | 定义传统参数编码协议和实现。 |
| `ParameterEncoder.swift` | 定义 `Encodable` 参数编码协议和实现。 |
| `HTTPHeaders.swift` / `HTTPMethod.swift` | HTTP 头部和方法模型。 |
| `Response.swift` | 响应模型、metrics、result 等类型定义。 |
| `AFError.swift` | Alamofire 统一错误模型。 |

### 2.2 Source/Features

```text
Source/Features/
├── AlamofireExtended.swift
├── AuthenticationInterceptor.swift
├── CachedResponseHandler.swift
├── Combine.swift
├── Concurrency.swift
├── EventMonitor.swift
├── MultipartFormData.swift
├── MultipartUpload.swift
├── NetworkReachabilityManager.swift
├── OfflineRetrier.swift
├── RedirectHandler.swift
├── RequestCompression.swift
├── RequestInterceptor.swift
├── ResponseSerialization.swift
├── RetryPolicy.swift
├── ServerTrustEvaluation.swift
├── URLEncodedFormEncoder.swift
└── Validation.swift
```

| 文件 | 主要职责 |
| --- | --- |
| `RequestInterceptor.swift` | 定义请求适配、重试和组合拦截协议。 |
| `RetryPolicy.swift` / `OfflineRetrier.swift` | 内置重试策略和离线恢复策略。 |
| `AuthenticationInterceptor.swift` | 认证凭证刷新、排队和重试。 |
| `ResponseSerialization.swift` | 响应预处理、序列化协议和内置序列化器。 |
| `Validation.swift` | 状态码、Content-Type 和自定义响应验证。 |
| `ServerTrustEvaluation.swift` | TLS 信任评估、证书和公钥 pinning。 |
| `CachedResponseHandler.swift` | 缓存响应处理策略。 |
| `RedirectHandler.swift` | 重定向处理策略。 |
| `EventMonitor.swift` | 事件监控、组合监控和闭包监控。 |
| `NetworkReachabilityManager.swift` | 网络可达性监听。 |
| `Concurrency.swift` | Swift Concurrency 支持。 |
| `Combine.swift` | Combine publisher 支持。 |
| `MultipartFormData.swift` / `MultipartUpload.swift` | multipart 表单构建和上传桥接。 |
| `URLEncodedFormEncoder.swift` | URL encoded form 编码。 |
| `RequestCompression.swift` | HTTP body 压缩支持。 |

### 2.3 Source/Extensions

```text
Source/Extensions/
├── DispatchQueue+Alamofire.swift
├── OperationQueue+Alamofire.swift
├── Result+Alamofire.swift
├── StringEncoding+Alamofire.swift
├── URLRequest+Alamofire.swift
└── URLSessionConfiguration+Alamofire.swift
```

这些文件为 Foundation 或标准库类型补充 Alamofire 内部需要的便利能力，例如默认 `URLSessionConfiguration`、URLRequest 校验、队列创建和结果转换。

## 3. Tests 目录

`Tests` 是 Swift Package test target `AlamofireTests` 的根目录，测试文件基本按源码能力拆分。

```text
Tests/
├── *Tests.swift                    # 功能测试、回归测试和平台行为测试
├── BaseTestCase.swift              # 测试基类
├── TestHelpers.swift               # 测试辅助类型和工具
├── InternalHelpers.swift           # 内部测试辅助逻辑
├── InspectorEventMonitor.swift     # 用于测试事件监控的工具
├── NSLoggingEventMonitor.swift     # 日志监控测试工具
├── Resources/                      # 测试资源，如 JSON 响应
└── Test Plans/                     # Xcode 平台测试计划
```

主要覆盖范围包括：

- 请求生命周期：`RequestTests.swift`、`InternalRequestTests.swift`、`SessionTests.swift`、`SessionDelegateTests.swift`。
- 请求构建和编码：`ParameterEncodingTests.swift`、`ParameterEncoderTests.swift`、`RequestModifierTests.swift`。
- 响应处理：`ResponseTests.swift`、`ResponseSerializationTests.swift`、`ValidationTests.swift`。
- 上传下载和流式能力：`UploadTests.swift`、`DownloadTests.swift`、`MultipartFormDataTests.swift`、`DataStreamTests.swift`、`WebSocketTests.swift`。
- 横切能力：`AuthenticationTests.swift`、`AuthenticationInterceptorTests.swift`、`RequestInterceptorTests.swift`、`RetryPolicyTests.swift`、`OfflineRetrierTests.swift`、`CachedResponseHandlerTests.swift`、`RedirectHandlerTests.swift`。
- 安全与网络：`ServerTrustEvaluatorTests.swift`、`TLSEvaluationTests.swift`、`NetworkReachabilityManagerTests.swift`。
- 并发和响应式：`ConcurrencyTests.swift`、`CombineTests.swift`。

## 4. Documentation 与 docs

```text
Documentation/
├── Usage.md
├── AdvancedUsage.md
├── Alamofire 2.0 Migration Guide.md
├── Alamofire 3.0 Migration Guide.md
├── Alamofire 4.0 Migration Guide.md
├── Alamofire 5.0 Migration Guide.md
├── Architecture.md
├── ProjectStructure.md
└── HighLevelDesign.md
```

- `Documentation`：面向使用者和维护者的手写 Markdown 文档。
- `docs`：生成后的 API 文档站点，包含 HTML、索引、样式和 `Alamofire.docset`。

## 5. 示例工程

```text
Example/
├── Source/
├── Resources/
└── iOS Example.xcodeproj/

watchOS Example/
├── watchOS Example WatchKit App/
├── watchOS Example WatchKit Extension/
└── watchOS Example.xcodeproj/
```

示例工程用于展示 Alamofire 在 iOS 和 watchOS App 中的基本集成方式，不属于 Swift Package library target。

## 6. 构建与发布配置

| 文件 / 目录 | 说明 |
| --- | --- |
| `Package.swift` | 当前 SwiftPM manifest，定义 library products、平台、target、资源和测试 target。 |
| `Package@swift-6.0.swift`、`Package@swift-6.1.swift`、`Package@swift-6.2.swift` | 面向不同 Swift 版本的兼容 manifest。 |
| `Alamofire.podspec` | CocoaPods 发布配置。 |
| `Alamofire.xcodeproj` | Apple 平台构建和测试主工程。 |
| `.github/workflows/ci.yml` | GitHub Actions CI，覆盖 Apple 平台、SPM、Linux、Android、Windows 和 CodeQL。 |
| `.github/ISSUE_TEMPLATE`、`.github/PULL_REQUEST_TEMPLATE.md` | Issue 和 PR 模板。 |
| `.github/FUNDING.yml` | 赞助配置。 |

## 7. 依赖关系特点

- 项目没有第三方运行时依赖，核心能力构建在 Foundation、Dispatch、CFNetwork、Security、SystemConfiguration 等系统能力之上。
- SwiftPM target 将 `Source/PrivacyInfo.xcprivacy` 作为资源处理。
- `CFNetwork` 在 SwiftPM linker settings 中按 Apple 平台链接。
- Linux、Windows、Android 在 CI 中主要验证构建能力，部分 Apple 专属能力由条件编译隔离。
