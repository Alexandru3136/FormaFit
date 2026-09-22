"use client";

import { useMemo, useState } from "react";
import {
  activityLabel,
  calculateTargets,
  goalLabel,
} from "@/features/nutrition/calorie-calculator";
import {
  activityOptions,
  experienceLabel,
  experienceOptions,
  goalOptions,
  sexOptions,
  trainingDayLabel,
  trainingDayOptions,
  trainingPlaceLabel,
  trainingPlaceOptions,
  type TrainingDay,
  type UserProfile,
  validateProfile,
} from "@/features/profile/profile";
import { readStoredProfile, writeStoredProfile } from "@/features/profile/profile-storage";

type ProfileFormProps = {
  initialProfile: UserProfile;
  redirectTo?: string;
};

type SegmentProps<T extends string> = {
  label: string;
  options: T[];
  value: T;
  format: (value: T) => string;
  onChange: (value: T) => void;
};

function Segment<T extends string>({ label, options, value, format, onChange }: SegmentProps<T>) {
  return (
    <div>
      <p className="text-sm font-black text-[#535b50]">{label}</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {options.map((option) => {
          const isSelected = option === value;
          return (
            <button
              className={`min-h-11 rounded-lg border px-3 py-2 text-sm font-black transition ${
                isSelected
                  ? "border-[#123f31] bg-[#123f31] text-[#c8ff55]"
                  : "border-[#d8d2bf] bg-[#fbfaf4] text-[#384034] hover:bg-white"
              }`}
              key={option}
              onClick={() => onChange(option)}
              type="button"
            >
              {format(option)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-[#535b50]">{label}</span>
      <input
        className="mt-2 h-12 w-full rounded-lg border border-[#d8d2bf] bg-[#fbfaf4] px-4 text-base font-bold outline-none focus:border-[#123f31]"
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        type="number"
        value={value}
      />
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-[#535b50]">{label}</span>
      <input
        className="mt-2 h-12 w-full rounded-lg border border-[#d8d2bf] bg-[#fbfaf4] px-4 text-base font-bold outline-none focus:border-[#123f31]"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="text"
        value={value}
      />
    </label>
  );
}

function TrainingDaysPicker({
  selectedDays,
  onChange,
}: {
  selectedDays: TrainingDay[];
  onChange: (days: TrainingDay[]) => void;
}) {
  function toggleDay(day: TrainingDay) {
    const nextDays = selectedDays.includes(day)
      ? selectedDays.filter((selectedDay) => selectedDay !== day)
      : [...selectedDays, day];

    onChange(trainingDayOptions.filter((option) => nextDays.includes(option)));
  }

  return (
    <div>
      <p className="text-sm font-black text-[#535b50]">Zile disponibile</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-4">
        {trainingDayOptions.map((day) => {
          const isSelected = selectedDays.includes(day);
          return (
            <button
              className={`min-h-11 rounded-lg border px-3 py-2 text-sm font-black transition ${
                isSelected
                  ? "border-[#123f31] bg-[#123f31] text-[#c8ff55]"
                  : "border-[#d8d2bf] bg-[#fbfaf4] text-[#384034] hover:bg-white"
              }`}
              key={day}
              onClick={() => toggleDay(day)}
              type="button"
            >
              {trainingDayLabel(day)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ProfileForm({ initialProfile, redirectTo = "/dashboard" }: ProfileFormProps) {
  const [profile, setProfile] = useState(() => {
    const storedProfile = readStoredProfile();
    return initialProfile.name ? initialProfile : storedProfile;
  });
  const [status, setStatus] = useState("Completeaza profilul ca sa calculam tintele tale.");
  const [isSaving, setIsSaving] = useState(false);

  const validation = useMemo(() => validateProfile(profile), [profile]);
  const targets = useMemo(() => calculateTargets(profile), [profile]);

  function updateProfile<T extends keyof UserProfile>(key: T, value: UserProfile[T]) {
    setProfile((current) => ({ ...current, [key]: value }));
    setStatus("Ai modificari nesalvate.");
  }

  function updateTrainingDaysPerWeek(value: number) {
    setProfile((current) => ({
      ...current,
      trainingDaysPerWeek: value,
    }));
    setStatus("Ai modificari nesalvate.");
  }

  function updateAvailableTrainingDays(days: TrainingDay[]) {
    setProfile((current) => ({
      ...current,
      availableTrainingDays: days,
      trainingDaysPerWeek: Math.min(current.trainingDaysPerWeek, Math.max(days.length, 1)),
    }));
    setStatus("Ai modificari nesalvate.");
  }

  async function saveProfile() {
    const result = validateProfile(profile);
    if (!result.isValid) {
      setStatus("Verifica erorile inainte de salvare.");
      return;
    }

    setIsSaving(true);
    setStatus("Se salveaza profilul...");

    try {
      const response = await fetch("/api/profile", {
        body: JSON.stringify(profile),
        headers: {
          "Content-Type": "application/json",
        },
        method: "PUT",
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Profilul nu a putut fi salvat.");
      }

      writeStoredProfile(profile);
      window.location.href = redirectTo;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Eroare necunoscuta.");
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
      <section className="rounded-lg border border-[#ded9c8] bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black">Profil personal</h2>
        <p className="mt-2 text-sm leading-6 text-[#62695f]">
          Aceste date vor alimenta calculatorul, dashboard-ul, planurile de mese si
          planurile de antrenament.
        </p>

        <div className="mt-5 grid gap-4">
          <TextField
            label="Nume"
            onChange={(value) => updateProfile("name", value)}
            placeholder="Ex: Ana"
            value={profile.name}
          />

          <Segment
            format={(option) => (option === "female" ? "Femeie" : "Barbat")}
            label="Sex"
            onChange={(value) => updateProfile("sex", value)}
            options={sexOptions}
            value={profile.sex}
          />

          <div className="grid gap-3 sm:grid-cols-3">
            <NumberField label="Varsta" max={90} min={14} onChange={(value) => updateProfile("age", value)} value={profile.age} />
            <NumberField label="Inaltime cm" max={230} min={120} onChange={(value) => updateProfile("heightCm", value)} value={profile.heightCm} />
            <NumberField label="Greutate kg" max={250} min={35} onChange={(value) => updateProfile("weightKg", value)} value={profile.weightKg} />
          </div>

          <Segment format={goalLabel} label="Obiectiv" onChange={(value) => updateProfile("goal", value)} options={goalOptions} value={profile.goal} />
          <Segment format={activityLabel} label="Activitate" onChange={(value) => updateProfile("activityLevel", value)} options={activityOptions} value={profile.activityLevel} />

          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField
              label="Zile sala / saptamana"
              max={7}
              min={1}
              onChange={updateTrainingDaysPerWeek}
              value={profile.trainingDaysPerWeek}
            />
            <Segment
              format={trainingPlaceLabel}
              label="Unde te antrenezi"
              onChange={(value) => updateProfile("trainingPlace", value)}
              options={trainingPlaceOptions}
              value={profile.trainingPlace}
            />
          </div>

          <TrainingDaysPicker
            onChange={updateAvailableTrainingDays}
            selectedDays={profile.availableTrainingDays}
          />

          <Segment
            format={experienceLabel}
            label="Experienta"
            onChange={(value) => updateProfile("experienceLevel", value)}
            options={experienceOptions}
            value={profile.experienceLevel}
          />

          <TextField label="Preferinte alimentare" onChange={(value) => updateProfile("foodPreferences", value)} value={profile.foodPreferences} />
          <TextField label="Restrictii / alergii" onChange={(value) => updateProfile("restrictions", value)} value={profile.restrictions} />
        </div>

        {!validation.isValid ? (
          <div className="mt-5 rounded-lg border border-[#d6c981] bg-[#fff7cc] p-4 text-sm font-semibold leading-6 text-[#5d531c]">
            {validation.errors.join(" ")}
          </div>
        ) : null}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            className="min-h-12 rounded-lg bg-[#15171d] px-5 py-3 text-sm font-black text-white transition hover:bg-[#252832]"
            disabled={isSaving}
            onClick={saveProfile}
            type="button"
          >
            {isSaving ? "Se salveaza..." : "Salveaza profil"}
          </button>
          <p className="text-sm font-semibold text-[#62695f]">{status}</p>
        </div>
      </section>

      <aside className="rounded-lg bg-[#111317] p-5 text-white shadow-sm">
        <p className="text-sm font-black text-[#c8ff55]">Rezultat profil</p>
        <h2 className="mt-2 text-3xl font-black">{targets.calories} kcal</h2>
        <p className="mt-2 text-sm leading-6 text-[#dce3d7]">
          Tinta zilnica pentru {goalLabel(profile.goal).toLowerCase()}, cu{" "}
          {profile.trainingDaysPerWeek} zile de antrenament pe saptamana.
        </p>

        <dl className="mt-5 grid gap-3">
          <div className="rounded-lg bg-white/[0.07] p-4">
            <dt className="text-xs font-black uppercase tracking-[0.12em] text-[#c8ff55]">
              BMR / TDEE
            </dt>
            <dd className="mt-2 text-lg font-black">
              {targets.bmr} / {targets.tdee} kcal
            </dd>
          </div>
          <div className="rounded-lg bg-white/[0.07] p-4">
            <dt className="text-xs font-black uppercase tracking-[0.12em] text-[#c8ff55]">
              Macro-uri
            </dt>
            <dd className="mt-2 text-sm font-bold leading-6">
              {targets.proteinGrams}g proteine, {targets.fatGrams}g grasimi,{" "}
              {targets.carbGrams}g carbohidrati
            </dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
