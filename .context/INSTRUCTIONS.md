# Context Engineering Instructions for AI Assistants

This file contains important information and instructions for AI assistants working on this codebase.

## Deployment Timestamp

**IMPORTANT**: Every time you deploy to GitHub Pages, you MUST update the deployment timestamp in:
`src/config/deploymentInfo.ts`

Update the `LAST_DEPLOYMENT` constant with the current date and time in ISO format.

Example:
```typescript
export const LAST_DEPLOYMENT = '2026-02-02T12:00:00Z';
```

## Project Overview

This is a Rubik's Cube training app with three games:
1. **Color Sensei** - Color recognition drill
2. **F2L Pair Ninja** - F2L pair spotting practice  
3. **EO Kata** - Edge orientation recognition (ZZ method)

## Key Files

- `src/App.tsx` - Main routing and layout
- `src/components/Header.tsx` - Top navigation with help button
- `src/components/HelpModal.tsx` - Help modal with game rules
- `src/config/deploymentInfo.ts` - Deployment timestamp
- `src/logic/edgeKata/isGoodEdge.ts` - Edge orientation logic

## Edge Orientation Rules (EO Kata)

The correct rule for edge orientation:
1. Find the **important sticker**:
   - If edge has U or D color → that sticker is important
   - Otherwise → the F or B colored sticker is important

2. Check the edge's **CURRENT position** (not solved position):
   - If currently in U/D layer → GOOD if important sticker faces U or D
   - If currently in middle layer → GOOD if important sticker faces F or B

## Deployment Commands

```bash
# Build and deploy
npm run build && npm run deploy

# Or use the deploy script which does both
npm run deploy
```

## Remember

- Always update deployment timestamp before deploying
- The help modal shows rules for the current game based on route
- Sound toggle has been removed - the app uses sounds by default
