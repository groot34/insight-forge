# Prompts Used

This document records the key prompts and directives used during the development of Insight Forge.

## Phase 1: Rebranding & UI Overhaul
*   "Rebrand the application from 'CSV Insights' to 'Insight Forge'."
*   "Implement a 'Deep Blue/Purple, space-like' theme using CSS variables."
*   "Integrate a lightweight CSS animated background behind the content."
*   "Fix the chart colors to use `oklch` variables compatible with the new theme."

## Phase 2: Debugging & Refinement
*   "Fix the Next.js hydration error on the `html` tag."
*   "The letter 'g' in 'Insight Forge' is being clipped in the hero section."
*   "The animated background is not visible on the Status page."

## Phase 3: Deployment & Configuration
*   "Analyze the repo and explain how to host it on Vercel properly."
*   "Fix the TypeScript error: Type 'Record<string, unknown>[]' is not assignable to type 'JsonValue'."
*   "Create a `DEPLOYMENT.md` guide."

## Phase 4: Documentation
*   "Create a short README with steps, done/not done lists."
*   "Create a `.env.example` file for reference."
*   "Create `AI_NOTES.md`, `ABOUTME.md`, and `PROMPTS_USED.md`."

## Phase 5: Code Explanation & Walkthrough
*   "Explain the `app/status/page.tsx` file and how the health checks work."
*   "Explain the `components/ui/animated-shader-background.tsx` file and how CSS animations are used."
*   "Explain the `app/api/upload/route.ts` file and how CSV parsing works."
*   "Explain the `app/api/generate-insights/route.ts` file and how the Groq API is called."
*   "Explain the `app/globals.css` file and how `oklch` colors are used for theming."
*   "Explain the `lib/storage.ts` file and how the database abstraction layer is structured."

## Phase 4: Documentation
*   "Create a short README with steps, done/not done lists."
*   "Create a `.env.example` file for reference."
*   "Create `AI_NOTES.md`, `ABOUTME.md`, and `PROMPTS_USED.md`."
