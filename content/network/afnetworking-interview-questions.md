---
title: "AFNetworking 面试题目列表"
date: "2026-05-06T01:45:00+08:00"
summary: "基于 AFNetworking-Interview-Questions.md 整理的 AFNetworking 文档，适配 tech-note 博客格式。"
category: "network"
slug: "afnetworking-interview-questions"
tags:
  - network
  - iOS
draft: false
---

# AFNetworking 面试题目列表

## 1. 核心必问题目

1. **AFNetworking 主要解决了什么问题？它和系统 `NSURLSession` 是什么关系？**

   答案：AFNetworking 主要解决 Apple 平台网络开发中重复、繁琐且容易出错的通用问题。它把 `NSURLSession` 的请求创建、任务管理、回调处理、进度监听、参数编码、响应解析、错误处理、HTTPS 安全校验、网络状态监听等能力封装成更易用的 Objective-C API。

   它和系统 `NSURLSession` 不是替代关系，而是封装关系。AFNetworking 底层仍然使用 Foundation 的 URL Loading System，核心类 `AFURLSessionManager` 内部管理一个 `NSURLSession`，并实现多个 `NSURLSession` delegate，把系统 delegate 回调转换成更方便使用的 block 回调。

   面试时可以概括为：AFNetworking 是对 `NSURLSession` 的高层封装，不是重新实现网络栈。它基于系统网络能力，屏蔽请求构造、参数序列化、响应反序列化、进度回调、安全校验和网络状态监听等细节，让业务层可以用更简单的 API 发起 HTTP 请求并处理结果。


2. **`AFURLSessionManager` 和 `AFHTTPSessionManager` 的区别是什么？**

   答案：`AFURLSessionManager` 是 AFNetworking 的基础会话管理类，主要封装 `NSURLSession`。它负责创建和管理 `NSURLSessionDataTask`、`NSURLSessionUploadTask`、`NSURLSessionDownloadTask`，处理 delegate 回调、上传下载进度、响应序列化、安全校验、任务完成回调等通用能力。

   `AFHTTPSessionManager` 是 `AFURLSessionManager` 的子类，专门面向 HTTP 请求场景。它在 `AFURLSessionManager` 的基础上增加了 `baseURL`、`requestSerializer`，并提供 `GET`、`POST`、`PUT`、`PATCH`、`DELETE` 等便捷方法，让业务层可以直接按 HTTP 方法发起请求。

   面试时可以概括为：`AFURLSessionManager` 更偏底层，是对 `NSURLSession` 和 task 生命周期的通用封装；`AFHTTPSessionManager` 更偏业务使用，是在它之上封装的 HTTP 客户端，提供 `baseURL`、请求参数序列化和常见 HTTP 方法。一般业务 API 请求用 `AFHTTPSessionManager`，如果需要更细粒度地管理 data/upload/download task，可以直接使用 `AFURLSessionManager`。

3. **AFNetworking 的整体架构可以分为哪些模块？**

   答案：AFNetworking 的整体架构可以分为核心网络层、序列化层、安全策略层、网络可达性层和 UIKit 扩展层。

   核心网络层主要由 `AFURLSessionManager` 和 `AFHTTPSessionManager` 组成。`AFURLSessionManager` 负责封装 `NSURLSession`、管理 data/upload/download task、处理 delegate 回调和进度；`AFHTTPSessionManager` 在它之上提供面向 HTTP 的 `GET`、`POST`、`PUT`、`PATCH`、`DELETE` 等便捷 API。

   序列化层分为请求序列化和响应序列化。请求序列化由 `AFURLRequestSerialization` 相关类负责，将参数编码到 URL、HTTP body、JSON body 或 multipart body 中；响应序列化由 `AFURLResponseSerialization` 相关类负责，校验状态码和 MIME type，并把响应数据解析成 JSON、XML、plist、image 或原始 data。

   安全策略层由 `AFSecurityPolicy` 负责，主要处理 HTTPS 服务端证书校验和 SSL Pinning。网络可达性层由 `AFNetworkReachabilityManager` 负责，监听网络是否可达以及当前是蜂窝网络还是 Wi-Fi。UIKit 扩展层包括 `UIImageView+AFNetworking`、`UIButton+AFNetworking`、`AFImageDownloader`、`AFAutoPurgingImageCache` 等，用来支持网络图片下载、缓存和 UI 控件状态绑定。

   面试时可以概括为：AFNetworking 是一个分层封装的网络库，底层基于 `NSURLSession`，中间提供请求/响应序列化、安全校验和可达性监听，上层提供 HTTP 便捷 API，另外还提供 UIKit 图片加载和 UI 状态扩展。

4. **AFNetworking 如何封装 HTTP 请求的创建、执行和回调？**

   答案：AFNetworking 主要通过 `AFHTTPSessionManager` 和 `AFURLSessionManager` 协作完成 HTTP 请求的创建、执行和回调。

   请求创建阶段，业务层通常调用 `AFHTTPSessionManager` 的 `GET`、`POST`、`PUT`、`PATCH`、`DELETE` 等方法。`AFHTTPSessionManager` 会根据 `baseURL`、URL path、请求参数和 headers 创建请求，并交给 `requestSerializer` 做参数编码。比如 GET 参数会拼到 URL query 中，JSON POST 参数会写入 HTTP body，并设置对应的 `Content-Type`。

   请求执行阶段，`AFHTTPSessionManager` 会把创建好的 `NSURLRequest` 交给父类 `AFURLSessionManager`，由它基于内部持有的 `NSURLSession` 创建 `NSURLSessionDataTask`、`NSURLSessionUploadTask` 或 `NSURLSessionDownloadTask`，然后启动任务。任务执行过程中的上传进度、下载进度、重定向、认证 challenge、数据接收等都通过 `NSURLSession` delegate 处理。

   回调处理阶段，任务完成后 `AFURLSessionManager` 会先拿到原始响应和 `NSData`，再交给 `responseSerializer` 校验状态码、校验 `Content-Type`，并解析成 JSON、XML、plist、image 或原始 data。如果网络请求和响应解析都成功，就调用 `success`；如果网络失败、状态码不合法、MIME type 不匹配或解析失败，就调用 `failure`。

   面试时可以概括为：AFNetworking 把 HTTP 请求封装成三步，先由 `AFHTTPSessionManager` 结合 `requestSerializer` 创建请求，再由 `AFURLSessionManager` 基于 `NSURLSession` 执行任务，最后由 `responseSerializer` 解析结果并通过 block 回调给业务层。

5. **`requestSerializer` 和 `responseSerializer` 分别负责什么？**

   答案：`requestSerializer` 负责请求发送前的处理，核心作用是把业务参数转换成真正的 `NSURLRequest`。它会处理 URL 拼接、query 参数编码、HTTP body 编码、请求头设置、超时时间、缓存策略、Authorization 等请求相关配置。

   比如 GET 请求中，`requestSerializer` 通常会把参数拼到 URL query 后面；普通 POST 表单请求会把参数放到 HTTP body；JSON POST 请求会把参数序列化成 JSON 数据，并设置 `Content-Type: application/json`；multipart 上传请求会把文件、图片或二进制数据组装成 `multipart/form-data`。

   `responseSerializer` 负责请求完成后的处理，核心作用是把服务端返回的原始响应转换成业务层更容易使用的对象。它会先校验 HTTP 状态码和响应 `Content-Type`，然后再把 `NSData` 解析成 JSON、XML、plist、image 或保留为原始 data。

   如果网络请求成功，但响应状态码不在允许范围内、MIME type 不匹配，或者 JSON 解析失败，也会被 `responseSerializer` 视为失败，并通过 `failure` 回调返回错误。

   面试时可以概括为：`requestSerializer` 是“请求发送前”的序列化，负责把参数变成 HTTP 请求；`responseSerializer` 是“响应返回后”的反序列化和校验，负责把 HTTP 响应数据变成业务对象。

6. **`AFHTTPRequestSerializer`、`AFJSONRequestSerializer`、`AFPropertyListRequestSerializer` 有什么区别？**

   答案：这三个类都属于请求序列化器，区别在于它们把请求参数编码成不同的 HTTP 请求格式。

   `AFHTTPRequestSerializer` 是默认的 HTTP 请求序列化器，适合普通表单或 query 参数场景。对于 `GET`、`HEAD`、`DELETE` 等请求，它通常会把参数编码到 URL query 中；对于 `POST`、`PUT`、`PATCH` 等请求，它通常会把参数编码成 `application/x-www-form-urlencoded` 格式放到 HTTP body 中。它还负责设置默认 header、超时时间、缓存策略、Basic Auth 等通用请求配置。

   `AFJSONRequestSerializer` 继承自 `AFHTTPRequestSerializer`，但会把参数序列化成 JSON 数据放到 HTTP body 中，并设置 `Content-Type: application/json`。它适合服务端接口要求请求体为 JSON 的场景，也是现在很多 REST API 常见的请求格式。

   `AFPropertyListRequestSerializer` 也继承自 `AFHTTPRequestSerializer`，但会把参数序列化成 Apple property list 格式，并设置对应的 plist content type。它主要用于服务端或系统接口要求 plist 格式的场景，普通业务接口中使用相对较少。

   面试时可以概括为：`AFHTTPRequestSerializer` 处理普通 URL query 和表单请求，`AFJSONRequestSerializer` 处理 JSON body 请求，`AFPropertyListRequestSerializer` 处理 plist body 请求。三者的核心区别是请求参数进入 HTTP 请求时采用的编码格式不同。

7. **`AFHTTPResponseSerializer`、`AFJSONResponseSerializer`、`AFImageResponseSerializer` 有什么区别？**

   答案：这三个类都属于响应序列化器，区别在于它们把服务端返回的 `NSData` 解析成不同类型的对象。

   `AFHTTPResponseSerializer` 是基础响应序列化器，主要负责校验 HTTP 状态码和 `Content-Type`，校验通过后默认直接返回原始 `NSData`。它适合下载文件、处理二进制数据、或者业务层想自己解析响应内容的场景。

   `AFJSONResponseSerializer` 继承自 `AFHTTPResponseSerializer`，除了做状态码和 MIME type 校验之外，还会使用 `NSJSONSerialization` 把响应数据解析成 Foundation 对象，比如 `NSDictionary` 或 `NSArray`。它默认接受 `application/json`、`text/json`、`text/javascript` 等 JSON 相关 MIME type，适合大多数返回 JSON 的接口。

   `AFImageResponseSerializer` 也继承自 `AFHTTPResponseSerializer`，用于把图片响应数据解析成图片对象。在 iOS/tvOS/watchOS 上通常返回 `UIImage`，在 macOS 上通常返回 `NSImage`。它适合图片下载、头像加载、列表图片缓存等场景。

   如果状态码不合法、`Content-Type` 不符合 serializer 的 `acceptableContentTypes`，或者数据解析失败，请求即使已经拿到服务端响应，也会进入 `failure` 回调。

   面试时可以概括为：`AFHTTPResponseSerializer` 返回原始 data，`AFJSONResponseSerializer` 把 data 解析成 JSON 对象，`AFImageResponseSerializer` 把 data 解析成图片对象。三者的核心区别是响应数据最终被转换成什么类型。

8. **AFNetworking 如何处理 GET、POST、PUT、PATCH、DELETE 等请求？**

   答案：AFNetworking 主要通过 `AFHTTPSessionManager` 提供这些 HTTP 方法的便捷封装。业务层调用 `GET`、`POST`、`PUT`、`PATCH`、`DELETE` 方法时，本质上都是先创建一个对应 HTTP method 的 `NSMutableURLRequest`，再交给 `AFURLSessionManager` 创建并执行 `NSURLSessionDataTask`。

   请求创建时，`AFHTTPSessionManager` 会结合 `baseURL`、传入的 URL 字符串、parameters 和 headers 生成请求。参数如何放入请求由 `requestSerializer` 决定：默认情况下，`GET`、`HEAD`、`DELETE` 等方法的参数通常会编码到 URL query 中；`POST`、`PUT`、`PATCH` 等方法的参数通常会编码到 HTTP body 中。如果使用 `AFJSONRequestSerializer`，参数会以 JSON body 的形式发送。

   请求执行时，`AFHTTPSessionManager` 会调用父类的 `dataTaskWithRequest:uploadProgress:downloadProgress:completionHandler:` 创建 data task，然后启动任务。请求完成后，`responseSerializer` 会校验状态码和 `Content-Type`，并把响应数据解析成对应对象，最后再触发 `success` 或 `failure` block。

   对于普通接口请求，这些方法最终走的是统一的 data task 流程；区别主要在于 HTTP method 不同，以及参数默认编码位置不同。对于 multipart 上传，AFNetworking 提供了带 `constructingBodyWithBlock` 的 `POST` 方法，用来构造 `multipart/form-data` 请求体。

   面试时可以概括为：AFNetworking 把常见 HTTP method 封装成 `AFHTTPSessionManager` 的便捷方法，每个方法负责设置不同的 HTTP method，再通过 `requestSerializer` 编码参数，通过 `NSURLSessionDataTask` 执行请求，最后通过 `responseSerializer` 解析响应并回调业务层。

9. **AFNetworking 如何实现 multipart 文件上传？**

   答案：AFNetworking 通过 `AFHTTPRequestSerializer` 提供 multipart 请求构造能力，常用入口是 `AFHTTPSessionManager` 的 `POST:parameters:headers:constructingBodyWithBlock:progress:success:failure:` 方法。业务层在 `constructingBodyWithBlock` 中拿到一个遵守 `AFMultipartFormData` 协议的对象，然后把文件、图片、二进制数据或 stream 追加到请求体中。

   multipart 上传的核心是把普通参数和文件数据按照 `multipart/form-data` 格式组织到 HTTP body 中。每一段数据都会带有 boundary、表单字段名、文件名、MIME type 等信息，服务端可以根据这些分隔符和 header 正确解析出普通字段和文件字段。

   AFNetworking 封装了这些底层细节。调用方只需要使用 `appendPartWithFileURL:name:error:`、`appendPartWithFileURL:name:fileName:mimeType:error:`、`appendPartWithFileData:name:fileName:mimeType:`、`appendPartWithInputStream:name:fileName:length:mimeType:` 等方法追加上传内容，serializer 会负责生成 multipart body 和对应的 `Content-Type`。

   请求构造完成后，`AFHTTPSessionManager` 会把 multipart request 交给 `AFURLSessionManager` 执行。上传过程中可以通过 progress block 获取 `NSProgress`，用于展示上传进度；完成后仍然通过 `responseSerializer` 解析服务端响应，并进入 `success` 或 `failure` 回调。

   面试时可以概括为：AFNetworking 的 multipart 上传是由 `AFHTTPRequestSerializer` 构造 `multipart/form-data` 请求体，通过 `AFMultipartFormData` 追加文件或二进制数据，再由 `AFURLSessionManager` 基于 `NSURLSession` 执行上传，并通过 progress、success、failure block 回调结果。

10. **AFNetworking 如何监听上传和下载进度？**

   答案：AFNetworking 主要通过 `NSProgress` 和 `NSURLSession` delegate 回调来监听上传、下载进度。业务层在创建请求时传入 upload progress 或 download progress block，AFNetworking 在任务执行过程中不断更新对应的 `NSProgress` 对象，并把进度变化回调给业务层。

   上传进度主要来自 `NSURLSessionTaskDelegate` 的 `URLSession:task:didSendBodyData:totalBytesSent:totalBytesExpectedToSend:`。系统在请求 body 发送过程中会不断回调已发送字节数和总字节数，AFNetworking 根据这些数据更新 upload progress。

   下载进度主要来自两类场景。对于 data task，AFNetworking 在 `URLSession:dataTask:didReceiveData:` 中根据已接收数据量更新 download progress；对于 download task，系统会通过 `URLSession:downloadTask:didWriteData:totalBytesWritten:totalBytesExpectedToWrite:` 回调下载进度。

   在 `AFHTTPSessionManager` 的 `GET`、`POST`、multipart `POST` 等便捷方法里，调用方可以直接传入 `progress` block。对于更底层的任务，也可以使用 `AFURLSessionManager` 的 `dataTaskWithRequest:uploadProgress:downloadProgress:completionHandler:`、`uploadTaskWithRequest:fromFile:progress:completionHandler:`、`downloadTaskWithRequest:progress:destination:completionHandler:` 等方法监听进度。

   需要注意的是，AFNetworking 的进度回调不一定在主线程执行。如果要更新 UI，比如进度条或按钮状态，应该切回主线程。

   面试时可以概括为：AFNetworking 并不是自己计算网络进度，而是基于 `NSURLSession` 的 delegate 回调拿到已上传、已下载和总字节数，再封装成 `NSProgress`，通过 progress block 暴露给业务层。

