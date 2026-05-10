# DreamScape AI

An emotionally intelligent AI dream visualizer and journal — lets users describe dreams, receive AI-powered interpretations with symbols and psychological insights, track patterns over time, and chat with an AI dream therapist named Luna.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port assigned dynamically)
- `pnpm --filter @workspace/dreamscape run dev` — run the Expo mobile app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required env: `AI_INTEGRATIONS_ANTHROPIC_BASE_URL`, `AI_INTEGRATIONS_ANTHROPIC_API_KEY` — auto-provisioned via Replit AI Integrations

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo (SDK 54) + Expo Router, React Native
- API: Express 5 + @anthropic-ai/sdk (Replit AI Integrations proxy)
- Local storage: AsyncStorage (no DB for first build)
- Build: esbuild (API server CJS bundle)

## Where things live

- `artifacts/dreamscape/` — Expo mobile app
- `artifacts/dreamscape/app/(tabs)/` — 5 main tabs (journal, create, insights, chat, community)
- `artifacts/dreamscape/app/onboarding.tsx` — Multi-step onboarding
- `artifacts/dreamscape/app/dream/[id].tsx` — Dream detail view
- `artifacts/dreamscape/context/DreamContext.tsx` — AsyncStorage dream CRUD
- `artifacts/dreamscape/components/` — AnimatedBackground, GlassCard, DreamCard, EmotionBadge
- `artifacts/dreamscape/constants/colors.ts` — Dark cosmic design tokens
- `artifacts/api-server/src/routes/dreams/index.ts` — AI interpretation + chat SSE endpoints

## Architecture decisions

- Dark-first palette: Both light/dark tokens set to cosmic dark palette so app is always dark regardless of system setting
- AI interpretation is stateless: dreams interpreted at creation time, result stored in AsyncStorage alongside the dream
- Chat is session-based (no persistence): Luna chat resets each session, history kept in component state
- No database on first build: AsyncStorage provides enough persistence for MVP; upgrade to Postgres + Drizzle when sharing/sync needed
- SSE streaming for chat: Luna's responses stream word-by-word for a more natural, alive feel using expo/fetch reader API

## Product

- **Dream Journal**: Record dreams, browse history, search by title or content
- **AI Interpretation**: Describe a dream → Claude analyzes symbols, emotions, psychology, and advice
- **Luna AI Therapist**: Gentle conversational AI companion for processing dream emotions (streaming chat)
- **Insights Dashboard**: Emotion frequency, recurring symbols, weekly activity
- **Community Feed**: Curated public dream stories with reactions
- **Onboarding**: 4-step immersive cinematic onboarding flow

## User preferences

- Dark mode only, cinematic aesthetic
- No emojis in UI
- Production-quality polish throughout

## Gotchas

- Always run `pnpm install --no-frozen-lockfile` after adding new dependencies
- API server must be running for AI interpretation and chat features to work
- `expo/fetch` (not native fetch) is used in the chat screen for SSE streaming support across platforms
- `useAnimatedStyle` must never be called inside `.map()` — extract to child components

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `expo` skill for mobile patterns and Expo Go compatibility
