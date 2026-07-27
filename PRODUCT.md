# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, served evenly:
- **AI-agent users** — developers using Claude Code (or a compatible AI coding agent) who want to install this as a skill so their agent can generate and send Peruvian electronic tax documents on request, without knowing SUNAT's internals up front.
- **PHP/Greenter developers** — backend developers integrating Peruvian e-invoicing directly (via Greenter or its Lycet REST wrapper) who need the exact catalogs, field names, and endpoint behavior, independent of any AI-agent framing.

## Product Purpose

`sunat-facturacion-electronica` is now an ecosystem, not a single skill: a set of Claude Code sub-skills (by layer: catálogos, cálculo, comprobantes, cli) plus a native TypeScript monorepo (`packages/core`, `packages/xml`, and the CLI/npm package `sunat-fe`) that generates valid Peruvian electronic tax documents — Factura, Boleta de Venta, Nota de Crédito/Débito, Guía de Remisión, Resumen Diario, Comunicación de Baja/Reversión, Comprobante de Retención, and Comprobante de Percepción. Three execution paths now coexist: PHP (`greenter/lite`), the Lycet REST API, and the native TypeScript path (catalogs + montos calculation + unsigned UBL 2.1 XML generation, with signing and real SUNAT submission planned as later phases). This page exists to explain what the ecosystem does, how to install it, and how to use it, for both audiences above.

## Positioning

A bare Greenter tutorial or the Lycet API reference alone assumes the reader already knows SUNAT's domain quirks. This skill packages that domain knowledge — correct catalog codes, the exact IGV calculation formula (grouping by tipAfeIgv "bucket," rounding rules), which document types are synchronous vs. async (ticket + status polling), the 2023 migration of Guía de Remisión off SOAP onto OAuth2/SEE-API, the real `/peception` endpoint typo, and CDR result-code interpretation (0 = accepted, 2000–3999 = rejected) — so neither an AI agent nor a developer has to rediscover these from scratch or from trial-and-error against SUNAT's rejection responses.

## Operating Context

Used inside Claude Code (or a compatible AI coding agent) via the skill mechanism, read as a technical reference by a backend developer, or run directly as a Node/TypeScript library and CLI. Three execution modes exist and are detected/chosen, not assumed:
- **PHP mode** — project has `composer.json` with `greenter/lite` or `greenter/greenter`.
- **Lycet API mode** — a running Lycet server, addressed via REST/JSON.
- **Native TypeScript mode** — the `sunat-fe-core` / `sunat-fe-xml` packages and the `sunat-fe` CLI, run via Bun/Node, no PHP required.

Real usage involves RUC/company data, invoice line items, IGV (18%) tax calculations grouped by affectation type, and (for the PHP/Lycet modes) a full round trip against SUNAT's test (`FE_BETA`) or production endpoints, ending in a CDR (Constancia de Recepción) that must be read, not just "no connection error."

## Capabilities and Constraints

- Covers Factura (01), Boleta de Venta (03), Nota de Crédito (07), Nota de Débito (08), Comprobante de Retención (20), Comprobante de Percepción (40) — all synchronous (immediate CDR).
- Covers Resumen Diario, Comunicación de Baja, Comunicación de Reversión, and Guía de Remisión Remitente (09) — all asynchronous (ticket returned first, status polled separately).
- Guía de Remisión since 2023 no longer uses the SOAP webservice; it uses SEE-API (OAuth2 client_id/client_secret + REST).
- BETA vs. PRODUCCIÓN is a real safety boundary: production submissions are legally binding and consume real correlative numbering; not reversible except via a formal Nota de Crédito or Comunicación de Baja.
- **Undecided:** final distribution/install mechanism (public repo + manual copy into `.claude/skills`, a package manager, a marketplace listing, or something else) is not yet fixed. The page should not hard-commit to one specific install command or a real repository URL.

### Native TypeScript path — verified state by layer (do not overstate)