11. **AFNetworking 的 `success` 和 `failure` 回调分别在什么情况下触发？**

   答案：`success` 回调并不是只要服务端有响应就会触发，而是要求网络请求完成、响应校验通过，并且响应数据反序列化成功。也就是说，请求没有底层网络错误，HTTP 状态码在 `acceptableStatusCodes` 范围内，响应 `Content-Type` 符合 `acceptableContentTypes`，并且 JSON、XML、image 等解析过程没有报错，才会进入 `success`。

   `failure` 回调触发的范围更广，主要包括四类情况。第一类是底层网络错误，比如断网、超时、DNS 解析失败、请求被取消、TLS 握手失败等。第二类是 HTTP 响应校验失败，比如状态码不是允许范围内的 2xx。第三类是响应 MIME type 不匹配，比如使用 `AFJSONResponseSerializer` 时服务端返回了不被接受的 `Content-Type`。第四类是响应解析失败，比如服务端返回的内容不是合法 JSON，但客户端使用 JSON serializer 解析。

   需要注意，服务端返回 HTTP 200 不一定会进入 `success`。如果响应内容和当前 `responseSerializer` 不匹配，或者解析失败，也会进入 `failure`。反过来，AFNetworking 默认通常把 2xx 状态码视为成功状态码，3xx、4xx、5xx 通常会被 response serializer 作为错误处理。

   面试时可以概括为：`success` 表示“网络成功 + HTTP 校验成功 + 响应解析成功”；`failure` 表示这三步中任意一步失败，包括网络错误、状态码不合法、Content-Type 不匹配或数据解析失败。

12. **AFNetworking 如何校验 HTTP 状态码和响应 `Content-Type`？**

   答案：AFNetworking 的 HTTP 状态码和 `Content-Type` 校验主要由 `AFHTTPResponseSerializer` 完成，核心方法是 `validateResponse:data:error:`。请求完成后，`AFURLSessionManager` 会把服务端返回的 `NSHTTPURLResponse` 和响应数据交给当前的 `responseSerializer`，由 serializer 判断这个响应是否符合预期。

   状态码校验依赖 `acceptableStatusCodes`。默认情况下，`AFHTTPResponseSerializer` 通常接受 2xx 范围的状态码。如果服务端返回 404、500 这类不在允许范围内的状态码，校验会失败，AFNetworking 会构造错误并进入 `failure` 回调。业务方也可以修改 `acceptableStatusCodes`，让某些非默认状态码被视为可接受。

   `Content-Type` 校验依赖 `acceptableContentTypes`。不同 serializer 默认接受的 MIME type 不同，比如 `AFJSONResponseSerializer` 默认接受 `application/json`、`text/json`、`text/javascript`，`AFImageResponseSerializer` 默认接受图片相关 MIME type。如果服务端返回的 `Content-Type` 和当前 serializer 不匹配，即使状态码是 200，也可能进入 `failure`。

   需要注意，`acceptableStatusCodes` 和 `acceptableContentTypes` 都是 response serializer 的配置项。也就是说，同一个接口用不同的 `responseSerializer`，校验标准可能不同。比如同样返回一张图片，用 `AFImageResponseSerializer` 可以成功，用 `AFJSONResponseSerializer` 就可能因为 MIME type 或解析失败进入 `failure`。

   面试时可以概括为：AFNetworking 在响应序列化阶段校验状态码和 `Content-Type`，状态码看 `acceptableStatusCodes`，MIME type 看 `acceptableContentTypes`。两者都通过后，才继续做 JSON、图片等数据解析；任意一步失败都会进入 `failure`。

13. **`AFSecurityPolicy` 的作用是什么？**

   答案：`AFSecurityPolicy` 是 AFNetworking 中负责 HTTPS 安全校验的模块，主要用来评估服务端证书是否可信。它会在 `NSURLSession` 收到 HTTPS authentication challenge 时参与判断，决定当前服务端的 `serverTrust` 是否可以被客户端接受。

   默认情况下，`AFSecurityPolicy` 使用系统证书信任链做校验，不允许无效或过期证书，并且会校验证书中的域名是否和请求域名匹配。这种默认策略适合大多数标准 HTTPS 接口。

   除了默认校验，它还支持 SSL Pinning。开发者可以把服务端证书或公钥内置到 App 中，然后配置 `AFSecurityPolicy` 使用证书绑定或公钥绑定。这样即使攻击者拿到了其他受系统信任 CA 签发的证书，只要和 App 内置的证书或公钥不匹配，也会被拒绝，从而降低中间人攻击风险。

   `AFSecurityPolicy` 里常见配置包括 `SSLPinningMode`、`pinnedCertificates`、`allowInvalidCertificates`、`validatesDomainName`。其中 `allowInvalidCertificates` 在生产环境通常不应开启，否则会降低 HTTPS 的安全性；`validatesDomainName` 也通常应该保持开启，避免证书被错误地用于其他域名。

   面试时可以概括为：`AFSecurityPolicy` 负责 HTTPS 服务端信任评估，包括系统证书链校验、域名校验以及 SSL Pinning。它不是发请求的模块，而是在 HTTPS 握手和认证 challenge 阶段决定是否信任服务端证书。

14. **SSL Pinning 是什么？AFNetworking 支持哪些 pinning 模式？**

   答案：SSL Pinning 是一种增强 HTTPS 安全性的机制。普通 HTTPS 校验主要依赖系统信任的 CA 证书链，只要服务端证书由系统信任的 CA 签发，并且域名匹配，客户端通常就会信任它。SSL Pinning 会在这个基础上进一步要求服务端证书或公钥必须和 App 内置的证书或公钥匹配。

   这样做的好处是可以降低中间人攻击风险。即使攻击者通过某种方式拿到了一个系统信任 CA 签发的证书，只要这个证书或公钥不是 App 预先绑定的内容，客户端也会拒绝连接。

   AFNetworking 通过 `AFSecurityPolicy` 支持三种 pinning 模式。`AFSSLPinningModeNone` 表示不做 pinning，只使用系统默认的证书链和域名校验。`AFSSLPinningModeCertificate` 表示证书绑定，要求服务端证书链中有证书和 App 内置证书完全匹配。`AFSSLPinningModePublicKey` 表示公钥绑定，要求服务端证书中的公钥和 App 内置证书提取出的公钥匹配。

   证书绑定校验更严格，但服务端证书更新时客户端也可能需要同步更新内置证书。公钥绑定相对灵活，只要服务端换证书时继续使用同一套公钥，客户端就不一定需要更新。实际项目中选择哪种方式，要看安全要求、证书更新频率和运维成本。

   面试时可以概括为：SSL Pinning 是把服务端证书或公钥固定在客户端，HTTPS 握手时除了系统信任链校验，还要和本地内置内容匹配。AFNetworking 支持不绑定、证书绑定和公钥绑定三种模式，分别对应 `None`、`Certificate`、`PublicKey`。

15. **`AFNetworkReachabilityManager` 的作用是什么？它能否用来决定是否允许发起请求？**

   答案：`AFNetworkReachabilityManager` 的作用是监听当前网络可达性状态，帮助应用了解目标主机或默认网络地址当前是否可达，以及大致是通过蜂窝网络还是 Wi-Fi 可达。它基于系统的 `SCNetworkReachability` 实现。

   它常见的状态包括 `AFNetworkReachabilityStatusUnknown`、`AFNetworkReachabilityStatusNotReachable`、`AFNetworkReachabilityStatusReachableViaWWAN`、`AFNetworkReachabilityStatusReachableViaWiFi`。调用方可以通过 `startMonitoring` 开始监听，并通过 `setReachabilityStatusChangeBlock:` 接收网络状态变化。

   但它不应该作为是否允许发起请求的唯一依据。Reachability 只能反映某个时间点的网络可达性，不能保证下一次请求一定成功，也不能覆盖 DNS、服务端异常、TLS 失败、代理、弱网丢包等所有情况。有时候网络状态显示不可达，用户发起请求本身也可能触发系统建立连接；有时候显示可达，请求仍然可能失败。

   更合理的使用方式是：用它做网络状态提示、失败原因辅助判断、网络恢复后的自动重试触发、区分 Wi-Fi 和蜂窝网络下的策略选择，比如大文件下载是否提示用户。真正的请求成功与否仍然应该以请求完成后的 error、HTTP 状态码和响应解析结果为准。

   面试时可以概括为：`AFNetworkReachabilityManager` 用来监听网络是否可达以及当前网络类型，但不能可靠预测下一次请求是否成功，所以不建议用它直接拦截用户请求。它更适合做状态提示、失败辅助判断和网络恢复后的重试。

16. **AFNetworking 如何支持网络图片下载和缓存？**

   答案：AFNetworking 主要通过 `UIKit+AFNetworking` 扩展支持网络图片下载和缓存，核心组件包括 `AFImageDownloader`、`AFAutoPurgingImageCache`，以及 `UIImageView+AFNetworking`、`UIButton+AFNetworking` 等 UIKit 分类。

   `UIImageView+AFNetworking` 和 `UIButton+AFNetworking` 给 UIKit 控件增加了设置远程图片的便捷方法。业务层只需要传入图片 URL 或 request，分类内部会调用 `AFImageDownloader` 发起图片下载，并在下载成功后把图片设置到对应控件上。

   `AFImageDownloader` 负责真正的图片下载。它内部使用 `AFHTTPSessionManager` 发起请求，并配置 `AFImageResponseSerializer` 将响应数据解析成图片对象。它还支持并发下载队列、FIFO/LIFO 下载优先级、请求取消，以及相同图片请求的合并处理。

   缓存方面，AFNetworking 默认使用 `AFAutoPurgingImageCache` 作为内存图片缓存。下载前会先根据 request 查询缓存，如果缓存命中，就直接返回图片，避免重复网络请求；如果缓存未命中，才发起下载。下载成功后，会把图片写入缓存，后续相同请求可以复用。

   图片从下载到展示的大致流程是：控件分类先根据 URL 构造 `NSURLRequest`，再查询图片缓存；如果缓存命中，直接在控件上展示缓存图片；如果缓存未命中，则通过 `AFImageDownloader` 创建或复用下载任务。网络请求完成后，`AFImageResponseSerializer` 把响应 data 转成图片对象，下载器先把图片写入缓存，再回调控件分类设置图片。

   在列表滚动这类控件复用场景中，分类通常会保存当前图片请求对应的下载 receipt。当控件被复用或重新设置新 URL 时，可以取消旧请求对应的 receipt，避免旧请求完成后把图片设置到已经复用的控件上，减少错图问题。

   `AFAutoPurgingImageCache` 有内存容量限制，当缓存图片占用内存超过阈值时，会按照最近访问时间清理较旧的图片，让内存使用回落到指定范围。这样可以兼顾图片加载性能和内存控制。

   缓存策略上，AFNetworking 通常先查内存图片缓存，命中则立即展示；未命中再走网络下载；下载成功后写入内存缓存。底层还可以配合 `NSURLCache` 使用 HTTP 缓存，但 UIKit 图片扩展中最直接的性能优化来自 `AFAutoPurgingImageCache` 的内存缓存。

   面试时可以概括为：AFNetworking 的图片能力在 UIKit 扩展层实现，控件分类负责“请求图片并展示”，`AFImageDownloader` 负责“下载、请求合并和取消”，`AFImageResponseSerializer` 负责“把 data 解析成图片”，`AFAutoPurgingImageCache` 负责“内存缓存、命中复用和自动清理”。

17. **`AFImageDownloader` 如何处理重复图片请求？**

   答案：`AFImageDownloader` 会对相同的图片请求做合并处理，避免同一张图片被重复下载。它内部会根据 `NSURLRequest` 识别当前是否已经有相同请求正在等待或执行，如果有，就不会再创建新的网络任务，而是把新的 success、failure 回调追加到已有下载任务上。

   当这个共享的图片下载任务完成后，`AFImageDownloader` 会按添加顺序依次触发所有绑定在该任务上的回调。这样多个 `UIImageView` 或 `UIButton` 同时请求同一张图片时，底层只需要一次网络请求，所有调用方都能收到结果。

   为了支持单个调用方取消请求，`AFImageDownloader` 会返回 `AFImageDownloadReceipt`。这个 receipt 中包含实际的 `NSURLSessionDataTask` 和一个唯一的 `receiptID`。取消时，AFNetworking 会根据 receiptID 移除当前调用方对应的回调，而不是简单地直接取消整个 data task。

   如果一个重复请求上还有其他调用方的回调没有取消，底层下载任务会继续执行，避免影响其他控件。如果所有回调都被取消，或者任务还在等待队列中且没有其他使用者，AFNetworking 才可能取消底层任务。

   面试时可以概括为：`AFImageDownloader` 通过请求去重和回调合并避免重复下载，同一个图片 URL 只创建一个底层下载任务，多个调用方共享结果；取消时通过 `AFImageDownloadReceipt` 只移除当前调用方的回调，避免误伤其他相同请求。

18. **`AFAutoPurgingImageCache` 的自动清理策略是什么？**

   答案：`AFAutoPurgingImageCache` 是 AFNetworking 默认的内存图片缓存，它的核心策略是按内存容量控制缓存，并在超过阈值时自动清理较旧、较少访问的图片。

   它内部会维护当前图片缓存的总内存占用，也就是 `memoryUsage`。同时有两个关键容量配置：`memoryCapacity` 表示缓存允许使用的最大内存容量，`preferredMemoryUsageAfterPurge` 表示触发清理后希望回落到的目标内存占用。默认情况下，`memoryCapacity` 是 100 MB，`preferredMemoryUsageAfterPurge` 是 60 MB。

   每张缓存图片都会关联一个唯一 identifier，并记录图片大小和最近访问时间。当缓存新增图片后，如果总内存超过 `memoryCapacity`，缓存会按照最近访问时间排序，优先清理最久没有被访问的图片，直到总内存降到 `preferredMemoryUsageAfterPurge` 附近。

   当图片被读取时，它的访问时间会被更新，所以经常使用的图片会更晚被清理，不常使用的旧图片会优先被移除。这种策略类似 LRU 的思路，用空间换取图片加载速度，同时避免内存无限增长。

   在图片展示链路中，缓存策略通常是“先读缓存，再决定是否下载”。`AFImageDownloader` 会根据 request 和 additional identifier 生成缓存 key，并向 `AFAutoPurgingImageCache` 查询图片；缓存命中时直接返回图片，不创建新的网络任务；缓存未命中时才发起下载。下载成功后，如果 `shouldCacheImage:forRequest:withAdditionalIdentifier:` 返回允许缓存，图片会被写入缓存。

   这个策略的好处是列表图片、头像、按钮图片等重复出现的资源可以快速展示，减少网络请求和解析成本；同时缓存又有容量上限，内存压力变大时可以自动清理旧图片，避免无限占用内存。

   面试时可以概括为：`AFAutoPurgingImageCache` 是一个带容量上限的内存图片缓存，超过最大容量后会根据最近访问时间清理旧图片，直到内存占用降到目标阈值，从而平衡缓存命中率和内存压力。

19. **AFNetworking 为什么要通过协议抽象序列化逻辑？**

   答案：AFNetworking 通过 `AFURLRequestSerialization` 和 `AFURLResponseSerialization` 两个协议抽象序列化逻辑，主要是为了让网络请求执行流程和具体的数据格式处理解耦。`AFURLSessionManager` 和 `AFHTTPSessionManager` 不需要关心参数最终是 query、form、JSON 还是 plist，也不需要关心响应最终解析成 JSON、XML、图片还是原始 data。

   请求序列化协议只要求实现“如何把参数编码进请求”，响应序列化协议只要求实现“如何把响应 data 转成对象”。这样 manager 只负责请求生命周期和任务执行，serializer 负责数据格式转换，职责边界更清晰。

   这种设计带来的好处是可替换。业务方可以根据接口需要替换 `requestSerializer` 或 `responseSerializer`，比如某些接口用 JSON 请求体，某些接口用表单请求；某些接口返回 JSON，某些接口返回图片或文件。manager 的执行逻辑不用改变，只需要换 serializer。

   另一个好处是可扩展。如果业务有自定义协议格式，比如统一包裹的响应结构、自定义加密签名、特殊 MIME type、Protobuf 或其他二进制格式，可以实现对应的 serializer，接入现有请求流程，而不需要修改 AFNetworking 的核心 session 管理代码。

   面试时可以概括为：协议抽象让“网络任务执行”和“数据格式转换”分离。manager 负责发请求和管理 task，serializer 负责请求参数编码和响应数据解析。这样可以降低耦合，方便替换默认实现，也方便业务扩展自定义序列化逻辑。

