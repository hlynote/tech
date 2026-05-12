---
title: "Alamofire 面试题与笔试题"
date: "2026-05-06T02:00:00+08:00"
summary: "基于 Alamofire 仓库 Documentation/InterviewAndWrittenQuestions.md 整理，适配 tech-note 博客格式。"
category: "network"
slug: "alamofire-interview-and-written-questions"
tags:
  - network
  - iOS
draft: false
---

# Alamofire 面试题与笔试题

本文档基于当前 Alamofire 项目源码、架构和工程配置整理，适用于 Swift 网络库、iOS/macOS 客户端、SDK 基础设施方向的面试和笔试考察。每道题都给出参考答案和答题逻辑，实际面试时可根据候选人层级调整追问深度。

## 1. 面试题

### 1.1 项目理解与架构

1. **Alamofire 的项目定位是什么？它和直接使用 `URLSession` 相比主要解决了哪些问题？**
   - **答案：** Alamofire 是基于 Foundation `URLSession` 的 Swift HTTP 网络库，提供更易用的请求创建、参数编码、响应序列化、验证、认证、重试、上传下载、缓存、安全和并发集成能力。
   - **逻辑：** 它没有替代传输层，而是在 `URLSession` 之上抽象请求生命周期和常见横切能力，减少业务侧重复封装。

2. **`AF`、`Session.default` 和自定义 `Session` 分别适合什么使用场景？**
   - **答案：** `AF` 是 `Session.default` 的快捷入口，适合简单请求；`Session.default` 是默认共享会话；自定义 `Session` 适合注入配置、拦截器、信任策略、缓存、重定向、事件监控和队列。
   - **逻辑：** 简单场景用默认单例降低成本，复杂业务需要独立配置隔离行为。

3. **Alamofire 为什么以 `Session` 作为请求编排中心？它持有哪些核心依赖？**
   - **答案：** `Session` 负责创建并管理请求，持有 `URLSession`、`SessionDelegate`、`rootQueue`、`requestQueue`、`serializationQueue`、`RequestInterceptor`、`ServerTrustManager`、`RedirectHandler`、`CachedResponseHandler` 和 `EventMonitor`。
   - **逻辑：** 网络请求需要统一管理底层 task、delegate 回调、状态、策略和生命周期，因此需要一个会话级编排对象。

4. **`Session`、`SessionDelegate`、`Request`、`URLSessionTask` 之间的关系是什么？**
   - **答案：** `Session` 创建 `Request` 和对应的 `URLSessionTask`；`SessionDelegate` 接收系统回调；`RequestTaskMap` 将 task 映射回 `Request`；`Request` 维护状态、数据、进度、错误和响应处理。
   - **逻辑：** 系统只认识 `URLSessionTask`，Alamofire 需要把系统回调准确路由回自己的请求模型。

5. **`Source/Core`、`Source/Features`、`Source/Extensions` 三个目录的职责边界分别是什么？**
   - **答案：** `Core` 放会话、请求、响应、错误、HTTP 基础模型；`Features` 放拦截、认证、序列化、安全、缓存、并发等能力；`Extensions` 放 Foundation 和标准库扩展。
   - **逻辑：** 目录划分体现核心生命周期、可选能力和基础工具的分层。

6. **为什么 Alamofire 将 `DataRequest`、`UploadRequest`、`DownloadRequest`、`DataStreamRequest`、`WebSocketRequest` 拆成不同类型？**
   - **答案：** 不同请求背后的 `URLSessionTask`、数据处理、进度、重试和完成语义不同，拆分类型能让 API 和内部状态更精确。
   - **逻辑：** 统一基类复用生命周期，具体子类表达各自传输模型，避免一个巨型请求类处理所有分支。

7. **`RequestTaskMap` 在请求生命周期中解决了什么问题？**
   - **答案：** 它维护 Alamofire `Request` 与系统 `URLSessionTask` 的映射，使 delegate 回调能找到对应请求并更新状态。
   - **逻辑：** `URLSessionDelegate` 回调只携带 task，不携带 Alamofire 请求对象，因此必须有映射表。

8. **Alamofire 的扩展点主要有哪些？哪些适合业务 App 使用，哪些更适合框架维护者扩展？**
   - **答案：** 业务侧常用 `URLRequestConvertible`、`RequestInterceptor`、`ResponseSerializer`、`EventMonitor`、`ServerTrustEvaluating`；维护者更常扩展请求子类、delegate 桥接、内部状态和平台条件能力。
   - **逻辑：** 协议型扩展点面向调用方，核心生命周期类型影响框架稳定性，应谨慎修改。

9. **如果让你为 Alamofire 增加一个新的请求类型，你会从哪些类和协议入手？**
   - **答案：** 从 `Request` 子类、`Session` 创建 API、task 创建逻辑、`SessionDelegate` 回调路由、响应序列化和测试覆盖入手。
   - **逻辑：** 新请求类型必须贯穿创建、执行、回调、完成、错误和测试全链路。

10. **如何解释 Alamofire 的“核心层 + 功能层 + 扩展层”架构？**
    - **答案：** 核心层负责请求生命周期和 HTTP 基础抽象；功能层提供可插拔网络能力；扩展层补充系统类型便利方法。
    - **逻辑：** 这种分层既保持核心稳定，也允许功能按协议扩展。

### 1.2 请求生命周期

1. **从调用 `AF.request(...)` 到收到响应，内部大致经历哪些阶段？**
   - **答案：** 创建 `DataRequest`，构建 `URLRequest`，执行适配器，创建 `URLSessionTask`，启动 task，delegate 接收响应和数据，执行验证和序列化，回调闭包、async 或 publisher。
   - **逻辑：** 回答应覆盖请求创建、传输、回调桥接和结果产出四段。

2. **`URLConvertible` 和 `URLRequestConvertible` 分别在请求构建中承担什么职责？**
   - **答案：** `URLConvertible` 将输入转成 `URL`；`URLRequestConvertible` 将路由或自定义对象转成完整 `URLRequest`。
   - **逻辑：** 前者偏 URL，后者偏完整请求，适合封装业务 API 路由。

3. **`ParameterEncoding` 和 `ParameterEncoder` 有什么区别？**
   - **答案：** `ParameterEncoding` 主要处理字典参数，如 URL 或 JSON 编码；`ParameterEncoder` 面向 `Encodable` 模型，如 JSONParameterEncoder 和 URL encoded form encoder。
   - **逻辑：** 区别在输入模型和类型安全程度，现代 Swift 更偏向 `Encodable`。

