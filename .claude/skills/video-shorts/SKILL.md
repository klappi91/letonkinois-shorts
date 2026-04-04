---
name: video-shorts
description: Erstellt Instagram Reels & Shorts für Le Tonkinois. Nutze diesen Skill wenn der User ein neues Short/Reel erstellen, eine Shot List planen, Referenzbilder oder Veo-Clips generieren, eine Remotion-Komposition bauen, oder ein Video judgen/iterieren möchte. Auch bei "erstelle ein Reel", "neues Short", "Shot List", "workflow erstellen", "Video rendern", "judgen", oder "das Branding stimmt nicht" diesen Skill verwenden. Der Skill orchestriert die komplette Pipeline: Idee → workflow.json → Referenzbilder → Veo-Clips → Trimming → Remotion → Judge → Iterate.
---

# Le Tonkinois Video Shorts Pipeline

Dieser Skill steuert die komplette Produktion von Instagram Reels & Shorts für Le Tonkinois — vom Konzept bis zum fertigen, bewerteten Video.

## Pipeline-Übersicht

```
1. KONZEPT       → Idee + Content-Typ festlegen
2. SHOT LIST     → workflow.json erstellen (Szenen, Prompts, Kamerawinkel)
3. REFERENZBILDER → Gemini Image generiert Stil-Anker pro Szene
4. VIDEO-CLIPS    → Veo 3.1 (Image-to-Video) generiert 3-5 Clips à 4-8s
5. TRIMMING       → FFmpeg schneidet die guten Sekunden raus
6. KOMPOSITION    → Remotion (TransitionSeries) cuttet alles zusammen
7. RENDER         → Remotion rendert zu MP4 (1080x1920 @ 30fps)
8. JUDGE          → Gemini 3.1 Pro bewertet (7 Kriterien)
9. ITERATE        → Bei Score < 7.5: Pacing/Text/Reihenfolge anpassen, neu rendern
```

## Wann welchen Pfad nutzen

| Situation | Pfad |
|-----------|------|
| Echte Video-Clips nötig (Flüssigkeiten, Kamerafahrten, Bewegung) | Voll-Pipeline (Schritte 1-9) |
| Statische Szenen (Before/After, Listicles, Text-heavy) | Nur Bilder + Ken Burns (Schritte 1, 2, 3, 6-9 — kein Veo) |
| Mix aus beidem (Video-Hook + Bild-Schritte) | Hybrid: Video für Hook/Money Shot, Bilder für den Rest |

## Schritt 1: Konzept & Content-Typ

Jedes Short hat einen Content-Typ, der den Aufbau bestimmt:

| Typ | Aufbau | Beispiel |
|-----|--------|---------|
| `showcase` | Hook → Produkt in Aktion → Reveal → ProductReveal → EndCard | Boot-Deck Renovation |
| `before-after` | Vorher → Schritte → Nachher → ProductReveal → EndCard | Gartenmöbel Renovation |
| `seasonal` | Saisonaler Hook → Szenen → ProductReveal → EndCard | Oster-Ei-Boot |
| `how-to` | Problem → 3 Schritte → Ergebnis → ProductReveal → EndCard | — |
| `heritage` | Historischer Hook → Tradition → Heute → ProductReveal → EndCard | — |

## Schritt 2: workflow.json erstellen

Jedes Short beginnt mit einer `workflow.json` — die Shot List. Erstelle sie unter `assets/sequences/{short-name}/workflow.json`.

### Pflicht-Felder

```json
{
  "name": "Short-Name",
  "description": "Kurze Beschreibung",
  "type": "seasonal|showcase|before-after|how-to|heritage|lifestyle",
  "aspect_ratio": "9:16",
  "target_duration_seconds": 15,
  "fps": 30,

  "consistency": {},

  "clips": [
    {
      "id": "clip_01_hook",
      "type": "video",
      "description": "Was passiert in dieser Szene",
      "image_prompt": "Prompt für Gemini Image (Referenzbild)",
      "video_prompt": "Prompt für Veo 3.1 (nur Bewegung beschreiben)",
      "duration_seconds": 6,
      "use_seconds": [0, 5],
      "camera": "slow zoom in / static / dolly back",
      "effects": []
    }
  ],

  "overlays": {
    "hook_text": { "text": "Hook\nText.", "font": "Playfair Display", "position": "top_safe" },
    "scene_label": { "text": "Geölt.", "font": "Lora", "on_clip": "clip_02" },
    "product_reveal": { "product": "vernis", "cutout": "product-cutouts/vernis.png", "name": "Le Tonkinois Vernis" },
    "end_card": { "cta": "CTA Text!", "logo": "brand/logo.png" }
  },

  "generation_config": {
    "image_model": "gemini-image",
    "image_size": "2K",
    "video_model": "gemini-video",
    "video_duration": 8,
    "video_resolution": "720p",
    "video_quality": "fast",
    "video_aspect_ratio": "9:16"
  }
}
```