20. **AFNetworking 4.x 为什么被废弃？现代项目应该如何迁移？**

   答案：AFNetworking 4.x 被废弃的主要原因是项目已经完成历史使命，维护团队在 2023 年宣布不再继续发布新版本。AFNetworking 是 Objective-C 时代非常主流的网络库，但 Apple 平台开发生态已经明显转向 Swift，系统 `URLSession` 能力也持续增强，现代 Swift 项目通常更倾向使用 Alamofire 或直接基于 `URLSession` 封装。

   从技术定位上看，AFNetworking 主要服务于 Objective-C 项目和早期 iOS/macOS 网络开发场景。随着 Swift、Codable、async/await、Combine、URLSessionTaskMetrics 等现代能力成熟，继续维护一套 Objective-C 网络抽象的收益变低，迁移到更现代的网络方案更符合长期维护方向。

   现代项目迁移时，通常有两种路线。Swift 项目可以优先考虑迁移到 Alamofire，因为 Alamofire 可以理解为 AFNetworking 在 Swift 生态下的延续，提供请求构造、参数编码、响应解析、认证、证书校验、上传下载等高层能力。轻量项目也可以直接基于系统 `URLSession`、`Codable` 和 async/await 封装自己的网络层。

   迁移不建议一次性全量替换。更稳妥的方式是先抽象业务网络层接口，把业务代码从 AFNetworking 具体 API 中隔离出来；然后按模块或接口逐步迁移请求实现；最后迁移图片加载、上传下载、证书校验、网络状态监听等附属能力。迁移过程中要重点对齐参数编码方式、header、超时、错误模型、响应解析、SSL Pinning 和缓存策略。

   对仍在维护的 Objective-C 老项目，如果短期无法迁移，可以继续固定使用现有 AFNetworking 版本，或 fork 仓库自行维护安全补丁。但新项目或长期演进项目，不建议继续把 AFNetworking 作为新的基础网络库。

   面试时可以概括为：AFNetworking 被废弃是因为它属于 Objective-C 时代的网络封装，现代 Apple 开发生态已经转向 Swift、Alamofire 和更强的原生 `URLSession`。迁移时应先抽象业务网络层，再逐步替换请求、解析、上传下载、安全策略和图片加载能力，避免一次性大改带来风险。

## 2. 架构设计类题目

1. **请画出 AFNetworking 的核心架构图，并说明各模块职责。**

   答案：AFNetworking 的核心架构可以理解为“业务调用层 -> HTTP 便捷封装层 -> Session 任务管理层 -> 序列化/安全/可达性等支撑模块 -> 系统 URL Loading System”。它不是重新实现网络栈，而是在 `NSURLSession` 之上做模块化封装。

   ```mermaid
   graph TB
       App[业务层 / API Client] --> HTTP[AFHTTPSessionManager]
       App --> Session[AFURLSessionManager]
       App --> UIKit[UIKit+AFNetworking]

       HTTP --> Request[AFURLRequestSerialization]
       HTTP --> Session

       Session --> Response[AFURLResponseSerialization]
       Session --> Security[AFSecurityPolicy]
       Session --> Reachability[AFNetworkReachabilityManager]
       Session --> URLSession[NSURLSession / NSURLSessionTask]

       UIKit --> ImageDownloader[AFImageDownloader]
       UIKit --> ImageCache[AFAutoPurgingImageCache]
       UIKit --> Categories[UIImageView / UIButton 等分类]
       ImageDownloader --> HTTP
       ImageDownloader --> ImageCache
   ```

   `AFHTTPSessionManager` 是面向业务使用的 HTTP 客户端封装，提供 `GET`、`POST`、`PUT`、`PATCH`、`DELETE` 等便捷方法，并持有 `requestSerializer` 和 `responseSerializer`。一般业务 API 请求通常从这一层发起。

   `AFURLSessionManager` 是核心任务管理层，封装 `NSURLSession`，负责创建和管理 data、upload、download task，处理 delegate 回调、上传下载进度、任务完成、响应序列化、安全 challenge 等通用逻辑。

   `AFURLRequestSerialization` 负责请求序列化，也就是把业务参数编码成 URL query、form body、JSON body、plist body 或 multipart body，并设置请求头、超时时间、缓存策略等请求配置。

   `AFURLResponseSerialization` 负责响应序列化，也就是校验 HTTP 状态码和 `Content-Type`，再把响应 data 解析成 JSON、XML、plist、image 或原始 data。

   `AFSecurityPolicy` 负责 HTTPS 服务端信任评估，包括系统证书链校验、域名校验和 SSL Pinning。`AFNetworkReachabilityManager` 负责监听网络可达性状态，用于网络状态提示、失败辅助判断或网络恢复后的重试触发。

   `UIKit+AFNetworking` 是 UI 扩展层，主要包括图片下载、图片缓存和 UIKit 控件分类。`AFImageDownloader` 负责下载和请求合并，`AFAutoPurgingImageCache` 负责内存图片缓存，`UIImageView+AFNetworking`、`UIButton+AFNetworking` 等分类负责把下载结果展示到 UI 控件上。

   面试时可以概括为：AFNetworking 采用分层架构，底层依赖 `NSURLSession`，中间由 `AFURLSessionManager` 管理任务，由 request/response serializer 处理数据格式，由 `AFSecurityPolicy` 和 reachability 提供安全与网络状态能力，上层由 `AFHTTPSessionManager` 提供 HTTP 便捷 API，UIKit 扩展则负责图片下载、缓存和展示。

2. **为什么 `AFHTTPSessionManager` 要继承 `AFURLSessionManager`？**

   答案：`AFHTTPSessionManager` 继承 `AFURLSessionManager`，是为了复用底层 `NSURLSession` 任务管理能力，同时在其基础上扩展 HTTP 场景下更方便使用的 API。

   `AFURLSessionManager` 是通用 session 管理器，已经封装了 `NSURLSession`、任务创建、delegate 回调、上传下载进度、响应序列化、安全 challenge、任务完成回调等能力。这些能力不仅 HTTP 请求需要，普通 data task、upload task、download task 也都需要。

   `AFHTTPSessionManager` 关注的是 HTTP 客户端能力，比如 `baseURL`、`requestSerializer`、默认 headers、参数编码，以及 `GET`、`POST`、`PUT`、`PATCH`、`DELETE` 等便捷方法。它不需要重新实现任务生命周期管理，只需要把 HTTP 请求构造好，然后交给父类创建和执行 `NSURLSessionTask`。

   这种继承关系体现了 AFNetworking 的分层设计：父类负责通用网络任务管理，子类负责 HTTP 协议语义和业务友好的调用方式。这样既避免重复代码，也让低层能力和高层 HTTP API 的职责边界更清晰。

   面试时可以概括为：`AFURLSessionManager` 是通用的 `NSURLSession` 封装，负责 task 生命周期；`AFHTTPSessionManager` 是 HTTP 专用客户端，负责 baseURL、请求序列化和常见 HTTP 方法。继承的目的就是复用底层 session 管理能力，并在上层扩展 HTTP 便捷 API。

3. **AFNetworking 为什么把请求序列化和响应序列化设计成独立模块？**

   答案：AFNetworking 把请求序列化和响应序列化设计成独立模块，核心原因是为了把“网络任务执行”和“数据格式转换”解耦。`AFURLSessionManager` 和 `AFHTTPSessionManager` 只需要负责创建、执行和管理请求，不需要把各种参数编码格式、响应解析格式都写死在 manager 里。

   请求序列化解决的是“请求发出前”的问题，也就是业务参数如何进入 HTTP 请求。比如参数是拼到 URL query，还是放到 form body，还是转成 JSON body，或者构造成 multipart body。不同接口可能要求不同格式，所以这部分独立成 `requestSerializer` 更灵活。

   响应序列化解决的是“响应回来后”的问题，也就是服务端返回的原始 data 如何校验和转换。比如校验状态码和 `Content-Type`，再解析成 JSON、XML、plist、image 或保留为原始 data。不同接口返回的数据类型不同，所以这部分独立成 `responseSerializer` 更容易替换。

   独立模块化还有利于扩展。业务方可以自定义 serializer 来支持统一响应壳解析、自定义错误码、加解密、签名、Protobuf、特殊 MIME type 等逻辑，而不用修改底层 session 管理代码。

   面试时可以概括为：请求序列化和响应序列化被独立出来，是为了让 manager 专注于网络任务生命周期，让 serializer 专注于数据格式转换。这样职责清晰、耦合低，也方便根据不同接口替换或自定义序列化逻辑。

4. **AFNetworking 如何做到核心网络层和 UIKit 扩展层解耦？**

   答案：AFNetworking 通过源码目录拆分、入口头文件拆分、依赖方向控制、条件编译和包管理 subspec，把核心网络层和 UIKit 扩展层解耦。

   核心网络层放在 `AFNetworking/` 目录下，主要包括 `AFURLSessionManager`、`AFHTTPSessionManager`、请求/响应序列化、`AFSecurityPolicy`、`AFNetworkReachabilityManager` 等。这一层只依赖 Foundation、Security、SystemConfiguration 等系统基础框架，不依赖 `UIImageView`、`UIButton`、`UIProgressView` 这类 UIKit 控件。

   UIKit 扩展层放在 `UIKit+AFNetworking/` 目录下，主要包括 `UIImageView+AFNetworking`、`UIButton+AFNetworking`、`AFImageDownloader`、`AFAutoPurgingImageCache` 等。它可以依赖核心网络层，比如 `AFImageDownloader` 内部使用 `AFHTTPSessionManager` 下载图片，但核心网络层不会反向依赖 UIKit 扩展层。

   入口头文件也体现了解耦。`AFNetworking/AFNetworking.h` 主要导入核心网络能力；`UIKit+AFNetworking/UIKit+AFNetworking.h` 只在 iOS/tvOS 等支持 UIKit 的平台导入 UI 扩展。Framework umbrella header 会根据平台条件导入对应模块，但底层源码仍保持分层。

   包管理上，CocoaPods 把 `UIKit` 做成独立 subspec，并依赖 `NSURLSession` subspec；Swift Package Manager 的 target 只指向 `AFNetworking/` 核心目录，因此不包含 `UIKit+AFNetworking`。这说明 UIKit 能力是可选附加层，不是核心网络层的一部分。

   面试时可以概括为：AFNetworking 的解耦方式是核心网络层不依赖 UIKit，UIKit 扩展层单向依赖核心网络层；再通过独立目录、独立头文件、条件编译和 CocoaPods subspec 控制模块边界，从而让纯网络能力可以脱离 UI 单独使用。

5. **CocoaPods subspec 中 `Serialization`、`Security`、`Reachability`、`NSURLSession`、`UIKit` 的关系是什么？**

   答案：AFNetworking 在 CocoaPods 中通过 subspec 把功能拆成多个可组合模块，方便按需引入。整体依赖关系可以理解为：`Serialization`、`Security`、`Reachability` 是基础能力模块，`NSURLSession` 是核心网络执行模块，`UIKit` 是建立在核心网络能力之上的 UI 扩展模块。

   `Serialization` 包含 `AFURLRequestSerialization` 和 `AFURLResponseSerialization`，负责请求参数编码和响应数据解析。它是 `NSURLSession` subspec 的基础依赖，因为 session manager 执行请求时需要 request serializer 和 response serializer。

   `Security` 包含 `AFSecurityPolicy`，负责 HTTPS 服务端信任评估和 SSL Pinning。`NSURLSession` subspec 依赖它，因为 `AFURLSessionManager` 在处理 authentication challenge 时需要安全策略。

   `Reachability` 包含 `AFNetworkReachabilityManager`，负责网络可达性监听。它在 iOS、macOS、tvOS 上被 `NSURLSession` subspec 依赖，但 watchOS 不包含这个能力。

   `NSURLSession` subspec 包含 `AFURLSessionManager`、`AFHTTPSessionManager` 和兼容宏，是 AFNetworking 的核心网络请求模块。它依赖 `Serialization`、`Security`，并在支持的平台依赖 `Reachability`。

   `UIKit` subspec 包含 `UIKit+AFNetworking` 目录下的图片下载、缓存和 UIKit 控件分类。它依赖 `NSURLSession` subspec，因为图片下载等 UI 扩展需要复用 `AFHTTPSessionManager` 和核心请求能力。

   面试时可以概括为：`Serialization`、`Security`、`Reachability` 是基础支撑模块，`NSURLSession` 在它们之上提供核心网络请求能力，`UIKit` 再依赖 `NSURLSession` 提供图片下载、缓存和 UI 控件扩展。这个 subspec 设计体现了 AFNetworking 的模块化和按需引入能力。

6. **Swift Package Manager 集成 AFNetworking 时为什么不包含 `UIKit+AFNetworking`？**

   答案：因为这个仓库的 `Package.swift` 只定义了一个名为 `AFNetworking` 的 target，并且 target path 指向 `AFNetworking/` 核心源码目录。`UIKit+AFNetworking/` 是单独的目录，没有被包含进 Swift Package target，所以通过 Swift Package Manager 集成时只会拿到核心网络层能力，不会包含 UIKit 分类、图片下载和图片缓存扩展。

   这样设计的一个重要原因是平台兼容性。Swift Package 声明支持 macOS、iOS、tvOS、watchOS，而 `UIKit+AFNetworking` 依赖 UIKit，只适用于 iOS/tvOS 的部分能力，某些扩展还只适用于 iOS，比如 `UIRefreshControl+AFNetworking`、`WKWebView+AFNetworking`、`AFNetworkActivityIndicatorManager`。如果直接把 UIKit 扩展放进同一个跨平台 target，会让平台条件和编译配置更复杂。

   另一个原因是模块边界。核心 `AFNetworking/` 目录只依赖 Foundation、Security、SystemConfiguration 等基础框架，适合作为通用网络库；`UIKit+AFNetworking/` 是 UI 附加能力，主要服务于图片展示、控件状态绑定和 UIKit 分类。把它排除在 Swift Package 之外，可以保持核心网络库更轻量，也避免非 UIKit 平台引入不必要依赖。

   CocoaPods 中可以通过 `UIKit` subspec 单独引入这些 UI 扩展，而 Swift Package 版本没有定义对应的 UIKit target 或 product。所以如果项目通过 SPM 集成 AFNetworking，又需要 `UIImageView+AFNetworking`、`AFImageDownloader` 等能力，就需要使用 CocoaPods/Carthage，或者手动把 `UIKit+AFNetworking` 源码加入工程。

   面试时可以概括为：SPM 版本只打包 `AFNetworking/` 核心网络目录，不包含 `UIKit+AFNetworking/`。这是为了保持跨平台核心 target 简洁，避免把 UIKit 依赖混入通用网络层；UIKit 扩展在 CocoaPods 中作为单独 subspec 存在，属于可选 UI 附加能力。

7. **AFNetworking 如何通过条件编译支持 iOS、macOS、watchOS、tvOS？**

   答案：AFNetworking 通过 `TargetConditionals.h` 提供的平台宏做条件编译，根据不同 Apple 平台选择性导入头文件、编译源码和暴露功能。常见宏包括 `TARGET_OS_IOS`、`TARGET_OS_TV`、`TARGET_OS_WATCH` 等。

   在核心入口 `AFNetworking.h` 中，`AFNetworkReachabilityManager` 会在非 watchOS 平台导入，也就是通过 `#if !TARGET_OS_WATCH` 排除 watchOS。原因是 watchOS 对部分 SystemConfiguration reachability 能力支持不同，AFNetworking 在 watchOS 下不暴露该模块。

   在请求序列化和图片相关模块中，AFNetworking 会根据平台选择不同 UI 框架。比如 iOS/tvOS 使用 UIKit，watchOS 使用 WatchKit，macOS 则不会使用 UIKit。响应图片序列化也会根据平台返回不同图片类型，例如 iOS/tvOS/watchOS 使用 `UIImage`，macOS 使用 `NSImage`。

   在 `UIKit+AFNetworking.h` 中，UIKit 扩展只在支持 UIKit 的平台导入。iOS/tvOS 会导入 `UIImageView+AFNetworking`、`UIButton+AFNetworking`、`UIProgressView+AFNetworking`、`AFImageDownloader`、`AFAutoPurgingImageCache` 等；而 `AFNetworkActivityIndicatorManager`、`UIRefreshControl+AFNetworking`、`WKWebView+AFNetworking` 只在 iOS 下导入。

   包管理层也配合平台差异。CocoaPods podspec 为 iOS、macOS、watchOS、tvOS 分别设置 deployment target，并让 `Reachability`、`UIKit` 等 subspec 按平台声明依赖；Swift Package 则只暴露核心 `AFNetworking` target，降低跨平台编译复杂度。

   面试时可以概括为：AFNetworking 使用 `TargetConditionals.h` 的平台宏做条件编译，不同平台只编译和暴露自己支持的模块。核心网络能力跨平台复用，Reachability 在 watchOS 排除，UIKit 扩展只在 iOS/tvOS 或 iOS 下启用，图片类型和 UI 依赖也按平台切换。

