# Queries del radar X por artículo

Allowlist v1 (cuentas institucionales / amplificadores locales):

| Handle | Rol |
|--------|-----|
| `MTTBiobio` | SEREMITT Biobío |
| `EFE_Biotren` | Operador Biotrén |
| `TTIBiobio` | TransporTeinforma (solo hitos; descartar ops diarias) |
| `MediosUdeC` | Lead a Diario Concepción / TVU |

## Por slug

| Slug | Query sugerida (keyword search, mode Latest) |
|------|-----------------------------------------------|
| `seremitt-dtpr-biobio` | `from:MTTBiobio (SEREMI OR Seremi OR DTPR OR Subsecretario OR Henry OR Campos)` |
| `biotren` | `from:EFE_Biotren (puente OR tarifa OR frecuencia OR L1 OR L2 OR itinerario)` |
| `biotren-extensiones-proyectos` | `(Biotrén OR Biotren) (Penco OR Lota OR "Carriel Sur" OR Tomé) (from:EFE_Biotren OR from:MTTBiobio OR from:MediosUdeC)` |
| `buspay` | `(BusPay OR Buspay OR "pago electrónico") (Concepción OR Biobío) (from:MTTBiobio OR from:MediosUdeC)` |
| `perimetro-exclusion-gran-concepcion-2024` | `("perímetro de exclusión" OR "perimetro de exclusion") Concepción (from:MTTBiobio OR from:MediosUdeC)` |
| `perimetro-exclusion-tome` | `(Tomé OR Tome) (401 OR 411 OR 421 OR "perímetro") (from:MTTBiobio OR from:MediosUdeC)` |
| default | `from:MTTBiobio OR from:EFE_Biotren` + keyword del título |

Complementar con búsqueda semántica: p. ej. “puente ferroviario Biotrén Biobío”, “SEREMI Transportes Biobío”.
