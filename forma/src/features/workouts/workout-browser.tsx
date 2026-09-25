"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { PlannedExercise, WorkoutDay } from "@/features/workouts/workout-planner";

type WorkoutBrowserProps = {
  plan: WorkoutDay[];
  trainingDaysPerWeek: number;
};

type WorkoutLog = {
  completedAt: string;
  dayLabel: string;
  focus: string;
  id: string;
  notes: string;
};

export function WorkoutBrowser({ plan, trainingDaysPerWeek }: WorkoutBrowserProps) {
  const t = useTranslations("workoutBrowser");
  const td = useTranslations("days");
  const tw = useTranslations("workout");
  const tex = useTranslations("exercises");

  const dayName = (day: string) => td(day);
  const focusName = (focusKey: string) => tw(`focus.${focusKey}`);
  const detailText = (day: WorkoutDay) =>
    tw(`detail.${day.detailKey}`, { volume: tw(`volume.${day.volumeKey}`) });
  const exerciseName = (exercise: PlannedExercise) =>
    tex(`${exercise.key}Name${exercise.place === "home" ? "Home" : "Gym"}`);

  const [selectedDay, setSelectedDay] = useState(plan[0]?.day ?? "");
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const activeDay = useMemo(
    () => plan.find((day) => day.day === selectedDay) ?? plan[0],
    [plan, selectedDay],
  );
  const completedDays = useMemo(() => new Set(logs.map((log) => log.dayLabel)), [logs]);
  const activeLog = activeDay ? logs.find((log) => log.dayLabel === activeDay.day) : null;

  useEffect(() => {
    let isMounted = true;

    async function loadLogs() {
      try {
        const response = await fetch("/api/workout-log");
        const payload = (await response.json()) as { logs?: WorkoutLog[] };

        if (isMounted) {
          setLogs(payload.logs ?? []);
        }
      } catch {
        if (isMounted) {
          setLogs([]);
        }
      }
    }

    void loadLogs();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      setNotes(activeLog?.notes ?? "");
      setStatus("");
    });
  }, [activeLog?.notes, selectedDay]);

  async function completeWorkout() {
    if (!activeDay || isSaving) return;

    setIsSaving(true);
    setStatus(t("saving"));

    try {
      const response = await fetch("/api/workout-log", {
        body: JSON.stringify({
          dayLabel: activeDay.day,
          exercises: activeDay.exercises.map((exercise) => ({
            name: exerciseName(exercise),
            sets: exercise.sets,
          })),
          focus: focusName(activeDay.focusKey),
          notes,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json()) as { error?: string; log?: WorkoutLog };

      if (!response.ok || !payload.log) {
        throw new Error(payload.error ?? t("cannotSave"));
      }

      setLogs((current) => [
        payload.log as WorkoutLog,
        ...current.filter((log) => log.dayLabel !== payload.log?.dayLabel),
      ]);
      setStatus(t("saved"));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t("unknownError"));
    } finally {
      setIsSaving(false);
    }
  }

  if (!activeDay) {
    return null;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[0.82fr_1.18fr]">
      <section className="rounded-lg border border-[#ded9c8] bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black">{t("currentWeek")}</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-[#62695f]">
          {t("chooseDay", { days: trainingDaysPerWeek })}
        </p>

        <div className="mt-4 grid gap-3">
          {plan.map((day) => {
            const isSelected = day.day === activeDay.day;
            const isCompleted = completedDays.has(day.day);
            return (
              <button
                className={`rounded-lg border p-4 text-left transition ${
                  isSelected
                    ? "border-[#123f31] bg-[#123f31] text-white shadow-sm"
                    : "border-transparent bg-[#fbfaf4] text-[#101211] hover:border-[#c8ff55]"
                }`}
                data-testid={`workout-day-${day.day}`}
                key={day.day}
                onClick={() => setSelectedDay(day.day)}
                type="button"
              >
                <p
                  className={`text-xs font-black uppercase tracking-[0.12em] ${
                    isSelected ? "text-[#c8ff55]" : "text-[#527b20]"
                  }`}
                >
                  {dayName(day.day)}
                </p>
                <h3 className="mt-1 text-lg font-black">{focusName(day.focusKey)}</h3>
                <p className={`mt-1 text-sm ${isSelected ? "text-[#edf4e7]" : "text-[#656b62]"}`}>
                  {t("exercisesDetail", { count: day.exercises.length, detail: detailText(day) })}
                </p>
                {isCompleted ? (
                  <span
                    className={`mt-3 inline-flex rounded-lg px-3 py-1 text-xs font-black ${
                      isSelected ? "bg-[#c8ff55] text-[#101211]" : "bg-[#123f31] text-[#c8ff55]"
                    }`}
                  >
                    {t("done")}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border border-[#ded9c8] bg-white p-5 shadow-sm">
        <div
          className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"
          data-testid="active-workout-day"
        >
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#527b20]">
              {dayName(activeDay.day)}
            </p>
            <h2 className="mt-1 text-2xl font-black">{focusName(activeDay.focusKey)}</h2>
          </div>
          <p className="text-sm font-semibold text-[#62695f]">{detailText(activeDay)}</p>
        </div>

        <div className="mt-5 rounded-lg border border-[#e6e1d1] bg-[#fbfaf4] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black text-[#527b20]">
                {activeLog ? t("savedWorkout") : t("tracking")}
              </p>
              <p className="mt-1 text-sm font-semibold leading-6 text-[#62695f]">
                {t("trackingBody")}
              </p>
            </div>
            <button
              className="min-h-11 rounded-lg bg-[#15171d] px-4 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSaving}
              onClick={completeWorkout}
              type="button"
            >
              {isSaving ? t("savingBtn") : activeLog ? t("update") : t("markDone")}
            </button>
          </div>
          <textarea
            className="mt-3 min-h-24 w-full resize-none rounded-lg border border-[#d8d2bf] bg-white p-3 text-sm font-semibold leading-6 outline-none focus:border-[#123f31]"
            onChange={(event) => setNotes(event.target.value)}
            placeholder={t("notesPlaceholder")}
            value={notes}
          />
          {status ? (
            <p className="mt-3 text-sm font-semibold text-[#62695f]">{status}</p>
          ) : null}
        </div>

        <div className="mt-5 grid gap-4">
          {activeDay.exercises.map((exercise, index) => (
            <article
              className={
                index === 0
                  ? "rounded-lg bg-[#fbfaf4] p-4"
                  : "grid gap-4 rounded-lg bg-[#fbfaf4] p-4 sm:grid-cols-[180px_1fr]"
              }
              key={exercise.key}
            >
              <Image
                alt={t("photoAlt", { name: exerciseName(exercise) })}
                className={
                  index === 0
                    ? "h-64 w-full rounded-lg object-cover"
                    : "h-36 w-full rounded-lg object-cover"
                }
                height={720}
                priority={index === 0}
                src={exercise.image}
                width={1280}
              />
              <div className={index === 0 ? "mt-4" : ""}>
                <p className="text-sm font-black text-[#527b20]">{tex(`${exercise.key}Muscles`)}</p>
                <h3 className="mt-1 text-xl font-black">{exerciseName(exercise)}</h3>
                <p className="mt-2 w-fit rounded-lg bg-[#c8ff55] px-3 py-2 text-sm font-black text-[#101211]">
                  {exercise.sets}
                </p>
                <p className="mt-3 text-sm font-semibold leading-6 text-[#656b62]">
                  {tex(`${exercise.key}Cue`)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