8. **如果要基于 AFNetworking 封装公司内部 API Client，应该继承哪个类？为什么？**

   答案：通常应该基于 `AFHTTPSessionManager` 封装公司内部 API Client。因为公司业务接口大多数都是 HTTP/HTTPS API，需要 `baseURL`、统一 header、参数序列化、响应序列化、`GET`/`POST` 等便捷方法，而这些正是 `AFHTTPSessionManager` 提供的能力。

   `AFHTTPSessionManager` 已经继承了 `AFURLSessionManager` 的底层任务管理能力，同时额外提供 HTTP 客户端常用功能。封装内部 API Client 时，可以在初始化方法中统一设置 `baseURL`、`requestSerializer`、`responseSerializer`、超时时间、公共 headers、token、`acceptableContentTypes`、安全策略等。

   典型做法是创建一个类似 `CompanyAPIClient : AFHTTPSessionManager` 的类，并提供单例或依赖注入方式给业务模块使用。业务层不直接接触 AFNetworking 的底层细节，而是调用 API Client 提供的业务方法，比如 `fetchUserProfile`、`uploadAvatar`、`requestOrderList` 等。

   需要注意，除了继承，也可以使用组合方式，在公司 API Client 内部持有一个 `AFHTTPSessionManager`。如果只是简单封装公共配置，继承会比较直接；如果希望降低和 AFNetworking 的耦合，方便未来迁移到 Alamofire 或原生 `URLSession`，组合方式会更灵活。

   面试时可以概括为：公司内部 API Client 一般基于 `AFHTTPSessionManager`，因为它是 HTTP 专用客户端，已经封装了 baseURL、请求序列化、响应序列化和常见 HTTP 方法。封装时应把公共配置和业务 API 方法集中在这一层，避免业务代码到处直接依赖 AFNetworking。

9. **如果业务需要统一添加 token、公共 header、超时时间，应该在哪一层处理？**

   答案：这类通用请求配置应该集中在公司内部 API Client 或 `requestSerializer` 层处理，而不应该散落在每个业务请求里。通常会在基于 `AFHTTPSessionManager` 封装的 API Client 初始化阶段统一配置。

   公共 header 和 token 可以通过 `requestSerializer` 设置，比如使用 `setValue:forHTTPHeaderField:` 添加 `Authorization`、`User-Agent`、`Accept-Language`、业务渠道号、App 版本号、设备信息等。这样所有通过该 manager 发出的请求都会自动带上这些 header。

   超时时间也适合配置在 `requestSerializer.timeoutInterval` 上。这样可以统一控制接口默认超时时间，避免不同业务模块随意设置造成行为不一致。如果个别接口确实有特殊超时要求，可以在 API Client 的某个方法里单独覆盖，而不是让业务层直接操作底层 request。

   token 如果会动态变化，比如登录后刷新 token，可以在 API Client 中提供统一的更新方法，刷新后同步更新 `requestSerializer` 的 `Authorization` header。对于 token 过期、自动刷新 token、请求重试等更复杂逻辑，也应该放在 API Client 或更上层的网络协调器中统一处理。

   面试时可以概括为：公共 header、token、超时时间属于请求的公共配置，应该集中放在 API Client 的 `requestSerializer` 中处理。这样可以保证所有请求行为一致，也避免业务代码到处重复设置，后续修改和排查问题更容易。

10. **如果业务需要统一解析服务端自定义错误码，应该在哪一层处理？**

   答案：服务端自定义错误码应该放在统一响应处理层处理，常见位置是自定义 `responseSerializer`、公司内部 API Client 的统一 completion 包装层，或者更上层的网络结果适配层。核心原则是不要让每个业务页面都重复解析 `code`、`message`、`data` 这类通用响应结构。

   如果服务端所有接口都有统一响应格式，比如 `{ "code": 0, "message": "...", "data": ... }`，可以自定义一个继承自 `AFJSONResponseSerializer` 的 serializer。在 JSON 解析完成后，统一检查 `code` 是否表示业务成功；如果 `code` 表示 token 过期、无权限、参数错误、服务端业务失败，就构造业务 NSError，并让请求进入统一错误处理逻辑。

   也可以在 API Client 层包装 `success` 和 `failure`。这种做法是先让 `AFJSONResponseSerializer` 负责基础 JSON 解析，然后 API Client 再对解析出来的字典做业务错误码判断，把成功数据和业务错误转换成统一的 result 或 callback。这样比直接改 serializer 更灵活，也方便不同业务线有不同响应格式。

   分层上可以这样理解：HTTP 状态码、`Content-Type`、JSON 是否可解析，属于 response serializer 的基础职责；服务端 `code`、`message` 这种业务语义，属于业务网络层的统一响应处理职责。两者可以放在同一个自定义 serializer 中，也可以拆成 serializer + API Client 两层处理。

   面试时可以概括为：自定义错误码不应该散落在业务页面里解析，而应该在统一响应处理层处理。基础响应校验由 `responseSerializer` 做，业务 code 判断可以放在自定义 serializer 或 API Client 的统一 completion 包装中，从而保证错误模型一致、方便统一处理 token 过期和业务失败。

## 3. 请求序列化相关题目

1. **`AFURLRequestSerialization` 协议定义了什么核心方法？**

   答案：`AFURLRequestSerialization` 协议的核心方法是 `requestBySerializingRequest:withParameters:error:`。它的职责是接收一个原始 `NSURLRequest` 和业务参数，然后返回一个已经完成参数编码、header 设置和 body 处理的新 request。

   这个协议把“如何把业务参数变成 HTTP 请求”抽象出来。不同 serializer 可以用不同方式实现这个方法，比如 `AFHTTPRequestSerializer` 把参数编码成 query 或 form body，`AFJSONRequestSerializer` 把参数编码成 JSON body，`AFPropertyListRequestSerializer` 把参数编码成 plist body。

   面试时可以概括为：`AFURLRequestSerialization` 的核心方法就是把原始 request 和 parameters 转成可发送的 request，它定义了请求序列化器的统一入口。

2. **AFNetworking 如何将字典参数编码成 query string？**

   答案：AFNetworking 会通过 `AFQueryStringFromParameters` 将字典参数展开成 URL query string。它会遍历参数字典，把 key 和 value 转换成 `key=value` 的形式，并用 `&` 拼接多个参数。

   在编码过程中，key 和 value 会经过百分号转义，也就是调用类似 `AFPercentEscapedStringFromString` 的逻辑，确保空格、中文、特殊符号等内容能安全出现在 URL 中。比如 `@{@"name": @"Tom", @"age": @18}` 可以编码成 `age=18&name=Tom` 这类 query string。

   如果参数里有数组、字典等复杂结构，AFNetworking 会递归展开，生成符合常见 Web 后端解析习惯的 key 格式。最终 query string 会根据 HTTP method 决定拼到 URL 后面，或者放到 request body 中。

   面试时可以概括为：AFNetworking 会把字典参数递归展开成多个 query pair，对 key/value 做百分号转义，再用 `&` 拼成 query string。

3. **GET 请求和 POST 请求的参数默认分别放在哪里？**

   答案：默认情况下，`AFHTTPRequestSerializer` 会把 `GET` 请求的参数放到 URL query 中，也就是拼接到 URL 的 `?` 后面。比如 `GET /users` 携带 `page=1`、`size=20`，最终会变成类似 `/users?page=1&size=20`。

   对于普通 `POST` 请求，默认会把参数放到 HTTP body 中，并按 `application/x-www-form-urlencoded` 的形式编码，比如 `name=Tom&age=18`。这种方式适合传统表单提交接口。

   但这不是绝对规则，而是由 `HTTPMethodsEncodingParametersInURI` 和具体 serializer 决定。如果使用 `AFJSONRequestSerializer`，`POST` 参数通常会被编码成 JSON body；如果是 multipart `POST`，参数和文件会被组装进 `multipart/form-data` body。

   面试时可以概括为：默认 GET 参数进 URL query，普通 POST 参数进 HTTP body；具体编码位置和格式由 request serializer 和 `HTTPMethodsEncodingParametersInURI` 控制。

4. **`HTTPMethodsEncodingParametersInURI` 的作用是什么？**

   答案：`HTTPMethodsEncodingParametersInURI` 用来决定哪些 HTTP method 的参数应该编码到 URL query 中，而不是放到 HTTP body。`AFHTTPRequestSerializer` 默认通常会把 `GET`、`HEAD`、`DELETE` 这类方法放进这个集合。

   当请求 method 在这个集合中时，serializer 会把 parameters 编码成 query string，并拼接到 URL 后面。当 method 不在集合中时，参数通常会被编码到 HTTP body 中，例如普通 `POST`、`PUT`、`PATCH`。

   这个属性提供了灵活性。如果某些后端接口要求 `DELETE` 参数放在 body，或者某些 `POST` 参数必须放在 query 中，可以通过调整这个集合或自定义序列化逻辑来实现。

   面试时可以概括为：`HTTPMethodsEncodingParametersInURI` 控制“哪些请求方法的参数走 URL query”，默认 GET/HEAD/DELETE 走 URI，POST/PUT/PATCH 多数走 body。

5. **`AFPercentEscapedStringFromString` 的作用是什么？**

   答案：`AFPercentEscapedStringFromString` 的作用是对 URL query 中的 key 或 value 做百分号转义，保证参数可以安全放进 URL。URL 中有些字符有特殊含义，比如空格、中文、`#`、`&`、`=`、`+` 等，如果不转义，可能导致 URL 解析错误或参数含义被破坏。

   它会遵循 RFC 3986 的规则，对 query string 中不应该直接出现的保留字符进行转义。例如空格可能被转成 `%20`，中文会被转成对应的百分号编码。

   这个方法通常不是业务层直接调用，而是 request serializer 在生成 query string 时内部使用。它保证 `AFQueryStringFromParameters` 生成的 query string 符合 URL 编码规范。

   面试时可以概括为：它负责 URL 参数的百分号转义，避免特殊字符破坏 query string 结构，是参数安全拼接到 URL 中的基础工具方法。

6. **`AFQueryStringFromParameters` 如何处理数组、字典等复杂参数？**

   答案：`AFQueryStringFromParameters` 会递归处理复杂参数，把字典、数组、集合等结构展开成一组扁平的 query pair。它不会简单地把复杂对象转成字符串，而是按照嵌套结构生成更容易被服务端解析的 key。

   对字典来说，它通常会使用类似 `user[name]=Tom`、`user[age]=18` 的形式表达嵌套字段。对数组来说，它通常会使用类似 `ids[]=1&ids[]=2` 的形式表达多个值。这样服务端可以根据约定把 query string 还原成数组或嵌套对象。

   展开完成后，每个 key 和 value 都会做百分号转义，然后再用 `&` 拼接成最终 query string。需要注意，不同服务端框架对数组和嵌套对象的解析约定可能不同，如果后端格式特殊，可以自定义 query string serialization block。

   面试时可以概括为：它会递归展开字典和数组，生成 bracket 风格的 query key，再对 key/value 转义并拼接，必要时可以通过自定义 block 覆盖默认规则。

7. **`AFJSONRequestSerializer` 如何设置请求体和 `Content-Type`？**

   答案：`AFJSONRequestSerializer` 会把 parameters 使用 `NSJSONSerialization` 序列化成 JSON 数据，然后写入 request 的 HTTP body。它适合服务端要求请求体是 JSON 的接口。

   同时，它会设置请求头 `Content-Type: application/json`，表示当前请求体的数据格式是 JSON。通常还会配合设置 `Accept: application/json`，表示客户端期望服务端返回 JSON。

   如果参数无法被 JSON 序列化，比如包含非 JSON 支持的对象，序列化过程会返回 error，请求创建失败。JSON 支持的数据类型主要包括字典、数组、字符串、数字、布尔值和 `NSNull`。

   面试时可以概括为：`AFJSONRequestSerializer` 把参数转成 JSON data 写入 HTTP body，并设置 `Content-Type` 为 `application/json`，用于 JSON body 风格的接口请求。

8. **multipart 请求的 boundary 是什么？为什么需要 boundary？**

   答案：boundary 是 multipart/form-data 请求体中用于分隔每一段表单数据的边界字符串。multipart 请求里可能同时包含普通字段、图片、文件、二进制数据或 stream，服务端需要知道每一段数据从哪里开始、到哪里结束，boundary 就是这个分隔标记。

   请求头中会包含类似 `Content-Type: multipart/form-data; boundary=xxx` 的信息，请求体中每个 part 前后都会使用这个 boundary。每个 part 还会包含自己的字段名、文件名、MIME type 等 header，然后才是具体内容。

   如果没有 boundary，服务端就无法可靠地区分不同字段和文件内容。AFNetworking 在构造 multipart body 时会自动生成 boundary，并按规范组织每个 part，业务层只需要通过 `AFMultipartFormData` 追加文件或 data。

   面试时可以概括为：boundary 是 multipart body 的分隔符，用来让服务端识别每个表单字段和文件片段；AFNetworking 会自动生成并写入请求头和 body。

9. **multipart 上传大文件时为什么可能使用 stream？**

   答案：multipart 上传大文件时使用 stream，主要是为了降低内存占用。如果把大文件一次性读成 `NSData` 再放入 HTTP body，文件越大，占用内存越高，可能导致卡顿甚至内存警告。

   使用 stream 后，可以边读取文件边上传，不需要一次性把整个文件加载到内存中。AFNetworking 的 `AFMultipartFormData` 支持通过 `appendPartWithInputStream:name:fileName:length:mimeType:` 追加 stream，也支持通过 file URL 让底层按文件方式处理上传内容。

   对于图片、小文件，直接使用 `NSData` 比较方便；对于视频、日志包、大型附件等场景，使用 file URL 或 stream 更合理。这样可以提升上传稳定性，并减少内存峰值。

   面试时可以概括为：大文件上传用 stream 是为了避免一次性加载完整文件到内存，降低内存压力，适合视频、大附件等场景。

10. **如何自定义参数序列化策略？**

   答案：AFNetworking 提供了两种常见方式自定义参数序列化策略。第一种是使用 `AFHTTPRequestSerializer` 的 `setQueryStringSerializationWithBlock:`，自定义 parameters 如何转成 query string。适合只是 query 编码规则和默认规则不一致的场景。

   第二种是自定义 request serializer，实现 `AFURLRequestSerialization` 协议，或者继承 `AFHTTPRequestSerializer`、`AFJSONRequestSerializer` 后重写序列化逻辑。适合需要统一加密、签名、特殊 body 格式、Protobuf、XML body、自定义 header 或特殊参数结构的场景。

   在公司网络层中，自定义 serializer 通常会被设置到 `AFHTTPSessionManager.requestSerializer` 上。这样所有通过该 manager 发出的请求都会使用统一的参数编码策略。

   面试时可以概括为：简单自定义 query 规则可以用 serialization block；复杂场景可以实现或继承 request serializer，把自定义参数编码逻辑集中到 `requestSerializer` 中。

## 4. 响应序列化相关题目

1. **`AFURLResponseSerialization` 协议定义了什么核心方法？**

   答案：`AFURLResponseSerialization` 协议的核心方法是 `responseObjectForResponse:data:error:`。它接收服务端返回的 `NSURLResponse`、原始响应 `NSData` 和 error 指针，然后返回序列化后的对象。

   这个方法定义了响应序列化器的统一入口。不同 serializer 会用不同方式实现它，比如 `AFHTTPResponseSerializer` 返回原始 data，`AFJSONResponseSerializer` 解析 JSON，`AFImageResponseSerializer` 解析图片，`AFPropertyListResponseSerializer` 解析 plist。

   面试时可以概括为：`AFURLResponseSerialization` 的核心方法负责把 HTTP 响应和原始 data 转换成业务可用对象，同时在转换过程中处理校验和解析错误。

2. **AFNetworking 如何判断响应是否成功？**

   答案：AFNetworking 判断响应是否成功，不只是看网络请求是否完成，还要看响应校验和数据解析是否成功。底层网络没有 error、HTTP 状态码符合 `acceptableStatusCodes`、`Content-Type` 符合 `acceptableContentTypes`，并且 response serializer 能成功解析数据，才会进入 `success`。

   具体来说，`AFURLSessionManager` 在 task 完成后会把响应交给当前的 `responseSerializer`。`AFHTTPResponseSerializer` 会先通过 `validateResponse:data:error:` 校验状态码和 MIME type，校验通过后才继续做 JSON、图片、plist 等具体解析。

   面试时可以概括为：AFNetworking 的成功条件是“网络成功 + HTTP 校验成功 + 响应解析成功”。任意一步失败，都会进入 `failure`。

