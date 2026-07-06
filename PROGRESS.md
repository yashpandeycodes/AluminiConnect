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

## [Version 2 - Sprint 1] Career State Foundation

Status: DONE
Files touched: prisma/schema.prisma, src/lib/ai/prompts.ts, src/services/aiCareerService.ts, src/repositories/careerStateRepository.ts, src/services/careerStateService.ts, src/validators/careerStateValidators.ts, src/app/api/career-state/route.ts, src/app/api/career-state/rebuild/route.ts
Next step: Await code review for Sprint 1 before proceeding to Sprint 2.
Decisions made:
- Designed the CareerState model to act strictly as a derived intelligence layer, without duplicating raw profile fields.
- Implemented robust observability using enums (CareerStateSyncStatus, CareerStateAnalysisSource).
- Versioned the AI schema via schemaVersion and tracked the AI model in analysisModel.
- Maintained separation of concerns by creating dedicated repository, service, and API layers.
- Appended buildCareerIntelligencePrompt and generateCareerIntelligence to existing AI abstraction layers rather than calling Gemini directly from careerStateService.
- Target role is optional, handled gracefully in prompt and API logic.
- Built smart caching logic via refreshCareerState to prevent excessive API costs.

## [Version 2 - Sprint 2] Career Insight Engine

Status: DONE
Files touched: src/types/careerInsight.ts, src/lib/ai/prompts.ts, src/services/aiCareerService.ts, src/services/careerInsightService.ts, src/app/api/career-insight/route.ts
Next step: Await code review for Sprint 2 before proceeding to Sprint 3 (Recommendation Engine).
Decisions made:
- Maintained a zero-persistence architecture for the Insight Engine to prevent data duplication.
- Replaced presentation-layer strings with quantitative priorityScore and impactScore.
- Established a canonical ActionableInsight DTO contract wrapped in a metadata DTO tracing generatedAt, careerStateVersion, and analysisModel.
- Kept the service decoupled by directly injecting careerStateRepository into careerInsightService.
- The engine acts purely as a computation layer, transforming CareerState into downstream consumable actions without Prisma migrations.

## [Version 2 - Sprint 3] Career Goal Engine

