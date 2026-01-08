---
layout: papermod-post
title: "Deeper look at Next-Token Prediction and what's beyond"
date: 2026-01-05 12:00:00 +0530
categories: [research, ai, language-models]
description: "why does next-token prediction with teacher-forcing fails to learn planning, even with infinite data and capacity."
---

## A Bit about Next-Token Prediction
Next-token prediction (NTP) is the primary objective for training sequence models. This
objective involves a technique called teacher forcing , where the model’s predicted output at each step is replaced with the ground truth from the real dataset. One of teacher forcing’s benefits is that it accelerates the training by providing the model
with the correct previous output, so the learning does not suffer from error accumulation,
and the gradient update is more stable. Another crucial benefit is that it enables parallelism
and hardware acceleration in training because the model can simultaneously process all
time steps, rather than sequentially waiting for its own predictions. 
**Mathematically,** \\
Let $y = (y_1, \ldots, y_T)$ be a token sequence with $y_t \in V$. An autoregressive language model parameterized by $\theta$ defines a joint distribution that factorizes via the chain rule:

$$P_\theta(y) = \prod_{t=1}^{T} p_\theta(y_t \mid y_{\lt t}), \quad y_{\lt t} = (y_1, \ldots, y_{t-1}).$$

Training uses maximum likelihood estimation with **teacher forcing**. Given a dataset $\{y^{(i)}\}_{i=1}^{N}$, the objective is

$$\theta^* = \arg\max_\theta \sum_{i=1}^{N} \sum_{t=1}^{T} \log p_\theta(y_t^{(i)} \mid y_{\lt t}^{(i)}),$$

which is equivalent to minimizing the cross-entropy between the empirical data distribution and $p_\theta$.

At **inference**, the model generates tokens sequentially by conditioning on previously generated tokens $\hat{y}_{<t}$ and an optional context $c$. **Greedy decoding** selects

$$\hat{y}_t = \arg\max_{y_t \in V} p_\theta(y_t \mid \hat{y}_{<t}, c),$$

while **stochastic decoding** samples $y_t \sim p_\theta(\cdot \mid \hat{y}_{<t}, c)$. This procedure defines next-token prediction as iterative conditional density estimation under an autoregressive factorization.

## Teacher-Forcing as an Optimization Objective

Teacher-forced training optimizes the expected negative log-likelihood of the target sequence under the model distribution. Given an input prompt $p$ and a target response sequence $r = (r_1, r_2, \dots, r_T)$, the teacher-forcing loss is defined as

$$\mathcal{L}_{\text{TF}}(\theta) = - \mathbb{E}_{(p,r) \sim \mathcal{D}} \left[ \sum_{i=1}^{T} \log q_\theta(r_i \mid p, r_{\lt i}) \right],$$

where $q_\theta$ denotes the model distribution and $r_{\lt i} = (r_1, \dots, r_{i-1})$ is the ground-truth prefix.

This objective decomposes sequence learning into a collection of supervised subproblems, one for each time step. Each subproblem is trained by conditioning on the true prefix $r_{\lt i}$, which is available during training but not at inference time, where the model must instead condition on its own previously generated tokens.

The standard assumption underlying teacher forcing is that minimizing $\mathcal{L}_{\text{TF}}$ yields a model whose conditional distributions satisfy

$$q_\theta(r_i \mid p, r_{\lt i}) \approx P(r_i \mid p, r_{\lt i}) \quad \text{for all } i,$$

where $P$ denotes the true data-generating distribution.

## Error Compounding Is Not the Core Issue

Suppose instead that the learned model has a small but nonzero per-token error rate

$$P_{q_\theta}(\hat{r}_i \neq r_i \mid p, r_{\lt i}) = \varepsilon.$$

Then the probability of producing an entirely correct sequence under autoregressive inference satisfies

$$P(\hat{r} = r) = (1 - \varepsilon)^T,$$

which decays exponentially in $T$. This is the standard **snowballing error argument**.

