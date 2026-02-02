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

## Persisting User Preferences

**IMPORTANT**: All user preferences and settings must persist between sessions via localStorage.

When adding new game settings or preferences:

1. Add the new settings to the `Settings` interface in `src/hooks/useLocalStorage.ts`
2. Add default values in `DEFAULT_SETTINGS`
3. In the page component, read from `appData.settings.yourNewSetting`
4. Create setter functions that call `setAppData` to update the setting
5. Pass `setAppData` to the page component from `App.tsx` if not already passed

Current persisted settings:
- `bottomColor` - Global bottom color preference (all games)
- `muted` - Sound mute preference
- `edgeKataFrontColor` - EO Kata front color selection
- `edgeKataAutoContinue` - EO Kata auto-continue toggle
- `zanshinFlashDurationMs` - Zanshin Recall flash duration
- `zanshinEnabledTypes` - Zanshin Recall enabled question types
- `zanshinOnlyVisibleStickers` - Zanshin Recall visible stickers only option

## Project Overview

This is a Rubik's Cube training app with four games:
1. **Color Sensei** - Color recognition drill
2. **F2L Pair Ninja** - F2L pair spotting practice  
3. **EO Kata** - Edge orientation recognition
4. **Zanshin Recall** - Cube memory/recall training

## Key Files

- `src/App.tsx` - Main routing and layout
- `src/components/Header.tsx` - Top navigation with help button
- `src/components/HelpModal.tsx` - Help modal with game rules
- `src/hooks/useLocalStorage.ts` - Settings persistence (ADD NEW SETTINGS HERE)
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
- All user preferences must persist between sessions
- The help modal shows rules for the current game based on route
- Stats for each game are stored separately in their own stores