3. **`acceptableStatusCodes` 默认范围是什么？**

   答案：`AFHTTPResponseSerializer` 的 `acceptableStatusCodes` 默认通常是 2xx 范围，也就是 `200` 到 `299`。这表示 AFNetworking 默认把 HTTP 2xx 视为成功状态码。

   如果服务端返回 404、500 等非 2xx 状态码，默认会被 response serializer 判定为响应校验失败，并进入 `failure`。如果某些业务接口需要把 304、202 或其他状态码视为可接受，可以自定义 `acceptableStatusCodes`。

   面试时可以概括为：默认接受 2xx 状态码，非 2xx 通常会被认为是失败；业务可以通过修改 `acceptableStatusCodes` 调整成功状态码范围。

4. **`acceptableContentTypes` 的作用是什么？**

   答案：`acceptableContentTypes` 用来限制当前 response serializer 可以接受哪些响应 MIME type。它对应服务端响应头里的 `Content-Type`，用于判断返回内容是否符合当前解析器的预期。

   不同 serializer 默认接受的 MIME type 不同。比如 `AFJSONResponseSerializer` 默认接受 JSON 相关类型，如 `application/json`、`text/json`、`text/javascript`；`AFImageResponseSerializer` 默认接受图片相关类型；`AFHTTPResponseSerializer` 更偏通用原始 data 处理。

   如果服务端返回的 `Content-Type` 不在 `acceptableContentTypes` 中，即使 HTTP 状态码是 200，也可能进入 `failure`。业务方可以根据服务端实际情况扩展这个集合，但更好的做法通常是让服务端返回正确的 MIME type。

   面试时可以概括为：`acceptableContentTypes` 是响应 MIME type 白名单，用来保证当前 serializer 只解析自己能处理的数据类型。

5. **JSON 解析失败会进入 `success` 还是 `failure`？**

   答案：JSON 解析失败会进入 `failure`。因为 AFNetworking 的 `success` 不只是网络层成功，还要求 response serializer 能成功把响应 data 解析成目标对象。

   比如使用 `AFJSONResponseSerializer` 时，如果服务端返回了非法 JSON、空字符串、不完整 JSON，或者返回的是 HTML 错误页，`NSJSONSerialization` 解析会失败，AFNetworking 会把解析错误传给 `failure`。

   需要注意，HTTP 状态码是 200 也不代表一定进入 `success`。只要 JSON 解析阶段失败，仍然会被视为响应序列化失败。

   面试时可以概括为：JSON 解析失败属于响应序列化失败，因此会进入 `failure`，即使网络请求本身成功、状态码也是 200。

6. **服务端返回 200 但 `Content-Type` 不匹配时会发生什么？**

   答案：服务端返回 200 但 `Content-Type` 不匹配时，通常会进入 `failure`。因为状态码校验只是第一步，AFNetworking 还会通过 `acceptableContentTypes` 校验响应 MIME type 是否符合当前 serializer 的预期。

   例如当前使用 `AFJSONResponseSerializer`，但服务端返回 `Content-Type: text/html`，即使 body 里可能是 JSON 字符串，默认也可能被判定为 MIME type 不匹配。AFNetworking 会构造一个响应序列化错误，并通过 `failure` 回调返回。

   解决方式有两类：更推荐让服务端返回正确的 `Content-Type`，比如 `application/json`；如果服务端短期无法修改，客户端可以临时把对应 MIME type 加到 `acceptableContentTypes` 中。

   面试时可以概括为：HTTP 200 只说明状态码成功，不代表响应一定可被当前 serializer 接受；`Content-Type` 不匹配时会被 response serializer 判为失败。

7. **`AFCompoundResponseSerializer` 的使用场景是什么？**

   答案：`AFCompoundResponseSerializer` 用于组合多个 response serializer，并按顺序尝试解析同一份响应数据。它适合服务端响应类型不固定、同一个接口可能返回多种格式的场景。

   比如某些接口正常时返回 JSON，异常时可能返回纯文本；或者一个下载接口可能根据条件返回图片、JSON 错误对象或原始 data。使用 compound serializer 可以把 JSON serializer、image serializer、HTTP serializer 等组合起来，前一个解析失败时继续尝试下一个。

   需要注意，它不应该被滥用来掩盖服务端接口设计混乱。更理想的接口应该有明确的响应格式和正确的 `Content-Type`。compound serializer 更适合作为兼容历史接口或多格式响应的兜底方案。

   面试时可以概括为：`AFCompoundResponseSerializer` 是多个 serializer 的组合，会依次尝试解析响应，适合响应格式可能不固定或需要兼容多种返回类型的场景。

8. **`AFJSONResponseSerializer` 的 `removesKeysWithNullValues` 有什么作用？**

   答案：`removesKeysWithNullValues` 用来控制 JSON 解析后是否递归移除值为 `NSNull` 的键。默认情况下，JSON 中的 `null` 会被解析成 `NSNull`，保留在字典或数组中。

   如果把 `removesKeysWithNullValues` 设置为 `YES`，AFNetworking 会在 JSON 解析后递归遍历对象，把字典中值为 `NSNull` 的 key 移除。这样业务层访问字段时可以减少对 `NSNull` 的判断。

   但这也会改变服务端返回数据的结构。某些业务需要区分“字段不存在”和“字段存在但值为 null”，这种情况下不应该开启该选项。

   面试时可以概括为：它用于清理 JSON 结果中的 `NSNull` 值，降低业务层判空成本，但会丢失字段为 null 的语义，需要谨慎使用。

9. **`AFImageResponseSerializer` 如何处理图片响应？**

   答案：`AFImageResponseSerializer` 会先校验 HTTP 状态码和图片相关 `Content-Type`，然后把响应 `NSData` 解码成平台对应的图片对象。在 iOS、tvOS、watchOS 上通常是 `UIImage`，在 macOS 上通常是 `NSImage`。

   它适合图片下载场景，比如头像、封面图、列表图片等。`AFImageDownloader` 内部就会配置图片 response serializer，把网络返回的图片 data 转成图片对象，再交给缓存或 UIKit 控件展示。

   如果返回数据不是合法图片，或者 `Content-Type` 不符合图片 serializer 的可接受类型，解析会失败并进入 `failure`。

   面试时可以概括为：`AFImageResponseSerializer` 负责把图片响应 data 解码成 `UIImage` 或 `NSImage`，常用于 AFNetworking 的图片下载和 UIKit 图片展示扩展。

10. **如果服务端返回空 body，AFNetworking 应该如何处理？**

   答案：空 body 的处理取决于当前使用的 response serializer、HTTP 状态码和业务预期。对于某些状态码，比如 204 No Content、205 Reset Content，空 body 是合理的，serializer 通常应该允许没有响应内容。

   如果使用 `AFHTTPResponseSerializer`，空 data 可以作为原始 data 返回。若使用 `AFJSONResponseSerializer`，但接口返回 200 且 body 为空，JSON 解析通常会失败，因为空内容不是合法 JSON。此时可能进入 `failure`。

   解决方式是根据接口语义选择合适的 serializer 或调整服务端返回。如果接口确实没有内容，服务端可以返回 204；如果客户端期望 JSON，服务端应该返回合法 JSON，比如 `{}` 或 `[]`。客户端也可以在统一响应处理层对特定接口或特定状态码做兼容。

   面试时可以概括为：空 body 是否成功取决于 serializer 和状态码。204/205 这类无内容响应可以接受；如果用 JSON serializer 解析 200 空 body，通常会因为不是合法 JSON 进入 `failure`。

## 5. Session 与任务管理题目

1. **`AFURLSessionManager` 内部持有哪些关键对象？**

   答案：`AFURLSessionManager` 内部最关键的对象是 `NSURLSession` 和 `NSOperationQueue`。`session` 是真正执行网络请求的系统对象，`operationQueue` 是 `NSURLSession` delegate 回调执行的队列。

   它还持有 `responseSerializer`，用于在任务完成后校验和解析响应；持有 `securityPolicy`，用于 HTTPS 认证 challenge 中的服务端信任评估；在非 watchOS 平台还持有 `reachabilityManager`，用于网络可达性监听。

   此外，它会维护当前 session 下的任务集合，比如 `tasks`、`dataTasks`、`uploadTasks`、`downloadTasks`。内部实现中还会跟踪每个 task 对应的 delegate 或回调信息，用来管理进度、数据接收、完成回调等。

   面试时可以概括为：`AFURLSessionManager` 的核心对象包括 `NSURLSession`、delegate queue、response serializer、security policy、reachability manager 和 task 管理结构，它本质上是对 `NSURLSession` 任务生命周期的集中管理。

2. **`AFURLSessionManager` 实现了哪些 `NSURLSession` delegate？**

   答案：`AFURLSessionManager` 实现了 `NSURLSessionDelegate`、`NSURLSessionTaskDelegate`、`NSURLSessionDataDelegate` 和 `NSURLSessionDownloadDelegate`。这些 delegate 覆盖了 session 生命周期、task 生命周期、data task 数据接收和 download task 文件下载等场景。

   `NSURLSessionDelegate` 主要处理 session 失效、HTTPS authentication challenge、后台 session 事件完成等。`NSURLSessionTaskDelegate` 主要处理重定向、task 级别认证 challenge、上传进度、请求 body stream、任务完成等。

   `NSURLSessionDataDelegate` 主要处理 data task 的响应、数据接收、缓存响应等。`NSURLSessionDownloadDelegate` 主要处理 download task 的文件下载完成路径、下载进度、断点续传进度等。

   面试时可以概括为：`AFURLSessionManager` 实现了 session、task、data、download 四类 delegate，把系统网络回调统一接管后，再转换成 AFNetworking 的 block、progress 和 serializer 流程。

3. **AFNetworking 如何把 delegate 回调转换成 block 回调？**

   答案：AFNetworking 的思路是由 `AFURLSessionManager` 统一实现 `NSURLSession` delegate 方法，然后为每个 `NSURLSessionTask` 保存一份对应的回调上下文。这个上下文里会记录 upload progress block、download progress block、completion handler、下载目标路径 block 等。

   当系统 delegate 被触发时，manager 会根据 task 找到对应的内部 delegate 或回调对象。例如上传过程中收到 `didSendBodyData`，就更新 upload progress 并调用上传进度 block；下载过程中收到 `didWriteData`，就更新 download progress 并调用下载进度 block；任务完成时收到 `didCompleteWithError`，就统一做错误处理和响应序列化。

   任务完成后，AFNetworking 会把网络错误、原始响应和响应 data 交给 `responseSerializer`。序列化成功则调用 completion 中的成功路径，失败则调用错误路径。对于 `AFHTTPSessionManager` 的便捷 API，还会进一步映射成 `success` 和 `failure` block。

   面试时可以概括为：AFNetworking 自己作为 `NSURLSession` 的 delegate 接收系统回调，再根据 task 找到保存的 block 和进度对象，把 delegate 风格 API 包装成业务更容易使用的 block 风格 API。

4. **data task、upload task、download task 在 AFNetworking 中如何创建？**

   答案：data task 通常通过 `dataTaskWithRequest:uploadProgress:downloadProgress:completionHandler:` 创建。`AFHTTPSessionManager` 的 `GET`、`POST`、`PUT`、`PATCH`、`DELETE` 等便捷方法最终大多会先构造 request，再调用这个方法创建 `NSURLSessionDataTask`。

   upload task 可以通过 `uploadTaskWithRequest:fromFile:progress:completionHandler:`、`uploadTaskWithRequest:fromData:progress:completionHandler:` 或 `uploadTaskWithStreamedRequest:progress:completionHandler:` 创建，分别适合从文件、内存 data 或 stream 上传。

   download task 可以通过 `downloadTaskWithRequest:progress:destination:completionHandler:` 创建，也可以通过 resume data 创建断点续传任务。download task 完成后会先下载到系统临时位置，再根据 destination block 移动到业务指定路径。

   面试时可以概括为：AFNetworking 基于内部 `NSURLSession` 创建三类 task，data task 处理普通请求，upload task 处理文件/data/stream 上传，download task 处理文件下载和目标路径移动。

5. **`completionQueue` 和 `completionGroup` 的作用是什么？**

   答案：`completionQueue` 用来指定 completion block 最终在哪个 dispatch queue 上执行。如果没有设置，AFNetworking 默认通常会把 completion 回调派发到主队列，方便业务层更新 UI。

   `completionGroup` 用来指定 completion block 派发时使用的 dispatch group。它可以让调用方把多个网络请求的完成回调纳入同一个 group，方便做统一等待、统计或同步协调。

   这两个属性主要影响“完成回调的调度方式”，不改变请求本身的执行队列，也不改变 `NSURLSession` delegate 回调队列。delegate 回调仍然由 manager 的 `operationQueue` 管理。

   面试时可以概括为：`completionQueue` 控制完成回调在哪个队列执行，`completionGroup` 控制完成回调加入哪个 dispatch group，用于更灵活地调度和协调网络请求完成事件。

6. **`NSProgress` 在上传和下载中如何使用？**

   答案：AFNetworking 使用 `NSProgress` 表示上传和下载进度。上传时，系统 delegate 会提供已发送字节数和总字节数，AFNetworking 根据这些数据更新 upload progress；下载时，系统会提供已接收或已写入字节数和总字节数，AFNetworking 根据这些数据更新 download progress。

   对业务层来说，创建请求时可以传入 progress block，block 参数就是对应的 `NSProgress` 对象。业务层可以读取 `completedUnitCount`、`totalUnitCount`、`fractionCompleted` 等属性来更新进度条或展示百分比。

   对于 data task，下载进度通常来自 `URLSession:dataTask:didReceiveData:`；对于 download task，下载进度来自 `URLSession:downloadTask:didWriteData:totalBytesWritten:totalBytesExpectedToWrite:`；上传进度来自 `URLSession:task:didSendBodyData:totalBytesSent:totalBytesExpectedToSend:`。

   面试时可以概括为：AFNetworking 基于 `NSURLSession` delegate 提供的字节数更新 `NSProgress`，再通过 progress block 暴露给业务层，用于展示上传和下载进度。

7. **后台 session 为什么要求 manager 在任务期间保持存活？**

   答案：后台 session 的任务可能在 App 进入后台、挂起甚至重新唤起后继续执行。`AFURLSessionManager` 是 `NSURLSession` 的 delegate 持有者，如果 manager 在任务期间被释放，系统后续的下载完成、认证、进度、后台事件完成等回调就没有正确的对象来接收和处理。

   对 AFNetworking 来说，manager 不只是创建 task 的工具，它还保存 task 对应的回调、下载目标路径、response serializer、安全策略等上下文。后台任务完成时，仍然需要 manager 根据这些上下文做文件移动、响应处理和 completion 回调。

   因此使用后台 session 时，通常需要把 manager 设计成应用级单例或由更长生命周期的对象强引用，确保任务执行期间不会提前销毁。

   面试时可以概括为：后台 session 的回调可能晚于请求创建很久才到达，manager 必须存活才能接收系统 delegate 回调并处理任务上下文，所以后台 session manager 需要被长期持有。

8. **`invalidateSessionCancelingTasks:resetSession:` 的作用是什么？**

   答案：`invalidateSessionCancelingTasks:resetSession:` 用于让 `AFURLSessionManager` 当前管理的 `NSURLSession` 失效，并可选择是否取消未完成任务、是否重置 manager 内部的 session。

   `cancelPendingTasks` 为 `YES` 时，会取消当前 session 中还没有完成的任务；为 `NO` 时，通常表示让已有任务继续完成后再让 session 失效。`resetSession` 为 `YES` 时，manager 会重新创建一个 session，后续还可以继续用这个 manager 发起新请求。

   这个方法适合在登出、切换环境、释放网络层、取消一组请求、重置 session 配置等场景使用。它比逐个取消 task 更偏 session 级别的生命周期控制。

   面试时可以概括为：这个方法用于使当前 `NSURLSession` 失效，可选择取消未完成任务，并可选择重建 session，是 manager 级别的 session 清理和重置能力。

9. **如何取消一个 AFNetworking 请求？**

   答案：AFNetworking 请求本质上对应一个 `NSURLSessionTask`，所以最直接的取消方式是拿到返回的 task 后调用 `cancel`。比如 `AFHTTPSessionManager` 的 `GET`、`POST` 等方法会返回 `NSURLSessionDataTask`，业务层可以保存它，在页面退出或请求不再需要时取消。

   对 upload task 和 download task 也是类似，保存 `NSURLSessionUploadTask` 或 `NSURLSessionDownloadTask` 后调用 `cancel`。如果是 download task，还可以根据需求使用取消产生的 resume data 做断点续传。

   对图片下载，`AFImageDownloader` 通常不建议直接取消底层 task，而是通过 `AFImageDownloadReceipt` 调用取消方法。这样可以只移除当前调用方的回调，避免同一个图片请求被多个控件共享时误伤其他调用方。

   面试时可以概括为：普通 AFNetworking 请求通过保存返回的 `NSURLSessionTask` 并调用 `cancel` 取消；图片下载则优先通过 `AFImageDownloadReceipt` 取消当前调用方的图片请求。

