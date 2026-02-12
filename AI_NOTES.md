# AI Implementation Notes

## AI Usage in Development
During the development of Insight Forge, AI was leveraged for several key areas:

*   **Code Generation**: Scaffolding UI components (Shadcn UI), implementing the Three.js animated background (`AnoAI`), and writing API routes for file processing.
*   **Debugging**: Identifying and resolving hydration errors in Next.js and fixing TypeScript type mismatches in the upload route.
*   **Refactoring**: converting standard CSS colors to `oklch` variables to match the new "Deep Blue" theme.
*   **Documentation**: Generating the initial structure for `README.md` and `DEPLOYMENT.md`.

## Human Verification & Oversight
While AI handled heavy lifting, manual verification was strictly applied:
*   **Visual Testing**: Verified the animated background rendering and "g" clipping issue in the header.
*   **Build Integrity**: Manually ran `npm run build` to ensure all type errors (like the `JsonValue` issue) were truly resolved.
*   **Security**: Checked that sensitive keys are loaded via environment variables and not hardcoded.
*   **User Experience**: Verified that toast notifications appear correctly and the flow from upload to insight generation is smooth.
*   **Cost Control & Manual Integration**: Chose **Groq** for its free tier (no credit card required) and manually wrote the core integration logic (`lib/groq.ts`) to ensure reliability and avoid AI-generated hallucinations in the critical API layer.

## App's AI Provider: Groq
Insight Forge uses **Groq** as the inference engine for generating data insights.

### Why Groq?
*   **Accessibility**: Groq offers a generous free tier that **doesn't require a credit card**, making it perfect for development and student projects.
*   **Manual Integration**: The `lib/groq.ts` client was written manually to ensure type safety and proper error handling, rather than relying solely on AI generation.
*   **Speed**: Groq's LPU (Language Processing Unit) delivers exceptionally fast inference speeds, which is critical for real-time user interaction.
*   **Model Support**: It supports powerful open-source models like **Llama 3** and **Mixtral 8x7B**, which are capable of high-quality reasoning and summarization needed for data analysis.
