#!/usr/bin/env python3
"""
Video Judge — Bewertet Shorts/Reels mit Gemini.

Nutzung:
    python3 scripts/judge-video.py <video.mp4> [--context "Beschreibung"]
    python3 scripts/judge-video.py public/videos/gartenmoebel-renovation.mp4
    python3 scripts/judge-video.py out.mp4 --context "Oster-Reel mit Holzhase"
    python3 scripts/judge-video.py out.mp4 --model gemini-3.1-pro-preview

Output: Strukturierte Bewertung (Markdown) + optionale JSON-Datei.
"""

import argparse
import json
import os
import re
import sys
import time
from pathlib import Path

# API Key aus Skills laden
ENV_PATHS = [
    Path.home() / ".claude/skills/_image-shared/.env",
    Path.home() / ".claude/skills/_video-shared/.env",
]


def load_api_key() -> str:
    """Lädt GEMINI_API_KEY aus Umgebung oder Skill-Env-Dateien."""
    key = os.environ.get("GEMINI_API_KEY")
    if key:
        return key
    for env_path in ENV_PATHS:
        if env_path.exists():
            for line in env_path.read_text().splitlines():
                if line.startswith("GEMINI_API_KEY="):
                    return line.split("=", 1)[1].strip().strip("'\"")
    print("FEHLER: Kein GEMINI_API_KEY gefunden.", file=sys.stderr)
    sys.exit(1)


BRAND_CONTEXT = """\
## Marke: Le Tonkinois (seit 1906)

Premium-Holzöle und -lacke mit maritimem Erbe. Shop: letonkinois.de (gehört zu Hermann Sachse).

### Website-Ästhetik (letonkinois.de)
- Farbschema: Hell, clean, Rot-auf-Weiß
- Primary: #B50606 (Brand-Rot), Secondary: #E01020 (helleres Rot)
- Hintergrund: #FFFFFF, Text: #777777 (gedämpft), #333333 (dunkel)
- Headlines: Lora (Serif), Body: Lato (Sans-Serif), Display: Playfair Display
- Ton: Traditionell-professionell, nicht trendig. Zielgruppe: Heimwerker & Bootsbesitzer.

### Logo & Produktdesign
- Schriftzug "LE TONKINOIS" im Bogen, Holzschnitt-/Schablonen-Stil, zackig, handgeschnitzt
- Logo immer in Karminrot (~#C1121C)
- Traditionelle Gebinde: Blechkanister, Metalldosen, Glasflaschen (KEIN Plastik)
- Maritime Illustrationen: Segelschiffe, Dschunken auf den Verpackungen
- Vintage-Layout (30er-50er Jahre Plakat-Stil)

### Farbpalette (aus Website-CSS + Produktfoto-Pixelanalyse)
- Brand-Rot: #B50606 (Website-CSS) / #B00000 (Logo-Pixel)
- Sekundär-Rot: #E01020 (Website-Links) / #C83830 (Produkt-Akzent)
- Marine-Blau: #403080 (Verpackungen, Marine No.1)
- Senfgelb: #C8B848 / #D8B040 (Blechdosen Gelomat/Bio Impression)
- Logo-Grün: #407048 (Hintergrund im Logo-Icon)
- Holzbraun: #785838 / #806038 (Beize-Produkte)
- Hintergründe: #FFFFFF (Website), #EBE4C2 (Creme-Variante)
- Text: #777777 (Body), #333333 (Dunkel)

### Brand-Fit Checkliste
✓ Echte Produktfotos wenn Produkte gezeigt werden (niemals KI-generierte Dosen/Flaschen)
✓ Brand Red (#B50606) als Wiedererkennungswert wo sinnvoll
✓ Serif-Fonts für Headlines wenn Text verwendet wird (Playfair Display / Lora)

Ansonsten: Kreative Freiheit. Stil wird aktuell noch gesucht — nicht einschränken.
"""

