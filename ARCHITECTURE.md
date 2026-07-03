# AlumniConnect — Architecture & Build Prompt for Antigravity IDE

> **How to use this file:** Paste the "IDE PROMPT" section (starting below the divider) directly into Antigravity as your project instructions / system context. Keep this whole file in your repo root as `ARCHITECTURE.md` — you'll reference it constantly, and it's exactly the kind of doc that makes seniors trust your backend.

---

## 0. Reality Check (read this before you start)

This is a full production system, not a weekend hack. Treat it as **8 phases**, each independently demoable. If you run out of time, you stop after Phase 3 or 4 and you _still_ have something impressive — auth + RBAC + a working ranking engine already proves you can design a backend. The AI features are the least important part for impressing seniors; the data modeling and auth are what they'll actually scrutinize.

---

## 1. Tech Stack (final)

| Layer                | Choice                                                               | Why                                                         |
| -------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------- |
| Framework            | Next.js 14+ (App Router), TypeScript strict mode                     | You already know it                                         |
| Database             | PostgreSQL                                                           | Relational integrity for referrals/rankings/roles           |
| ORM                  | Prisma                                                               | Type-safe queries, migrations, seeding                      |
| Auth                 | NextAuth.js (Credentials + Email provider) with custom JWT callbacks | Handles session/JWT plumbing so you focus on business rules |
| Validation           | Zod                                                                  | Every input validated at the boundary, no exceptions        |
| Password/OTP hashing | bcrypt                                                               | Standard                                                    |
| Email                | Resend or Nodemailer + college SMTP fallback                         | For verification + notifications                            |
| AI                   | Google Gemini API (Gemini 1.5/2.0 Flash) via server-only routes      | Free tier, generous rate limits, ideal for student project  |
| File storage         | Uploadthing or S3-compatible bucket (resumes)                        | Never store files in DB                                     |
| Rate limiting        | `@upstash/ratelimit` + Redis (Upstash free tier)                     | Protects auth + AI routes                                   |
| Deployment           | Vercel (app) + Neon or Supabase (Postgres) + Upstash (Redis)         | All free tier, production-realistic                         |

---

## 2. High-Level Architecture

Strict layering — **this is the #1 thing that will fix the "vibe coded" perception**:

```
Request → Route Handler (thin) → Validation (Zod) → Service Layer (business logic)
        → Repository Layer (Prisma calls) → Database
```

Rules:

- Route handlers (`app/api/**/route.ts`) NEVER contain business logic. They parse/validate input, call a service, return a response.
- Service layer functions are pure business logic, framework-agnostic, easily unit-testable.
- Repository layer is the only place Prisma is called directly.
- No file exceeds ~200 lines. If it does, split it.

---

## 3. Folder Structure

```
alumniconnect/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── verify/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── student/...
│   │   │   ├── alumni/...
│   │   │   └── admin/...
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── register/route.ts
│   │       │   ├── verify-email/route.ts
│   │       │   └── [...nextauth]/route.ts
│   │       ├── profile/route.ts
│   │       ├── alumni/
│   │       │   ├── search/route.ts
│   │       │   └── [id]/route.ts
│   │       ├── opportunities/
│   │       │   ├── route.ts          # GET list, POST create
│   │       │   └── [id]/route.ts
│   │       ├── referrals/route.ts
│   │       ├── ai/
│   │       │   ├── resume-score/route.ts
│   │       │   ├── referral-message/route.ts
│   │       │   ├── career-roadmap/route.ts
│   │       │   └── match-opportunities/route.ts
│   │       ├── contributions/route.ts
│   │       └── admin/
│   │           ├── users/route.ts
│   │           └── analytics/route.ts
│   ├── lib/
│   │   ├── prisma.ts                 # singleton Prisma client
│   │   ├── auth.ts                   # NextAuth config
│   │   ├── rbac.ts                   # role-check middleware helpers
│   │   ├── rateLimit.ts
│   │   ├── email.ts
│   │   └── ai/
│   │       ├── gemini.ts             # Gemini client wrapper
│   │       └── prompts.ts            # centralized AI prompt templates
│   ├── services/
│   │   ├── authService.ts
│   │   ├── profileService.ts
│   │   ├── alumniSearchService.ts    # ranking algorithm lives here
│   │   ├── opportunityService.ts
│   │   ├── referralService.ts
│   │   ├── contributionService.ts
│   │   └── aiCareerService.ts
│   ├── repositories/
│   │   ├── userRepository.ts
│   │   ├── opportunityRepository.ts
│   │   ├── referralRepository.ts
│   │   └── contributionRepository.ts
│   ├── validators/                   # Zod schemas, one file per domain
│   │   ├── authValidators.ts
│   │   ├── profileValidators.ts
│   │   └── opportunityValidators.ts
│   ├── middleware.ts                 # Next.js middleware — route protection
│   ├── types/
│   │   └── index.ts
│   └── components/                   # frontend, built in Phase 8
├── .env.example
├── ARCHITECTURE.md                   # this file
├── PROGRESS.md                       # session continuity log (see §7)
└── package.json
```