4. **Alamofire 在什么时候创建 `URLRequest`？什么时候创建 `URLSessionTask`？**
   - **答案：** `URLRequest` 在请求 setup 阶段由 convertible 生成并适配；`URLSessionTask` 在 `URLRequest` 创建成功后由具体 `Request` 使用 `URLSession` 创建。
   - **逻辑：** task 必须依赖最终的 request，因此适配和校验在前。

5. **请求适配器 `RequestAdapter` 在生命周期中的执行位置是什么？**
   - **答案：** 它在 `URLRequest` 初始创建和校验之后、`URLSessionTask` 创建之前执行。
   - **逻辑：** 适配器要修改最终发出的请求，例如 header、签名、token，所以必须在 task 创建前完成。

6. **请求失败后，`RequestRetrier` 如何参与重试决策？**
   - **答案：** 请求失败后，`Session` 将失败的 `Request`、错误和自身传给 retrier，retrier 异步返回 `RetryResult` 决定是否重试、延迟重试或结束。
   - **逻辑：** 重试需要结合错误类型、请求次数、状态码和业务策略。

7. **`RetryResult.retry`、`retryWithDelay`、`doNotRetry`、`doNotRetryWithError` 分别表示什么？**
   - **答案：** `retry` 立即重试；`retryWithDelay` 延迟重试；`doNotRetry` 使用当前错误结束；`doNotRetryWithError` 用新错误结束。
   - **逻辑：** 四种结果分别覆盖立即恢复、退避恢复、正常失败和错误替换。

8. **`Request.State` 中 `initialized`、`resumed`、`suspended`、`cancelled`、`finished` 的状态迁移规则是什么？**
   - **答案：** 新请求从 `initialized` 开始，可进入 `resumed`、`suspended`、`cancelled` 或 `finished`；`resumed` 与 `suspended` 可互转；二者可取消；完成后进入 `finished`。
   - **逻辑：** 取消和完成是终止语义，初始化只能作为起点。

9. **请求取消后为什么不允许再恢复到执行状态？**
   - **答案：** 取消代表调用方明确终止请求，底层 task 和回调链路可能已清理，再恢复会导致状态和资源不一致。
   - **逻辑：** 取消是不可逆状态，能避免竞态和重复回调。

10. **响应验证和响应序列化的先后顺序是什么？验证失败会如何影响最终结果？**
    - **答案：** 通常先验证状态码、Content-Type 或自定义条件，再序列化；验证失败会记录错误，最终响应 result 为失败。
    - **逻辑：** 验证决定响应是否符合业务前置条件，序列化不应掩盖验证错误。

### 1.3 并发与线程安全

1. **`Session.rootQueue` 为什么必须是串行队列？**
   - **答案：** 它是内部状态更新的同步边界，串行队列能保证状态变更顺序和可预测性。
   - **逻辑：** 请求状态、task 映射、活跃请求集合等都不能并发无序修改。

2. **`requestQueue` 和 `serializationQueue` 为什么要从 `rootQueue` 中拆分出来？**
   - **答案：** 请求构建和响应序列化可能耗时，拆分队列可以避免阻塞内部状态处理，同时仍可 target 到 `rootQueue` 保持顺序约束。
   - **逻辑：** 这是性能和线程安全之间的折中。

3. **`Protected` 解决了什么线程安全问题？**
   - **答案：** 它封装可变状态的读写，避免多个线程或队列同时访问导致数据竞争。
   - **逻辑：** `Request` 和 `Session` 状态会被 API 调用、delegate 回调和序列化回调访问。

4. **`Request` 中哪些状态需要线程安全保护？**
   - **答案：** 请求状态、进度回调、重定向和缓存处理器、响应序列化队列、凭证、requests、tasks、metrics、retryCount、error、finishHandlers 等。
   - **逻辑：** 这些字段会在生命周期不同阶段跨队列读取或修改。

5. **`URLSession` delegate queue 与 Alamofire `rootQueue` 的关系是什么？**
   - **答案：** Alamofire 为 `URLSession` 配置单并发 delegate queue，并让其底层队列与 `rootQueue` 对齐。
   - **逻辑：** delegate 回调是网络事件入口，必须与内部状态更新顺序协调。

6. **响应序列化为什么不应该在主线程或内部状态队列上执行重任务？**
   - **答案：** 主线程执行会卡 UI，内部状态队列执行会阻塞请求生命周期事件，导致延迟或死锁风险。
   - **逻辑：** JSON 解码、大数据处理都可能耗时，应放到独立序列化队列。

7. **Alamofire 如何同时支持闭包回调、Swift Concurrency 和 Combine？**
   - **答案：** 核心请求生命周期保持一致，在结果层包装为 completion handler、async/await serializing API 和 Combine publisher。
   - **逻辑：** 多种调用形态共享底层请求模型，避免重复实现网络传输。

8. **在 async/await 场景中，网络请求取消应该如何与 `Task` 取消协作？**
   - **答案：** 当 Swift `Task` 被取消时，应取消对应 Alamofire `Request`；请求完成或失败后恢复 continuation 或返回 async result。
   - **逻辑：** 取消要从语言级任务传播到底层网络任务，否则会浪费资源并产生无效回调。

9. **如果多个响应处理器同时添加到同一个 `Request`，应如何保证序列化和回调顺序？**
   - **答案：** 将响应序列化闭包排队，在受保护状态中记录执行状态，按队列顺序执行并在完成后调度各自回调。
   - **逻辑：** 多个 handler 共享同一请求结果，必须避免并发修改和重复 finish。

10. **如何排查一个请求偶发状态错乱或回调乱序的问题？**
    - **答案：** 查看状态迁移、队列调度、delegate 回调顺序、重试路径、取消路径和响应序列化队列，并通过 `EventMonitor`、断点和线程检查定位。
    - **逻辑：** 偶发问题通常来自竞态、重复回调、跨队列访问或生命周期边界处理不完整。

### 1.4 拦截、认证与重试

1. **`RequestAdapter`、`RequestRetrier`、`RequestInterceptor` 三者是什么关系？**
   - **答案：** `RequestAdapter` 负责请求发出前适配；`RequestRetrier` 负责失败后重试决策；`RequestInterceptor` 同时继承两者。
   - **逻辑：** 一个处理“发出前”，一个处理“失败后”，组合后形成完整横切能力。

2. **什么场景适合使用请求适配器？例如 token、签名、公共 header 应如何实现？**
   - **答案：** 适合统一添加认证 token、签名、语言、设备信息、trace id 等；实现 `adapt`，复制并修改 `URLRequest` 后返回。
   - **逻辑：** 这些逻辑与具体接口业务无关，但必须在请求发出前统一处理。