### Clip-Typen

- `"type": "video"` — Veo-Clip generieren (Image-to-Video). `image_prompt` + `video_prompt` nötig.
- `"type": "image"` — Ken Burns Standbild. Nur `image_prompt` oder `source` (Pfad zu bestehendem Bild).

### Konsistenz (optional)

Die `consistency`-Sektion ist **optional** und nur nötig wenn mehrere Clips zusammenpassen sollen.
In der Stilfindungsphase: Weglassen und frei prompten. Keine Beleuchtung, keinen Stil, keine Negative vorgeben.

## Schritt 3: Referenzbilder generieren

Erstelle eine `batch.json` im Sequenz-Verzeichnis und generiere die Bilder:

```bash
# batch.json Format
[
  {
    "prompt": "Photorealistic 9:16 ...",
    "output": "/absolute/path/to/assets/sequences/{name}/01-hook.png",
    "aspect_ratio": "9:16",
    "image_size": "2K"
  }
]

# Generieren (IMMER absolute Pfade für output!)
$HOME/.claude/skills/_image-shared/ensure_env.sh \
  $HOME/.claude/skills/gemini-image/scripts/generate.py \
  batch assets/sequences/{name}/batch.json --max-concurrent=3 --size=2K
```

**Kosten:** ~$0.10 pro Bild bei 2K

### Prompt-Tipps für Referenzbilder

- Frei prompten — kein festes Format erzwingen
- Einzige harte Regel: KEINE KI-generierten Produktdosen/Flaschen — immer echte Fotos
- IMMER absolute Pfade für output-Dateien verwenden

## Schritt 4: Video-Clips generieren (Veo 3.1)

Pro Clip mit `"type": "video"`:

```bash
# IMMER absolute Pfade verwenden!
$HOME/.claude/skills/_video-shared/ensure_env.sh \
  $HOME/.claude/skills/gemini-video/scripts/generate.py animate \
  /absolute/path/to/assets/sequences/{name}/01-hook.png \
  "Motion prompt: was sich bewegt, nicht was im Bild ist" \
  /absolute/path/to/assets/clips/{name}/clip_01_hook.mp4 \
  --aspect-ratio=9:16 --duration=8 --no-audio --quality=fast
```

**Kosten:** ~$0.80 pro Clip (fast, 8s, no-audio)

### Prompt-Regeln für Video

- Nur **Bewegung** beschreiben, nicht was im Bild ist (das kommt vom Referenzbild)
- Kurz halten (<30 Wörter)
- Eine Kamerabewegung pro Prompt (nicht kombinieren)
- "Camera glides forward" statt "Dolly in" (natürliche Sprache > Fachjargon)
- Keine Maßangaben (F-Stops, Grad) — werden ignoriert

### Parallelisierung

Mehrere Clips können parallel generiert werden (separate Bash-Hintergrund-Tasks). Jeder Clip dauert 1-6 Minuten.

## Schritt 5: Clips trimmen (FFmpeg)

Nutze `use_seconds` aus der workflow.json:

```bash
ffmpeg -y -i assets/clips/{name}/clip_01_hook.mp4 \
  -ss {use_seconds[0]} -t {use_seconds[1] - use_seconds[0]} \
  -c:v libx264 -c:a aac \
  assets/clips/{name}/clip_01_hook_trimmed.mp4
```

Re-Encoding (`-c:v libx264`) ist empfohlen — Stream Copy (`-c copy`) kann Frames am Schnittpunkt verlieren.

## Schritt 6: Remotion-Komposition erstellen

### Dateistruktur

```
remotion/src/
├── compositions/{ShortName}.tsx    # Die Komposition
├── entries/{ShortName}.tsx         # Isolierter Entry Point
└── Root.tsx                        # Registrierung (optional)
```

### Kompositions-Template