JUDGE_PROMPT = f"""\
Du bist ein erfahrener Social-Media-Experte und Video-Producer, spezialisiert auf Instagram Reels und YouTube Shorts im Bereich Holzpflege, DIY und Lifestyle.

{BRAND_CONTEXT}

Bewerte dieses Video ehrlich und konstruktiv — kein Schönreden. Prüfe insbesondere ob das Video zur oben beschriebenen Markenidentität passt.

## Bewertungskriterien (jeweils 1-10)

1. **Hook-Stärke** — Stoppt der Viewer beim Scrollen? Ist das erste Bild stark genug?
2. **Visueller Flow** — Übergänge flüssig? Pacing richtig? Visuelle Abwechslung?
3. **Bildqualität & Ästhetik** — Farbharmonie, Beleuchtung, Komposition. Professionell oder künstlich?
4. **Text & Typografie** — Lesbar? Timing? Passt die Schrift zur Marke (Holzschnitt/Vintage)?
5. **Branding** — Logo erkennbar? Markenfarben (Rot, Blau, Senfgelb) konsistent? Produkte authentisch?
6. **Emotionaler Impact** — Mini-Geschichte? Wow-Moment? Würde man es speichern?
7. **Instagram-Prognose** — Save-Rate? Explore-tauglich? Format korrekt?

## Antwort-Struktur

Gib für jedes Kriterium einen Score (1-10) mit kurzer Begründung.
Dann:
- **Gesamtscore** (Durchschnitt, 1 Dezimalstelle)
- **Top 3 Stärken** (Bulletpoints)
- **Top 3 Schwächen** (Bulletpoints)
- **3 konkrete Verbesserungsvorschläge** (umsetzbar, spezifisch)
- **Brand-Fit**: niedrig / mittel / hoch (passt das Video zur Le Tonkinois Identität?)
- **Save-Wahrscheinlichkeit**: niedrig / mittel / hoch
- **Fazit**: 1 Satz
"""


def extract_scores(text: str) -> dict:
    """Versucht Scores aus dem Freitext zu extrahieren."""
    scores = {}
    patterns = {
        "hook": r"hook[^:]*:\s*(\d+)",
        "flow": r"flow[^:]*:\s*(\d+)",
        "visual_quality": r"(?:bild)?qualit[äa]t[^:]*:\s*(\d+)",
        "typography": r"typo(?:grafie|graphy)?[^:]*:\s*(\d+)",
        "branding": r"branding[^:]*:\s*(\d+)",
        "emotional_impact": r"emoti(?:on|onal)[^:]*:\s*(\d+)",
        "instagram_prognosis": r"(?:instagram|ig|prognos)[^:]*:\s*(\d+)",
    }
    # Auch "8/10" Format matchen
    score_line_pattern = r"(\d+)\s*/\s*10"

    # Alle "X/10" Scores in Reihenfolge finden
    all_scores = re.findall(score_line_pattern, text)

    # Versuche benannte Patterns
    for key, pattern in patterns.items():
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            scores[key] = int(match.group(1))

    # Fallback: wenn nicht genug benannte, nehme die /10 Scores in Reihenfolge
    if len(scores) < 5 and len(all_scores) >= 7:
        keys = ["hook", "flow", "visual_quality", "typography", "branding", "emotional_impact", "instagram_prognosis"]
        for i, key in enumerate(keys):
            if key not in scores and i < len(all_scores):
                scores[key] = int(all_scores[i])

    return scores


