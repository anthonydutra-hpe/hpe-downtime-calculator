# HPE Downtime Calculator

This is an MVP Next.js (App Router) + TypeScript project implementing an HPE Downtime Calculator.

Quick start:

1. Install dependencies

```bash
npm install
```

2. Run development server

```bash
npm run dev
```

3. Open http://localhost:3000

Vercel:

- Ensure you add the HPE logo at `public/hpe-logo.svg` before deploying.
- Push to GitHub and import the repo into Vercel (default Next.js settings).

Notes:
- Calculation logic in `lib/calc.ts`.
- Advisor logic and thresholds in `lib/advisor.ts` and `lib/rules.json`.
- Tests: `npm test` (Jest + ts-jest).
