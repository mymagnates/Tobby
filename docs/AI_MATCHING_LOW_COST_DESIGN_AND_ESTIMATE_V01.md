# AI Matching Low-Cost Design + Cost Estimate v0.1

## Platform Scope
- Matching outputs are shared backend results for both Web and iOS experiences.
- Platform UI differences must not affect core matching logic or ranking inputs.

## 1) Objective
- Support semantic matching between SP free-text capabilities and task descriptions.
- Avoid rigid fixed category catalog.
- Keep compute cost low for MVP and early growth.

## 2) Design (Recommended)

### 2.1 Where AI is used
1. SP profile create/update:
   - Parse free text into structured semantic fields.
2. Task create/update:
   - Parse task text into the same semantic fields.
3. Optional Top-K re-rank:
   - Re-rank a small candidate set only (e.g., top 20 -> top 10).

### 2.2 Where AI is NOT used
- No full-model call for every search query.
- No full-model scoring across all SP candidates in real time.

### 2.3 Runtime matching path
1. Hard filters:
   - service area
   - availability
   - verification status
2. Rule score on structured fields:
   - semantic tag overlap
   - historical reliability
   - response speed
   - budget fit
3. Optional AI re-rank only on Top-K.

### 2.4 Cost controls
- Cache extraction by content hash.
- Re-run extraction only when source text changes.
- Use small model (`gpt-5-nano` or `gpt-5-mini`) with strict token budget.
- Use Batch API for non-urgent extraction jobs when possible.

## 3) Data Outputs from AI Extraction
- `semantic_tags[]`
- `service_area`
- `budget_band`
- `urgency_capability`
- `confidence_score`
- `extraction_version`

## 4) Assumptions for Cost Estimation (1000 DAU system)

### 4.1 Monthly action volume (MVP planning baseline)
- Task text extraction calls: `9,000 / month` (about 300/day)
- SP profile extraction calls: `900 / month` (about 30/day)
- Optional Top-K re-rank calls: `9,000 / month` (one per extracted task)

### 4.2 Token budget per call
- Task extraction: input `800`, output `250`
- SP extraction: input `1200`, output `350`
- Top-K re-rank: input `700`, output `120`

### 4.3 Total monthly token volume
- Input tokens:
  - Task extraction: `7.20M`
  - SP extraction: `1.08M`
  - Re-rank: `6.30M`
  - Total input: `14.58M`
- Output tokens:
  - Task extraction: `2.25M`
  - SP extraction: `0.315M`
  - Re-rank: `1.08M`
  - Total output: `3.645M`

## 5) Estimated Monthly LLM Cost

Pricing reference (standard rates):
- `gpt-5-nano`: input `$0.05 / 1M`, output `$0.40 / 1M`
- `gpt-5-mini`: input `$0.25 / 1M`, output `$2.00 / 1M`

Formula:
- `monthly_cost = input_tokens_M * input_price + output_tokens_M * output_price`

### 5.1 If using `gpt-5-nano`
- Input: `14.58 * 0.05 = $0.729`
- Output: `3.645 * 0.40 = $1.458`
- Total: **~$2.19 / month**

### 5.2 If using `gpt-5-mini`
- Input: `14.58 * 0.25 = $3.645`
- Output: `3.645 * 2.00 = $7.29`
- Total: **~$10.94 / month**

### 5.3 With Batch API on async extraction jobs
- Batch API typically reduces both input/output token cost by ~50%.
- Approximate totals:
  - `gpt-5-nano`: **~$1.10 / month**
  - `gpt-5-mini`: **~$5.47 / month**

## 6) Recommendation
- MVP default: `gpt-5-nano` for extraction + rules ranking.
- Enable `gpt-5-mini` only for selective re-rank when confidence is low.
- This keeps AI matching cost very low while preserving semantic quality.

## 7) Notes
- Estimates exclude non-LLM infrastructure cost (storage, db reads/writes, queues).
- Actual cost depends on real prompt size, re-rank frequency, and retry rate.
