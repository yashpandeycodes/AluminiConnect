import { z } from "zod";

// Recommendations are fully AI generated.
// We mostly need validation for triggering regeneration if we want to pass explicit filters in the future.
// For now, the endpoints are mostly parameterless actions (Complete/Dismiss) or fetch requests.

export const RefreshRecommendationsSchema = z.object({
  force: z.boolean().optional().default(false)
});
