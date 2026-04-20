---
title: "AI 提示词评估测试代码示例"
date: "2026-04-20"
summary: "使用 Node 内置测试框架验证 AI 输出评分逻辑的示例。"
category: "AI"
slug: "ai-prompt-evaluator-test"
tags:
  - AI
  - testing
  - node-test
draft: false
---

# AI 提示词评估测试代码示例

下面是一段可直接用于演示的测试代码，目标是验证 AI 输出评分逻辑是否稳定。

## 示例：评分函数 + 单元测试

```ts
import test from "node:test";
import assert from "node:assert/strict";

type EvalInput = {
  grounded: boolean;
  concise: boolean;
  hasActionableSteps: boolean;
};

export function scoreAnswer(input: EvalInput): number {
  let score = 0;
  if (input.grounded) score += 40;
  if (input.concise) score += 30;
  if (input.hasActionableSteps) score += 30;
  return score;
}

test("returns 100 when all quality checks pass", () => {
  const score = scoreAnswer({
    grounded: true,
    concise: true,
    hasActionableSteps: true,
  });

  assert.equal(score, 100);
});

test("penalizes ungrounded answers", () => {
  const score = scoreAnswer({
    grounded: false,
    concise: true,
    hasActionableSteps: true,
  });

  assert.equal(score, 60);
});

test("returns 0 when all checks fail", () => {
  const score = scoreAnswer({
    grounded: false,
    concise: false,
    hasActionableSteps: false,
  });

  assert.equal(score, 0);
});
```

## 运行方式

```bash
node --test ai-evaluator.test.ts
```

你也可以把这段逻辑替换为你的真实 LLM 评估规则，例如加入「事实一致性」「格式正确性」「安全合规」等维度。