- ✅ **Catálogos** (`sunat-fe-core`): implemented and unit-tested (`bun test`).
- ✅ **Cálculo de montos/IGV** (`sunat-fe-core`): implemented and unit-tested against the verified S/100 + 18% = S/118 example.
- ✅ **Generación de XML UBL 2.1** (`sunat-fe-xml`, Factura/Boleta only): implemented, unit-tested, structurally well-formed. Not yet validated against SUNAT's real XSD.
- ⚠️ **Firma XML-DSig** (`sunat-fe-signer`): implemented using `xml-crypto` (RSA-SHA1 + exclusive C14N, enveloped-signature transform). Cryptographically self-consistent — verified by an independent round-trip check (sign, then verify with the same standard library) and by a tamper-detection test. **Rejected by SUNAT's real BETA environment** with `SOAP Fault 2335: Incorrect reference digest value`. Four configurations were tried against the live server (exclusive vs. classic C14N, Id-based vs. whole-document reference, and a fresh non-expired certificate vs. Greenter's public one, which had in fact expired in 2018) — all four failed with the identical error, which rules out canonicalization choice and certificate expiry as the sole cause. The real discrepancy with SUNAT's specific validator is unresolved and needs either Greenter's actual PHP source compared byte-for-byte, or SUNAT support — not further blind guessing.
- ✅ **Cliente SOAP** (`sunat-fe-client`): implemented and **verified end-to-end against the real SUNAT BETA server** — zip packaging (with the correct ISO-8859-1 byte encoding SUNAT's UBL-PE profile requires, a real encoding bug caught and fixed during this work), WS-Security UsernameToken auth, the `sendBill` SOAP call, and SOAP-Fault/CDR parsing all correctly reach SUNAT and correctly interpret its real response. The remaining gap is exclusively the signature content itself (see above), not the transport/protocol layer.
- 📦 **CLI / npm package (`sunat-fe`)**: structured to be publishable (bin, exports, package.json) but **not published** to the npm registry. Commands: `catalogo`, `calcular`, `generar-xml`, `firmar`, `enviar` — the last two work mechanically end-to-end but will not yet produce an ACEPTADA CDR, per the signature gap above.

The skill's own sub-skills (`sunat-catalogos`, `sunat-calculo`, `sunat-comprobantes`, `sunat-cli`) must reflect this same honesty — never imply the native path already produces a SUNAT-accepted comprobante.

## Brand Commitments

None pre-existing. The literal skill name is `sunat-facturacion-electronica` (surfaced to users as "Facturación Electrónica SUNAT"); no existing logo, palette, or tagline constrains the new visual identity for this page.

## Evidence on Hand

Real, verified source material exists in this repo and must be the factual basis for any claims the page makes about capabilities:

- `.claude/skills/sunat-facturacion-electronica/SKILL.md` — the index/router skill.
- `.claude/skills/sunat-comprobantes/` — orchestrating skill + `references/document-types.md`, `greenter-php.md`, `lycet-api.md`, `evals/evals.json`.
- `.claude/skills/sunat-catalogos/references/catalogs.md` — catalog codes.
- `.claude/skills/sunat-calculo/references/formula-montos.md` — the verified montos/IGV formula.
- `.claude/skills/sunat-cli/SKILL.md` — native CLI/npm package usage and its honest capability state.
- `packages/core`, `packages/xml`, `packages/cli` — the actual TypeScript implementation and its `bun test` suites (46 passing tests as of this writing).

No testimonials, customer logos, usage metrics, or case studies exist. The page must not fabricate any of these.

## Product Principles

1. Domain correctness is the actual product — lead with catalogs, montos math, sync/async handling, and CDR interpretation, not a generic AI-demo pitch.
2. Serve two readers in one flow: an agent-user scanning "what can I ask it to do" and a backend developer scanning "which library, which field, which endpoint."
3. BETA vs. PRODUCTION is a first-class, visible distinction, not a footnote — the irreversibility of production submissions is a real stake worth surfacing.
4. No invented proof: no fake testimonials, logos, or stats. Silence is honest; fabrication is not.
5. Don't hard-commit to one unresolved distribution mechanism — present installation in a way a real install method can later slot into without a rewrite.
