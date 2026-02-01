# dTikTok — Distributed K-Routed Video Platform

## Vision
TikTok energy without TikTok control. Your algorithm. Your data. Your feed.

## Quick Start
```bash
npm run dev
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      PWA (SvelteKit)                     │
├─────────────────────────────────────────────────────────┤
│  Swipe UI  │  K-Router  │  User Prefs  │  Upload Flow   │
├─────────────────────────────────────────────────────────┤
│                    Content Sources                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │Archive.org│  │  IPFS    │  │  Nostr   │  │ Direct  │ │
│  │(bootstrap)│  │(user vid)│  │(social)  │  │ Upload  │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
```

## K-Routing

User sets their feed balance with suit sliders:

| Suit | Content Type |
|------|--------------|
| ♥ Hearts | Emotional, connection, feels |
| ♠ Spades | Educational, analysis, news |
| ♦ Diamonds | Practical, how-to, builds |
| ♣ Clubs | Hype, motivation, action |

## Status

- [x] PWA scaffold
- [x] Tailwind + dark theme
- [x] Video types + interfaces
- [x] Archive.org API service
- [x] K-router service
- [x] VideoPlayer component
- [x] VideoFeed with swipe
- [x] Main page with loading states
- [x] Settings page with sliders
- [ ] More Archive.org content
- [ ] IPFS upload
- [ ] Nostr integration