3. **什么场景适合使用请求重试器？网络错误、限流、token 过期的重试策略有什么区别？**
   - **答案：** 网络瞬断可短延迟重试；限流应按 `Retry-After` 或退避；token 过期需刷新凭证后重试。
   - **逻辑：** 重试策略要匹配失败原因，不能所有错误都盲目重试。

4. **`AuthenticationInterceptor` 需要解决哪些并发刷新 token 的问题？**
   - **答案：** 需要避免重复刷新、排队等待刷新中的请求、刷新成功后统一重试、刷新失败后统一失败，并控制刷新窗口。
   - **逻辑：** 多个请求同时 401 是典型并发竞态，必须集中协调。

5. **如何避免多个请求同时触发 token refresh 导致重复刷新？**
   - **答案：** 使用共享刷新状态和等待队列，首个请求启动刷新，后续请求挂起等待，刷新完成后批量回调。
   - **逻辑：** 核心是把并发刷新合并为一次单飞请求。

6. **如何设计一个指数退避重试策略？**
   - **答案：** 配置最大次数、基础延迟、倍率、最大延迟和可重试错误；第 n 次延迟通常为 `min(base * pow(multiplier, n), maxDelay)`，可加入 jitter。
   - **逻辑：** 退避能降低雪崩和服务端压力，jitter 能避免请求同步重试。

7. **离线重试 `OfflineRetrier` 应该依赖哪些网络状态信息？**
   - **答案：** 依赖网络可达性状态、连接类型、请求错误类型和请求是否适合恢复。
   - **逻辑：** 离线重试只有在网络恢复且请求安全可重放时才有意义。

8. **请求重试时，为什么需要重新构建或重新适配 `URLRequest`？**
   - **答案：** token、签名、时间戳、body stream、headers 等可能已过期或消耗，需要重新生成最终请求。
   - **逻辑：** 重试不是简单 resume 旧 task，而是创建新 task 执行新请求。

9. **上传请求重试时需要特别注意什么？**
   - **答案：** 需要保证上传体可重放，文件仍存在，stream 可重新创建，multipart 临时文件未被过早删除。
   - **逻辑：** 上传 body 可能是一次性资源，重试前必须确认资源可再次读取。

10. **如何避免不安全或非幂等请求被错误重试？**
    - **答案：** 默认只重试幂等方法或明确标记可重试请求，对 POST/支付/下单等使用幂等键或禁用自动重试。
    - **逻辑：** 错误重试可能造成重复提交、重复扣款或状态污染。

### 1.5 安全、缓存与重定向

1. **`ServerTrustManager` 和 `ServerTrustEvaluating` 的职责是什么？**
   - **答案：** `ServerTrustManager` 按 host 管理信任评估器；`ServerTrustEvaluating` 定义具体 TLS 信任校验逻辑。
   - **逻辑：** 管理器负责路由策略，评估器负责执行证书或公钥校验。

2. **证书 pinning 和公钥 pinning 有什么区别？**
   - **答案：** 证书 pinning 绑定具体证书；公钥 pinning 绑定证书中的公钥，证书更新但公钥不变时更灵活。
   - **逻辑：** 前者安全边界更具体但维护成本高，后者更新友好但仍需严谨管理。

3. **为什么 Linux、Windows、Android 上部分信任评估能力不可用或受限？**
   - **答案：** 这些平台依赖 `swift-corelibs-foundation` 和不同 TLS 能力，部分 Apple Security / CFNetwork 行为不可用或不一致。
   - **逻辑：** Alamofire 的完整安全能力建立在 Apple 平台网络栈之上。

4. **`SessionDelegate` 如何处理 `URLAuthenticationChallenge`？**
   - **答案：** 它根据认证方式选择 credential 认证或 server trust 评估，成功则使用 credential，失败则取消 challenge 并记录错误。
   - **逻辑：** 认证挑战来自系统 delegate，必须在 delegate 层完成决策并回传系统。

5. **`RedirectHandler` 能解决哪些业务问题？**
   - **答案：** 可控制是否跟随重定向、修改重定向请求、阻止跨域跳转、保留或移除敏感 header。
   - **逻辑：** 默认系统重定向不一定满足业务安全和认证语义。

6. **请求级重定向处理器和会话级重定向处理器的优先级应该如何设计？**
   - **答案：** 请求级优先于会话级；没有请求级配置时使用会话级；都没有则走系统默认行为。
   - **逻辑：** 局部策略应覆盖全局默认配置。

7. **`CachedResponseHandler` 与系统 `URLCache` 的关系是什么？**
   - **答案：** `URLCache` 是系统缓存存储和策略基础，`CachedResponseHandler` 用于定制某个响应是否缓存或如何修改缓存响应。
   - **逻辑：** Alamofire 不替代系统缓存，而是提供决策钩子。

8. **哪些响应适合缓存？哪些响应不应该缓存？**
   - **答案：** 静态、公开、幂等 GET 响应适合缓存；用户隐私、实时状态、支付、一次性 token、POST 副作用响应不应随意缓存。
   - **逻辑：** 缓存要考虑数据新鲜度、隐私和方法语义。

9. **如何通过 `EventMonitor` 记录 TLS、重定向、缓存和请求耗时信息？**
   - **答案：** 实现相关事件回调，在请求开始记录时间，在 task metrics、重定向、challenge、完成事件中采集字段并脱敏输出。
   - **逻辑：** `EventMonitor` 是只观察不改变主流程的可观测性扩展点。

10. **如果证书过期导致线上请求失败，你会如何定位和缓解？**
    - **答案：** 检查错误类型、失败 host、证书链、pinning 配置和系统时间；缓解可更新证书/pin 配置、临时回滚策略或发布热修复。
    - **逻辑：** 要区分服务端证书问题、客户端 pinning 问题和环境问题。

### 1.6 上传、下载、流式响应与 WebSocket

1. **`UploadRequest` 为什么继承自 `DataRequest`？**
   - **答案：** 上传请求通常也会收到内存响应数据，继承 `DataRequest` 可以复用响应收集、验证和序列化能力。
   - **逻辑：** 上传特殊在 request body，响应处理与普通数据请求高度相同。

2. **Alamofire 支持哪些上传数据来源？**
   - **答案：** 支持 `Data`、文件 URL、`InputStream` 和 `MultipartFormData`。
   - **逻辑：** 这些覆盖小数据、大文件、流式数据和表单上传四类常见场景。

3. **multipart 上传为什么需要内存阈值？**
   - **答案：** 小表单可在内存编码，大表单应写入临时文件，避免内存峰值过高。
   - **逻辑：** 阈值用于在性能和内存占用之间取平衡。

