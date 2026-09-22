import { NextResponse } from "next/server";
import type { UserProfile } from "@/features/profile/profile";
import { validateProfile } from "@/features/profile/profile";
import { db } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";

export async function PUT(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Trebuie sa fii autentificat." }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const profile = body as UserProfile;
  const validation = validateProfile(profile);

  if (!validation.isValid) {
    return NextResponse.json({ error: validation.errors.join(" ") }, { status: 400 });
  }

  await db.$transaction([
    db.user.update({
      data: {
        name: profile.name.trim(),
      },
      where: {
        id: user.id,
      },
    }),
    db.profile.upsert({
      create: {
        activityLevel: profile.activityLevel,
        age: profile.age,
        experienceLevel: profile.experienceLevel,
        foodPreferences: profile.foodPreferences.trim(),
        goal: profile.goal,
        heightCm: profile.heightCm,
        availableTrainingDays: profile.availableTrainingDays.join(","),
        restrictions: profile.restrictions.trim(),
        sex: profile.sex,
        trainingDaysPerWeek: profile.trainingDaysPerWeek,
        trainingPlace: profile.trainingPlace,
        userId: user.id,
        weightKg: profile.weightKg,
      },
      update: {
        activityLevel: profile.activityLevel,
        age: profile.age,
        experienceLevel: profile.experienceLevel,
        foodPreferences: profile.foodPreferences.trim(),
        goal: profile.goal,
        heightCm: profile.heightCm,
        availableTrainingDays: profile.availableTrainingDays.join(","),
        restrictions: profile.restrictions.trim(),
        sex: profile.sex,
        trainingDaysPerWeek: profile.trainingDaysPerWeek,
        trainingPlace: profile.trainingPlace,
        weightKg: profile.weightKg,
      },
      where: {
        userId: user.id,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
