## [Phase 0 - Setup] Project Initialization

Status: DONE
Files touched: `prisma/schema.prisma`, `prisma.config.ts`, `PROGRESS.md`
Next step: Wait for user confirmation before starting Phase 1 (Auth).
Decisions made: 
- Adjusted `prisma/schema.prisma` for Prisma 7 compatibility (removed `url` as it's configured in `prisma.config.ts`).
- Created the initial folder skeleton exactly as specified in ARCHITECTURE.md section 3.
- Synced the Prisma schema with the Postgres database.

## [Phase 1 - Auth] Authentication and Authorization

Status: DONE
Files touched: prisma/schema.prisma, src/lib/prisma.ts, src/lib/rateLimit.ts, src/lib/email.ts, src/lib/rbac.ts, src/lib/auth.ts, src/validators/authValidators.ts, src/repositories/userRepository.ts, src/services/authService.ts, src/app/api/auth/[...nextauth]/route.ts, src/app/api/auth/register/route.ts, src/app/api/auth/verify-email/route.ts, src/app/api/admin/cron/role-transition/route.ts, src/middleware.ts, .env.example, src/types/next-auth.d.ts
Next step: Phase 2 - Profiles (Student/Alumni CRUD, resume upload)
Decisions made:
- Added 
ame field to User model to align with registration requirements.
- Handled NextAuth JWT session to embed ole and id.
- Handled role calculation logic automatically based on graduationYear.
- Set up a dummy email configuration using Nodemailer (logs to console if SMTP not configured).
- Implemented Zod validators to reject emails outside @nitjsr.ac.in.
- Set up RBAC using Next.js middleware withAuth.


## [Phase 2 - Profiles] Profiles and Resume Upload

Status: DONE
Files touched: \src/validators/profileValidators.ts\, \src/repositories/profileRepository.ts\, \src/services/profileService.ts\, \src/app/api/profile/route.ts\, \src/app/api/uploadthing/core.ts\, \src/app/api/uploadthing/route.ts\, \package.json\, \.env.example\
Next step: Phase 3 - Search & Filters (Alumni Directory, Job Portal UI, Search API)
Decisions made:
- Added \profileRepository.ts\ instead of cramming profile logic into \userRepository.ts\ for cleaner code.
- Added \uploadthing\ and \@uploadthing/react\ for scalable file uploads in Next.js.
- Set up a \esumeUploader\ endpoint in Uploadthing that restricts file types to PDF only and size to 4MB max.
- Handled profile API requests strictly using \getServerSession\ for secure validation based on role.


## [Phase 3 - Search & Filters] Alumni Discovery & Ranking Engine

Status: DONE
Files touched: src/services/alumniSearchService.ts, src/app/api/alumni/search/route.ts, src/app/api/alumni/[id]/route.ts, prisma/schema.prisma, src/repositories/profileRepository.ts, src/validators/profileValidators.ts
Next step: Phase 4 - Referral & Opportunity Portal
Decisions made:
- Added department to AlumniProfile model to fulfill the problem statement requirements.
- Implemented Jaccard similarity in memory for matching student skills to alumni skills.
- Implemented ranking algorithm with 40% skills, 30% company relevance, 20% success rate, 10% responsiveness.

## [Phase 4 - Referral & Opportunity Portal]

Status: DONE
Files touched: src/validators/opportunityValidators.ts, src/repositories/opportunityRepository.ts, src/repositories/referralRepository.ts, src/services/opportunityService.ts, src/services/referralService.ts, src/app/api/opportunities/route.ts, src/app/api/opportunities/[id]/route.ts, src/app/api/referrals/route.ts, src/app/api/referrals/[id]/route.ts
Next step: Phase 5 - Connection & Real-Time Messaging System
Decisions made:
- Implemented opportunities listing with sorting by alumni metrics (seniority + referral success rate + responsiveness).
- Used flat listing rather than grouping for identical openings to keep the API flexible.
- Used strict Zod enum validation for Referral Status without modifying Prisma schema.

## [Phase 5 - AI Career Assistant]

Status: DONE
Files touched: package.json, src/lib/ai/gemini.ts, src/lib/ai/prompts.ts, src/services/aiCareerService.ts, src/app/api/ai/resume-score/route.ts, src/app/api/ai/referral-message/route.ts, src/app/api/ai/career-roadmap/route.ts
Next step: Phase 6 - Contribution System
Decisions made:
- Installed @google/generative-ai and built a client wrapper for the gemini-2.0-flash model.
- Structured output relies on instructing the LLM to output ONLY JSON and aggressively parsing it.
- Created 3 robust AI services: ATS Resume Scoring, LinkedIn-style Referral Message Drafting, and Skill Gap / Career Roadmapping.

## [Phase 6 - Contribution System]

Status: DONE
Files touched: src/repositories/contributionRepository.ts, src/services/contributionService.ts, src/services/opportunityService.ts, src/services/referralService.ts, src/app/api/contributions/route.ts, src/app/api/contributions/me/route.ts
Next step: Phase 7 - Admin Dashboard
Decisions made:
- Leveraged Prisma transactions to safely execute points increment and logging simultaneously.
- Injected contributionService into opportunity and referral flows to automatically award points.

## [Phase 7 - Admin Dashboard]

Status: DONE
Files touched: prisma/schema.prisma, src/services/adminService.ts, src/app/api/admin/stats/route.ts, src/app/api/admin/users/route.ts, src/app/api/admin/users/[id]/route.ts
Next step: Phase 8 - Frontend Polish
Decisions made:
- Included an isBanned flag in the Prisma User model instead of relying on hard deletions.
- Added 3 core backend admin services: getting platform stats, fetching all users, and toggling a user's ban status.
- Confirmed RBAC proxy captures all /api/admin/* routes properly.

## [Phase 8 - Frontend Polish]

Status: DONE
Files touched: src/app/globals.css, src/app/layout.tsx, src/app/page.tsx, src/app/(auth)/login/page.tsx, src/app/(auth)/register/page.tsx, src/app/(auth)/verify/page.tsx, src/app/dashboard/student/page.tsx, src/app/dashboard/alumni/page.tsx, src/app/dashboard/admin/page.tsx, src/components/Navbar.tsx
Next step: Final Review
Decisions made:
- Used Tailwind CSS with a custom bluish dark theme in globals.css as requested.
- Applied glassmorphism techniques across all pages.
- Leveraged Framer Motion for premium micro-animations (page load staggers, hover effects).
- Generated an abstract blurred background for Auth pages.