4. **上传 `InputStream` 在重试时为什么需要重新提供 stream？**
   - **答案：** stream 通常是一次性读取资源，读取后无法自动回到开头，重试时系统需要新的 body stream。
   - **逻辑：** 没有新 stream，重试 task 可能上传空 body 或失败。

5. **`DownloadRequest` 如何处理临时文件和目标文件移动？**
   - **答案：** 系统下载完成后返回临时文件 URL，Alamofire 根据 `Destination` 策略移动到目标路径并处理覆盖、创建目录等选项。
   - **逻辑：** 下载 task 的结果天然是临时文件，业务需要稳定目标路径。

6. **resume data 的作用是什么？它有哪些可靠性风险？**
   - **答案：** resume data 用于断点续传；风险包括服务端不支持 range、数据过期、文件变更、系统生成的 resume data 不可靠。
   - **逻辑：** 断点续传依赖客户端、服务端和中间缓存的一致状态。

7. **`DataStreamRequest` 适合哪些场景？**
   - **答案：** 适合服务器持续推送、日志流、长轮询、SSE 类响应或大数据分块处理。
   - **逻辑：** 它不等待完整响应体，可边接收边处理。

8. **流式响应和普通 `DataRequest` 在内存使用上有什么差异？**
   - **答案：** `DataRequest` 通常累积完整 data；流式响应按片段处理，可降低内存峰值。
   - **逻辑：** 大响应或无限响应不能依赖完整内存聚合。

9. **`WebSocketRequest` 为什么需要平台可用性限制？**
   - **答案：** 它依赖 `URLSessionWebSocketTask`，该 API 只在特定 Apple 平台和系统版本可用。
   - **逻辑：** 条件编译和 availability 能避免不支持平台编译或运行失败。

10. **如何设计上传和下载的进度回调，避免 UI 线程压力过大？**
    - **答案：** 在后台队列接收进度，做节流或去重，只将必要 UI 更新派发到主线程。
    - **逻辑：** 进度回调频率可能很高，直接刷新 UI 会造成卡顿。

### 1.7 响应处理与错误模型

1. **`ResponseSerializer` 的核心职责是什么？**
   - **答案：** 将 request、response、data/file 和 error 转换为强类型结果，并处理预处理、解码和错误包装。
   - **逻辑：** 网络层输出应从原始字节转换为业务可用模型。

2. **`DataResponse` 和 `DownloadResponse` 应该包含哪些信息？**
   - **答案：** 应包含 request、response、data 或 fileURL、metrics、serializationDuration 和 result。
   - **逻辑：** 这些字段既支持业务取值，也支持调试和性能分析。

3. **为什么 Alamofire 需要统一的 `AFError`？**
   - **答案：** 统一参数、请求构建、验证、序列化、网络、安全、上传下载等错误，便于调用方分类处理。
   - **逻辑：** 直接暴露多来源错误会让业务层判断复杂且不稳定。

4. **参数编码失败、验证失败、序列化失败和信任评估失败分别应如何归类？**
   - **答案：** 分别归入参数编码/请求构建错误、响应验证错误、响应序列化错误和 server trust 评估错误。
   - **逻辑：** 按失败阶段归类，便于定位问题发生在请求前、响应后还是安全握手中。

5. **空响应应该如何序列化？**
   - **答案：** 对允许空响应的状态码或方法，返回空模型、`Empty`、`Void` 或 nil；否则应作为序列化失败。
   - **逻辑：** 空响应可能是合法协议语义，也可能是服务端异常。

6. **`Decodable` 响应序列化中常见失败原因有哪些？**
   - **答案：** JSON 格式错误、字段缺失、类型不匹配、日期格式不一致、空响应、编码不是 UTF-8 或服务端错误页伪装成 JSON。
   - **逻辑：** Decodable 失败通常来自数据格式与模型契约不一致。

7. **如何实现一个自定义响应序列化器？**
   - **答案：** 实现 `ResponseSerializer`，在 `serialize` 中先处理错误和空响应，再预处理 data，最后解码或转换为目标类型。
   - **逻辑：** 自定义序列化器应复用 Alamofire 的错误和空响应语义。

8. **`DataPreprocessor` 和 `DataDecoder` 分别适合处理什么问题？**
   - **答案：** `DataPreprocessor` 适合去除 XSSI 前缀、解压或清洗原始数据；`DataDecoder` 适合 JSON、PropertyList 或自定义格式解码。
   - **逻辑：** 预处理发生在解码前，decoder 负责结构化转换。

9. **如何将底层系统错误映射为更可读的业务错误？**
   - **答案：** 在网络层将 `AFError` 和 `URLError` 分类，再映射为业务错误枚举，同时保留原始 error 供日志排查。
   - **逻辑：** 用户提示需要可读，工程排查需要原始上下文。

10. **cURL 描述对调试网络问题有什么价值？**
    - **答案：** cURL 可复现请求 method、URL、headers 和 body，便于和服务端、网关或代理团队联调。
    - **逻辑：** 可复现请求是定位网络问题的重要证据，但输出前要脱敏。

### 1.8 工程化、测试与发布

1. **当前项目同时支持 SwiftPM、CocoaPods 和 Xcode 工程，它们分别由哪些文件配置？**
   - **答案：** SwiftPM 由 `Package.swift` 和版本变体配置；CocoaPods 由 `Alamofire.podspec` 配置；Xcode 由 `Alamofire.xcodeproj` 和示例工程配置。
   - **逻辑：** 多分发方式服务不同集成场景。

2. **`Package.swift` 中 library product、target、test target 分别如何定义？**
   - **答案：** 定义 `Alamofire` 和 `AlamofireDynamic` library products，主 target 路径为 `Source`，测试 target 为 `AlamofireTests` 且路径为 `Tests`。
   - **逻辑：** product 是外部依赖入口，target 是源码组织和构建单元。

3. **`Alamofire.podspec` 中有哪些关键信息？**
   - **答案：** 包含 name、version、license、summary、homepage、source、documentation_url、deployment targets、swift_versions、source_files、frameworks 和 resource_bundles。
   - **逻辑：** podspec 同时描述元信息、源码、平台和资源分发。

4. **为什么 SwiftPM、README、CocoaPods 中的平台最低版本可能不完全一致？**
   - **答案：** 不同分发方式、Swift 工具链、资源处理和平台支持策略可能不同，README 也可能描述历史或总体支持范围。
   - **逻辑：** 判断支持范围时要区分文档承诺和具体构建配置。

