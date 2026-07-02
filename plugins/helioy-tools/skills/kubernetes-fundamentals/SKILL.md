---
name: kubernetes-fundamentals
description: >
  Kubernetes fundamentals taught from first principles (kubernetes-the-hard-way
  backbone). Use BEFORE reasoning from scratch about any Kubernetes internals:
  cluster bootstrap, the control plane (apiserver / controller-manager /
  scheduler), etcd, the PKI/TLS cert mesh and CN/O-to-RBAC mapping, kubeconfigs,
  kubelet / containerd / CRI, pod networking and CNI, kube-proxy, encryption at
  rest, the Node Authorizer, or CRDs and the Helioy v2 K8s-shaped endgame.
  Routes you into the verified curriculum at ~/.mdx/knowledge/kubernetes/.
  Trigger when: explaining or debugging Kubernetes internals, designing
  K8s-shaped infrastructure, reviewing cluster config, or onboarding to how the
  core components fit together.
---

# Kubernetes Fundamentals

A verified knowledge curriculum lives at `~/.mdx/knowledge/kubernetes/`: an index plus 9 modules, original synthesis seeded from `kubernetes-the-hard-way` (v1.32 era), carrying 275 cited `file:line` references into the cloned repo at `~/Dev/LLM/DEV/helioy/REFS/kubernetes-the-hard-way`. The flagship `pki-and-identity.md` is two-model peer-reviewed.

When a task touches Kubernetes internals, read the relevant module BEFORE reasoning from memory. The modules are denser and more accurate than first-principles recall, and they cite the exact config/unit lines.

## Start here

Read `~/.mdx/knowledge/kubernetes/index.md` first: the 4-VM topology, the 13-step bootstrap arc, and the study order.

## Module map

| Module (`~/.mdx/knowledge/kubernetes/<slug>.md`) | Answers | Read when |
|---|---|---|
| `index` | topology, 13-step arc, study order | always first |
| `topology-and-bootstrap-model` | 4-VM layout, `machines.txt`, the forced dependency chain | cluster bring-up, ordering |
| `pki-and-identity` **(flagship)** | the CA, 8 certs, CN→user / O→group RBAC, SANs, apiserver↔kubelet reverse-trust | certs, identity, auth, 403s |
| `kubeconfig-and-authn` | cert-per-consumer, `--embed-certs`, server-URL choices | kubeconfig problems |
| `control-plane-internals` | apiserver / controller-manager / scheduler units, flags, which secrets each holds | control-plane behavior |
| `etcd-and-state` | single stateful member, plaintext-localhost shortcut vs prod TLS/quorum | datastore, state, backup |
| `worker-runtime-stack` | kubelet + containerd + runc + CRI, the cgroupDriver/SystemdCgroup contract | node/runtime failures |
| `networking-model` | pod /16-per-cluster /24-per-node, service CIDR, bridge CNI vs static routes, kube-proxy | networking, CNI, routing |
| `security-at-rest-and-rbac` | encryption provider ordering, apiserver-to-kubelet RBAC, SA token signing | secrets, RBAC, admission |
| `operations-and-failure-modes` | smoke-test matrix, systemd debug, gotchas catalogue (cross-links all siblings) | debugging, failure triage |

## How to use

- **Direct read** the module that matches the task. Each is self-contained.
- **Find a passage** with `md_search` / `md_keyword_search` (mdm) when you do not know which module: e.g. `md_search "cgroup driver containerd"` surfaces `worker-runtime-stack`.
- **Cite the module** in your answer (slug + the KTHW `file:line` it references), so the reasoning is traceable to ground truth.
- The `operations-and-failure-modes` gotchas catalogue is the fastest entry point when triaging a specific failure (403 on `logs/exec`, cgroup mismatch, missing SANs, pod cross-node unreachable).

## Provenance & boundaries

- Source: `kubernetes-the-hard-way`, dual-licensed (Apache-2.0 for `configs/`/`units/`/`ca.conf`, CC-BY-NC-SA-4.0 for prose). The modules are original synthesis, freely usable; quoted Apache snippets carry a notice.
- The curriculum is pinned to the **v1.32 era**. For a live cluster on a different version, treat the modules as the conceptual model and verify version-specific flags against the running cluster or upstream docs.
- A cm `reference` pointer (`global/project:helioy`) also routes here via `cx_recall`; the long-form synthesis essay is `~/.mdx/research/kelseyhightower-kubernetes-the-hard-way.md`.

## Rules

- **NEVER** reason about K8s internals from scratch when a module covers the topic. Read it first.
- **ALWAYS** read `index.md` before a multi-component question.
- **DO** extend this domain in place: new K8s knowledge (kubeadm, CKA, operators, CRDs) joins `~/.mdx/knowledge/kubernetes/` as new modules with their own `source`/`license` frontmatter, never a parallel home.