Status: DONE
Files touched: prisma/schema.prisma, src/types/goal.ts, src/repositories/goalRepository.ts, src/validators/goalValidators.ts, src/lib/ai/prompts.ts, src/services/aiOrchestrationService.ts, src/services/goalService.ts, src/app/api/goals/*
Next step: Await code review for Sprint 3.
Decisions made:
- Implemented CareerGoal as the user's destination, isolated from AI analysis inside the database.
- Generated AI analysis (GoalHealth, missingSkills, matchedSkills) dynamically in GoalSnapshotDTO via aiOrchestrationService.
- Business rule enforcement implemented at the service layer: only ONE ACTIVE goal allowed per user, automatically archiving previous active goals upon new activation.
- Zod validators deployed for targetCompanies, targetIndustries, and preferredLocations, capping arrays at 5 elements.
- Maintained exact frozen architecture (Route -> Validator -> Service -> Repo).

## [Version 2 - Sprint 4] Recommendation Engine

Status: DONE
Files touched: prisma/schema.prisma, src/types/recommendation.ts, src/repositories/recommendationRepository.ts, src/services/recommendationService.ts, src/services/recommendationResourceResolver.ts, src/validators/recommendationValidators.ts, src/lib/ai/prompts.ts, src/services/aiOrchestrationService.ts, src/app/api/recommendations/*
Next step: Await code review for Sprint 4.
Decisions made:
- Recommendations are persisted as snapshots to preserve history and analytics (manual dismissals, completions, future ranking).
- Recommendation engine demands CareerState, CareerInsight, and CareerGoal dependencies upfront; returns HTTP 409 if any are missing.
- Implemented ResourceResolver to keep AI output agnostic (returns search keywords, resolved locally to URLs).
- Implemented deterministic final ranking score formula incorporating priority, impact, and AI confidence.

## [Version 2 - Sprint 5] Mission Engine

Status: DONE
Files touched: prisma/schema.prisma, src/types/mission.ts, src/repositories/missionRepository.ts, src/services/missionService.ts, src/validators/missionValidators.ts, src/lib/ai/prompts.ts, src/services/aiOrchestrationService.ts, src/app/api/missions/*
Next step: Sprint 6 (Timeline Engine).
Decisions made:
- Mission Engine dictates the *execution roadmap*, converting destination + recommendations into actionable chunks.
- Persisted active missions and archived previous runs into historical status to ensure progress survives re-logins.
- Implemented deterministic execution score  .45 * impact + 0.35 * priority + 0.20 * (100 - difficulty) to rank tasks, overriding AI ordering.
- Strictly guarded generation endpoints behind 409 conflict checks verifying CareerState, CareerGoal, CareerInsight, and Active Recommendations.

## [Version 2 - Sprint 6] Timeline Engine

Status: DONE
Files touched: prisma/schema.prisma, src/types/timeline.ts, src/repositories/timelineRepository.ts, src/services/timelineService.ts, src/validators/timelineValidators.ts, src/utils/timelineScheduler.ts, src/app/api/timeline/*
Next step: Sprint 7 (Prediction Engine).
Decisions made:
- Timeline engine handles *When* tasks are done, converting the Mission roadmap into a JSON execution schedule.
- Decoupled scheduling logic into a pure deterministic algorithm (	imelineScheduler.ts). No AI generation happens here, avoiding hallucinations and saving costs.
- Calculates schedule health dynamically comparing required vs configured weekly hours against the Goal's deadline.
- Timeline operations are strictly encapsulated in a single eplaceTimeline transaction to guarantee zero downtime.

## [Version 2 - Sprint 6 Adjustments] Timeline Enhancements

Status: DONE
Files touched: prisma/schema.prisma, src/types/timeline.ts, src/utils/timelineScheduler.ts, src/app/api/timeline/route.ts
Decisions made:
- Timeline DB JSON no longer duplicates schedules. Stores flat { missions: [{ missionId, startDate, endDate, allocatedHours }] }.
- API endpoint GET /api/timeline dynamically bins tasks into 	oday, 	hisWeek, uture, overdue at runtime.
- Added ufferPercentage to schedule health statistics mathematically derived from required vs available workloads.
- Enhanced CareerTimeline Prisma model with 	imelineVersion, scheduleAlgorithmVersion, and generatedAt columns.

## [Version 2 - Sprint 7] Analytics & Progress Engine

Status: DONE
Files touched: prisma/schema.prisma, src/types/analytics.ts, src/repositories/analyticsRepository.ts, src/services/analyticsService.ts, src/validators/analyticsValidators.ts, src/app/api/analytics/*
Next step: Sprint 8 (TBD / Leaderboard / Gamification).
Decisions made:
- Kept the Analytics engine completely deterministic without querying Gemini, enforcing read-only operation.
- Calculated Overall Progress safely relying on 4 upstream metrics (readiness, missions, recs, goal health).
- Ensured zero data loss for historical metrics by persisting historical entries chronologically during upsertAnalytics.

## [Version 2 - Sprint 7 Adjustments] Analytics Refinement

Status: DONE
Files touched: prisma/schema.prisma, src/lib/config/analyticsWeights.ts, src/types/analytics.ts, src/repositories/analyticsRepository.ts, src/services/analyticsService.ts
Decisions made:
- Enforced a hard limit of 365 days on historical metric snapshots via slice(-365) to prevent infinite DB growth.
- Extracted deterministic scoring formulas out of the service layer and centralized them in nalyticsWeights.ts.
- Introduced native struct fields for nalyticsVersion and ormulaVersion to allow for automatic recalculation invalidations down the road.
- Exposed forward-looking Prediction Inputs (verageWeeklyVelocity, verageCompletionTime, verageMissionDifficultyCompleted, verageHoursPerWeek) to set up structural dependencies for Sprint 8 without breaking the strict aggregation rules.

## [Version 2 - Sprint 8] Prediction Engine

Status: DONE
Files touched: prisma/schema.prisma, src/constants/predictionWeights.ts, src/types/prediction.ts, src/repositories/predictionRepository.ts, src/services/predictionService.ts, src/validators/predictionValidators.ts, src/app/api/predictions/*
Decisions made:
- Prediction engine explicitly read-only, ingesting purely from Analytics, Timeline, Mission, and CareerState.
- Extracted mathematical projection constants into predictionWeights.ts to allow safe algorithmic tuning without structural downtime.
- Engineered dynamic Intervention Simulator that loops through deterministic scenarios (10hr, 15hr, 20hr) returning predictive JSON nodes that can immediately populate frontend slider dashboards.
- Prediction historical payload safely clamped to latest 365.

## [Version 2 - Sprint 9] Career OS Dashboard

Status: DONE
Files touched: src/types/dashboard.ts, src/services/dashboardService.ts, src/app/api/dashboard/route.ts, src/components/dashboard/*, src/app/dashboard/student/page.tsx
Decisions made:
- Frontend layout explicitly follows a BFF (Backend-For-Frontend) aggregator architecture where dashboardService.ts executes a massive parallel Promise.all mapping to reduce waterfall rendering.
- Error Boundaries insulate React Server Component trees, allowing AnalyticsCharts (via Recharts) to fail gracefully without corrupting the Prediction UI widget.
- NextJS App Router Server Components hydrate the unified API controller instantly on payload.
