import type { UserProfile } from "@/features/profile/profile";
import { trainingDayLabel, trainingDayOptions } from "@/features/profile/profile";

export type Exercise = {
  name: string;
  muscles: string;
  cue: string;
  sets: string;
  image: string;
};

export type WorkoutDay = {
  day: string;
  focus: string;
  detail: string;
  exercises: Exercise[];
};

const gymExercises = {
  squat: {
    cue: "Coboara controlat, tine trunchiul stabil si impinge prin mijlocul talpii.",
    image: "/exercises/squat.png",
    muscles: "Picioare, fesieri, trunchi",
    name: "Genuflexiuni",
    sets: "3 x 8-10",
  },
  row: {
    cue: "Trage coatele inapoi, mentine pieptul deschis si evita balansul.",
    image: "/exercises/cable-row.png",
    muscles: "Spate, biceps",
    name: "Ramat la cablu",
    sets: "3 x 10-12",
  },
  press: {
    cue: "Controleaza coborarea si pastreaza umerii jos, fara arcuire agresiva.",
    image: "/exercises/dumbbell-press.png",
    muscles: "Piept, umeri, triceps",
    name: "Impins cu gantere",
    sets: "3 x 8-12",
  },
  hinge: {
    cue: "Impinge soldurile inapoi, spatele ramane neutru si miscarea vine din sold.",
    image: "/exercises/romanian-deadlift.png",
    muscles: "Fesieri, femurali, spate",
    name: "Indreptari romanesti",
    sets: "3 x 8-10",
  },
  shoulder: {
    cue: "Impinge vertical, strange abdomenul si nu ridica umerii spre urechi.",
    image: "/exercises/shoulder-press.png",
    muscles: "Umeri, triceps",
    name: "Impins deasupra capului",
    sets: "3 x 8-10",
  },
  plank: {
    cue: "Coastele jos, bazin neutru, respira lent si nu lasa soldurile sa cada.",
    image: "/exercises/plank.png",
    muscles: "Abdomen, trunchi",
    name: "Plank",
    sets: "3 x 30-45 sec",
  },
};

const homeExercises = {
  squat: { ...gymExercises.squat, name: "Genuflexiuni cu greutatea corpului", sets: "4 x 12-15" },
  row: { ...gymExercises.row, name: "Ramat cu elastic/prosop", sets: "3 x 12-15" },
  press: { ...gymExercises.press, name: "Flotari inclinate", sets: "3 x 8-12" },
  hinge: { ...gymExercises.hinge, name: "Hip hinge cu rucsac", sets: "3 x 12" },
  shoulder: { ...gymExercises.shoulder, name: "Pike push-up", sets: "3 x 6-10" },
  plank: gymExercises.plank,
};

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

function pickLibrary(profile: UserProfile) {
  return profile.trainingPlace === "home" ? homeExercises : gymExercises;
}

function volumeForGoal(profile: UserProfile) {
  if (profile.goal === "lose") return "pauze 60-90 sec, ritm constant";
  if (profile.goal === "gain") return "pauze 90-150 sec, progres pe greutati";
  return "pauze 75-120 sec, tehnica si consecventa";
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
  const exercises = pickLibrary(profile);
  const selectedDays = pickTrainingDays(profile);
  const volumeNote = volumeForGoal(profile);

  if (selectedDays.length <= 3) {
    const fullBodyVariants = [
      {
        detail: `Baza si forta; ${volumeNote}.`,
        exercises: [exercises.squat, exercises.press, exercises.row, exercises.plank],
        focus: "Full-body A",
      },
      {
        detail: `Posterior chain si umeri; ${volumeNote}.`,
        exercises: [exercises.hinge, exercises.shoulder, exercises.row, exercises.plank],
        focus: "Full-body B",
      },
      {
        detail: `Volum moderat si control; ${volumeNote}.`,
        exercises: [exercises.squat, exercises.hinge, exercises.press, exercises.plank],
        focus: "Full-body C",
      },
    ];

    return selectedDays.map((day, index) => ({
      day: trainingDayLabel(day),
      ...fullBodyVariants[index % fullBodyVariants.length],
    }));
  }

  const split = [
    {
      detail: `Piept, spate si umeri; ${volumeNote}.`,
      exercises: [exercises.press, exercises.row, exercises.shoulder],
      focus: "Upper",
    },
    {
      detail: `Picioare, fesieri si abdomen; ${volumeNote}.`,
      exercises: [exercises.squat, exercises.hinge, exercises.plank],
      focus: "Lower",
    },
  ];

  return selectedDays.map((day, index) => ({
    day: trainingDayLabel(day),
    ...split[index % split.length],
  }));
}

export function buildExerciseLibrary(profile: UserProfile): Exercise[] {
  const exercises = pickLibrary(profile);
  return [exercises.squat, exercises.row, exercises.press, exercises.hinge, exercises.shoulder, exercises.plank];
}
