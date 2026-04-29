---
title: "Apple Developer Pending Termination Notice 处理指南"
date: "2026-04-29T14:45:00+08:00"
summary: "针对 Apple Developer Program 收到 Pending Termination Notice 的问题定位、申诉框架与整改清单。"
category: "iOS"
slug: "apple-developer-pending-termination-notice-guide"
tags:
  - iOS
  - AppStore
  - Compliance
  - Review
draft: false
---

## 问题原文（Apple 通知）

```text
Pending Termination Notice

Upon further review of the activity associated with your Apple Developer Program membership, it's been determined that your membership, or a membership associated with your account, has been used for dishonest or fraudulent activity, in violation of the Apple Developer Program License Agreement. Given the severity of the identified issues, all apps associated with your Apple Developer Program account have been removed from the App Store and your account has been flagged for removal.

Because your account has been flagged for removal, any earnings payments are paused and app transfers are disabled. Creating new accounts after receiving this message may result in the termination of the new or associated accounts.

Evidence of Dishonest or Fraudulent Activity

App submissions from your account have engaged in concept or feature switch schemes to evade the review process, such as dynamically populating different app content after review, submitting apps with hidden features, repeatedly submitting misleading apps, and/or submitting apps with concrete references to content that you are not authorized to provide or is otherwise not appropriate for the App Store.

Guidelines or Terms Violated

The dishonest or fraudulent activity described above directly violates section 3.2(f) of the Apple Developer Program License Agreement, which states:

"You will not, directly or indirectly, commit any act intended to interfere with any of the Apple Software or Services, the intent of this Agreement, or Apple’s business practices including, but not limited to, taking actions that may hinder the performance or intended use of the App Store, Custom App Distribution, TestFlight, Xcode Cloud, Ad Hoc distribution, or the Program (e.g., submitting fraudulent reviews of Your own Application or any third-party application, choosing a name for Your Application that is substantially similar to the name of a third-party application in order to create consumer confusion, or squatting on application names to prevent legitimate third-party use). Further, You will not engage, or encourage others to engage, in any unlawful, unfair, misleading, fraudulent, improper, or dishonest acts or business practices relating to Your Covered Products or Corresponding Products (e.g., engaging in bait-and-switch pricing, consumer misrepresentation, deceptive business practices, or unfair competition against other developers)."

Appeal

If you would like to appeal this termination decision to the App Review Board, you must do so within 30 calendar days. When submitting your appeal, be sure to select "I would like to appeal an app rejection or app removal" from the drop-down menu on the Contact the App Review Team page and provide a written statement that includes the following:

- A thorough explanation of the issues we identified
- Specific steps you will take to prevent its recurrence
- New information clarifying these issues, if you disagree with our findings

Otherwise, your Apple Developer Program membership will be terminated. If you have questions, contact us.
```

# Apple Developer Pending Termination Notice 处理指南

本文基于 Apple 发出的 `Pending Termination Notice` 内容，整理为可执行的应对方案，适用于团队内部复盘、申诉材料准备和后续合规整改。

## 1. 这封通知是什么意思

通知核心含义是：

- Apple 认为账号（或关联账号）存在欺诈/误导行为
- 当前账号已被标记为可能终止（Pending Termination）
- 账号下架全部 App、暂停收益结算、禁用 app transfer
- 需在 30 天内向 App Review Board 发起申诉，否则大概率终止会生效

## 2. 本次指控的重点（按你收到的原文归纳）

Apple 指向的是“规避审核”的行为模式，典型包括：

- 审核后动态切换内容（concept/feature switch）
- 提交含隐藏功能的版本
- 重复提交误导性 App
- 提交了你无授权或不适合上架的内容引用

对应条款是 Apple Developer Program License Agreement `3.2(f)`（不允许欺骗、误导、不正当或不诚信行为）。

## 3. 申诉窗口与目标

你需要在 30 天内提交申诉，目标不是“争辩一句话”，而是让 Apple 相信三件事：

