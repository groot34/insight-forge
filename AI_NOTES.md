# AI Implementation Notes

## AI Usage in Development
During the development of Insight Forge, AI was leveraged for several key areas:

*   **Debugging**: Identifying and resolving hydration errors in Next.js and fixing TypeScript type mismatches in the upload route.
*   **Refactoring**: converting standard CSS colors to `oklch` variables to match the new "Deep Blue" theme.
*   **Documentation**: Generating the initial structure for `README.md` and `DEPLOYMENT.md`.

## Human Verification & Oversight
While AI handled heavy lifting, manual verification was strictly applied:
*   **Visual Testing**: Verified the animated background rendering and "g" clipping issue in the header.
*   **Build Integrity**: Manually ran `npm run build` to ensure all type errors (like the `JsonValue` issue) were truly resolved.
*   **Security**: Checked that sensitive keys are loaded via environment variables and not hardcoded.
*   **User Experience**: Verified that toast notifications appear correctly and the flow from upload to insight generation is smooth.

### Operational Rigor
*   **Structured JSON Logging**: A custom `lib/logger.ts` outputs structured JSON logs (`{timestamp, level, message, context}`) to `console`, which Vercel captures automatically. All 4 API routes are instrumented with request-level logging.
*   **Zod Input Validation**: All API inputs are validated using Zod schemas (`lib/validators.ts`), replacing manual `if (!field)` checks with type-safe parsing that provides clear error messages.
*   **AI Response Validation**: The Groq API response is validated with a Zod schema to catch malformed or empty responses before they reach the user.
*   **Retry with Backoff**: AI calls use exponential backoff with a **maximum of 2 retries** (3 total attempts) to balance reliability with free-tier API credit conservation.
*   **Automated Tests**: A Vitest test suite covers CSV parsing, AI integration (with mocked SDK), and input validation schemas (22 tests total).
*   **Cost Control & Manual Integration**: Chose **Groq** for its free tier (no credit card required) and manually wrote the core integration logic (`lib/groq.ts`) to ensure reliability and avoid AI-generated hallucinations in the critical API layer.

## App's AI Provider: Groq
Insight Forge uses **Groq** as the inference engine for generating data insights.

### Why Groq?
*   **Accessibility**: Groq offers a generous free tier that **doesn't require a credit card**, making it perfect for development and student projects.
*   **Manual Integration**: The `lib/groq.ts` client was written manually to ensure type safety and proper error handling, rather than relying solely on AI generation.
*   **Speed**: Groq's LPU (Language Processing Unit) delivers exceptionally fast inference speeds, which is critical for real-time user interaction.
*   **Model Support**: It supports powerful open-source models like **Llama 3** and **Mixtral 8x7B**, which are capable of high-quality reasoning and summarization needed for data analysis.