```tsx
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { colors } from "../utils/colors";
import { playfair, lora } from "../utils/fonts";
import { VideoScene } from "../components/VideoScene";
import { ImageScene } from "../components/ImageScene";
import { ProductReveal } from "../components/ProductReveal";
import { EndCard } from "../components/EndCard";

// Frame-Berechnung: Σ(Sequenz-Frames) - Σ(Transition-Frames)
// Transitions überlappen — deshalb abziehen!
export const SHORT_NAME_DURATION = /* berechnen */;

// Hook-Text Overlay
const HookText: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [10, 24], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const y = interpolate(frame, [10, 24], [18, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div style={{ position: "absolute", top: 160, left: 60, right: 60 }}>
      <span style={{
        fontFamily: playfair, fontWeight: 700, fontSize: 58,
        color: colors.lightText, opacity, transform: `translateY(${y}px)`,
        textShadow: colors.textShadow, lineHeight: 1.2, display: "block",
      }}>
        Hook Text
      </span>
    </div>
  );
};

export const ShortName: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <TransitionSeries>
      {/* Szene 1: Hook */}
      <TransitionSeries.Sequence durationInFrames={/* seconds * 30 */}>
        <VideoScene src="clips/{name}/clip_01_trimmed.mp4" gradientStrength={0.4}>
          <HookText />
        </VideoScene>
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 8 })}
      />

      {/* ... weitere Szenen ... */}

      {/* Product Reveal (3s = 90 Frames) */}
      <TransitionSeries.Sequence durationInFrames={90}>
        <ProductReveal productImage="product-cutouts/vernis.png" productName="Le Tonkinois Vernis" />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 8 })} />

      {/* EndCard (2.5-3s = 75-90 Frames) */}
      <TransitionSeries.Sequence durationInFrames={90}>
        <EndCard cta="CTA Text!" />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
);
```

### Entry Point Template

```tsx
import { registerRoot, Composition } from "remotion";
import { ShortName, SHORT_NAME_DURATION } from "../compositions/ShortName";

const Root: React.FC = () => (
  <Composition
    id="ShortName"
    component={ShortName}
    durationInFrames={SHORT_NAME_DURATION}
    fps={30}
    width={1080}
    height={1920}
  />
);

registerRoot(Root);
```

### Verfügbare Komponenten

| Komponente | Zweck | Props |
|-----------|-------|-------|
| `VideoScene` | Veo-Clip abspielen | `src`, `startFrom`, `volume`, `loopDuration`, `gradientStrength`, `children` |
| `ImageScene` | Ken Burns Standbild | `src`, `zoomFrom`, `zoomTo`, `gradientStrength`, `children` |
| `ProductReveal` | Dose auf Cream-BG | `productImage`, `productName` |
| `EndCard` | Logo + Seit 1906 + CTA | `cta` |
| `SceneLabel` | 1-3 Wort Label | `text`, `delay` |
| `StepBadge` | "1/3" Badge | `number`, `totalSteps`, `delay` |

### Timing-Referenz

| Element | Empfohlene Dauer | Frames (30fps) |
|---------|:----------------:|:--------------:|
| Hook-Szene | 3-4s | 90-120 |
| Content-Szene | 3-5s | 90-150 |
| Product Reveal | 3s | 90 |
| EndCard | 2.5-3s | 75-90 |
| Transition (fade/slide) | 0.2-0.4s | 6-12 |
| Min. Szenen-Dauer | 3.3s | 100 |
| Max. Gesamt-Dauer | 30s | 900 |

### Text-Overlay Regeln

- **Hook-Text:** Max 2-3 Wörter pro Zeile, Playfair Display 58px, `top: 160px` (in Safe Zone)
- **Scene Label:** Max 1-3 Wörter, Lora 42-48px, `bottom: 400-420px` (in Safe Zone)
- **Text-Shadow:** `0 2px 12px rgba(0,0,0,0.5)` oder softer `0 1px 8px rgba(0,0,0,0.35)`
- **Fade-In:** 12-15 Frames, mit `Easing.out(Easing.cubic)` und `translateY` Slide-Up
- Text muss zum Bild passen — Erklärungen gehören in die Caption, nicht ins Video

## Schritt 7: Rendern

```bash
cd /home/chris/projects/letonkinois-shorts/remotion && \
npx remotion render src/entries/{ShortName}.tsx {ShortName} out/{short-name}.mp4 --log=error
```

