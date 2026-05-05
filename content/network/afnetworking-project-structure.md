---
title: "AFNetworking 项目结构"
date: "2026-05-06T01:45:00+08:00"
summary: "基于 Project-Structure.md 整理的 AFNetworking 文档，适配 tech-note 博客格式。"
category: "network"
slug: "afnetworking-project-structure"
tags:
  - network
  - iOS
draft: false
---

# AFNetworking 项目结构

## 1. 顶层结构

```text
AFNetworking/
├── AFNetworking/                 # 核心网络库源码，Swift Package target 也指向此目录
├── UIKit+AFNetworking/            # UIKit 分类与图片下载、缓存、UI 状态绑定扩展
├── Framework/                     # Framework umbrella header
├── Example/                       # iOS、macOS、tvOS、watchOS 示例工程
├── Tests/                         # 单元测试工程与测试用例
├── fastlane/                      # 发布与自动化相关配置
├── .github/                       # GitHub issue、PR、CI 配置
├── AFNetworking.xcodeproj         # Xcode 工程
├── AFNetworking.xcworkspace       # Xcode workspace
├── AFNetworking.podspec           # CocoaPods 规格与 subspec 拆分
├── Package.swift                  # Swift Package Manager 配置
├── README.md                      # 项目说明
├── CHANGELOG.md                   # 版本变更记录
├── CONTRIBUTING.md                # 贡献指南
├── Gemfile / Gemfile.lock         # Ruby 工具链依赖
└── LICENSE                        # MIT License
```

## 2. 核心源码目录

```text
AFNetworking/
├── AFNetworking.h
├── AFCompatibilityMacros.h
├── AFURLSessionManager.h
├── AFURLSessionManager.m
├── AFHTTPSessionManager.h
├── AFHTTPSessionManager.m
├── AFURLRequestSerialization.h
├── AFURLRequestSerialization.m
├── AFURLResponseSerialization.h
├── AFURLResponseSerialization.m
├── AFSecurityPolicy.h
├── AFSecurityPolicy.m
├── AFNetworkReachabilityManager.h
└── AFNetworkReachabilityManager.m
```

核心源码按职责可以分为：

- 入口头文件：`AFNetworking.h`。
- 会话管理：`AFURLSessionManager`、`AFHTTPSessionManager`。
- 请求序列化：`AFURLRequestSerialization`。
- 响应序列化：`AFURLResponseSerialization`。
- 安全策略：`AFSecurityPolicy`。
- 网络可达性：`AFNetworkReachabilityManager`。
- 兼容宏：`AFCompatibilityMacros`。

## 3. UIKit 扩展目录

```text
UIKit+AFNetworking/
├── UIKit+AFNetworking.h
├── AFAutoPurgingImageCache.h
├── AFAutoPurgingImageCache.m
├── AFImageDownloader.h
├── AFImageDownloader.m
├── AFNetworkActivityIndicatorManager.h
├── AFNetworkActivityIndicatorManager.m
├── UIImageView+AFNetworking.h
├── UIImageView+AFNetworking.m
├── UIButton+AFNetworking.h
├── UIButton+AFNetworking.m
├── UIActivityIndicatorView+AFNetworking.h
├── UIActivityIndicatorView+AFNetworking.m
├── UIProgressView+AFNetworking.h
├── UIProgressView+AFNetworking.m
├── UIRefreshControl+AFNetworking.h
├── UIRefreshControl+AFNetworking.m
├── WKWebView+AFNetworking.h
└── WKWebView+AFNetworking.m
```

该目录提供面向 UIKit 的便利扩展，主要服务于网络图片加载、网络任务与 UI 状态绑定、状态栏网络活动指示器等场景。由于 Swift Package 只声明了 `AFNetworking` target，UIKit 扩展不包含在 Swift Package 产品中。

## 4. 示例工程目录

```text
Example/
├── Classes/
│   ├── Models/
│   └── Networking Extensions/
├── iOS Example/
├── macOS Example/
├── tvOS Example/
├── watchOS Example/
├── watchOS Example Extension/
├── Today Extension Example/
└── Assets.xcassets/
```

示例工程用于展示不同 Apple 平台上的集成方式，包含 API client、模型对象、控制器、平台入口和资源文件。

## 5. 测试目录

```text
Tests/
└── Tests/
    ├── AFTestCase.h
    ├── AFTestCase.m
    ├── AFURLSessionManagerTests.m
    ├── AFHTTPSessionManagerTests.m
    ├── AFHTTPRequestSerializationTests.m
    ├── AFHTTPResponseSerializationTests.m
    ├── AFJSONSerializationTests.m
    ├── AFPropertyListRequestSerializerTests.m
    ├── AFPropertyListResponseSerializerTests.m
    ├── AFXMLParserResponseSerializerTests.m
    ├── AFXMLDocumentResponseSerializerTests.m
    ├── AFImageResponseSerializerTests.m
    ├── AFCompoundResponseSerializerTests.m
    ├── AFSecurityPolicyTests.m
    ├── AFNetworkReachabilityManagerTests.m
    ├── AFImageDownloaderTests.m
    ├── AFAutoPurgingImageCacheTests.m
    ├── AFUIImageViewTests.m
    ├── AFUIButtonTests.m
    ├── AFUIActivityIndicatorViewTests.m
    ├── AFUIRefreshControlTests.m
    ├── AFWKWebViewTests.m
    └── AFNetworkActivityManagerTests.m
```

测试覆盖核心网络管理、请求与响应序列化、安全策略、可达性、图片下载与缓存，以及 UIKit 分类行为。

## 6. 包管理结构

### CocoaPods

`AFNetworking.podspec` 将项目拆分为以下 subspec：

- `Serialization`：请求与响应序列化。
- `Security`：HTTPS 安全策略。
- `Reachability`：网络可达性。
- `NSURLSession`：session manager 与 HTTP session manager。
- `UIKit`：UIKit 扩展。

### Swift Package Manager

`Package.swift` 定义一个 library product：

- product：`AFNetworking`
- target：`AFNetworking`
- path：`AFNetworking`
- 支持平台：macOS 10.10、iOS 9、tvOS 9、watchOS 2

Swift Package 不包含 `UIKit+AFNetworking`。

## 7. 平台条件

项目通过 `TargetConditionals.h` 控制平台差异：

- watchOS 不引入 `AFNetworkReachabilityManager`。
- iOS/tvOS 引入图片缓存、图片下载、UIKit 控件分类。
- iOS 额外引入 `AFNetworkActivityIndicatorManager`、`UIRefreshControl+AFNetworking`、`WKWebView+AFNetworking`。
- macOS 支持 `AFXMLDocumentResponseSerializer`。
