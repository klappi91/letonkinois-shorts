# Le Tonkinois Shorts

Video-Dashboard & Content-Pipeline für Le Tonkinois Instagram Reels & Shorts.

## Konzept

Automatisierte Video-Erstellung mit Content-Rotation für den Le Tonkinois Instagram-Kanal. Videos werden generiert, auf einer Vercel-hosted Gallery reviewed, und perspektivisch per One-Click auf Instagram veröffentlicht.

## Tech Stack

| Komponente | Technologie |
|-----------|------------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Video-Pipeline | Gemini Image + Gemini Video + Remotion |
| Deployment | Vercel |
| Daten | JSON-basiert (videos.json) |

## Video-Pipeline

3 Generierungs-Pfade (je nach Komplexität):

1. **Remotion Only** — Produktfotos + Animation/Text-Overlays → MP4
2. **Gemini Image + Remotion** — KI-generierte Szenen + Compositing → MP4
3. **Gemini Image + Gemini Video + Remotion** — KI-Bild → KI-Video → Compositing → MP4

## Content-Rotation

Video-Typen rotieren für Abwechslung auf dem Instagram-Kanal:

| Typ | Beschreibung | Häufigkeit |
|-----|-------------|-----------|
| `showcase` | Einzelnes Produkt featured | 2x/Monat |
| `before-after` | Vorher/Nachher Transformation | 2x/Monat |
| `how-to` | Tipps & Tricks, häufige Fehler | 2x/Monat |
| `seasonal` | Saisonale Inhalte (Frühling, Sommer...) | 2x/Monat |
| `heritage` | Seit 1906, Tradition, Handwerk | 1x/Monat |
| `lifestyle` | Stimmungsbilder, Atmosphäre | 1x/Monat |

## Branding

Übernommen von letonkinois-content:
- **Fonts:** Lora (Headlines) + Lato (Body)
- **Farben:** Brand Red #B50606, Warm Woods (#D4A76A, #E8B84B, #6B4226), Cream #FFF8F0
- **Ton:** Premium & authentisch, kein Stock-Photo-Look. Deutsche Vorstadtgarten-Atmosphäre.
- **WICHTIG:** Produkt-Dosen/Flaschen NIEMALS von Gemini generieren — immer echte Produktfotos aus dem Katalog verwenden.

## Struktur

```
src/
├── app/
│   ├── page.tsx              # Gallery Dashboard
│   ├── layout.tsx            # Root Layout mit Branding
│   └── video/[id]/page.tsx   # Video Detail + Player + Caption
├── components/
│   ├── VideoCard.tsx         # Video-Karte für Grid
│   └── VideoGrid.tsx         # Grid mit Filter
├── data/
│   └── videos.json           # Video-Metadaten
└── lib/
    └── types.ts              # TypeScript Types
public/
└── videos/                   # Generierte MP4s
```

## Befehle

```bash
npm run dev        # Dev Server (lokal)
npm run build      # Production Build
npm run lint       # ESLint
```

## Roadmap

- [x] Phase 1: Gallery Dashboard + Detail-Seite
- [x] Phase 2: Erste Videos generieren (5 verschiedene Typen)
- [ ] Phase 3: Vercel Deployment
- [ ] Phase 4: Cron Job für tägliche Generierung
- [ ] Phase 5: Rating-System persistent machen (Supabase)
- [ ] Phase 6: Instagram API Integration (One-Click Publish)

## Verwandte Projekte

- **letonkinois-content/** — Content-Toolkit, Remotion-Projekt, Produkt-Katalog, Prompts
- **creative-web-lab/** — Web-Komponenten Lab (Architektur-Referenz)
- **gemini-video/** — Claude Code Skill für Veo 3.1 Video-Generierung