Danach kopieren:
```bash
cp remotion/out/{short-name}.mp4 public/videos/{short-name}.mp4
```

## Schritt 8: Judge

```bash
cd /home/chris/projects/letonkinois-shorts && \
python3 scripts/judge-video.py remotion/out/{short-name}.mp4 \
  --context "Beschreibung des Shorts und seiner Zielgruppe" \
  -o remotion/out/{short-name}-judge.json
```

**7 Bewertungskriterien (je 1-10):**
1. Hook-Stärke — Stoppt der Viewer beim Scrollen?
2. Visueller Flow — Übergänge, Pacing, Abwechslung
3. Bildqualität — Farben, Beleuchtung, Komposition
4. Typografie — Lesbar, timing-richtig, marken-konform
5. Branding — Logo, Farben, Produktdarstellung
6. Emotion/Story — Wow-Moment, Neugier, Befriedigung
7. IG-Prognose — Save-Rate, Explore-tauglich

**Ziel-Score:** >= 7.5

## Schritt 9: Iterate

Bei Score < 7.5 — die häufigsten Verbesserungen:

| Problem | Lösung |
|---------|--------|
| Pacing zu langsam | Szenen kürzen, unnötige Frames raus |
| Hook zu schwach | Stärkstes Bild/Video an den Anfang |
| Branding fehlt | BrandBadge oder "Seit 1906" Text hinzufügen |
| Harter Bruch zu ProductReveal | BrandedOutro über Ergebnisbild statt weißer Hintergrund |
| Text zu subtil | Stärkere Aussage, z.B. "Holzschutz seit 1906" statt "Geölt." |
| KI-Look zu stark | Gradient stärker, kürzere Szenen, mehr Abwechslung |

Nach Änderungen: Neu rendern und erneut judgen. Max 2-3 Iterationen.

## Agent-Strategie

Für **mehrere Shorts gleichzeitig**: Pro Short einen eigenen Agent spawnen mit der kompletten Pipeline. Jeder Agent arbeitet autonom:

```
Agent pro Short:
1. workflow.json erstellen
2. Referenzbilder generieren
3. Veo-Clips generieren (parallel)
4. Trimmen
5. Remotion-Komposition schreiben
6. Rendern
7. Judgen
8. Iterieren (max 2x)
9. Finale Version nach public/videos/ kopieren
```

Agents nutzen **separate Entry Points** (`remotion/src/entries/`), um Konflikte in Root.tsx zu vermeiden.

## Branding Quick Reference

| Element | Wert |
|---------|------|
| Brand Red | `#B50606` |
| Cream BG | `#FFF8F0` |
| Navy (Marine) | `#1A2744` |
| Headline Font | Playfair Display |
| Scene Font | Lora |
| Body Font | Lato |
| Safe Zone Top | 140px |
| Safe Zone Bottom | 380px |
| Product Cutout | `product-cutouts/vernis.png` (echtes Foto!) |
| Logo | `brand/logo.png` |

**Einzige harte Regel:** KI-generierte Produktdosen/Flaschen — IMMER echte Fotos verwenden.

Ansonsten: Kreativ frei. Kein Stil, keine Beleuchtung, keine Stimmung vorgegeben.
Wir sind in der Stilfindungsphase.

Vollständige Brand-Tokens: `src/lib/brand.ts`

## Kosten-Übersicht

| Asset | Kosten | Pro Short |
|-------|--------|----------|
| Referenzbild (2K) | ~$0.10 | 2-5 Bilder |
| Veo-Clip (fast, 8s, no-audio) | ~$0.80 | 2-4 Clips |
| Judge (Gemini 3.1 Pro) | ~$0.01 | 2-3 Runs |
| **Gesamt pro Short** | **$2-5** | |

## Dateistruktur

```
assets/
├── sequences/{short-name}/
│   ├── workflow.json          # Shot List
│   ├── batch.json             # Gemini Image Prompts
│   ├── 01-hook.png            # Referenzbilder
│   └── 02-detail.png
├── clips/{short-name}/
│   ├── clip_01_hook.mp4       # Veo-Roh-Clip
│   └── clip_01_hook_trimmed.mp4  # Getrimmter Clip
remotion/
├── src/compositions/{ShortName}.tsx
├── src/entries/{ShortName}.tsx
├── public/clips → ../../assets/clips  # Symlink!
└── out/{short-name}.mp4       # Gerendert
public/videos/{short-name}.mp4  # Finale Version
```
