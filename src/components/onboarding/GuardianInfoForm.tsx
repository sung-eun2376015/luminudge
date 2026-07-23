// src/components/onboarding/GuardianInfoForm.tsx
"use client";

import { useState } from "react";
import type { GuardianInfo } from "@/types/onboarding";

const MIN_AGE = 2;
const MAX_AGE = 7;

export default function GuardianInfoForm({
  onSubmit,
}: {
  onSubmit: (info: GuardianInfo) => void;
}) {
  const [ageYears, setAgeYears] = useState<string>("");
  const [gender, setGender] = useState<GuardianInfo["gender"] | "">("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const age = Number(ageYears);
    if (!ageYears || Number.isNaN(age) || age < MIN_AGE || age > MAX_AGE) {
      setError(`아이 나이를 ${MIN_AGE}~${MAX_AGE}세 사이로 입력해주세요.`);
      return;
    }
    if (!gender) {
      setError("아이 성별을 선택해주세요.");
      return;
    }

    setError(null);
    onSubmit({ ageYears: age, gender });
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
      <div>
        <h1 className="text-xl font-semibold">아이 정보를 입력해주세요</h1>
        <p className="mt-1 text-sm text-gray-500">
          입력한 정보는 발달 티어 분류에 사용돼요.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="ageYears" className="block text-sm font-medium">
          아이 나이 (만 나이)
        </label>
        <input
          id="ageYears"
          type="number"
          inputMode="numeric"
          min={MIN_AGE}
          max={MAX_AGE}
          value={ageYears}
          onChange={(e) => setAgeYears(e.target.value)}
          placeholder="예: 4"
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
        />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">아이 성별</legend>
        <div className="flex gap-4">
          {(
            [
              { value: "male", label: "남아" },
              { value: "female", label: "여아" },
            ] as const
          ).map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 text-sm"
            >
              <input
                type="radio"
                name="gender"
                value={option.value}
                checked={gender === option.value}
                onChange={() => setGender(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        className="w-full rounded-md bg-black py-2 text-white transition hover:bg-gray-800"
      >
        다음
      </button>
    </form>
  );
}
