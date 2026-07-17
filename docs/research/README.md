# Research logs (radar X → wiki)

Bitácoras de pasadas de actualización. **No son fuente canónica**: el artículo en `src/wiki/articles/` lo es.

## Flujo

1. Queries + allowlist en [`docs/wiki-research-queries.md`](../wiki-research-queries.md).
2. Buscar en X (`from:cuenta` + keywords).
3. Clasificar: `ephemeral_ops` | `structural_hint` | `noise`.
4. Cotejar claims estructurales con fuente primaria (EFE, Subtrans, BCN, prensa nombrada).
5. Escribir este log; editar la ficha solo con claims verificados.
6. Actualizar `FactStrip` / `ArticleSummary` / `NewsPulse` / collapsibles.

## Reglas

- **X nunca es la única prueba** de un claim en el cuerpo del wiki.
- Alertas del día (semáforos, frontal, micro detenido) → no entran al wiki.
- Nombre de archivo: `<slug>-YYYY-MM-DD.md`.

## Plantilla

```markdown
# Research <slug> — YYYY-MM-DD

## Queries
- ...

## Candidates
| date | claim | account/post | follow_up | wiki_action |
|------|-------|--------------|-----------|-------------|
| | | | | |

## Descartados
- ...
```
