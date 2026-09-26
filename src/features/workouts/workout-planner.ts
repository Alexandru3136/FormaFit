import type { UserProfile } from "@/features/profile/profile";
import { trainingDayOptions } from "@/features/profile/profile";

export type ExerciseKey = "squat" | "row" | "press" | "hinge" | "shoulder" | "plank";

export type PlannedExercise = {
  key: ExerciseKey;
  place: "gym" | "home";
  sets: string;
  image: string;
};

export type WorkoutDay = {
  day: UserProfile["availableTrainingDays"][number];
  focusKey: string;
  detailKey: string;
  volumeKey: "lose" | "gain" | "maintain";
  exercises: PlannedExercise[];
};

const exerciseImages: Record<ExerciseKey, string> = {
  squat: "/exercises/squat.png",
  row: "/exercises/cable-row.png",
  press: "/exercises/dumbbell-press.png",
  hinge: "/exercises/romanian-deadlift.png",
  shoulder: "/exercises/shoulder-press.png",
  plank: "/exercises/plank.png",
};

const gymSets: Record<ExerciseKey, string> = {
  squat: "3 x 8-10",
  row: "3 x 10-12",
  press: "3 x 8-12",
  hinge: "3 x 8-10",
  shoulder: "3 x 8-10",
  plank: "3 x 30-45 sec",
};

const homeSets: Record<ExerciseKey, string> = {
  squat: "4 x 12-15",
  row: "3 x 12-15",
  press: "3 x 8-12",
  hinge: "3 x 12",
  shoulder: "3 x 6-10",
  plank: "3 x 30-45 sec",
};

function volumeKeyForGoal(profile: UserProfile): WorkoutDay["volumeKey"] {
  if (profile.goal === "lose") return "lose";
  if (profile.goal === "gain") return "gain";
  return "maintain";
}

type TrainingDayCount = 1 | 2 | 3 | 4 | 5 | 6 | 7;

const fallbackDays: Record<TrainingDayCount, UserProfile["availableTrainingDays"]> = {
  1: ["wednesday"],
  2: ["tuesday", "friday"],
  3: ["monday", "wednesday", "friday"],
  4: ["monday", "tuesday", "thursday", "friday"],
  5: ["monday", "tuesday", "wednesday", "friday", "saturday"],
  6: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
  7: trainingDayOptions,
};

function placeForProfile(profile: UserProfile): "gym" | "home" {
  return profile.trainingPlace === "home" ? "home" : "gym";
}

function makeExercise(key: ExerciseKey, place: "gym" | "home"): PlannedExercise {
  return {
    key,
    place,
    image: exerciseImages[key],
    sets: place === "home" ? homeSets[key] : gymSets[key],
  };
}

function pickTrainingDays(profile: UserProfile) {
  const trainingDays = Math.min(Math.max(profile.trainingDaysPerWeek, 1), 7) as TrainingDayCount;
  const availableDays = trainingDayOptions.filter((day) =>
    profile.availableTrainingDays.includes(day),
  );
  const usableDays = availableDays.length > 0 ? availableDays : fallbackDays[trainingDays];

  if (usableDays.length >= trainingDays) {
    return usableDays.slice(0, trainingDays);
  }

  return fallbackDays[trainingDays];
}

export function buildWorkoutPlan(profile: UserProfile): WorkoutDay[] {
  const place = placeForProfile(profile);
  const selectedDays = pickTrainingDays(profile);
  const volumeKey = volumeKeyForGoal(profile);
  const ex = (key: ExerciseKey) => makeExercise(key, place);

  if (selectedDays.length <= 3) {
    const fullBodyVariants = [
      { focusKey: "fullBodyA", detailKey: "base", exercises: [ex("squat"), ex("press"), ex("row"), ex("plank")] },
      { focusKey: "fullBodyB", detailKey: "posterior", exercises: [ex("hinge"), ex("shoulder"), ex("row"), ex("plank")] },
      { focusKey: "fullBodyC", detailKey: "moderate", exercises: [ex("squat"), ex("hinge"), ex("press"), ex("plank")] },
    ];

    return selectedDays.map((day, index) => ({
      day,
      volumeKey,
      ...fullBodyVariants[index % fullBodyVariants.length],
    }));
  }

  const split = [
    { focusKey: "upper", detailKey: "upper", exercises: [ex("press"), ex("row"), ex("shoulder")] },
    { focusKey: "lower", detailKey: "lower", exercises: [ex("squat"), ex("hinge"), ex("plank")] },
  ];

  return selectedDays.map((day, index) => ({
    day,
    volumeKey,
    ...split[index % split.length],
  }));
}

export function buildExerciseLibrary(profile: UserProfile): PlannedExercise[] {
  const place = placeForProfile(profile);
  return (["squat", "row", "press", "hinge", "shoulder", "plank"] as ExerciseKey[]).map((key) =>
    makeExercise(key, place),
  );
}
