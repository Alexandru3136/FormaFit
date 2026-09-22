import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";

type WorkoutLogBody = {
  dayLabel?: unknown;
  exercises?: unknown;
  focus?: unknown;
  notes?: unknown;
};

function getWeekStart() {
  const date = new Date();
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

function mapWorkoutLog(log: {
  completedAt: Date;
  dayLabel: string;
  focus: string;
  id: string;
  notes: string;
}) {
  return {
    completedAt: log.completedAt.toISOString(),
    dayLabel: log.dayLabel,
    focus: log.focus,
    id: log.id,
    notes: log.notes,
  };
}

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Trebuie sa fii autentificat." }, { status: 401 });
  }

  const logs = await db.workoutLog.findMany({
    orderBy: {
      completedAt: "desc",
    },
    where: {
      userId: user.id,
      weekStart: getWeekStart(),
    },
  });

  return NextResponse.json({ logs: logs.map(mapWorkoutLog) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Trebuie sa fii autentificat." }, { status: 401 });
  }

  let body: WorkoutLogBody;

  try {
    body = (await request.json()) as WorkoutLogBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const dayLabel = typeof body.dayLabel === "string" ? body.dayLabel.trim().slice(0, 80) : "";
  const focus = typeof body.focus === "string" ? body.focus.trim().slice(0, 120) : "";
  const notes = typeof body.notes === "string" ? body.notes.trim().slice(0, 1000) : "";

  if (dayLabel.length < 2 || focus.length < 2) {
    return NextResponse.json({ error: "Ziua si tipul antrenamentului sunt necesare." }, { status: 400 });
  }

  const weekStart = getWeekStart();
  const exercisesJson = JSON.stringify(Array.isArray(body.exercises) ? body.exercises : []);
  const log = await db.workoutLog.upsert({
    create: {
      completedAt: new Date(),
      dayLabel,
      exercisesJson,
      focus,
      notes,
      userId: user.id,
      weekStart,
    },
    update: {
      completedAt: new Date(),
      exercisesJson,
      focus,
      notes,
    },
    where: {
      userId_weekStart_dayLabel: {
        dayLabel,
        userId: user.id,
        weekStart,
      },
    },
  });

  return NextResponse.json({ log: mapWorkoutLog(log) }, { status: 201 });
}
