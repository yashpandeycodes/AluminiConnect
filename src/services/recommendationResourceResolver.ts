export const recommendationResourceResolver = {
  resolveUrl(keywords: string): string {
    const query = encodeURIComponent(keywords);
    // Determine target based on simple heuristics
    const lower = keywords.toLowerCase();
    
    if (lower.includes("course") || lower.includes("learn") || lower.includes("certification")) {
      return `https://www.coursera.org/search?query=${query}`;
    }
    if (lower.includes("code") || lower.includes("problem") || lower.includes("leetcode")) {
      return `https://leetcode.com/problemset/all/?search=${query}`;
    }
    if (lower.includes("job") || lower.includes("internship") || lower.includes("role")) {
      return `https://www.linkedin.com/jobs/search/?keywords=${query}`;
    }
    if (lower.includes("repo") || lower.includes("open source")) {
      return `https://github.com/search?q=${query}`;
    }

    // Default to Google search
    return `https://www.google.com/search?q=${query}`;
  }
};
