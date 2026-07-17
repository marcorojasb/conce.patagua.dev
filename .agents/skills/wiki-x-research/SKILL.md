---
name: wiki-x-research
description: >
  Actualizar artículos del wiki de conce (transporte Gran Concepción) con radar X
  y plantilla legible en capas. Use when the user asks to refresh a wiki article,
  update SEREMITT/Biotrén/BusPay, run /wiki-research, or compact wiki content.
---

# Wiki X research + compactación

## When

- Actualizar ficha del wiki (`/wiki/<slug>`)
- “Buscar en X / Twitter” sobre transporte Biobío
- Compactar artículo largo a capas (FactStrip / Summary / NewsPulse)

## Rules (non-negotiable)

1. **X is a radar, not authority.** Never put a claim in the article body with X as sole source. Prefer BCN, Subtrans, EFE, CGR, MercadoPúblico; else named regional press + PendingBanner for sensitive facts.
2. **No live X feed** in the app. No API keys in the client.
3. **Ephemeral ops** (traffic lights, weather, stuck bus) → log only, not wiki.
4. **Structural hits** (fares, SEREMI, inaugurations, awards) → follow up primary URL, then edit.

## Workflow

1. Read `docs/wiki-research-queries.md` for the slug’s query + allowlist.
2. Run `x_keyword_search` (mode **Latest**) with `from:ACCOUNT` queries; optional `x_semantic_search`.
3. Classify each post: `ephemeral_ops` | `structural_hint` | `noise`.
4. For structural hints: `web_search` / `web_fetch` primary sources.
5. Write `docs/research/<slug>-YYYY-MM-DD.md` (see `docs/research/README.md`).
6. Edit the article using layered template from `_components.tsx`:
   - Banners → **FactStrip** → **ArticleSummary** → **NewsPulse** (0–3)
   - Key operational sections stay open
   - **CollapsibleSection** for history, issues, pending, bibliography
7. Bump `updated` in `src/wiki/articles.ts` if facts changed.
8. Run `npm run typecheck` (and `npm run maplinks:validate` if MapLinks changed). Prefer `npm run check` before done.

## Components

From `src/wiki/articles/_components.tsx`:

- `FactStrip` — current facts chips + snapshot date
- `ArticleSummary` — 4–6 bullets
- `NewsPulse` — recent structural news (requires SourceLink each)
- `CollapsibleSection` — native `<details>`

## Do not

- Cite X alone under VerifiedBanner
- Invent NewsPulse items without a primary/press URL
- Replace entire article history; collapse it