---

## 4. Database Schema (Prisma) — core models

```prisma
enum Role {
  STUDENT
  ALUMNI
  ADMIN
}

model User {
  id              String   @id @default(cuid())
  collegeEmail    String   @unique
  passwordHash    String
  role            Role
  emailVerified   Boolean  @default(false)
  verificationToken String?  @unique
  graduationYear  Int
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  studentProfile  StudentProfile?
  alumniProfile   AlumniProfile?
  postedOpportunities Opportunity[] @relation("PostedBy")
  referralsGiven  Referral[] @relation("ReferrerUser")
  referralsRequested Referral[] @relation("RequesterUser")
  contributionScore Int @default(0)
}

model StudentProfile {
  id           String @id @default(cuid())
  userId       String @unique
  user         User   @relation(fields: [userId], references: [id])
  department   String
  skills       String[]
  projects     Json?
  resumeUrl    String?
}

model AlumniProfile {
  id            String @id @default(cuid())
  userId        String @unique
  user          User   @relation(fields: [userId], references: [id])
  company       String
  jobRole       String
  industry      String
  experienceYrs Int
  skills        String[]
  responsivenessScore Float @default(0)
  referralSuccessRate Float @default(0)
  verifiedBadge Boolean @default(false)
}

model Opportunity {
  id              String   @id @default(cuid())
  postedById      String
  postedBy        User     @relation("PostedBy", fields: [postedById], references: [id])
  company         String
  role            String
  eligibility     String
  requiredSkills  String[]
  deadline        DateTime
  applicationLink String
  createdAt       DateTime @default(now())
  referrals       Referral[]
}

model Referral {
  id            String   @id @default(cuid())
  opportunityId String
  opportunity   Opportunity @relation(fields: [opportunityId], references: [id])
  requesterId   String
  requester     User @relation("RequesterUser", fields: [requesterId], references: [id])
  referrerId    String
  referrer      User @relation("ReferrerUser", fields: [referrerId], references: [id])
  status        String   @default("PENDING") // PENDING, ACCEPTED, REJECTED, COMPLETED
  createdAt     DateTime @default(now())
}

model ContributionLog {
  id        String   @id @default(cuid())
  userId    String
  points    Int
  reason    String   // "REFERRAL_COMPLETED", "OPPORTUNITY_POSTED", etc.
  createdAt DateTime @default(now())
}
```

Add indexes on `collegeEmail`, `graduationYear`, and composite indexes on search fields (`company`, `industry`, `department`) once search is built — Prisma migration, not an afterthought.

---

## 5. Authentication — Step by Step (this is what seniors will actually test)

1. **Registration**: user submits `collegeEmail`, `password`, `graduationYear`, `name`.
   - Validate email domain server-side against an **allow-list** (e.g. `nitjsr.ac.in`) — never trust client input. Reject anything else with a clear error.
   - Hash password with bcrypt (cost factor 12).
   - Compute `role` automatically: `graduationYear > currentYear → STUDENT`, else `ALUMNI`. This logic lives in `authService.ts`, unit-testable, not inline in the route.
   - Generate a verification token (crypto random, 32 bytes), store hashed version, email the raw token as a link.
   - Rate-limit registration by IP (prevents spam account creation).

2. **Email verification**: token link hits `/api/auth/verify-email`, looks up hashed token, checks expiry (24h), sets `emailVerified = true`, deletes token. Unverified users cannot log in — enforce this in the NextAuth `authorize` callback, not just the UI.

3. **Login**: NextAuth Credentials provider. `authorize()` checks `emailVerified`, compares bcrypt hash, returns user with `role` embedded in the JWT.

4. **Session/JWT**: role and `userId` embedded in the JWT callback so every server component/route can read role without a DB hit.

5. **Role transition (student → alumni)**: a scheduled job (Vercel Cron hitting an internal API route, run daily) checks `graduationYear <= currentYear AND role = STUDENT`, flips role to ALUMNI, and prompts the user to complete their alumni profile fields on next login. Document this clearly — "automatic transition via scheduled job" is a sentence that will make seniors nod.