5. **CI 为什么要覆盖 macOS、iOS、tvOS、visionOS、watchOS、Linux、Android、Windows？**
   - **答案：** Alamofire 是跨平台 Swift 网络库，需要验证 Apple 平台完整功能和非 Apple 平台构建兼容性。
   - **逻辑：** 条件编译和 Foundation 差异很容易造成平台回归。

6. **Apple 平台测试和 SPM 测试的执行方式有什么区别？**
   - **答案：** Apple 平台主要通过 `xcodebuild`、scheme、destination 和 test plan 执行；SPM 通过 `swift test` 或 `swift build --build-tests` 执行。
   - **逻辑：** Xcode 测试覆盖模拟器和平台配置，SPM 覆盖包管理构建路径。

7. **`Tests/Test Plans` 的作用是什么？**
   - **答案：** 它们定义不同平台测试计划，控制测试集合、配置和执行环境。
   - **逻辑：** 多平台项目需要按平台组织测试入口。

8. **对网络库做单元测试时，如何避免真实网络不稳定影响测试？**
   - **答案：** 使用 mock `URLProtocol`、本地测试服务器、固定响应资源和可控 session configuration。
   - **逻辑：** 测试应可重复、可隔离、可控制延迟和错误。

9. **如何测试重试、认证刷新、重定向、缓存和 TLS 失败场景？**
   - **答案：** 通过 mock 响应序列、状态码、challenge、本地证书、URLCache 和事件监控断言请求次数及最终结果。
   - **逻辑：** 横切能力要验证触发条件、执行次数、顺序和失败分支。

10. **CodeQL 在这类 Swift 网络库项目中能提供什么价值？**
    - **答案：** CodeQL 可做静态安全和质量分析，发现潜在漏洞、危险 API 使用和代码模式问题。
    - **逻辑：** 网络库处在安全敏感路径，静态分析是 CI 防线之一。

## 2. 笔试题

### 2.1 简答题

1. **请简述 Alamofire 中 `Session` 的核心职责。**
   - **答案：** `Session` 创建和管理请求，持有 `URLSession` 和 delegate，维护队列、task 映射、活跃请求、拦截器、信任、缓存、重定向和事件监控。
   - **逻辑：** 答案应突出“请求生命周期编排中心”。

2. **请说明 `RequestAdapter` 和 `RequestRetrier` 的区别。**
   - **答案：** Adapter 在请求发出前修改 `URLRequest`；Retrier 在请求失败后决定是否重试。
   - **逻辑：** 一个发生在执行前，一个发生在失败后。

3. **请说明 `ParameterEncoding` 与 `ParameterEncoder` 的区别，并各举一个适合场景。**
   - **答案：** `ParameterEncoding` 适合字典参数，如 `URLEncoding`；`ParameterEncoder` 适合 `Encodable` 模型，如 JSON body。
   - **逻辑：** 区分动态字典和类型安全模型。

4. **请解释 Alamofire 为什么需要 `SessionDelegate`。**
   - **答案：** 它接收系统 `URLSession` 回调，并转发给对应 Alamofire `Request`，处理认证、重定向、数据、下载、metrics 和完成事件。
   - **逻辑：** `URLSession` 的异步事件必须桥接到框架请求模型。

5. **请说明 `Request.State` 的主要状态，以及取消状态的特殊性。**
   - **答案：** 状态包括 initialized、resumed、suspended、cancelled、finished；cancelled 是终止状态，不能恢复执行。
   - **逻辑：** 状态机的关键是防止非法迁移。

6. **请解释 `ResponseSerializer` 在网络请求中的位置和作用。**
   - **答案：** 它在请求完成和验证后执行，把原始 data 或文件转换为目标模型并生成 result。
   - **逻辑：** 序列化是原始网络响应到业务数据的转换层。

7. **请说明为什么网络库需要统一错误类型，例如 `AFError`。**
   - **答案：** 统一错误能表达不同阶段失败原因，便于业务分类处理、日志记录和测试断言。
   - **逻辑：** 错误来源多，不统一会导致调用方处理复杂。

8. **请简述证书 pinning 的作用和风险。**
   - **答案：** 作用是防止中间人攻击和错误证书链；风险是证书轮换不当会导致客户端全部请求失败。
   - **逻辑：** pinning 提升安全，也增加运维和发布成本。

9. **请说明上传大文件时为什么不适合全部读入内存。**
   - **答案：** 大文件读入内存会造成内存峰值过高、卡顿甚至 OOM，应使用文件或 stream 上传。
   - **逻辑：** 上传设计要考虑设备资源限制。

10. **请简述如何设计网络请求的日志和指标采集。**
    - **答案：** 使用事件监控记录请求开始、结束、耗时、状态码、错误、metrics 和重试次数，并对敏感 header/body 脱敏。
    - **逻辑：** 可观测性要服务排查，同时不能泄露隐私。

### 2.2 代码阅读题

1. **阅读 `Source/Alamofire.swift`，说明 `AF` 和 `AFInfo.version` 的作用。**
   - **答案：** `AF` 是 `Session.default` 的全局快捷入口；`AFInfo.version` 暴露当前 Alamofire 版本。
   - **逻辑：** 该文件是公共入口和基础环境校验点。

2. **阅读 `Source/Core/Session.swift`，找出 `Session` 初始化时注入的可定制组件，并说明它们的用途。**
   - **答案：** 可注入 configuration、delegate、rootQueue、requestQueue、serializationQueue、interceptor、serverTrustManager、redirectHandler、cachedResponseHandler、eventMonitors。
   - **逻辑：** 这些组件分别控制传输配置、回调桥接、并发调度和横切策略。

3. **阅读 `Source/Core/Request.swift`，说明 `Request.MutableState` 中至少 5 个字段的含义。**
   - **答案：** `state` 表示请求状态；`requests` 保存创建过的 URLRequest；`tasks` 保存 URLSessionTask；`metrics` 保存任务指标；`error` 保存最终错误；`retryCount` 记录重试次数。
   - **逻辑：** 字段围绕生命周期、执行历史、观测数据和结果状态组织。

4. **阅读 `Source/Core/DataRequest.swift`，说明 `didReceive(data:)` 如何维护响应数据和下载进度。**
   - **答案：** 首次收到 data 时赋值，后续 append 到已有 data，然后调用 `updateDownloadProgress()` 更新下载进度。
   - **逻辑：** data task 的响应体是分片到达，需要逐步累积并同步进度。

5. **阅读 `Source/Core/SessionDelegate.swift`，说明认证挑战如何被处理。**
   - **答案：** 根据 challenge 的 authenticationMethod 分支处理 HTTP credential、server trust 或默认行为，失败时通知 request 记录错误。
   - **逻辑：** delegate 层是系统认证挑战的唯一处理入口。

