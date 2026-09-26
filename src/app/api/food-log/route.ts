import { NextResponse } from "next/server";
import type { FoodEstimateItem } from "@/features/food-log/food-log";
import { db } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";

type SaveMealRequest = {
  estimate?: {
    confidence?: unknown;
    items?: unknown;
    mealType?: unknown;
    notes?: unknown;
    totals?: {
      calories?: unknown;
      carbGrams?: unknown;
      fatGrams?: unknown;
      proteinGrams?: unknown;
    };
  };
  rawText?: unknown;
};

function parseItems(value: unknown): FoodEstimateItem[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 20).map((item) => {
    const record = item as Partial<FoodEstimateItem>;
    return {
      calories: Number(record.calories ?? 0),
      carbGrams: Number(record.carbGrams ?? 0),
      fatGrams: Number(record.fatGrams ?? 0),
      name: String(record.name ?? "Aliment").slice(0, 120),
      portion: String(record.portion ?? "portie").slice(0, 120),
      proteinGrams: Number(record.proteinGrams ?? 0),
    };
  });
}

function mapMealLog(mealLog: {
  calories: number;
  carbGrams: number;
  confidence: string;
  createdAt: Date;
  fatGrams: number;
  id: string;
  itemsJson: string;
  mealType: string;
  notes: string;
  proteinGrams: number;
  rawText: string;
}) {
  return {
    confidence: mealLog.confidence,
    createdAt: mealLog.createdAt.toISOString(),
    id: mealLog.id,
    items: parseItems(JSON.parse(mealLog.itemsJson) as unknown),
    mealType: mealLog.mealType,
    notes: mealLog.notes,
    rawText: mealLog.rawText,
    totals: {
      calories: mealLog.calories,
      carbGrams: mealLog.carbGrams,
      fatGrams: mealLog.fatGrams,
      proteinGrams: mealLog.proteinGrams,
    },
  };
}

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Trebuie sa fii autentificat." }, { status: 401 });
  }

  const mealLogs = await db.mealLog.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
    where: {
      userId: user.id,
    },
  });

  return NextResponse.json({ entries: mealLogs.map(mapMealLog) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Trebuie sa fii autentificat." }, { status: 401 });
  }

  let body: SaveMealRequest;

  try {
    body = (await request.json()) as SaveMealRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const rawText = typeof body.rawText === "string" ? body.rawText.trim() : "";
  const estimate = body.estimate;

  if (!estimate || rawText.length < 3) {
    return NextResponse.json({ error: "Masa nu poate fi salvata." }, { status: 400 });
  }

  const items = parseItems(estimate.items);
  const mealLog = await db.mealLog.create({
    data: {
      calories: Number(estimate.totals?.calories ?? 0),
      carbGrams: Number(estimate.totals?.carbGrams ?? 0),
      confidence: String(estimate.confidence ?? "low"),
      fatGrams: Number(estimate.totals?.fatGrams ?? 0),
      itemsJson: JSON.stringify(items),
      mealType: String(estimate.mealType ?? "snack"),
      notes: String(estimate.notes ?? "").slice(0, 1000),
      proteinGrams: Number(estimate.totals?.proteinGrams ?? 0),
      rawText: rawText.slice(0, 1000),
      userId: user.id,
    },
  });

  return NextResponse.json({ entry: mapMealLog(mealLog) }, { status: 201 });
}