10. **AFNetworking 如何处理下载文件的目标路径？**

   答案：AFNetworking 的 download task 完成后，系统会先把文件下载到一个临时路径。`AFURLSessionManager` 提供 `destination` block，让业务方根据临时路径和响应信息返回最终保存路径。

   常见写法是在 destination block 中获取 Documents、Caches 或临时目录，再根据 `response.suggestedFilename` 或业务文件名拼出目标 URL。AFNetworking 收到 `URLSession:downloadTask:didFinishDownloadingToURL:` 回调后，会把临时文件移动到 destination block 返回的位置。

   完成后，completion handler 会返回最终文件路径 `filePath`。如果移动文件失败，比如目标目录不存在、没有权限、同名文件处理失败，也会通过 error 体现出来。

   面试时可以概括为：download task 先下载到系统临时目录，AFNetworking 通过 destination block 让业务指定最终路径，然后在下载完成回调中把临时文件移动过去，并在 completion 中返回最终 file URL。

## 6. 安全相关题目

1. **`AFSecurityPolicy` 默认策略是什么？**

   答案：`AFSecurityPolicy` 的默认策略是不启用 SSL Pinning，不允许无效证书，并且校验证书域名。也就是说，它主要依赖系统默认的 CA 信任链来判断服务端证书是否可信。

   默认策略适合大多数标准 HTTPS 接口：服务端证书必须由系统信任的 CA 签发，证书不能过期或无效，并且证书中的域名要和请求域名匹配。如果这些条件不满足，AFNetworking 会拒绝该 HTTPS 连接。

   面试时可以概括为：默认策略是系统信任链校验 + 域名校验，不允许无效证书，不做证书或公钥绑定。

2. **`allowInvalidCertificates` 有什么风险？**

   答案：`allowInvalidCertificates` 表示是否允许无效、过期、自签名或不被系统信任的证书。如果开启它，客户端可能会接受本来不应该被信任的服务端证书。

   这个配置最大的风险是降低 HTTPS 的安全性。攻击者如果伪造证书或使用不受信任证书进行中间人攻击，客户端可能不会拒绝连接，从而导致请求内容、token、用户隐私数据被窃取或篡改。

   它通常只适合开发、测试、内网调试或临时验证环境。生产环境不建议开启；如果必须使用自签名证书，更合理的做法是配合证书 pinning，并保持域名校验。

   面试时可以概括为：开启 `allowInvalidCertificates` 会让客户端信任不合法证书，破坏 HTTPS 的证书信任基础，生产环境通常不能开启。

3. **`validatesDomainName` 为什么重要？**

   答案：`validatesDomainName` 用来校验证书中的域名是否和当前请求的域名匹配。HTTPS 证书不仅要由可信 CA 签发，还必须证明它属于当前访问的域名。

   如果关闭域名校验，攻击者可能拿一个其他域名的合法证书来冒充当前服务端。这个证书虽然可能被系统信任，但并不属于当前请求的域名，关闭域名校验会让这种错误证书也有机会通过。

   在开启 SSL Pinning 时，域名校验也通常应该保留。Pinning 负责确认服务端证书或公钥是否是预期的，域名校验负责确认这个证书是否用于正确的域名，两者关注点不同。

   面试时可以概括为：域名校验保证“证书属于当前访问的域名”，关闭它会让其他域名的合法证书也可能被误信任，增加中间人攻击风险。

4. **`AFSSLPinningModeNone`、`AFSSLPinningModePublicKey`、`AFSSLPinningModeCertificate` 有什么区别？**

   答案：`AFSSLPinningModeNone` 表示不做 SSL Pinning，只使用系统默认的证书链和域名校验。它适合普通 HTTPS 接口，配置简单，但安全强度主要依赖系统 CA 信任体系。

   `AFSSLPinningModeCertificate` 表示证书绑定。客户端会把 App 内置证书和服务端证书链中的证书进行匹配，要求证书内容匹配。它校验严格，但服务端证书更新时，客户端内置证书也可能需要更新。

   `AFSSLPinningModePublicKey` 表示公钥绑定。客户端从内置证书中提取公钥，再和服务端证书链中的公钥进行匹配。它比证书绑定更灵活，只要服务端换证书时继续使用同一套公钥，客户端通常不需要更新。

   面试时可以概括为：None 不绑定，Certificate 绑定完整证书，PublicKey 绑定证书中的公钥；证书绑定更严格，公钥绑定对证书续期更友好。

5. **证书绑定和公钥绑定各有什么优缺点？**

   答案：证书绑定的优点是校验更直接、更严格，客户端内置什么证书，服务端就必须匹配对应证书。缺点是证书过期、续签或更换时，客户端可能也要发版更新内置证书，否则线上请求可能失败。

   公钥绑定的优点是灵活性更好。如果服务端证书续期或更换，但继续使用同一对密钥，客户端公钥 pinning 仍然可以通过，降低证书更新带来的发版压力。缺点是如果密钥需要轮换，客户端仍然要更新内置公钥来源；同时实现上比完整证书比较稍复杂。

   实际项目中，安全要求非常高、证书变更可控时可以选择证书绑定；希望兼顾安全和证书续期灵活性时，公钥绑定更常见。

   面试时可以概括为：证书绑定安全边界更硬但维护成本高，公钥绑定更适合证书续期场景但仍需管理密钥轮换。

6. **AFNetworking 如何从 bundle 中加载 `.cer` 证书？**

   答案：AFNetworking 的 `AFSecurityPolicy` 提供了 `certificatesInBundle:` 方法，用于从指定 bundle 中查找 `.cer` 证书文件，并读取成 `NSData` 集合。

   创建 pinning 策略时，可以使用 `policyWithPinningMode:`，它会默认从 main bundle 中加载 `.cer` 证书；也可以使用 `policyWithPinningMode:withPinnedCertificates:`，手动传入证书集合，这样对证书来源更可控。

   如果 AFNetworking 以 framework 形式集成，证书可能不在 main bundle 中，这时需要明确指定包含证书的 bundle，再把加载出的证书传给 security policy。

   面试时可以概括为：AFNetworking 会把 bundle 中的 `.cer` 文件读成 `NSData`，作为 pinned certificates，用于证书或公钥绑定校验。

7. **HTTPS challenge 到来时 AFNetworking 如何决定是否信任服务端？**

   答案：当 `NSURLSession` 收到 HTTPS authentication challenge 时，`AFURLSessionManager` 会把服务端的 `serverTrust` 交给 `AFSecurityPolicy` 的 `evaluateServerTrust:forDomain:` 方法评估。

   评估过程通常包括系统证书链是否可信、证书是否有效、域名是否匹配，以及在开启 SSL Pinning 时，服务端证书或公钥是否和本地 pinned certificates 匹配。全部符合当前 security policy 的规则时，AFNetworking 才会使用 credential 接受该 trust。

   如果评估失败，AFNetworking 会拒绝 challenge，请求会失败并返回相关安全错误。

   面试时可以概括为：challenge 到来后，AFNetworking 用 `AFSecurityPolicy` 评估 `serverTrust`，通过系统信任链、域名和 pinning 校验后才信任服务端。

8. **为什么开启 SSL Pinning 可以降低中间人攻击风险？**

   答案：普通 HTTPS 依赖系统 CA 信任链。只要攻击者拿到某个系统信任 CA 签发的证书，并能让流量经过自己，就可能尝试中间人攻击。SSL Pinning 在系统信任链之外增加了一层客户端本地校验。

   开启 pinning 后，客户端不仅要求证书链合法、域名匹配，还要求服务端证书或公钥必须和 App 内置的证书或公钥匹配。攻击者即使拿到了其他受信任证书，只要和本地 pinned 内容不匹配，也无法通过校验。

   面试时可以概括为：SSL Pinning 把服务端身份固定到客户端本地证书或公钥上，减少对 CA 体系的单点依赖，从而降低伪造证书导致的中间人攻击风险。

9. **使用自签名证书时 AFNetworking 需要如何配置？**

   答案：使用自签名证书时，通常需要把服务端 `.cer` 证书加入 App bundle，然后创建 `AFSecurityPolicy`，设置合适的 pinning mode，比如 `AFSSLPinningModeCertificate` 或 `AFSSLPinningModePublicKey`，并把证书作为 pinned certificates。

   同时要谨慎配置 `allowInvalidCertificates` 和 `validatesDomainName`。如果自签名证书不被系统信任，开发阶段可能会开启 `allowInvalidCertificates`，但生产环境更推荐通过 pinned certificate 明确信任该证书，并尽量保持域名校验开启。如果证书域名和请求域名不匹配，应修正证书，而不是简单关闭域名校验。

   面试时可以概括为：自签名证书应内置到客户端并通过 `AFSecurityPolicy` 做证书或公钥绑定，生产环境不要单纯依赖 `allowInvalidCertificates` 放行。

10. **为什么不建议在生产环境允许无效证书？**

   答案：生产环境允许无效证书会破坏 HTTPS 的核心安全保证。客户端会接受过期证书、自签名证书、伪造证书或不受信任 CA 签发的证书，攻击者更容易发起中间人攻击。

   一旦无效证书被放行，用户登录态、token、支付信息、个人隐私数据等都可能被窃取或篡改。即使接口本身使用 HTTPS，安全性也会因为证书校验被绕过而大幅下降。

   正确做法是生产环境使用受信任 CA 签发的合法证书，保持域名校验开启；如果有更高安全要求，则配置 SSL Pinning。调试环境需要临时允许无效证书时，也应通过环境隔离避免带到线上。

   面试时可以概括为：生产环境允许无效证书等于放松 HTTPS 身份校验，会显著增加中间人攻击风险，因此应使用合法证书并保持完整校验。

## 7. 网络可达性题目

1. **`AFNetworkReachabilityManager` 基于什么系统 API 实现？**

   答案：`AFNetworkReachabilityManager` 基于 Apple 的 `SystemConfiguration` 框架实现，底层核心是 `SCNetworkReachability`。它通过系统 reachability API 监听某个地址或域名的网络可达性变化。

   AFNetworking 对 `SCNetworkReachabilityRef` 做了一层 Objective-C 封装，提供 `sharedManager`、`manager`、`managerForDomain:`、`managerForAddress:` 等创建方式，并通过 block 把网络状态变化通知给业务层。

   面试时可以概括为：它不是自己探测网络，而是封装系统 `SCNetworkReachability`，用来监听默认地址、指定域名或指定 socket address 的可达性。

2. **它支持哪些网络状态？**

   答案：`AFNetworkReachabilityManager` 主要支持四种状态：`AFNetworkReachabilityStatusUnknown`、`AFNetworkReachabilityStatusNotReachable`、`AFNetworkReachabilityStatusReachableViaWWAN`、`AFNetworkReachabilityStatusReachableViaWiFi`。

   `Unknown` 表示当前状态未知，可能还没有开始监听或系统暂时无法判断。`NotReachable` 表示目标不可达。`ReachableViaWWAN` 表示通过蜂窝网络可达，`ReachableViaWiFi` 表示通过 Wi-Fi 或有线网络可达。

   面试时可以概括为：它能区分未知、不可达、蜂窝网络可达和 Wi-Fi 可达四类状态。

3. **`startMonitoring` 和 `stopMonitoring` 的作用是什么？**

   答案：`startMonitoring` 用来开始监听网络可达性变化。调用后，manager 会注册 `SCNetworkReachability` 回调，并把 reachability 事件调度到合适的队列中处理。

   `stopMonitoring` 用来停止监听。调用后，manager 会取消系统 reachability 回调，不再接收网络状态变化，也可以避免不必要的资源占用或对象生命周期问题。

   使用时通常先通过 `setReachabilityStatusChangeBlock:` 设置状态变化回调，再调用 `startMonitoring`。不再需要监听时，比如对象释放或模块退出时，调用 `stopMonitoring`。

   面试时可以概括为：`startMonitoring` 开始注册并接收网络状态变化，`stopMonitoring` 取消监听和回调。

4. **reachability 能否准确预测下一次请求是否成功？为什么？**

   答案：不能。Reachability 只能反映某个时间点上目标地址或网络路径是否“看起来可达”，不能保证下一次真实 HTTP 请求一定成功。

   一次请求能否成功还取决于很多因素，比如 DNS 解析、TLS 握手、服务端是否可用、接口是否超时、代理/VPN、弱网丢包、HTTP 状态码、业务错误等。Reachability 显示可达，请求仍然可能失败；Reachability 显示不可达，用户发起请求也可能触发系统建立网络连接。

   因此不建议把 reachability 作为是否允许用户发起请求的唯一依据。真正的请求结果应该以请求完成后的 error、状态码和响应解析结果为准。

   面试时可以概括为：reachability 只能辅助判断网络状态，不能预测请求成功。请求是否成功必须以实际请求结果为准。

5. **reachability 更适合用在哪些场景？**

   答案：Reachability 更适合做网络状态提示、失败原因辅助判断、网络恢复后的重试触发，以及 Wi-Fi/蜂窝网络下的策略切换。

   比如网络不可达时提示“当前网络不可用”；请求失败后结合 reachability 判断是否可能是断网；网络从不可达变为可达时触发待重试请求；大文件下载或视频上传前，如果当前是蜂窝网络，可以提示用户确认。

   它不适合替代请求本身的错误处理，也不适合简单粗暴地阻止所有请求。网络层仍然应该完整处理超时、服务器错误、解析错误和业务错误。

   面试时可以概括为：reachability 适合做提示、辅助诊断、恢复重试和网络类型策略，不适合替代真实请求结果判断。

6. **watchOS 下为什么不引入 `AFNetworkReachabilityManager`？**

   答案：AFNetworking 在 watchOS 下通过条件编译排除了 `AFNetworkReachabilityManager`，主要是因为 watchOS 的系统能力和网络模型与 iOS/macOS/tvOS 不完全一致，`SystemConfiguration` reachability 相关能力并不适合作为统一模块暴露。

   从代码结构看，AFNetworking 在入口头文件中使用 `#if !TARGET_OS_WATCH` 导入 reachability，在 podspec 中也没有让 watchOS 依赖 `Reachability` subspec。这是为了避免 watchOS 编译或运行时引入不支持的系统 API。

   面试时可以概括为：watchOS 平台能力受限，AFNetworking 通过条件编译排除 reachability，保证跨平台编译和模块可用性。

7. **如何监听某个指定域名的网络可达性？**

   答案：可以使用 `+[AFNetworkReachabilityManager managerForDomain:]` 创建针对指定域名的 reachability manager，然后设置状态变化 block，并调用 `startMonitoring` 开始监听。

   典型流程是：先创建 `AFNetworkReachabilityManager *manager = [AFNetworkReachabilityManager managerForDomain:@"api.example.com"];`，再调用 `setReachabilityStatusChangeBlock:` 接收状态变化，最后调用 `startMonitoring`。

   需要注意，监听某个域名的可达性并不等于该域名上的具体接口一定可用。服务端业务错误、路径错误、TLS 错误等仍然要通过真实请求结果判断。

   面试时可以概括为：使用 `managerForDomain:` 创建域名级 reachability manager，设置回调后调用 `startMonitoring` 即可监听。

8. **`ReachableViaWWAN` 和 `ReachableViaWiFi` 有什么区别？**

   答案：`ReachableViaWWAN` 表示当前目标可通过蜂窝网络访问，比如 4G、5G 等移动网络。`ReachableViaWiFi` 表示当前目标可通过 Wi-Fi 或类似非蜂窝网络访问。

   这个区别常用于网络策略判断。比如大文件下载、视频上传、自动同步等场景，在蜂窝网络下可能需要提示用户或延后执行；在 Wi-Fi 下则可以自动执行。

   需要注意，状态名称中的 Wi-Fi 在实际系统语义中更接近“非蜂窝网络可达”，不应该把它理解成业务层绝对精确的网络质量判断。

   面试时可以概括为：WWAN 表示蜂窝网络，WiFi 表示非蜂窝网络；区别主要用于流量敏感场景的策略控制。