def judge_video(video_path: str, context: str | None = None, model: str = "gemini-3.1-pro-preview") -> dict:
    """Bewertet ein Video mit Gemini. Gibt dict mit text + scores zurück."""
    from google import genai
    from google.genai import types

    api_key = load_api_key()
    client = genai.Client(api_key=api_key)

    video_file = Path(video_path)
    if not video_file.exists():
        print(f"FEHLER: Video nicht gefunden: {video_path}", file=sys.stderr)
        sys.exit(1)

    file_size_mb = video_file.stat().st_size / (1024 * 1024)
    print(f"Video: {video_file.name} ({file_size_mb:.1f} MB)")
    print(f"Model: {model}")
    print(f"Uploading...", end=" ", flush=True)

    uploaded = client.files.upload(file=video_file)
    print(f"OK ({uploaded.name})")

    print("Processing...", end=" ", flush=True)
    while uploaded.state.name == "PROCESSING":
        time.sleep(2)
        uploaded = client.files.get(name=uploaded.name)

    if uploaded.state.name == "FAILED":
        print(f"\nFEHLER: Video-Verarbeitung fehlgeschlagen.", file=sys.stderr)
        sys.exit(1)
    print("OK")

    prompt = JUDGE_PROMPT
    if context:
        prompt += f"\n\n## Zusätzlicher Kontext\n{context}"

    print("Judging...", end=" ", flush=True)
    start = time.time()

    response = client.models.generate_content(
        model=model,
        contents=types.Content(
            role="user",
            parts=[
                types.Part.from_uri(
                    file_uri=uploaded.uri,
                    mime_type=uploaded.mime_type,
                ),
                types.Part.from_text(text=prompt),
            ],
        ),
    )

    elapsed = time.time() - start
    print(f"OK ({elapsed:.1f}s)")

    text = (response.text or "").strip()
    if not text:
        for candidate in (response.candidates or []):
            for part in (candidate.content.parts or []):
                if hasattr(part, "text") and part.text:
                    text = part.text.strip()
                    break

    if not text:
        print("WARNUNG: Leere Antwort von Gemini.", file=sys.stderr)
        return {"text": "", "scores": {}, "error": True}

    # Cleanup
    try:
        client.files.delete(name=uploaded.name)
    except Exception:
        pass

    scores = extract_scores(text)
    overall = round(sum(scores.values()) / len(scores), 1) if scores else 0

    return {
        "text": text,
        "scores": scores,
        "overall_score": overall,
        "model": model,
        "video": video_file.name,
        "elapsed_seconds": round(elapsed, 1),
    }


def print_report(result: dict):
    """Gibt die Bewertung aus."""
    if result.get("error"):
        print("\nFEHLER: Keine Bewertung erhalten.")
        return

    scores = result.get("scores", {})
    overall = result.get("overall_score", 0)

    print("\n" + "=" * 55)
    print(f"  VIDEO JUDGE — {result.get('video', '?')} — {overall}/10")
    print(f"  Model: {result.get('model', '?')} | {result.get('elapsed_seconds', 0)}s")
    print("=" * 55)

    if scores:
        labels = {
            "hook": "Hook-Stärke",
            "flow": "Flow & Rhythmus",
            "visual_quality": "Bildqualität",
            "typography": "Typografie",
            "branding": "Branding",
            "emotional_impact": "Emotion/Story",
            "instagram_prognosis": "IG-Prognose",
        }
        print()
        for key, label in labels.items():
            score = scores.get(key, "?")
            if isinstance(score, (int, float)):
                bar = "█" * int(score) + "░" * (10 - int(score))
                print(f"  {label:<20} {bar} {score}/10")
            else:
                print(f"  {label:<20} {'?' * 10} ?/10")

    print("\n" + "-" * 55)
    print(result.get("text", ""))
    print("=" * 55)


def main():
    parser = argparse.ArgumentParser(description="Video Judge — Bewertet Shorts mit Gemini")
    parser.add_argument("video", help="Pfad zum Video (MP4)")
    parser.add_argument("--context", "-c", help="Zusätzlicher Kontext (Zielgruppe, Thema etc.)")
    parser.add_argument("--model", "-m", default="gemini-3.1-pro-preview",
                        help="Gemini-Modell (default: gemini-3.1-pro-preview)")
    parser.add_argument("--json", action="store_true", help="Nur JSON ausgeben")
    parser.add_argument("--output", "-o", help="Ergebnis als JSON speichern")
    args = parser.parse_args()

    result = judge_video(args.video, context=args.context, model=args.model)

    if args.json:
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print_report(result)

    if args.output:
        out = Path(args.output)
        out.write_text(json.dumps(result, indent=2, ensure_ascii=False))
        print(f"\nJSON gespeichert: {args.output}")


if __name__ == "__main__":
    main()