6. **阅读 `Source/Features/RequestInterceptor.swift`，画出适配和重试协议之间的关系。**
   - **答案：** `RequestInterceptor` 继承 `RequestAdapter` 和 `RequestRetrier`；`Adapter`、`Retrier`、`Interceptor` 等类型提供闭包或组合实现。
   - **逻辑：** 协议组合让调用方可只实现单一能力，也可实现完整拦截器。

7. **阅读 `Source/Features/ResponseSerialization.swift`，说明响应序列化协议的抽象层次。**
   - **答案：** 它从 data/download serializer 协议抽象到通用 `ResponseSerializer`，并配套 data preprocessor、decoder、空响应处理和具体 serializer。
   - **逻辑：** 抽象层次服务不同响应来源和不同目标类型。

8. **阅读 `Source/Features/ServerTrustEvaluation.swift`，列举内置的信任评估策略。**
   - **答案：** 包括默认评估、禁用评估、证书 pinning、公钥 pinning、复合评估和 revoked 相关评估等。
   - **逻辑：** 不同安全等级和部署环境需要不同 TLS 策略。

9. **阅读 `Source/Features/MultipartFormData.swift`，说明 multipart body 的构建思路。**
   - **答案：** 为每个 body part 生成边界、headers 和内容，按 multipart 格式拼接；根据阈值选择内存编码或写临时文件。
   - **逻辑：** multipart 是规范化格式，关键在边界、header、换行和内存控制。

10. **阅读 `.github/workflows/ci.yml`，总结 CI 覆盖的平台和命令类型。**
    - **答案：** 覆盖 Apple 平台、Catalyst、SPM、Linux、Android、Windows 和 CodeQL；主要使用 `xcodebuild`、`swift test`、`swift build --build-tests` 和静态分析。
    - **逻辑：** 多平台网络库需要同时验证功能、构建和安全质量。

### 2.3 设计题

1. **设计一个 `RequestInterceptor`，要求为每个请求添加 access token，并在 401 时刷新 token 后重试。**
   - **答案：** `adapt` 中读取 token 并写入 `Authorization`；`retry` 中判断 401，进入共享刷新队列，刷新成功后 `.retry`，失败后 `.doNotRetryWithError`。
   - **逻辑：** 设计重点是 token 注入、401 判断、刷新单飞、等待队列和失败传播。

2. **设计一个指数退避的重试策略，要求支持最大重试次数、可重试状态码和网络错误白名单。**
   - **答案：** 配置 `maxRetries`、`retryableStatusCodes`、`retryableURLErrorCodes`、`baseDelay`、`multiplier` 和 `maxDelay`，满足条件时返回 `.retryWithDelay(delay)`。
   - **逻辑：** 策略要同时限制次数、错误类型和服务端状态，避免无界重试。

3. **设计一个网络日志 `EventMonitor`，要求记录请求 URL、method、headers、耗时、状态码和错误。**
   - **答案：** 在 request resume 或 task resume 时记录开始时间，在完成事件记录 response、error 和耗时，headers/body 输出前脱敏。
   - **逻辑：** 日志应完整覆盖请求和响应，但不能影响主流程或泄露敏感信息。

4. **设计一个自定义 `ResponseSerializer`，将服务端统一响应 `{ code, message, data }` 转成业务模型。**
   - **答案：** 定义 envelope 模型，serializer 解码 envelope；`code` 成功则返回 `data`，失败则抛业务错误并携带 `message`。
   - **逻辑：** 统一响应格式应在网络层拆壳，让业务拿到强类型数据或业务错误。

5. **设计一个下载管理器，基于 `DownloadRequest` 支持进度、暂停、恢复和目标文件校验。**
   - **答案：** 管理 request id、目标路径、progress、resumeData、状态和 checksum；暂停时 cancel producing resume data，恢复时用 resumeData 重建请求，完成后校验文件。
   - **逻辑：** 下载管理的关键是状态持久化、断点数据和文件完整性。

6. **设计一个 multipart 上传能力，要求支持大文件、进度、失败重试和临时文件清理。**
   - **答案：** 小文件内存编码，大文件写临时文件；上传时绑定进度；重试前保证文件可读；成功或终止后清理临时文件。
   - **逻辑：** multipart 设计重点在内存控制和资源生命周期。

7. **设计一个 TLS pinning 配置方案，要求支持不同 host 配置不同策略。**
   - **答案：** 以 host 为 key 配置 `ServerTrustEvaluating`，敏感域名使用证书或公钥 pinning，普通域名使用默认评估，并支持灰度更新 pin。
   - **逻辑：** TLS 策略天然按域名区分，更新机制能降低证书轮换风险。

8. **设计一个统一网络层，基于 `URLRequestConvertible` 封装业务 API 路由。**
   - **答案：** 定义 `enum APIRouter: URLRequestConvertible`，每个 case 提供 path、method、parameters、headers，在 `asURLRequest()` 中构建请求。
   - **逻辑：** 路由枚举集中描述接口契约，减少散落字符串和重复编码。

9. **设计一个请求缓存策略，要求区分 GET、POST、用户态数据和公共静态数据。**
   - **答案：** 默认只缓存公开 GET；用户态数据按用户隔离并设置短 TTL；POST 默认不缓存，除非业务明确允许；敏感数据禁用缓存。
   - **逻辑：** 缓存策略必须同时考虑 HTTP 语义、隐私和数据新鲜度。

10. **设计一个网络请求测试方案，要求覆盖成功、失败、重试、取消、超时、认证刷新和 JSON 解析失败。**
    - **答案：** 使用 mock `URLProtocol` 或本地 server 构造响应序列，断言请求次数、状态迁移、错误类型、回调队列和最终模型。
    - **逻辑：** 网络测试需要可控输入、确定输出和覆盖边界分支。

### 2.4 编程题

1. **使用 Swift 实现一个简单的 `RequestAdapter`，为请求添加 `Authorization: Bearer <token>` header。**
   - **答案：**
     ```swift
     final class TokenAdapter: RequestAdapter {
         let tokenProvider: @Sendable () -> String?

         init(tokenProvider: @escaping @Sendable () -> String?) {
             self.tokenProvider = tokenProvider
         }

         func adapt(_ urlRequest: URLRequest,
                    for session: Session,
                    completion: @escaping @Sendable (Result<URLRequest, any Error>) -> Void) {
             var request = urlRequest
             if let token = tokenProvider() {
                 request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
             }
             completion(.success(request))
         }
     }
     ```
   - **逻辑：** 适配器不能直接修改入参，应复制 `URLRequest` 后设置 header，再异步返回成功。