9. **网络状态变化回调一般在哪个线程处理 UI 更新？**

   答案：UI 更新必须在主线程处理。即使 AFNetworking 的 reachability 回调可能已经被派发到主队列，业务代码也应该保持这个原则：凡是更新 UI，都切到 main queue 或确认当前在主线程。

   比如在状态变化回调里更新 banner、toast、按钮状态、页面空状态时，应使用 `dispatch_async(dispatch_get_main_queue(), ^{ ... })` 包裹 UI 逻辑，避免在后台线程操作 UIKit 导致异常或不稳定行为。

   面试时可以概括为：网络状态变化可以在回调中接收，但 UI 更新必须在主线程执行，这是 iOS/macOS UI 编程的基本要求。

10. **网络不可达时应该如何设计重试策略？**

   答案：网络不可达时不建议无限立即重试。更合理的策略是先记录失败请求或标记需要重试的业务动作，在 reachability 从不可达变为可达时，再按规则触发重试。

   重试策略应该区分错误类型。断网、超时、临时连接失败可以考虑重试；参数错误、鉴权失败、业务失败、404 等通常不应自动重试。对于可重试请求，还应该设置最大重试次数、退避时间、去重机制和取消条件。

   如果涉及登录态过期，还要先完成 token refresh，再重放需要重试的请求。对于上传、支付、下单等非幂等操作，重试前必须考虑幂等性，避免重复提交。

   面试时可以概括为：网络不可达时应等待网络恢复后有限重试，按错误类型和接口幂等性决定是否重试，并设置次数、退避、去重和取消机制。

## 8. UIKit 扩展与图片加载题目

1. **`UIImageView+AFNetworking` 做了什么封装？**

   答案：`UIImageView+AFNetworking` 给 `UIImageView` 增加了异步加载远程图片的能力。业务层可以传入 URL 或 `NSURLRequest`，并设置 placeholder、success、failure 等回调，分类内部会负责图片下载、缓存查询、请求取消和最终图片展示。

   它通常会先通过 `AFImageDownloader` 查询缓存。如果缓存命中，直接设置图片；如果缓存未命中，就发起网络下载。下载完成后，`AFImageResponseSerializer` 会把 data 解析成 `UIImage`，然后写入缓存并设置到 image view 上。

   在列表复用场景中，它会保存当前图片请求对应的 receipt。当 image view 重新设置新 URL 或复用时，可以取消旧请求，避免旧请求完成后把错误图片设置到已经复用的控件上。

   面试时可以概括为：`UIImageView+AFNetworking` 封装了“URL -> 下载 -> 缓存 -> 设置图片”的流程，并处理 placeholder、回调、取消和复用错图问题。

2. **`UIButton+AFNetworking` 如何设置不同状态下的远程图片？**

   答案：`UIButton+AFNetworking` 给 `UIButton` 增加了按 `UIControlState` 加载远程图片的能力。它可以为 normal、highlighted、selected、disabled 等不同状态分别设置远程 image 或 background image。

   使用时，业务层会传入状态、图片 URL/request、placeholder 和回调。分类内部会根据按钮状态保存对应请求，下载成功后调用 `setImage:forState:` 或 `setBackgroundImage:forState:` 把图片设置到指定状态上。

   和 `UIImageView` 类似，它也会复用 `AFImageDownloader` 和图片缓存，避免重复下载，并在请求变化或控件生命周期变化时处理取消逻辑。

   面试时可以概括为：`UIButton+AFNetworking` 是对按钮不同状态远程图片加载的封装，下载成功后把图片设置到对应 `UIControlState`。

3. **`AFImageDownloader` 和 `AFHTTPSessionManager` 是什么关系？**

   答案：`AFImageDownloader` 内部使用 `AFHTTPSessionManager` 来执行图片下载请求。可以理解为 `AFImageDownloader` 是图片下载调度层，`AFHTTPSessionManager` 是底层 HTTP 请求执行层。

   `AFImageDownloader` 会配置一个专门用于图片下载的 session manager，通常使用 `AFImageResponseSerializer` 作为 response serializer，把服务端返回的图片 data 解析成图片对象。它还会结合 `NSURLCache` 和 `AFAutoPurgingImageCache` 做缓存。

   除了发请求，`AFImageDownloader` 还负责图片下载队列、最大并发数、FIFO/LIFO 优先级、重复请求合并和 receipt 取消，这些是普通 `AFHTTPSessionManager` 不直接提供的图片场景能力。

   面试时可以概括为：`AFHTTPSessionManager` 负责真正的 HTTP 下载，`AFImageDownloader` 在它之上增加图片解析、缓存、队列、去重和取消等图片专用逻辑。

4. **`AFImageDownloadReceipt` 的作用是什么？**

   答案：`AFImageDownloadReceipt` 是 `AFImageDownloader` 发起图片下载后返回的凭证，用来标识某一次图片请求。它内部包含实际的 `NSURLSessionDataTask` 和唯一的 `receiptID`。

   它的主要作用是支持取消。由于多个相同图片请求可能共享同一个底层 data task，不能简单地直接 cancel task，否则会影响其他调用方。通过 receiptID，AFNetworking 可以只移除当前调用方对应的 success/failure 回调。

   如果某个底层任务已经没有任何回调需要通知，或者还在等待队列中没有其他使用者，下载器才会取消底层任务。

   面试时可以概括为：`AFImageDownloadReceipt` 是图片请求的取消凭证，用来精确取消当前调用方的回调，避免误取消其他共享同一下载任务的请求。

5. **`AFImageDownloader` 如何取消一个图片请求？**

   答案：`AFImageDownloader` 取消图片请求时，通常通过 `cancelTaskForImageDownloadReceipt:` 传入之前返回的 `AFImageDownloadReceipt`。下载器会根据 receipt 中的 task 和 receiptID 找到对应请求。

   如果该图片请求是多个调用方共享的重复请求，取消时只会移除当前 receipt 对应的回调，不会立刻取消底层 data task。这样其他 image view 或 button 仍然可以继续等待同一次下载结果。

   只有当底层任务没有任何剩余回调，或者任务还在队列中且没有其他调用方需要它时，下载器才会真正取消 task。

   面试时可以概括为：图片取消不是简单 cancel task，而是通过 receipt 移除当前调用方回调；只有没有其他使用者时才取消底层下载任务。

6. **`AFImageDownloader` 如何合并重复请求？**

   答案：`AFImageDownloader` 会根据 `NSURLRequest` 判断是否已经存在相同的图片下载请求。如果相同请求已经在等待队列或正在执行，它不会重新创建新的 data task，而是把新的 success/failure 回调追加到已有任务上。

   当这个共享任务下载完成后，下载器会把同一个图片结果按顺序回调给所有等待的调用方。这样多个控件同时请求同一个 URL 时，底层只需要一次网络请求。

   这种合并机制可以减少重复网络流量、减少图片解析次数，也能提升列表图片加载性能。配合 `AFAutoPurgingImageCache`，后续同样请求还可以直接从内存缓存命中。

   面试时可以概括为：`AFImageDownloader` 通过 request 去重，把相同图片 URL 的多个回调挂到同一个下载任务上，实现一次下载、多处复用。

7. **FIFO 和 LIFO 图片下载优先级适合哪些场景？**

   答案：FIFO 表示先进先出，先加入队列的图片请求先下载。它适合请求顺序比较稳定、希望公平处理所有图片的场景，比如普通网格或按顺序预加载。

   LIFO 表示后进先出，后加入队列的图片请求优先下载。它适合快速滚动列表场景，因为用户当前屏幕上最新出现的 cell 通常是最后发起图片请求的，优先下载这些图片可以更快展示当前可见内容。

   选择 FIFO 还是 LIFO，取决于业务更关注公平性还是当前可见内容优先。图片列表、信息流快速滚动时，LIFO 往往体验更好；稳定批量加载时，FIFO 更直观。

   面试时可以概括为：FIFO 适合按顺序公平下载，LIFO 适合列表快速滚动时优先加载最新可见图片。

8. **`AFAutoPurgingImageCache` 如何计算和控制内存使用？**

   答案：`AFAutoPurgingImageCache` 会为每张图片计算大致内存占用，并维护所有缓存图片的总内存使用量 `memoryUsage`。它有两个关键阈值：`memoryCapacity` 和 `preferredMemoryUsageAfterPurge`。

   当新增图片后，如果总内存超过 `memoryCapacity`，缓存会触发清理。清理时会根据图片最近访问时间排序，优先移除最久没有访问的图片，直到内存使用降到 `preferredMemoryUsageAfterPurge` 附近。

   每次读取缓存图片时，该图片的访问时间会更新，所以常用图片更不容易被清理，冷门旧图片会优先被清理。这类似 LRU 思路，用来平衡缓存命中率和内存压力。

   面试时可以概括为：它统计缓存图片内存占用，超过最大容量后按最近访问时间清理旧图，直到回落到目标内存阈值。

9. **`UIProgressView+AFNetworking` 如何绑定任务进度？**

   答案：`UIProgressView+AFNetworking` 通过观察 `NSURLSessionTask` 对应的 `NSProgress` 来更新进度条。AFNetworking 在上传和下载过程中会维护 upload progress 或 download progress，分类把这些 progress 绑定到 `UIProgressView`。

   当 `NSProgress` 的 `fractionCompleted` 变化时，progress view 会更新自身的 `progress` 值，从而展示上传或下载进度。常见场景是文件上传、文件下载、图片或资源加载进度展示。

   使用时要注意 UI 更新应在主线程执行。分类本身会尽量封装绑定逻辑，但业务层如果在回调里额外更新 UI，也应切回主线程。

   面试时可以概括为：`UIProgressView+AFNetworking` 把 task 的 `NSProgress` 和进度条绑定起来，随着上传/下载字节数变化自动更新 UI 进度。

10. **`AFNetworkActivityIndicatorManager` 的作用是什么？为什么现代 iOS 项目中使用较少？**

   答案：`AFNetworkActivityIndicatorManager` 用来管理 iOS 状态栏上的网络活动指示器。它会监听 AFNetworking 请求开始和结束，根据当前活跃请求数量决定是否显示状态栏网络 activity indicator。

   它在早期 iOS 中比较有用，因为系统状态栏有一个全局网络活动小菊花，可以提示用户当前 App 正在进行网络请求。AFNetworking 通过集中管理避免每个请求手动开关该指示器。

   现代 iOS 项目中使用较少，主要是因为状态栏网络活动指示器在新系统中已经弱化或废弃，很多 App 也更倾向于在具体页面里使用 loading、骨架屏、刷新控件或局部进度提示，而不是依赖全局状态栏指示器。

   面试时可以概括为：它是早期 iOS 用来统一管理状态栏网络活动指示器的工具；现代项目由于系统 UI 变化和交互方式变化，通常用页面级 loading 或进度提示替代。

## 9. 常见笔试题

1. **写一段使用 `AFHTTPSessionManager` 发起 GET 请求的 Objective-C 代码。**

   答案：

   ```objc
   AFHTTPSessionManager *manager = [AFHTTPSessionManager manager];
   manager.responseSerializer = [AFJSONResponseSerializer serializer];

   NSDictionary *parameters = @{
       @"page": @1,
       @"size": @20
   };

   [manager GET:@"https://api.example.com/users"
     parameters:parameters
        headers:nil
       progress:nil
        success:^(NSURLSessionDataTask *task, id responseObject) {
           NSLog(@"GET success: %@", responseObject);
       }
        failure:^(NSURLSessionDataTask *task, NSError *error) {
           NSLog(@"GET failure: %@", error);
       }];
   ```

   要点：GET 参数默认会通过 `requestSerializer` 编码到 URL query 中，响应默认可以用 `AFJSONResponseSerializer` 解析 JSON。

2. **写一段使用 `AFHTTPSessionManager` 发起 JSON POST 请求的 Objective-C 代码。**

   答案：

   ```objc
   AFHTTPSessionManager *manager = [AFHTTPSessionManager manager];
   manager.requestSerializer = [AFJSONRequestSerializer serializer];
   manager.responseSerializer = [AFJSONResponseSerializer serializer];

   NSDictionary *parameters = @{
       @"username": @"tom",
       @"password": @"123456"
   };

   [manager POST:@"https://api.example.com/login"
      parameters:parameters
         headers:nil
        progress:nil
         success:^(NSURLSessionDataTask *task, id responseObject) {
            NSLog(@"POST success: %@", responseObject);
        }
         failure:^(NSURLSessionDataTask *task, NSError *error) {
            NSLog(@"POST failure: %@", error);
        }];
   ```

   要点：`AFJSONRequestSerializer` 会把参数写入 HTTP body，并设置 `Content-Type: application/json`。

3. **写一段使用 AFNetworking 上传图片 multipart/form-data 的代码。**

   答案：

   ```objc
   AFHTTPSessionManager *manager = [AFHTTPSessionManager manager];
   manager.responseSerializer = [AFJSONResponseSerializer serializer];

   UIImage *image = [UIImage imageNamed:@"avatar"];
   NSData *imageData = UIImageJPEGRepresentation(image, 0.8);

   NSDictionary *parameters = @{
       @"userId": @"10001"
   };

   [manager POST:@"https://api.example.com/upload/avatar"
      parameters:parameters
         headers:nil
constructingBodyWithBlock:^(id<AFMultipartFormData> formData) {
       [formData appendPartWithFileData:imageData
                                   name:@"avatar"
                               fileName:@"avatar.jpg"
                               mimeType:@"image/jpeg"];
   }
        progress:^(NSProgress *uploadProgress) {
            NSLog(@"upload progress: %.2f", uploadProgress.fractionCompleted);
        }
         success:^(NSURLSessionDataTask *task, id responseObject) {
            NSLog(@"upload success: %@", responseObject);
        }
         failure:^(NSURLSessionDataTask *task, NSError *error) {
            NSLog(@"upload failure: %@", error);
        }];
   ```

   要点：multipart 上传通过 `constructingBodyWithBlock` 追加文件字段，AFNetworking 负责生成 boundary 和 `multipart/form-data` body。

4. **写一段设置默认请求头 `Authorization` 的代码。**

   答案：

   ```objc
   AFHTTPSessionManager *manager = [AFHTTPSessionManager manager];

   NSString *token = @"your_access_token";
   NSString *authorization = [NSString stringWithFormat:@"Bearer %@", token];

   [manager.requestSerializer setValue:authorization
                    forHTTPHeaderField:@"Authorization"];
   ```

   如果是 Basic Auth，也可以使用：

   ```objc
   [manager.requestSerializer setAuthorizationHeaderFieldWithUsername:@"username"
                                                            password:@"password"];
   ```

   要点：公共 header 应集中在 API Client 的 `requestSerializer` 上设置，避免每个请求重复添加。

5. **写一段自定义 `acceptableContentTypes` 的代码。**

   答案：

   ```objc
   AFHTTPSessionManager *manager = [AFHTTPSessionManager manager];
   AFJSONResponseSerializer *serializer = [AFJSONResponseSerializer serializer];

   serializer.acceptableContentTypes = [NSSet setWithObjects:
       @"application/json",
       @"text/json",
       @"text/javascript",
       @"text/plain",
       @"text/html",
       nil
   ];

   manager.responseSerializer = serializer;
   ```

   要点：这通常用于兼容服务端 `Content-Type` 返回不规范的情况。更推荐服务端修正 MIME type，客户端兼容应尽量收敛在统一网络层。

6. **写一段配置 SSL Pinning 的代码。**

   答案：

   ```objc
   AFHTTPSessionManager *manager = [[AFHTTPSessionManager alloc] initWithBaseURL:[NSURL URLWithString:@"https://api.example.com"]];

   NSBundle *bundle = [NSBundle mainBundle];
   NSSet<NSData *> *certificates = [AFSecurityPolicy certificatesInBundle:bundle];

   AFSecurityPolicy *policy = [AFSecurityPolicy policyWithPinningMode:AFSSLPinningModeCertificate
                                               withPinnedCertificates:certificates];
   policy.allowInvalidCertificates = NO;
   policy.validatesDomainName = YES;

   manager.securityPolicy = policy;
   ```

   如果希望使用公钥绑定，可以把 `AFSSLPinningModeCertificate` 改成 `AFSSLPinningModePublicKey`。

   要点：生产环境应保持域名校验开启，不建议通过 `allowInvalidCertificates = YES` 简单放行无效证书。

7. **写一段监听网络状态变化的代码。**

   答案：

   ```objc
   AFNetworkReachabilityManager *manager = [AFNetworkReachabilityManager sharedManager];

   [manager setReachabilityStatusChangeBlock:^(AFNetworkReachabilityStatus status) {
       switch (status) {
           case AFNetworkReachabilityStatusReachableViaWiFi:
               NSLog(@"network reachable via Wi-Fi");
               break;
           case AFNetworkReachabilityStatusReachableViaWWAN:
               NSLog(@"network reachable via WWAN");
               break;
           case AFNetworkReachabilityStatusNotReachable:
               NSLog(@"network not reachable");
               break;
           case AFNetworkReachabilityStatusUnknown:
           default:
               NSLog(@"network status unknown");
               break;
       }
   }];

   [manager startMonitoring];
   ```

   要点：reachability 只能辅助判断网络状态，不能保证下一次请求一定成功。

