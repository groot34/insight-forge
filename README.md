# Insight Forge

Transform raw CSV data into actionable intelligence. Upload, analyze, and visualize with the power of AI.

## Overview

Insight Forge is a modern web application designed to simplify data analysis. It allows users to upload CSV files, preview the data in an interactive table, view automatic visualizations, and generate AI-powered insights using Groq.

## Features Checklist

Based on the project agenda:

### ✅ Done
- [x] **Upload CSV**: Support for `.csv` files up to 5MB.
- [x] **Data Preview**: Interactive, sortable, and paginated table view of the uploaded data.
- [x] **AI Insights**: Generates a summary of trends, outliers, and key findings using Groq AI.
- [x] **Simple Charts**: Auto-generates Bar, Line, and Pie charts based on data types (Numeric, Time-series, Categorical).
- [x] **Save & History**: Save generated reports and view the last 5 reports.
- [x] **Export**: Copy reports to clipboard or download as Markdown (`.md`).
- [x] **Home Page**: Clean, modern landing page with clear steps.
- [x] **Status Page**: Real-time health check for Backend, Database, and AI connection.
- [x] **Input Handling**: Validation for file type, size, and empty inputs with user-friendly toast notifications.
- [x] **Modern UI**: "Deep Blue/Purple" space-themed aesthetic with glassmorphism and animated backgrounds.

### 🚧 Not Done / Future Improvements
- [ ] **Column Selection**: Currently, the AI analyzes the first 100 rows of the entire dataset. Explicit column selection for focused analysis is not yet implemented.
- [ ] **Follow-up Questions**: The ability to ask chat-like follow-up questions to the AI about the data is not yet implemented.
- [ ] **Advanced Chart Customization**: Charts are auto-detected; users cannot currently customize axes or chart types manually.

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, CSS Variables, Shadcn UI
- **Database**: PostgreSQL (via Prisma ORM)
- **AI Provider**: Groq (with Zod validation & retry logic)
- **Visualization**: Recharts, CSS Animations (Background)
- **Validation**: Zod (input & AI output validation)
- **Testing**: Vitest (unit tests)
- **Logging**: Structured JSON logging
- **Deployment**: Vercel Ready

## Getting Started

### Prerequisites
- Node.js & npm
- PostgreSQL Database URL
- Groq API Key

### Local Setup

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd insight-forge
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    npm ci
    ```

3.  **Environment Variables**:
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/insight_forge"
    GROQ_API_KEY="gsk_..."
    ```

4.  **Database Setup**:
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing

Run the automated test suite:
```bash
npm test
```

This runs unit tests covering:
- **CSV Parsing** (`lib/csv.ts`): Valid/empty/malformed data, dynamic typing, whitespace trimming
- **AI Integration** (`lib/groq.ts`): Successful calls, empty/invalid responses, retry logic, exhausted retries
- **Input Validation** (`lib/validators.ts`): Schema enforcement for all API inputs