However, this analysis presupposes that $q_\theta(\cdot \mid p, r_{\lt i})$ is already a good approximation to the true conditional distribution. It only diagnoses a failure of **execution at inference time**, not a failure of **learning**. If the conditionals were accurate, one could in principle recover the correct plan via verification, backtracking, or search.

> The deeper question is therefore whether teacher-forced training actually recovers the correct conditionals.


## The Clever Hans Mechanism

For many tokens with large $i$, the conditional entropy

$$H(r_i \mid p, r_{\lt i})$$

is extremely small. Teacher-forcing therefore allows the model to learn a **trivial mapping** from $r_{i-1}$ to $r_i$, bypassing the need to compute any global plan from $p$.

Formally, the model converges to a factorization

$$q_\theta(r_i \mid p, r_{\lt i}) \approx q_\theta(r_i \mid r_{i-1}),$$

even when

$$P(r_i \mid p, r_{\lt i}) \neq P(r_i \mid r_{i-1})$$

at test time due to distributional shift in $r_{\lt i}$.

This shortcut **perfectly minimizes training loss** while discarding the intended computation. It is structurally induced by the objective, not by insufficient data or capacity.


## Loss of Supervision and the Indecipherable Token

When later tokens in an autoregressive sequence can be fitted through shortcut solutions, the effective supervision collapses onto early tokens, in particular the first response token $r_1$. Under teacher-forced training, the learning objective for this token reduces to

$$\mathbb{E}_{(p,r) \sim \mathcal{D}} \left[ \log q_\theta(r_1 \mid p) \right].$$

In structured prediction tasks, the correct value of $r_1$ is not determined solely by the prompt $p$, but depends on an implicit latent plan that specifies the entire response sequence. Suppose the task requires composing $\ell$ discrete subroutines drawn from a finite set $\mathcal{C}$. The resulting hypothesis space has cardinality

$$|\mathcal{H}| = |\mathcal{C}|^{\ell}.$$

Correct prediction of $r_1$ requires selecting the unique latent plan consistent with the ground-truth response. This induces an effective loss function of the form

$$\ell(\theta) = \begin{cases} 0, & \text{if all } \ell \text{ subroutines are correct}, \\ \infty, & \text{otherwise}. \end{cases}$$

The resulting loss surface is discontinuous and combinatorial, making gradient-based optimization intractable. Infinitesimal parameter updates almost surely correspond to incorrect latent plans and therefore incur maximal loss.

Consequently, the learned conditional distribution for the first token converges to a high-entropy solution,

$$q_\theta(r_1 \mid p) \approx \text{Uniform},$$

even though the model achieves near-zero training loss over full sequences under teacher forcing. This demonstrates a loss of effective supervision for early tokens and explains the emergence of indecipherable initial predictions in otherwise well-trained autoregressive models.

## Why Inference-Time Fixes Cannot Help

Because $q_\theta(r_1 \mid p)$ itself is incorrect, **no inference-time strategy can recover the correct plan**. The failure is not due to sampling error or exposure bias, but due to a mismatch between the learned conditionals and the true task structure.

Formally, for early tokens,

$$q_\theta(\cdot \mid p) \not\approx P(\cdot \mid p),$$

so any decoding algorithm operating on $q_\theta$ is **fundamentally misinformed**.


## Thoughts

The chain rule ensures that next-token predictors are **expressive**, but teacher-forced optimization does not ensure that the correct factorization is **learned**,the model conditions on ground-truth prefixes that implicitly contain information about future narrative outcomes, enabling shortcut solutions that bypass planning entirely.In lookahead tasks, the training objective admits spurious minimizers that condition on the answer rather than compute it.Long-horizon planning problems such as story generation, multiple factorizations achieve identical likelihood while relying on qualitatively different internal strategies including goal-conditioned narrative generation in which later tokens encode or reveal future structure, allowing earlier predictions to be fit without explicitly constructing a latent plan.

---

