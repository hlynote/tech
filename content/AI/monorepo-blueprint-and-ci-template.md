---
title: "多端项目 Monorepo 目录蓝图与 CI 拆分模板"
date: "2026-04-20T09:40:00+08:00"
summary: "提供可直接落地的 Monorepo 目录结构和按端拆分的 CI 流水线模板。"
category: "AI"
slug: "monorepo-blueprint-and-ci-template"
tags:
  - Monorepo
  - CI/CD
  - Harness
  - Template
draft: false
---

# 多端项目 Monorepo 目录蓝图与 CI 拆分模板

下面给出一个可直接落地的参考模板，适用于“后台管理 + H5 + 小程序 + App + 后端 API”的一体化项目。

## 1) Monorepo 目录蓝图

```text
.
├─ apps/
│  ├─ admin/              # 后台管理（Web）
│  ├─ h5/                 # H5 前端
│  ├─ mp-wechat/          # 微信小程序
│  └─ mobile/             # App（RN/Flutter/原生壳）
├─ services/
│  └─ api/                # 后端接口服务
├─ packages/
│  ├─ sdk/                # 由 OpenAPI/GraphQL 生成的 API SDK
│  ├─ types/              # 领域模型与共享类型
│  ├─ ui-web/             # Web 端共享 UI 组件（admin/h5）
│  ├─ utils/              # 跨端工具
│  └─ config/             # eslint/tsconfig/jest 等公共配置
├─ openspec/
│  └─ changes/            # OpenSpec 变更与任务沉淀
├─ scripts/               # 构建与发布脚本
└─ .github/workflows/     # CI 模板（若用 GitHub Actions）
```

## 2) 关键工程约定

- **统一版本管理**：所有包走 workspace（pnpm/yarn/npm workspaces）
- **统一类型来源**：`packages/types` 为唯一领域模型来源
- **统一 API 调用层**：业务端只能经 `packages/sdk` 调后端
- **统一规范**：lint、test、commit message 在 `packages/config` 中集中维护

## 3) CI 拆分策略（按目录触发）

核心目标：改哪一层只跑哪一层，减少无效构建。

- 改 `apps/admin/**` -> 仅跑 admin lint/test/build
- 改 `apps/h5/**` -> 仅跑 h5 lint/test/build
- 改 `apps/mp-wechat/**` -> 仅跑小程序校验
- 改 `apps/mobile/**` -> 仅跑 mobile 校验
- 改 `services/api/**` -> 跑 API lint/test/build + 合约校验
- 改 `packages/types` 或 `packages/sdk` -> 触发所有消费端兼容检查

## 4) CI 模板（可直接改造）

```yaml
name: monorepo-ci

on:
  pull_request:
  push:
    branches: [main]

jobs:
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      admin: ${{ steps.filter.outputs.admin }}
      h5: ${{ steps.filter.outputs.h5 }}
      mp: ${{ steps.filter.outputs.mp }}
      mobile: ${{ steps.filter.outputs.mobile }}
      api: ${{ steps.filter.outputs.api }}
      shared: ${{ steps.filter.outputs.shared }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            admin:
              - 'apps/admin/**'
            h5:
              - 'apps/h5/**'
            mp:
              - 'apps/mp-wechat/**'
            mobile:
              - 'apps/mobile/**'
            api:
              - 'services/api/**'
            shared:
              - 'packages/types/**'
              - 'packages/sdk/**'

  admin-ci:
    needs: detect-changes
    if: needs.detect-changes.outputs.admin == 'true' || needs.detect-changes.outputs.shared == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint --workspace=apps/admin
      - run: npm run test --workspace=apps/admin
      - run: npm run build --workspace=apps/admin

  h5-ci:
    needs: detect-changes
    if: needs.detect-changes.outputs.h5 == 'true' || needs.detect-changes.outputs.shared == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint --workspace=apps/h5
      - run: npm run test --workspace=apps/h5
      - run: npm run build --workspace=apps/h5

  api-ci:
    needs: detect-changes
    if: needs.detect-changes.outputs.api == 'true' || needs.detect-changes.outputs.shared == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint --workspace=services/api
      - run: npm run test --workspace=services/api
      - run: npm run build --workspace=services/api
      - run: npm run contract:check --workspace=services/api
```

## 5) 发布流水线建议（Harness 视角）

- **前端类应用**：按端独立发布（admin/h5/mp/mobile）
- **后端 API**：灰度发布 + 自动回滚阈值
- **共享包变更**：触发“多端兼容性检查”后再允许发布
- **高风险变更**：开启人工审批闸门（TL/SRE/SEC）

## 6) 与 OpenSpec 的衔接方式

每个 OpenSpec change 都应声明影响范围：

- `impact: admin`
- `impact: h5`
- `impact: api`
- `impact: shared`

CI 可以按 impact 和实际变更路径双重校验，减少漏测与误发版。
