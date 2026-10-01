# 06: AI agent architecture (free tier edition)

## The core problem
OpenRouter's free models (IDs ending in `:free`) cost nothing per token, but are limited per **account**: 20 requests per minute, and 50 requests per day until the account has bought $10 of credits, then 1,000 per day. Limits apply across all keys, so extra keys or accounts don't add capacity. (Verify current numbers before launch; they change.)

So a shared key means the **whole university shares 50 requests a day** (or 1,000 with a one-time $10 top-up). The architecture has to treat AI calls as a scarce resource.

## Tiered design: spend AI only where it matters

```
Request ─► Tier 0: no-AI logic ─► Tier 1: on-device model ─► Tier 2: cloud (OpenRouter :free) ─► Tier 3: graceful decline
```

| Tier | Handles | Cost |
|------|---------|------|
| **0. Deterministic** | Spaced repetition scheduling, timetable queries, "what's due", search over notes, poll/form helpers, revision-plan templates | Free, instant, offline |
| **1. On-device** | Flashcard generation from short notes, quick explanations, quiz questions, rephrasing | Free, offline, private; needs capable phone |
| **2. Cloud free** | Longer multi-turn tutoring, harder explanations, summarising long notes | Scarce: 50 to 1,000/day total |
| **3. Decline** | Quota gone and device can't run a model | Show cached answers and queue the request for tomorrow |

A router decides the tier. Cheap intent classification (keywords or a tiny local classifier) comes before any LLM call.

## Making the cloud tier last
1. **Edge Function proxy.** The OpenRouter key lives only in Supabase secrets. The app never sees it.
2. **Per-user quota** (for example 5 cloud calls a day) plus a global budget counter in `ai_usage`.
3. **Cache.** Hash (normalised prompt + course) and reuse answers across students. Many questions repeat.
4. **Fallback list.** Send 2 to 3 free models in a `models` array so one provider's outage or rate limit doesn't kill the request.
5. **Batch where possible.** One call that generates 10 flashcards beats 10 calls.
6. **Pre-generate.** Run an overnight job to generate flashcards and summaries for official course material, then ship them as static data. Zero runtime cost.
7. **BYOK (optional).** Let power users paste their own OpenRouter key. Limits are per account, so each person brings their own allowance. Store it only on their device.
8. **The $10 top-up.** The cheapest big win: it lifts the daily free limit twenty-fold, permanently.

## Agent design

**Tools (function calling):**
`get_timetable`, `get_deadlines`, `search_notes`, `create_flashcards`, `propose_revision_plan`, `add_reminder`, `find_room`, `list_polls`.

**Rule: read tools run freely; write tools only produce a *proposal*.** The user taps Approve before anything changes.

**Context assembly:** send the minimum: the user's question, a few retrieved note snippets, and the relevant schedule slice. Never send names, registration numbers or contact details.

**Free-model realities:**
- Tool-calling support varies by model. Don't depend on native function calling; ask for JSON, then validate with Zod and retry once on failure.
- Quality is uneven and models rotate out without warning. Keep model IDs in config, not code.
- Free endpoints may log or train on prompts, so treat everything sent as non-private.

## Safety and reliability
- **Prompt injection:** announcements, notes and posts are untrusted text. They can't trigger actions by themselves, and the approve step protects the user.
- **Medical content:** the study agent is a revision aid. Add "check against your course material and lecturers" on clinical answers, and prefer answers grounded in uploaded notes.
- **No patient data** in prompts, stored notes, or logs.
- **Hallucination handling:** show sources (which note the answer used); "I'm not sure" is a valid output.

## On-device notes
- WebGPU-based in-browser models work only on some phones; feature-detect, never assume
- Download model weights on Wi-Fi only, show the size, and let users delete them
- Use small embedding models for local note search; they're far cheaper than a chat model

## Evaluation (this is your case study)
Build a small test set (50 to 100 prompts): flashcard quality, factual accuracy against notes, tool-call correctness, refusal behaviour. Re-run it whenever you change model or prompt. Log: tier used, latency, cache hit rate, quota consumption, user thumbs up/down.

## Metrics worth reporting
Share of requests answered at Tier 0/1 (target over 80%), cache hit rate, cloud calls per active student per day, cost per active student (target: $0).

## Why this is a good study case
It's a real constrained-resource AI system: routing, caching, quotas, graceful degradation, human-in-the-loop actions, and evaluation, all without a budget.