8. **写一段使用 `UIImageView+AFNetworking` 加载网络图片的代码。**

   答案：

   ```objc
   #import "UIImageView+AFNetworking.h"

   NSURL *URL = [NSURL URLWithString:@"https://example.com/avatar.jpg"];
   NSURLRequest *request = [NSURLRequest requestWithURL:URL];
   UIImage *placeholder = [UIImage imageNamed:@"avatar_placeholder"];

   [self.avatarImageView setImageWithURLRequest:request
                               placeholderImage:placeholder
                                        success:^(NSURLRequest *request, NSHTTPURLResponse *response, UIImage *image) {
                                           self.avatarImageView.image = image;
                                        }
                                        failure:^(NSURLRequest *request, NSHTTPURLResponse *response, NSError *error) {
                                           NSLog(@"image load failure: %@", error);
                                        }];
   ```

   要点：该分类内部会复用 `AFImageDownloader`、`AFImageResponseSerializer` 和图片缓存，处理下载、缓存命中和控件展示。

9. **写一个基于 `AFHTTPSessionManager` 的单例 API Client。**

   答案：

   ```objc
   @interface CompanyAPIClient : AFHTTPSessionManager

   + (instancetype)sharedClient;

   @end

   @implementation CompanyAPIClient

   + (instancetype)sharedClient {
       static CompanyAPIClient *client = nil;
       static dispatch_once_t onceToken;
       dispatch_once(&onceToken, ^{
           NSURL *baseURL = [NSURL URLWithString:@"https://api.example.com/"];
           client = [[CompanyAPIClient alloc] initWithBaseURL:baseURL];
           client.requestSerializer = [AFJSONRequestSerializer serializer];
           client.responseSerializer = [AFJSONResponseSerializer serializer];
           client.requestSerializer.timeoutInterval = 15.0;
           [client.requestSerializer setValue:@"application/json" forHTTPHeaderField:@"Accept"];
       });
       return client;
   }

   @end
   ```

   要点：公司 API Client 可以统一配置 `baseURL`、serializer、header、timeout、security policy，并向业务层暴露具体接口方法。

10. **写一个统一处理服务端错误码的 response serializer 思路。**

   答案：

   ```objc
   @interface CompanyJSONResponseSerializer : AFJSONResponseSerializer
   @end

   @implementation CompanyJSONResponseSerializer

   - (id)responseObjectForResponse:(NSURLResponse *)response
                              data:(NSData *)data
                             error:(NSError *__autoreleasing *)error {
       id JSONObject = [super responseObjectForResponse:response data:data error:error];
       if (*error || ![JSONObject isKindOfClass:[NSDictionary class]]) {
           return JSONObject;
       }

       NSDictionary *dictionary = (NSDictionary *)JSONObject;
       NSNumber *code = dictionary[@"code"];
       if (code && code.integerValue != 0) {
           NSString *message = dictionary[@"message"] ?: @"Business error";
           if (error) {
               *error = [NSError errorWithDomain:@"CompanyAPIErrorDomain"
                                            code:code.integerValue
                                        userInfo:@{NSLocalizedDescriptionKey: message}];
           }
           return nil;
       }

       return dictionary[@"data"] ?: dictionary;
   }

   @end
   ```

   使用时：

   ```objc
   manager.responseSerializer = [CompanyJSONResponseSerializer serializer];
   ```

   要点：基础 JSON 解析仍交给 `AFJSONResponseSerializer`，业务 `code/message/data` 的统一处理放在自定义 serializer 或 API Client 包装层，避免每个页面重复判断。

## 10. 进阶追问题目

1. **如果多个请求同时失败并返回 token 过期，如何基于 AFNetworking 设计 token refresh 队列？**

   答案：核心思路是保证同一时间只有一个 refresh token 请求在执行，其他因为 token 过期失败的请求进入等待队列，refresh 成功后统一重放，refresh 失败后统一失败并引导重新登录。

   可以在 API Client 层维护一个 `isRefreshingToken` 标记和一个 pending requests 队列。请求返回业务错误码表示 token 过期时，先判断是否已有 refresh 请求。如果没有，就标记正在刷新并发起 refresh；如果已有，就把当前请求的重试 block、completion block 或 request descriptor 放入队列。

   refresh 成功后，更新 `requestSerializer` 中的 `Authorization` header，然后遍历 pending 队列重新发起请求。refresh 失败后，清空队列，将所有等待请求回调为认证失败，并通知业务跳转登录页。

   需要注意并发安全和幂等性。队列操作应放在串行队列或加锁保护；非幂等请求比如支付、下单、提交表单，重放前要确认服务端是否支持幂等 key，避免重复提交。

   面试时可以概括为：token refresh 要做单飞控制，请求失败后排队等待，refresh 成功统一更新 token 并重放，失败统一登出或返回认证错误，同时注意线程安全和非幂等请求风险。

2. **如何给 AFNetworking 请求增加统一日志、耗时统计和 trace id？**

   答案：这类能力应该放在统一网络层，而不是每个业务请求手写。可以在 API Client 封装层统一生成 trace id，写入 request header；在请求发起前记录开始时间、URL、method、参数摘要；在 completion 中记录结束时间、耗时、状态码、错误码和响应摘要。

   trace id 可以通过 `requestSerializer` 添加到 header，例如 `X-Trace-Id` 或公司统一链路追踪字段。服务端收到后也记录同一个 trace id，客户端日志和服务端日志就能串起来。

   耗时统计可以在封装的请求方法中记录 `NSDate` 或 `CFAbsoluteTimeGetCurrent()`。如果需要更细的 DNS、TCP、TLS、首包等指标，现代系统可以结合 `NSURLSessionTaskMetrics`，不过 AFNetworking 版本和封装层需要额外接入相关 delegate。

   日志要注意脱敏，不能直接打印 token、密码、手机号、身份证、支付信息等敏感数据。线上日志也要控制大小和采样比例。

   面试时可以概括为：统一日志和 trace id 应放在 API Client 层，请求前生成 trace id 并写 header，记录开始时间；完成后记录状态、耗时和错误，同时做好敏感信息脱敏。

3. **如何设计请求重试？哪些错误适合重试，哪些不适合？**

   答案：请求重试应该放在统一网络层，并且只对可重试错误和幂等请求启用。不能所有失败都无脑重试，否则可能造成重复提交、流量放大或服务端压力增加。

   适合重试的错误通常包括网络临时不可用、超时、连接中断、DNS 临时失败、5xx 服务端临时错误、网络恢复后的待重试请求等。适合重试的方法通常是 GET、HEAD，或者带幂等 key 的 PUT/DELETE/POST。

   不适合自动重试的情况包括参数错误、鉴权失败、权限不足、404、明确的业务失败、JSON 解析失败，以及支付、下单、提交表单等非幂等操作。token 过期不应简单重试原请求，而应先走 token refresh，再决定是否重放。

   重试策略应包含最大次数、退避算法、取消条件、去重和幂等保护。常见做法是指数退避，比如 0.5s、1s、2s，并限制最大重试次数。

   面试时可以概括为：重试要看错误类型和接口幂等性，临时网络错误和 5xx 可有限重试，业务错误和非幂等操作不应盲目重试。

4. **如果服务端返回的 JSON 外层结构固定，应该在 manager、serializer 还是业务层解析？**

   答案：如果所有接口都有统一外层结构，比如 `{ "code": 0, "message": "...", "data": ... }`，最好在统一网络层处理，而不是分散在每个业务页面。具体可以放在自定义 response serializer，也可以放在 API Client 的统一 completion 包装层。

   如果外层结构非常稳定，并且希望业务层只拿到 `data` 或统一错误，放在自定义 `AFJSONResponseSerializer` 中更集中。serializer 可以先完成 JSON 解析，再判断 `code`，成功返回 `data`，失败构造业务 NSError。

   如果不同业务线的结构略有差异，或者希望保留原始 response 给部分接口使用，放在 API Client completion 包装层会更灵活。serializer 只负责基础 JSON 解析，API Client 再做 code/message/data 的业务适配。

   不建议每个页面自己解析外层结构，否则错误处理、toast、token 过期、埋点、重试逻辑都会重复且不一致。

   面试时可以概括为：固定 JSON 外层结构应在统一网络层解析。结构稳定可放自定义 serializer，业务差异较多可放 API Client 包装层，尽量不要下沉到页面。

5. **AFNetworking 的 block 回调可能导致循环引用吗？如何避免？**

   答案：可能。AFNetworking 的 success、failure、progress block 会被 task 或 manager 间接持有，在 block 内如果强引用 `self`，而 `self` 又强持有 manager、task 或请求相关对象，就可能形成循环引用。

   常见写法是使用 weak-strong dance。在 block 外使用 `__weak typeof(self) weakSelf = self;`，block 内再 `__strong typeof(weakSelf) self = weakSelf;`，如果 self 已释放就直接返回。

   示例：

   ```objc
   __weak typeof(self) weakSelf = self;
   [manager GET:url parameters:nil headers:nil progress:nil success:^(NSURLSessionDataTask *task, id responseObject) {
       __strong typeof(weakSelf) self = weakSelf;
       if (!self) {
           return;
       }
       [self updateUIWithResponse:responseObject];
   } failure:^(NSURLSessionDataTask *task, NSError *error) {
       __strong typeof(weakSelf) self = weakSelf;
       if (!self) {
           return;
       }
       [self showError:error];
   }];
   ```

   面试时可以概括为：block 内直接强持有 self 可能循环引用，应使用 weak self，并在 block 内临时 strong self，尤其是 view controller 持有 task 或 manager 的场景。

6. **如何处理请求取消后的 UI 状态一致性？**

   答案：请求取消后，UI 不应该再展示过期请求的结果，也不应该把取消当成普通错误弹给用户。常见做法是保存当前请求 task，页面退出、cell 复用或发起新请求时取消旧 task，并在回调里判断当前 task 是否仍然是最新请求。

   对列表 cell 来说，复用时要取消旧图片请求或数据请求，并重置 placeholder、loading 状态和进度。旧请求即使回调，也要通过 URL、request id、indexPath 或 task 指针判断是否仍对应当前 UI。

   对页面请求来说，取消时应停止 loading，但通常不弹错误 toast。可以判断 error code 是否是 `NSURLErrorCancelled`，如果是取消错误，就静默处理。

   面试时可以概括为：取消请求后要区分取消和失败，停止 loading，忽略旧回调，复用场景要校验请求身份，避免过期数据覆盖当前 UI。

7. **图片列表快速滚动时，如何避免错图、重复下载和无效回调？**

   答案：避免错图的关键是 cell 复用时取消旧请求，并在回调时校验当前 cell 绑定的 URL 是否仍然等于回调对应的 URL。设置新图片前先设置 placeholder，避免展示上一张复用图片。

   避免重复下载可以依赖 `AFImageDownloader` 的请求合并和 `AFAutoPurgingImageCache` 的内存缓存。相同 URL 请求会共享底层下载任务，下载成功后写入缓存，后续请求直接命中缓存。

   避免无效回调可以使用 `AFImageDownloadReceipt`。cell 复用时取消旧 receipt，只移除当前 cell 对旧请求的回调，不影响其他控件共享同一个图片下载任务。

   对快速滚动列表，还可以使用 LIFO 优先级，让最新出现的可见 cell 图片优先下载；必要时配合预取、限流和图片尺寸裁剪。

   面试时可以概括为：列表图片要做到复用取消、URL 校验、placeholder 重置、请求合并、缓存复用和可见内容优先，才能减少错图、重复下载和无效回调。

8. **如果一个接口返回的 `Content-Type` 不规范，应该修改服务端还是客户端兼容？**

   答案：优先修改服务端，让服务端返回正确的 `Content-Type`。例如 JSON 接口应返回 `application/json`，图片接口应返回图片 MIME type。正确的 MIME type 是 HTTP 协议契约的一部分，有利于客户端、代理、缓存和调试工具正确处理响应。

   如果服务端短期无法修改，客户端可以在统一网络层临时兼容，比如把 `text/html`、`text/plain` 加入 `AFJSONResponseSerializer.acceptableContentTypes`。但这个兼容应该收敛在 API Client 或 response serializer 中，不应该散落在业务页面。

   同时应记录技术债，明确兼容范围和下线计划。过度放宽 `acceptableContentTypes` 可能掩盖服务端错误，也可能让错误页 HTML 被当作 JSON 接口处理，增加排查难度。

   面试时可以概括为：规范上应修服务端；客户端可在统一网络层做临时兼容，但要控制范围，避免把错误 MIME type 长期合理化。

9. **如果要迁移到 Alamofire，需要重点迁移哪些概念？**

   答案：迁移到 Alamofire 时，需要重点映射请求构造、参数编码、响应解析、认证、证书校验、上传下载、网络状态、错误模型和图片加载等概念。

   AFNetworking 中的 `AFHTTPSessionManager` 可以对应到 Alamofire 的 `Session` 或公司封装的 Swift API Client；`AFHTTPRequestSerializer` 对应 Alamofire 的 `ParameterEncoder` 或 `ParameterEncoding`；`AFJSONResponseSerializer` 等对应 Alamofire 的 response serializer、`Decodable` 解析或自定义 serializer。

   `AFSecurityPolicy` 需要迁移到 Alamofire 的 `ServerTrustManager` 和相关 trust evaluator。上传下载需要迁移到 Alamofire 的 upload/download API。Reachability 可以迁移到 `NetworkReachabilityManager` 或系统 `NWPathMonitor`。UIKit 图片加载如果还依赖 AFNetworking，需要选择新的图片库或自研图片加载层。

   面试时可以概括为：迁移不是简单替换方法名，而是要映射网络层概念，包括 session、参数编码、响应解析、trust 策略、上传下载、reachability、错误模型和图片加载。

10. **如果要完全移除 AFNetworking，如何分阶段降低风险？**

   答案：完全移除 AFNetworking 不建议一次性大改。第一步应该先抽象业务网络层接口，让业务代码依赖公司自己的 API Client 或 NetworkService，而不是直接依赖 `AFHTTPSessionManager`。

   第二步按能力拆分迁移：先迁移普通 GET/POST 请求，再迁移上传下载、图片加载、SSL Pinning、reachability、缓存、日志、重试和 token refresh 等复杂能力。每迁移一类能力，都要补充回归测试和线上灰度。

   第三步做双栈或灰度。可以让同一个业务接口在配置开关下选择 AFNetworking 或新网络栈，逐步扩大新实现流量，观察错误率、耗时、状态码分布和用户反馈。

   最后清理旧依赖和桥接代码。确认所有调用点都迁移完成后，移除 AFNetworking pod/package、UIKit 分类引用、旧 serializer、安全策略配置和相关测试替身。

   面试时可以概括为：移除 AFNetworking 要先抽象网络层，再分模块迁移，配合双栈灰度和监控，最后清理依赖，避免一次性替换导致大面积回归。

## 11. 高频简答参考

### 11.1 AFNetworking 的核心价值是什么？

它把 `NSURLSession` 的请求创建、任务执行、回调管理、进度监听、参数编码、响应解析、安全校验和网络状态监听封装成更易用的 Objective-C API。

### 11.2 `AFURLSessionManager` 与 `AFHTTPSessionManager` 的区别是什么？

`AFURLSessionManager` 是通用 session 管理器，关注 `NSURLSessionTask` 的创建、delegate、进度和响应处理。`AFHTTPSessionManager` 是 HTTP 专用子类，增加 `baseURL`、`requestSerializer` 和 `GET`、`POST` 等 HTTP 便捷方法。

### 11.3 请求序列化和响应序列化为什么重要？

请求序列化解决参数如何进入 URL、header 或 body 的问题；响应序列化解决响应数据如何校验并转成 JSON、XML、plist、image 等对象的问题。它们让网络层和业务层之间的边界更清晰。

### 11.4 SSL Pinning 是什么？

SSL Pinning 是客户端内置服务端证书或公钥，并在 HTTPS 握手时校验服务端证书链是否匹配预期证书或公钥的安全机制，用于降低中间人攻击风险。

### 11.5 reachability 能不能用来阻止请求？

不建议。网络可达性只能提供当前或最近的网络状态，不能保证下一次请求一定成功。它更适合用于失败原因解释、状态提示或网络恢复后的重试触发。

### 11.6 AFNetworking 为什么被废弃？

AFNetworking 是 Objective-C 时代的主流网络库，但现代 Apple 开发逐渐转向 Swift 和新的系统 API。官方已在 2023 年宣布停止维护，并建议 Swift 项目迁移到 Alamofire。
