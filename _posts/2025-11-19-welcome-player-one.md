---
layout: papermod-post
title: "When the Chain Rule Fails to Teach Planning: A Mathematical View of Next-Token Prediction"
date: 2026-01-05 12:00:00 +0530
categories: [research, ai, language-models]
description: "A mathematical analysis of why next-token prediction with teacher-forcing fails to learn planning, even with infinite data and capacity."
---

## The Optimistic Argument from the Chain Rule

Let $V$ be a finite vocabulary and let $r = (r_1, \ldots, r_T) \in V^T$ denote a response sequence conditioned on a prefix or problem description $p$. For any joint distribution $P(r \mid p)$, the chain rule guarantees the factorization

$$P(r \mid p) = \prod_{i=1}^{T} P(r_i \mid p, r_{<i}),$$

where $r_{<i} = (r_1, \ldots, r_{i-1})$.

From a purely representational standpoint, this implies that there exists a next-token predictor $q_\theta$ such that

$$q_\theta(r_i \mid p, r_{<i}) = P(r_i \mid p, r_{<i}) \quad \text{for all } i.$$

Under this assumption, autoregressive sampling from $q_\theta$ exactly reproduces the true distribution. This argument underlies the claim that **next-token prediction is universally expressive**.

---

## Error Compounding Is Not the Core Issue

Suppose instead that the learned model has a small but nonzero per-token error rate

$$P_{q_\theta}(\hat{r}_i \neq r_i \mid p, r_{<i}) = \varepsilon.$$

Then the probability of producing an entirely correct sequence under autoregressive inference satisfies

$$P(\hat{r} = r) = (1 - \varepsilon)^T,$$

which decays exponentially in $T$. This is the standard **snowballing error argument**.

However, this analysis presupposes that $q_\theta(\cdot \mid p, r_{<i})$ is already a good approximation to the true conditional distribution. It only diagnoses a failure of **execution at inference time**, not a failure of **learning**. If the conditionals were accurate, one could in principle recover the correct plan via verification, backtracking, or search.

> The deeper question is therefore whether teacher-forced training actually recovers the correct conditionals.

---

## Teacher-Forcing as an Optimization Objective

Teacher-forced training optimizes the expected log-likelihood

$$\mathcal{L}_{\text{TF}}(\theta) = \mathbb{E}_{(p,r) \sim \mathcal{D}} \left[ \sum_{i=1}^{T} \log q_\theta(r_i \mid p, r_{<i}) \right].$$

This objective decomposes sequence learning into $T$ supervised subproblems. Crucially, **each subproblem conditions on the ground-truth prefix $r_{<i}$**, which is information that will not be available at inference time.

The standard assumption is that minimizing $\mathcal{L}_{\text{TF}}$ yields $q_\theta(r_i \mid p, r_{<i}) \approx P(r_i \mid p, r_{<i})$ for all $i$. The paper shows that this assumption fails for a broad class of tasks.

---

## Lookahead Tasks and Conditional Shortcutting

Consider tasks in which the correct value of an early token $r_1$ depends on information that is only logically determined by later tokens $r_k, \ldots, r_T$. Formally, such tasks exhibit a dependency structure where

$$r_1 = f(p, r_{k:T}) \quad \text{for some } k > 1,$$

while no function $g$ exists such that $r_1 = g(p)$ alone.

In these settings, teacher-forcing introduces an alternative family of conditional predictors

$$\tilde{f}_i(p, r_{<i}) \approx r_i,$$

that exploit correlations between $r_{<i}$ and $r_i$ **without recovering the underlying dependency on $p$**.

These predictors are valid minimizers of $\mathcal{L}_{\text{TF}}$ but do not correspond to the true conditional distribution $P(r_i \mid p, r_{<i})$ that would be encountered at inference time.

---

## The Clever Hans Mechanism

For many tokens with large $i$, the conditional entropy

$$H(r_i \mid p, r_{<i})$$

is extremely small. Teacher-forcing therefore allows the model to learn a **trivial mapping** from $r_{i-1}$ to $r_i$, bypassing the need to compute any global plan from $p$.

Formally, the model converges to a factorization

$$q_\theta(r_i \mid p, r_{<i}) \approx q_\theta(r_i \mid r_{i-1}),$$

even when

$$P(r_i \mid p, r_{<i}) \neq P(r_i \mid r_{i-1})$$

at test time due to distributional shift in $r_{<i}$.

This shortcut **perfectly minimizes training loss** while discarding the intended computation. It is structurally induced by the objective, not by insufficient data or capacity.

---

## Loss of Supervision and the Indecipherable Token

Once later tokens are fitted via shortcuts, the remaining supervision concentrates on early tokens such as $r_1$. The learning problem reduces to minimizing

$$\mathbb{E}_{(p,r) \sim \mathcal{D}} \left[ \log q_\theta(r_1 \mid p) \right],$$

but the correct predictor requires implicitly reconstructing the entire latent plan.

If the task requires composing $\ell$ discrete subroutines drawn from a finite set $\mathcal{C}$, the effective hypothesis space has size $|\mathcal{C}|^\ell$. The loss for $r_1$ becomes effectively binary:

$$\ell(\theta) = \begin{cases} 0, & \text{if all subroutines are correct}, \\ \infty, & \text{otherwise}. \end{cases}$$

Gradient-based optimization over such a loss surface is **combinatorial and intractable**. As a result, the learned predictor for $r_1$ converges to a high-entropy approximation

$$q_\theta(r_1 \mid p) \approx \text{Uniform},$$

even though the model achieves near-zero training loss overall.

---

## Why Inference-Time Fixes Cannot Help

Because $q_\theta(r_1 \mid p)$ itself is incorrect, **no inference-time strategy can recover the correct plan**. The failure is not due to sampling error or exposure bias, but due to a mismatch between the learned conditionals and the true task structure.

Formally, for early tokens,

$$q_\theta(\cdot \mid p) \not\approx P(\cdot \mid p),$$

so any decoding algorithm operating on $q_\theta$ is **fundamentally misinformed**.

---

## Alternative Objectives and Identifiability

When training is modified to remove access to ground-truth prefixes—such as by predicting multiple future tokens jointly or by conditioning on uninformative placeholders—the shortcut family $q_\theta(r_i \mid r_{i-1})$ is no longer feasible.

In these objectives, the model must minimize

$$\mathbb{E}_{(p,r) \sim \mathcal{D}} \left[ \sum_{i=1}^{T} \log q_\theta(r_i \mid p) \right],$$

which **restores identifiability** of the true planning mechanism and empirically recovers correct generalization.

---

## Conclusion

The chain rule ensures that next-token predictors are **expressive**, but teacher-forced optimization does not ensure that the correct factorization is **learned**. In lookahead tasks, the training objective admits spurious minimizers that condition on the answer rather than compute it.

This failure is **mathematical and structural**. It arises even in-distribution, even with infinite data, and even for simple deterministic tasks. As a result, planning failures in language models cannot be fully attributed to inference-time compounding of errors. They can originate directly from the next-token learning objective itself.

---