- 你理解问题根因（不是模板化道歉）
- 你有可验证的整改措施（不是空泛承诺）
- 风险可控且不会再发生（有制度和技术约束）

## 4. 建议的申诉材料结构（可直接套用）

### 4.1 第一部分：问题说明（What happened）

- 逐条对应 Apple 指控点解释事实
- 明确哪些点你承认、哪些点你有补充事实
- 避免“全盘否认 + 情绪表达”的写法

### 4.2 第二部分：根因分析（Why happened）

- 需求/审核流程缺失（例如版本功能开关缺乏审计）
- 内容授权流程不完整（素材、版权、第三方来源）
- 发布前检查不充分（审核包与线上配置不一致）

### 4.3 第三部分：整改动作（What changed）

至少覆盖这 4 类：

- **产品层**：下线高风险入口、移除隐藏能力、保证审核态与线上态一致
- **工程层**：禁用高风险远程开关、增加发布白名单和构建期校验
- **流程层**：新增提审清单、法务/版权校验、双人复核
- **组织层**：明确 owner、建立违规升级机制、保留审计记录

### 4.4 第四部分：防复发机制（How to prevent recurrence）

- 版本级合规 checklist（提审必过）
- 配置变更审计（谁在何时改了什么）
- 灰度与回滚策略记录
- 内部培训与责任人制度

## 5. 可直接使用的整改清单（团队执行版）

### 5.1 48 小时内（止血）

- 停止所有新包提审与功能热切换
- 冻结可疑远程配置
- 梳理近 3-6 个月版本差异与审核记录
- 下线可能触发误导判断的入口与文案

### 5.2 7 天内（可交付）

- 输出完整 RCA（Root Cause Analysis）文档
- 建立 App 审核版本配置快照机制
- 补齐内容授权证明与第三方素材来源凭据
- 提交正式申诉文本（含时间线与责任人）

### 5.3 30 天内（稳定）

- 合规门禁接入 CI（高风险开关、敏感文案、隐藏路径扫描）
- 发布流程平台化（减少人工绕过）
- 建立季度合规回顾机制

## 6. 申诉文本模板（中文）

可在 Contact the App Review Team 中选择  
`I would like to appeal an app rejection or app removal` 后提交。

```text
主题：Appeal for Pending Termination Notice

我们已收到关于账号存在误导/不诚信行为的通知。我们高度重视该问题，并已完成初步排查与整改。

一、问题说明
1) 针对“审核后内容切换/隐藏功能”的问题：<逐条说明事实>
2) 针对“误导性提交”的问题：<逐条说明事实>
3) 针对“内容授权”的问题：<逐条说明事实>

二、根因分析
<说明流程与技术层面的根因，不推责>

三、已完成整改
1) 产品整改：<已移除/已下线项>
2) 工程整改：<开关治理、构建校验、日志审计>
3) 流程整改：<提审清单、法务复核、双人审批>

四、防复发机制
<长期制度与技术保障，含负责人和时间点>

我们愿意持续配合 Apple 的进一步核查，并按要求提供补充材料。恳请 App Review Board 重新评估本账号状态。
```

## 7. 关键注意事项（避免二次风险）

- 不要在申诉期继续尝试“新账号平移”或关联绕过
- 不要提交与申诉描述不一致的新版本行为
- 不要只给结论，必须提供证据链（时间线、配置、提交记录、责任人）
- 所有对外表述保持一致，避免团队成员口径冲突

## 8. 建议补充的证据材料

- 版本提交与审核记录时间线
- 审核包配置快照（与线上配置比对）
- 远程配置变更日志（含操作者）
- 下线/整改 PR、发布记录、回滚记录
- 第三方内容授权文件或合规证明

## 9. 给团队的落地建议

从这类事件看，App 审核问题本质不是“写一封申诉信”，而是“建立可信的合规工程体系”。  
建议把“合规”前置到需求评审、研发实现、发版流程和运营配置管理中，减少事后被动救火。