2. **使用 Swift 实现一个简单的 `RequestRetrier`，当状态码为 500、502、503 时最多重试 3 次。**
   - **答案：**
     ```swift
     final class StatusCodeRetrier: RequestRetrier {
         let retryableStatusCodes: Set<Int> = [500, 502, 503]

         func retry(_ request: Request,
                    for session: Session,
                    dueTo error: any Error,
                    completion: @escaping @Sendable (RetryResult) -> Void) {
             guard request.retryCount < 3,
                   let statusCode = request.response?.statusCode,
                   retryableStatusCodes.contains(statusCode) else {
                 completion(.doNotRetry)
                 return
             }

             completion(.retryWithDelay(1.0))
         }
     }
     ```
   - **逻辑：** 必须同时检查次数和状态码，避免无限重试。

3. **使用 Swift 实现一个 `URLRequestConvertible` 路由枚举，支持 GET 用户信息和 POST 创建用户。**
   - **答案：**
     ```swift
     enum UserRouter: URLRequestConvertible {
         case getUser(id: String)
         case createUser(name: String)

         var baseURL: URL { URL(string: "https://api.example.com")! }

         func asURLRequest() throws -> URLRequest {
             switch self {
             case let .getUser(id):
                 var request = URLRequest(url: baseURL.appendingPathComponent("/users/\(id)"))
                 request.method = .get
                 return request
             case let .createUser(name):
                 var request = URLRequest(url: baseURL.appendingPathComponent("/users"))
                 request.method = .post
                 request = try JSONParameterEncoder.default.encode(["name": name], into: request)
                 return request
             }
         }
     }
     ```
   - **逻辑：** 路由枚举集中管理 path、method 和参数编码。

4. **使用 Swift 实现一个自定义 `ResponseSerializer`，将空响应映射为指定的 `Empty` 模型。**
   - **答案：**
     ```swift
     struct EmptyModel: Sendable {}

     struct EmptyModelSerializer: ResponseSerializer {
         func serialize(request: URLRequest?,
                        response: HTTPURLResponse?,
                        data: Data?,
                        error: (any Error)?) throws -> EmptyModel {
             if let error { throw error }
             guard data?.isEmpty != false else {
                 throw AFError.responseSerializationFailed(reason: .inputDataNilOrZeroLength)
             }
             return EmptyModel()
         }
     }
     ```
   - **逻辑：** 空响应 serializer 应明确接受空 data，并把非空但不符合预期的响应视为失败。

5. **使用 Swift 实现一个 `EventMonitor`，打印请求开始、结束和耗时。**
   - **答案：**
     ```swift
     final class LoggingMonitor: EventMonitor {
         let queue = DispatchQueue(label: "logging.monitor")
         private var starts: [UUID: CFAbsoluteTime] = [:]

         func requestDidResume(_ request: Request) {
             starts[request.id] = CFAbsoluteTimeGetCurrent()
             print("Start:", request.request?.url?.absoluteString ?? "")
         }

         func requestDidFinish(_ request: Request) {
             let elapsed = CFAbsoluteTimeGetCurrent() - (starts[request.id] ?? CFAbsoluteTimeGetCurrent())
             print("Finish:", request.id, "elapsed:", elapsed, "error:", String(describing: request.error))
         }
     }
     ```
   - **逻辑：** 事件监控应在自己的队列上记录时间，不阻塞请求主流程。

6. **使用 async/await 封装一个请求函数，返回 `Decodable` 模型并正确处理取消。**
   - **答案：**
     ```swift
     func fetch<T: Decodable & Sendable>(_ type: T.Type, url: URL) async throws -> T {
         let request = AF.request(url)
         return try await withTaskCancellationHandler {
             try await request.serializingDecodable(T.self).value
         } onCancel: {
             request.cancel()
         }
     }
     ```
   - **逻辑：** Swift task 取消时要传播到 Alamofire request，避免底层请求继续运行。

7. **使用 Combine 封装一个请求 publisher，并将错误统一转换为业务错误。**
   - **答案：**
     ```swift
     enum APIError: Error {
         case network(AFError)
         case unknown(any Error)
     }

     func publisher<T: Decodable>(_ type: T.Type, url: URL) -> AnyPublisher<T, APIError> {
         AF.request(url)
             .publishDecodable(type: T.self)
             .value()
             .mapError { error in
                 if let afError = error.asAFError { return .network(afError) }
                 return .unknown(error)
             }
             .eraseToAnyPublisher()
     }
     ```
   - **逻辑：** Combine 封装要把 Alamofire publisher 的错误映射成业务稳定错误类型。

8. **实现一个简单的下载进度回调，将进度节流后分发到主线程。**
   - **答案：**
     ```swift
     final class ProgressThrottler {
         private var lastUpdate = Date.distantPast

         func handle(_ progress: Progress, update: @escaping (Double) -> Void) {
             let now = Date()
             guard now.timeIntervalSince(lastUpdate) > 0.1 || progress.fractionCompleted >= 1 else { return }
             lastUpdate = now
             DispatchQueue.main.async {
                 update(progress.fractionCompleted)
             }
         }
     }
     ```
   - **逻辑：** 进度高频触发时应节流，UI 更新必须回主线程。

9. **实现一个 token refresh 队列，要求多个并发 401 只触发一次刷新。**
   - **答案：**
     ```swift
     actor TokenRefreshCoordinator {
         private var isRefreshing = false
         private var waiters: [CheckedContinuation<String, any Error>] = []

         func refreshIfNeeded(_ refresh: @escaping @Sendable () async throws -> String) async throws -> String {
             if isRefreshing {
                 return try await withCheckedThrowingContinuation { waiters.append($0) }
             }

             isRefreshing = true
             do {
                 let token = try await refresh()
                 let currentWaiters = waiters
                 waiters.removeAll()
                 isRefreshing = false
                 currentWaiters.forEach { $0.resume(returning: token) }
                 return token
             } catch {
                 let currentWaiters = waiters
                 waiters.removeAll()
                 isRefreshing = false
                 currentWaiters.forEach { $0.resume(throwing: error) }
                 throw error
             }
         }
     }
     ```
   - **逻辑：** actor 串行化刷新状态，等待队列合并并发刷新。

