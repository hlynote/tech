---
title: "iOS 审核记录：Guideline 5.1 隐私问题"
date: "2026-04-25T16:21:00+08:00"
summary: "汇总 5.1.1(v) 与 5.1.1(ii) 的多轮审核问题，便于按轮次复盘和整改跟踪。"
category: "iOS"
slug: "ugc-guideline-5-1-review-record"
tags:
  - iOS
  - App Store Review
  - Guideline 5.1
  - Privacy
draft: false
---

# Guideline 5.1 审核问题记录

## 基本信息

- Submission ID: `b5e0b354-59ad-461f-a5ca-8a2a36f9e00a`
- App Version: `1.0.0`
- Scope: `5.1.1(v)` and `5.1.1(ii)`

## 问题 1：Guideline 5.1.1(v)（2026-04-14）

Review Device: iPhone 17 Pro Max

Issue Description

The app requires users to provide personal information that is not directly relevant to the app's core functionality.

Apps should only require users to provide information that is necessary for the app to function. If information is useful for a non-essential feature, apps may request the information but make it optional.

Examples of app concepts and inappropriate required information:

- A general shopping app that requires the user's marital status
- A rideshare app that requires the user's gender

Next Steps

Update the app to not require users to provide the following personal information:

- Date of birth
- Gender

Resources

Learn more about data collection and storage requirements in guideline 5.1.1.

## 问题 2：Guideline 5.1.1(v) Follow-up（日期未明确）

Issue Description

The app requires users to provide personal information that is not directly relevant to the app's core functionality.

Apps should only require users to provide information that is necessary for the app to function. If information is useful for a non-essential feature, apps may request the information but make it optional.

Examples of app concepts and inappropriate required information:

- A general shopping app that requires the user's marital status
- A rideshare app that requires the user's gender

Next Steps

Update the app to not require users to provide the following personal information:

- Gender
- Birthday

Resources

Learn more about data collection and storage requirements in guideline 5.1.1.

## 问题 3：Guideline 5.1.1(ii)（2026-04-19）

Review Device: iPad Air 11-inch (M3)

Issue Description

One or more purpose strings in the app do not sufficiently explain the use of protected resources. Purpose strings must clearly and completely describe the app's use of data and, in most cases, provide an example of how the data will be used.

Next Steps

Update the photo library purpose string to explain how the app will use the requested information and provide a specific example of how the data will be used. See the attached screenshot.

Resources

Purpose strings must clearly describe how an app uses the ability, data, or resource. The following are hypothetical examples of unclear purpose strings that would not pass review:

- "App would like to access your Contacts"
- "App needs microphone access"

See examples of helpful, informative purpose strings.

## 跟进状态

- 记录次数：`5.1` x 3
