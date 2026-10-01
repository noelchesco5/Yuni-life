# 05: Voting, polls and opinions

## Three tiers (different trust needs)
| Tier | Example | Binding? | Anonymity | Integrity needed |
|------|---------|----------|-----------|------------------|
| **Pre-vote poll** | "Which candidate issue matters most?" | No | Aggregate only | Low |
| **Opinion / feedback** | "Rate the new timetable", "Canteen feedback" | No | Optional anonymous | Low to medium |
| **Election / formal vote** | Class rep, student gov positions | **Yes** (only if sanctioned) | Secret ballot | High |

**Start with tiers 1 and 2.** Tier 3 should not go live without sign-off from student affairs or the electoral body. Until then, label it "pilot / non-binding".

## Poll features
- Single choice, multi choice, ranked choice, rating scale, free-text
- Scope targeting: everyone, a year, a programme, a club
- Open and close times; results visibility: live, after close, or admin-only
- Optional comments (moderated), reactions
- Leaders create; admins can remove or flag

## Who can vote
Eligibility must not depend on SARIS. Options, in order of simplicity:
1. **University email OTP** (if students have institutional emails)
2. **Admin-uploaded roster**: registration numbers (stored hashed) plus one-time claim codes handed out through class reps
3. Both combined for elections

Rule: one person, one vote per poll, enforced in the database.

## Integrity design (ballot secrecy)
Separate **who voted** from **what they voted**:

```
poll_receipts(poll_id, voter_id, created_at)   -- UNIQUE(poll_id, voter_id)
poll_ballots(poll_id, option_id, created_at)   -- no voter_id
```

Cast a vote in one transaction: insert the receipt (fails if duplicate), then insert the ballot. Avoid storing exact timestamps on ballots, or round them, so receipt/ballot pairs can't be matched by time.

Honest caveat: with a solo-run backend, the admin can in principle access both tables. For a real election, publish the procedure, restrict direct DB access, keep an audit log, and consider an independent observer.

## Result handling
- Results computed server-side and published in the next batch bundle, or via a live call if the poll allows
- Minimum-responses threshold (for example 5) before showing breakdowns by small groups, to avoid identifying people
- Export CSV for leaders (aggregates only)

## Offline voting
Votes queue locally with an idempotency key. If the poll closes before sync, the queued vote is rejected and the user is told clearly. Show "Vote not counted yet" instead of "Voted" until the server confirms.

## Abuse and fairness
- Rate limits per user, bot checks on sign-up
- Moderation queue for comments
- Leaders can't see individual responses unless the poll is explicitly non-anonymous and says so up front
- Conflict-of-interest rule: a candidate can't administer their own election

## UX copy to get right
- Before voting: "You can vote once. Your choice is secret." (only if true)
- After voting: confirmation with a receipt ID, with no reveal of the choice
- Closed poll: the result and the total vote count

## Analytics for leaders
Participation rate by year or programme, trend over time, top comments (after moderation).

## Milestones
1. Simple polls (single choice, aggregate results)
2. Targeting, scheduling, comments
3. Ranked choice and ratings
4. Election mode with roster eligibility and audit log (only with sanction)
