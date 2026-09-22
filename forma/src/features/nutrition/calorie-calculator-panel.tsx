"use client";

import { useMemo, useState } from "react";
import {
  type ActivityLevel,
  type CalorieInput,
  type Goal,
  type Sex,
  activityLabel,
  calculateTargets,
  goalLabel,
} from "@/features/nutrition/calorie-calculator";

const initialInput: CalorieInput = {
  sex: "female",
  age: 29,
  heightCm: 168,
  weightKg: 72,
  activityLevel: "moderate",
  goal: "lose",
};

type CalorieCalculatorPanelProps = {
  initialProfile?: CalorieInput;
};

const goals: Goal[] = ["lose", "maintain", "gain"];
const activityLevels: ActivityLevel[] = [
  "sedentary",
  "light",
  "moderate",
  "active",
  "very-active",
];

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

function Segment<T extends string>({
  label,
  options,
  value,
  format,
  onChange,
}: {
  label: string;
  options: T[];
  value: T;
  format: (option: T) => string;
  onChange: (value: T) => void;
}) {
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

export function CalorieCalculatorPanel({ initialProfile }: CalorieCalculatorPanelProps) {
  const [input, setInput] = useState(initialProfile ?? initialInput);
  const targets = useMemo(() => calculateTargets(input), [input]);

  function updateInput<T extends keyof CalorieInput>(key: T, value: CalorieInput[T]) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
      <section className="rounded-lg border border-[#ded9c8] bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black">Calculator profil</h2>
        <p className="mt-2 text-sm leading-6 text-[#62695f]">
          Pornim din profilul tau salvat si folosim formula Mifflin-St Jeor pentru
          BMR, apoi ajustam dupa activitate si obiectiv.
        </p>

        <div className="mt-5 grid gap-4">
          <Segment<Sex>
            format={(option) => (option === "female" ? "Femeie" : "Barbat")}
            label="Sex"
            onChange={(value) => updateInput("sex", value)}
            options={["female", "male"]}
            value={input.sex}
          />

          <div className="grid gap-3 sm:grid-cols-3">
            <NumberField
              label="Varsta"
              max={90}
              min={14}
              onChange={(value) => updateInput("age", value)}
              value={input.age}
            />
            <NumberField
              label="Inaltime cm"
              max={230}
              min={120}
              onChange={(value) => updateInput("heightCm", value)}
              value={input.heightCm}
            />
            <NumberField
              label="Greutate kg"
              max={250}
              min={35}
              onChange={(value) => updateInput("weightKg", value)}
              value={input.weightKg}
            />
          </div>

          <Segment<Goal>
            format={goalLabel}
            label="Obiectiv"
            onChange={(value) => updateInput("goal", value)}
            options={goals}
            value={input.goal}
          />

          <Segment<ActivityLevel>
            format={activityLabel}
            label="Activitate"
            onChange={(value) => updateInput("activityLevel", value)}
            options={activityLevels}
            value={input.activityLevel}
          />
        </div>
      </section>

      <aside className="rounded-lg bg-[#111317] p-5 text-white shadow-sm">
        <p className="text-sm font-black text-[#c8ff55]">Tinte calculate</p>
        <h2 className="mt-2 text-3xl font-black">{targets.calories} kcal</h2>
        <p className="mt-2 text-sm leading-6 text-[#dce3d7]">
          Estimare zilnica pentru {goalLabel(input.goal).toLowerCase()}, bazata pe
          activitatea aleasa.
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