10. **实现一个单元测试，用 mock `URLProtocol` 模拟服务端返回 JSON、500 错误和超时。**
    - **答案：**
      ```swift
      final class MockURLProtocol: URLProtocol {
          static var handler: ((URLRequest) throws -> (HTTPURLResponse, Data))?

          override class func canInit(with request: URLRequest) -> Bool { true }
          override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }

          override func startLoading() {
              do {
                  let (response, data) = try Self.handler!(request)
                  client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
                  client?.urlProtocol(self, didLoad: data)
                  client?.urlProtocolDidFinishLoading(self)
              } catch {
                  client?.urlProtocol(self, didFailWithError: error)
              }
          }

          override func stopLoading() {}
      }
      ```
    - **逻辑：** mock protocol 能拦截请求并返回可控响应，测试中通过切换 handler 模拟 JSON、500 和错误。

### 2.5 场景分析题

1. **线上出现大量请求偶发超时，你会从哪些维度排查？**
   - **答案：** 排查客户端网络环境、超时配置、DNS、TLS、服务端耗时、网关、重试、并发量、队列阻塞和 URLSessionTaskMetrics。
   - **逻辑：** 超时可能发生在连接、传输、服务端处理或客户端调度任一阶段。

2. **某接口在 token 过期时同时触发 20 个请求刷新 token，导致服务端限流，你会如何修复？**
   - **答案：** 引入刷新单飞机制，只有一个请求刷新 token，其余请求等待结果，刷新成功后统一重试，失败后统一返回认证错误。
   - **逻辑：** 问题根源是并发刷新未协调。

3. **某下载任务恢复后文件损坏，你会如何定位 resume data、目标文件移动和校验逻辑？**
   - **答案：** 检查服务端 range 支持、resume data 是否过期、临时文件和目标文件移动是否正确、是否覆盖旧文件，并用 checksum 校验完整性。
   - **逻辑：** 断点续传依赖分段一致性和最终文件校验。

4. **某 App 在弱网下重复提交订单，你会如何设计重试和幂等保护？**
   - **答案：** 禁止自动重试非幂等下单请求，或使用服务端幂等键；客户端显示明确提交状态并防重复点击。
   - **逻辑：** 弱网重试可能造成重复副作用，必须靠幂等语义保护。

5. **某服务端返回 `204 No Content`，客户端 JSON 解析失败，你会如何修复序列化逻辑？**
   - **答案：** 将 204 识别为合法空响应，使用 `Empty`、`Void` 或可选模型 serializer，而不是强制 JSON 解码。
   - **逻辑：** 204 的 HTTP 语义就是无响应体。

6. **某证书更新后 iOS 请求全部失败，但 Android 正常，你会如何排查 pinning 配置？**
   - **答案：** 检查 iOS 是否启用证书或公钥 pinning、bundle 中 pin 是否更新、host 是否匹配、证书链是否变化、系统时间是否正常。
   - **逻辑：** Android 正常说明服务端基本可用，iOS 失败更可能是客户端信任策略差异。

7. **某请求日志中 header 泄露了 token，你会如何改造日志系统？**
   - **答案：** 引入敏感字段脱敏白名单/黑名单，默认隐藏 Authorization、Cookie、Set-Cookie、API key 和请求体敏感字段。
   - **逻辑：** 日志系统应默认安全，敏感信息不能进入持久化日志。

8. **某请求取消后仍然回调 UI 更新，你会如何排查状态流转和回调调度？**
   - **答案：** 检查取消是否调用到底层 request，completion 是否判断取消状态，回调是否已排队，UI 层是否在复用对象时校验 request id。
   - **逻辑：** 取消不能保证已派发回调自动消失，UI 层也要做身份校验。

9. **某接口返回很大的 JSON 导致内存峰值高，你会如何优化？**
   - **答案：** 优先分页或服务端裁剪；客户端可使用流式处理、后台序列化、减少中间拷贝、压缩传输和更轻量模型。
   - **逻辑：** 大 JSON 问题既是协议设计问题，也是客户端内存管理问题。

10. **某 CI 在 Linux 上构建通过但功能不可用，你会如何解释跨平台支持边界？**
    - **答案：** 构建通过只说明源码可编译；Linux 的 FoundationNetworking、TLS、缓存、metrics、WebSocket 等能力可能与 Apple 平台不一致或缺失。
    - **逻辑：** 支持级别要区分“可构建”和“完整功能可用”。

## 3. 参考考察点

### 3.1 初级候选人

- **考察重点：** 能说明 `AF.request`、`Session`、`Request` 的基本关系；理解 GET / POST、headers、parameters、JSON 解析、错误处理；能使用回调或 async/await 完成基本请求；能解释上传、下载、进度和取消的基础概念。
- **评价逻辑：** 初级候选人重点看是否能正确使用网络库和理解基础 HTTP 概念，不要求深入解释 Alamofire 内部队列、状态机或 delegate 桥接。

### 3.2 中级候选人

- **考察重点：** 能描述请求生命周期和拦截器执行时机；理解线程安全、队列、响应序列化和统一错误模型；能设计 token 刷新、重试、日志、缓存等常见网络层能力；能编写可测试的网络层，并使用 mock 避免真实网络依赖。
- **评价逻辑：** 中级候选人重点看是否能把 Alamofire 用成稳定的业务网络层，并能处理认证、重试、错误映射、测试隔离等工程问题。

### 3.3 高级候选人

- **考察重点：** 能从源码层面解释 `Session`、`SessionDelegate`、`RequestTaskMap` 和 `Request` 的协作；能分析并发刷新、取消竞态、重试幂等、上传流重建等复杂问题；能设计跨平台、可观测、可扩展、安全合规的网络基础设施。
- **评价逻辑：** 高级候选人重点看系统设计能力和源码理解深度，需要能权衡 API 易用性、性能、线程安全、兼容性、测试覆盖和线上风险。

## 4. 推荐使用方式

- **使用建议：** 面试前根据岗位级别从对应章节选题，不建议一次性全部使用。
- **架构方向：** 优先选择“项目理解与架构”“请求生命周期”“并发与线程安全”，用于判断候选人是否理解 Alamofire 的核心设计。
- **业务客户端方向：** 优先选择“拦截、认证与重试”“响应处理与错误模型”“场景分析题”，用于判断候选人是否能落地业务网络层。
- **SDK / 基础设施方向：** 优先选择“安全、缓存与重定向”“工程化、测试与发布”“设计题”，用于判断候选人是否具备公共库设计和长期维护能力。
- **笔试组合：** 建议搭配 1 道代码阅读题、1 道设计题、1 道场景分析题和 1 道编程题。
- **评价逻辑：** 题目选择应服务岗位能力模型，避免只考 API 记忆；更应关注候选人是否能解释取舍、发现风险并给出可维护方案。
