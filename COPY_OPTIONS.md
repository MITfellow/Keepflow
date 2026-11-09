# Rill — Copy Options

All copy on the page is final-quality. There are no lorem-ipsum or placeholder strings.

---

## Hero headline

### Chosen — “Your day, quietly handled.”

**Why it wins:** It is five words, it makes a concrete promise, and “quietly” does the brand work without becoming a slogan. It reads as a complete thought at both 375px and 1440px.

### Option 2 — “The calm behind your busiest days.”

**Why it was considered:** It leads with the feeling and sounds good out loud. It is less specific about what changes in the user's day.

### Option 3 — “Less chasing. More making.”

**Why it was considered:** It has a good rhythm and speaks to founders. It could describe a project manager or a note-taking app, so it is less ownable.

---

## Subhead

**Chosen:**
“For people building something of their own, Rill handles email, calendar, and follow-through — quietly, and always on your terms.”

**Why:** One sentence, names the audience and the three jobs, and ends on the control promise. “Always on your terms” is the trust thesis in five words.

---

## Primary CTA

**Chosen:** “Get early access”

**Why:** Action plus outcome. “Join the waitlist” is used in the nav because it names the immediate object without overpromising access.

---

## Social proof

There are no invented numbers. With an empty database the page reads:

> **The list is open. Be first in line.**

Once real signups exist, the component reads:

> **Join [live count] people on the list.**

The number comes from the database and is formatted with `Intl.NumberFormat`. There is no fallback seed count.

---

## Launch line

**Chosen:** “Early access opens in waves through spring 2027.”

**Why:** It gives a real window without a fake countdown. “Through spring” leaves room for intentional waves and avoids implying a single big-bang day.

---

## Capability headings

1. **Replies that already sound like you.**
2. **A week with room to think.**
3. **Nothing dropped on your watch.**

The pattern is benefit first. Each card ends with one concrete example so the promise stays believable.

---

## Referral block

**Chosen heading:** “Move up the list.”

**Chosen line:** “When you join, you’ll get a private link. Every friend who joins with it moves you closer to the front.”

**Milestones:**
- 1 friend — earlier access
- 3 friends — priority onboarding

No “invite 10 friends for a mystery prize.” The reward is the actual product benefit.

---

## Final CTA

**Heading:** “Make room for what matters.”
**Line:** “Join the list. We’ll write once, when your spot is ready.”
**Button:** “Get early access”

The hero promises a quieter day. The close asks for the first quiet minute.

---

## Form microcopy and states

| State | Copy |
|---|---|
| Label | Email address |
| Placeholder | `you@yourwork.com` |
| Helper | No spam. One email when your spot is ready. |
| Consent | By joining, you agree to our [Privacy Policy]. Unsubscribe anytime. |
| Empty | Enter your email address to join. |
| Invalid | That email address doesn't look right. Check it and try again. |
| Loading | Saving your spot… |
| Success | You're in line. |
| Success detail | You're number **N**. We'll write once, when your spot is ready. |
| Duplicate | You're already in line. |
| Duplicate detail | This email is already on the list. Your place is safe. |
| Rate limited | Too many tries in a short window. Give it a minute, then try again. |
| Server error | We couldn't save your spot just now. Please try again in a moment. |
| Too fast | That was a little too quick. Please try once more. |
| Honeypot | (silent rejection; never shown) |

Error messages are specific about the next action. They never scold the person.

---

## 404

**Heading:** “This page went quiet.”
**Line:** “The current doesn't run here. Head back to Rill and join the list.”
**CTA:** “Back to the beginning”

---

## Voice notes

- Calm, precise, lightly warm. Never hypey.
- No “AI-powered” as a benefit. The agent is the how, not the what.
- No “unlock,” “supercharge,” “game-changing,” “revolutionary,” or “seamless.”
- Use sentence case for headings and labels.
- Use the em dash sparingly, only where a pause genuinely helps.
- Trust copy makes commitments, not warranties. Privacy language links to the fuller promise.
