"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function AccountSettings() {
  const t = useTranslations("account");
  const deleteWord = t("deleteWord");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function changePassword() {
    if (isSaving) return;
    setIsSaving(true);
    setStatus(t("updating"));

    try {
      const response = await fetch("/api/account", {
        body: JSON.stringify({ currentPassword, newPassword }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? t("cannotChange"));
      }

      setStatus(t("changedRelogin"));
      window.location.href = "/login";
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t("unknownError"));
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteAccount() {
    if (isSaving || deleteConfirmation !== deleteWord) return;
    setIsSaving(true);
    setStatus(t("deleting"));

    try {
      const response = await fetch("/api/account", {
        body: JSON.stringify({ currentPassword: deletePassword }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "DELETE",
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? t("cannotDelete"));
      }

      window.location.href = "/";
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t("unknownError"));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="mt-4 rounded-lg border border-[#ded9c8] bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#527b20]">
        {t("kicker")}
      </p>
      <h2 className="mt-2 text-2xl font-black">{t("title")}</h2>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg bg-[#fbfaf4] p-4">
          <h3 className="font-black">{t("changePassword")}</h3>
          <input
            className="mt-3 h-11 w-full rounded-lg border border-[#d8d2bf] bg-white px-3 text-sm font-semibold"
            onChange={(event) => setCurrentPassword(event.target.value)}
            placeholder={t("currentPassword")}
            type="password"
            value={currentPassword}
          />
          <input
            className="mt-3 h-11 w-full rounded-lg border border-[#d8d2bf] bg-white px-3 text-sm font-semibold"
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder={t("newPassword")}
            type="password"
            value={newPassword}
          />
          <button
            className="mt-3 min-h-11 w-full rounded-lg bg-[#15171d] px-4 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSaving || currentPassword.length < 1 || newPassword.length < 8}
            onClick={changePassword}
            type="button"
          >
            {t("updatePassword")}
          </button>
        </div>

        <div className="rounded-lg border border-[#d6c981] bg-[#fff7cc] p-4">
          <h3 className="font-black">{t("deleteAccount")}</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#5d531c]">
            {t("deleteBody")}
          </p>
          <input
            className="mt-3 h-11 w-full rounded-lg border border-[#d8d2bf] bg-white px-3 text-sm font-semibold"
            onChange={(event) => setDeletePassword(event.target.value)}
            placeholder={t("currentPassword")}
            type="password"
            value={deletePassword}
          />
          <input
            className="mt-3 h-11 w-full rounded-lg border border-[#d8d2bf] bg-white px-3 text-sm font-semibold"
            onChange={(event) => setDeleteConfirmation(event.target.value)}
            placeholder={t("typeDelete")}
            value={deleteConfirmation}
          />
          <button
            className="mt-3 min-h-11 w-full rounded-lg bg-[#15171d] px-4 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSaving || deleteConfirmation !== deleteWord || deletePassword.length < 1}
            onClick={deleteAccount}
            type="button"
          >
            {t("deleteFinal")}
          </button>
        </div>
      </div>
      {status ? (
        <p className="mt-4 rounded-lg bg-[#fbfaf4] p-3 text-sm font-semibold text-[#62695f]">
          {status}
        </p>
      ) : null}
    </section>
  );
}
