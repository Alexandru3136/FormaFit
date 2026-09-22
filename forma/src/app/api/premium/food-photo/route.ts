import { NextResponse } from "next/server";
import { extractJsonObject } from "@/lib/server/ai-json";
import { requestOmniRouteChat } from "@/lib/server/omniroute";
import { getPremiumContext } from "@/lib/server/premium";

const maxImageSize = 5 * 1024 * 1024;
const ambiguousSpecificFoodPattern =
  /\b(paste|pasta|fusilli|spaghete|macaroane|orez|cartof|cartofi|carne|pui|vita|porc|sos)\b/i;

function noteRejectsFood(note: string, foodPattern: RegExp) {
  return new RegExp(`\\b(nu|fara)\\b.{0,24}${foodPattern.source}`, "i").test(note);
}

function shouldUseConservativeNames(note: string, itemName: string) {
  const trimmedNote = note.trim();

  if (trimmedNote.length === 0) {
    return ambiguousSpecificFoodPattern.test(itemName);
  }

  return noteRejectsFood(trimmedNote, ambiguousSpecificFoodPattern) &&
    ambiguousSpecificFoodPattern.test(itemName);
}

function sanitizeEstimate(value: unknown, note: string) {
  if (value === null || typeof value !== "object" || !("items" in value)) {
    return value;
  }

  const estimate = value as {
    confidence?: unknown;
    items?: unknown;
    notes?: unknown;
  };

  if (!Array.isArray(estimate.items)) {
    return estimate;
  }

  let sanitizedCount = 0;
  const items = estimate.items.map((item) => {
    if (item === null || typeof item !== "object") return item;

    const record = item as { name?: unknown };
    const name = typeof record.name === "string" ? record.name : "";

    if (!shouldUseConservativeNames(note, name)) {
      return record;
    }

    sanitizedCount += 1;
    return {
      ...record,
      name: "Component portocaliu neclar",
    };
  });

  if (sanitizedCount === 0) {
    return estimate;
  }

  const currentConfidence = Number(estimate.confidence);
  return {
    ...estimate,
    confidence: Number.isFinite(currentConfidence) ? Math.min(currentConfidence, 0.45) : 0.45,
    items,
    notes: `${typeof estimate.notes === "string" ? `${estimate.notes} ` : ""}Un aliment a fost redenumit prudent deoarece imaginea nu confirma clar denumirea initiala.`,
  };
}

export async function POST(request: Request) {
  const context = await getPremiumContext();
  if (context.error) return context.error;

  const formData = await request.formData();
  const image = formData.get("image");
  const note = String(formData.get("note") ?? "").slice(0, 500);
  const hasUserCorrection = note.trim().length > 0;

  if (!(image instanceof File)) {
    return NextResponse.json({ error: "Incarca o imagine." }, { status: 400 });
  }

  if (!image.type.startsWith("image/") || image.size > maxImageSize) {
    return NextResponse.json(
      { error: "Imaginea trebuie sa fie un fisier image/* sub 5MB." },
      { status: 400 },
    );
  }

  const bytes = Buffer.from(await image.arrayBuffer());
  const dataUrl = `data:${image.type};base64,${bytes.toString("base64")}`;

  try {
    const answer = await requestOmniRouteChat({
      messages: [
        {
          role: "system",
          content:
            "You estimate Romanian food from an image for a fitness app. Return only valid JSON with keys confidence, notes, items, totals. items contain name, portion, calories, proteinGrams, carbGrams, fatGrams. totals contain calories, proteinGrams, carbGrams, fatGrams. Never invent a specific food name from shape or color alone. If the user did not provide a correction/description, ambiguous components must use cautious visual names such as 'component portocaliu neclar', 'leguma verde vizibila', or 'garnitura neclara', not pasta, rice, potato, meat, cheese, or sauce. Use specific food names only when they are visually unmistakable or explicitly mentioned by the user note. If the user note corrects what is in the image, prioritize that note over visual guessing. If no user note is provided, confidence must be 0.65 or lower unless every item is unmistakable. Be conservative and state uncertainty in notes.",
        },
        {
          role: "user",
          content: [
            {
              text: JSON.stringify({
                hasUserCorrection,
                note,
                profile: context.profile,
              }),
              type: "text",
            },
            {
              image_url: {
                url: dataUrl,
              },
              type: "image_url",
            },
          ],
        },
      ],
      temperature: 0.1,
    });

    const estimate = sanitizeEstimate(extractJsonObject(answer), note);

    return NextResponse.json({ estimate });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown food photo error." },
      { status: 502 },
    );
  }
}