6. **RBAC middleware** (`src/middleware.ts` + `lib/rbac.ts`): every protected route checks role against an explicit allow-list for that route. Never rely on frontend hiding buttons — enforce server-side, always.

7. **Admin routes**: additionally check `role === ADMIN` AND log the access attempt (basic audit trail — a `ContributionLog`-style `AdminActionLog` table is a nice touch if you have time).

---

## 6. Build Phases (do them in this exact order)

- **Phase 0 — Setup**: repo, Prisma + Postgres connected, `.env` structure, base folder skeleton, `PROGRESS.md` created.
- **Phase 1 — Auth**: registration, email verification, login, JWT, RBAC middleware, role auto-assignment. _Fully test this phase before moving on — this is what gets scrutinized most._
- **Phase 2 — Profiles**: student/alumni profile CRUD, resume upload.
- **Phase 3 — Alumni Discovery + Ranking Engine**: search filters + the ranking algorithm (weighted score: company relevance + skill overlap (Jaccard or cosine on skill arrays) + responsiveness + referral success rate). Keep the scoring formula in one clearly named function — `computeAlumniRankScore()` — so it's easy to explain in a demo.
- **Phase 4 — Referral & Opportunity Portal**: posting, listing, referral request flow, seniority-based tie-breaking for duplicate postings.
- **Phase 5 — AI Career Assistant**: resume scoring, skill gap analysis, referral message generation, career roadmap — all server-side calls to Gemini, never expose the API key client-side.
- **Phase 6 — Contribution System**: point logic on referral completion/opportunity posting, leaderboard query.
- **Phase 7 — Admin Dashboard**: user management, analytics.
- **Phase 8 — Frontend polish**: Framer Motion, modern UI — deliberately last.

---

## 7. Session Continuity (for when your IDE context/token runs out)

Keep a `PROGRESS.md` at repo root. After every phase or major step, the IDE should append:

```markdown
## [Phase X - Step Y] <short description>

Status: DONE / IN PROGRESS
Files touched: ...
Next step: ...
Decisions made: ...
```

Tell your IDE explicitly (included in the prompt below) to **read `PROGRESS.md` first, before doing anything**, and to keep it updated after every meaningful change. This is the actual fix for "continue where you left off" — it's not a token-refresh trick, it's an external memory file the agent re-reads every session.

---

## 8. Coding Standards (put in the prompt so the IDE doesn't drift)

- TypeScript strict mode, no `any` unless justified with a comment.
- Every API route validates input with Zod before touching the service layer.
- Every service function returns a typed `Result<T>` (or throws a typed `AppError`) — no silent failures.
- No secrets committed; `.env.example` lists required vars with dummy values.
- No business logic in React components or route handlers.
- Consistent error response shape: `{ error: { code, message } }`.

---

## 8.5 Gemini Client Wrapper (`src/lib/ai/gemini.ts`)

Install the SDK first:

```
npm install @google/generative-ai
```

Wrapper — keep this as the _only_ file that talks to Gemini directly. Every service function calls this, never the SDK directly:

````typescript
// src/lib/ai/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export type GeminiTextResult = {
  text: string;
};

/**
 * Generic text generation call. Keep all prompt construction in
 * lib/ai/prompts.ts — this function just sends and returns text.
 */
export async function generateText(prompt: string): Promise<GeminiTextResult> {
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return { text };
  } catch (err) {
    console.error("Gemini API error:", err);
    throw new Error("AI_GENERATION_FAILED");
  }
}

/**
 * For structured output (e.g. ATS score, skill gap list), force JSON
 * and parse defensively — Gemini sometimes wraps JSON in markdown fences.
 */
export async function generateJSON<T>(prompt: string): Promise<T> {
  const jsonInstruction =
    prompt +
    "\n\nRespond with ONLY valid JSON. No markdown fences, no preamble, no explanation.";
  const { text } = await generateText(jsonInstruction);
  const cleaned = text.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.error("Failed to parse Gemini JSON response:", cleaned);
    throw new Error("AI_RESPONSE_PARSE_FAILED");
  }
}
````

Example usage from a service (this pattern keeps `aiCareerService.ts` model-agnostic — swapping providers later only touches this one wrapper file):

```typescript
// src/services/aiCareerService.ts
import { generateJSON } from "@/lib/ai/gemini";
import { buildAtsScorePrompt } from "@/lib/ai/prompts";

type AtsScoreResult = {
  score: number;
  missingKeywords: string[];
  suggestions: string[];
};

export async function scoreResume(resumeText: string, targetRole: string) {
  const prompt = buildAtsScorePrompt(resumeText, targetRole);
  return generateJSON<AtsScoreResult>(prompt);
}
```

---

---
