"use client";

import { useState } from "react";

type ChatMessage = {
  role: "assistant" | "user";
  text: string;
};

const initialMessages: ChatMessage[] = [
  {
    role: "assistant",
    text: "Salut. Spune-mi ce vrei sa rezolvam azi: masa urmatoare, un antrenament, calorii, progres sau o revenire dupa o zi mai slaba.",
  },
];

const prompts = [
  "Fa-mi o cina din ce am in casa",
  "Vreau antrenament full-body azi",
  "Am depasit caloriile. Ce fac?",
  "Fa-mi plan pe 3 zile",
];

export function CoachPanel() {
  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage() {
    const trimmedMessage = message.trim();
    if (trimmedMessage.length < 2 || isLoading) return;

    setMessages((current) => [...current, { role: "user", text: trimmedMessage }]);
    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/coach", {
        body: JSON.stringify({
          message: trimmedMessage,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const payload = (await response.json()) as { answer?: string; error?: string };

      if (!response.ok || !payload.answer) {
        throw new Error(payload.error ?? "Coach-ul nu a putut raspunde.");
      }

      setMessages((current) => [...current, { role: "assistant", text: payload.answer ?? "" }]);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Eroare necunoscuta.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="flex min-h-[calc(100vh-190px)] flex-col rounded-lg border border-[#ded9c8] bg-white shadow-sm">
      <div className="border-b border-[#ece6d6] px-4 py-3 sm:px-5">
        <p className="text-sm font-black text-[#123f31]">Forma AI</p>
        <p className="mt-1 text-xs font-semibold text-[#62695f]">
          Raspunde pe profilul tau real, salvat in cont.
        </p>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-5">
        {messages.map((chatMessage, index) => (
          <article className="grid gap-3 sm:grid-cols-[44px_1fr]" key={`${chatMessage.role}-${index}`}>
            <div
              className={
                chatMessage.role === "user"
                  ? "flex h-10 w-10 items-center justify-center rounded-lg bg-[#15171d] text-sm font-black text-white sm:ml-auto"
                  : "flex h-10 w-10 items-center justify-center rounded-lg bg-[#123f31] text-sm font-black text-[#c8ff55]"
              }
            >
              {chatMessage.role === "user" ? "Tu" : "F"}
            </div>
            <div
              className={
                chatMessage.role === "user"
                  ? "rounded-lg bg-[#f4f2e9] p-4 text-[#101211]"
                  : "rounded-lg bg-white p-4 text-[#101211] ring-1 ring-[#ece6d6]"
              }
            >
              <p className="whitespace-pre-wrap text-sm font-semibold leading-6">
                {chatMessage.text}
              </p>
            </div>
          </article>
        ))}

        {isLoading ? (
          <article className="grid gap-3 sm:grid-cols-[44px_1fr]">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#123f31] text-sm font-black text-[#c8ff55]">
              F
            </div>
            <div className="rounded-lg bg-white p-4 text-sm font-semibold text-[#62695f] ring-1 ring-[#ece6d6]">
              Forma scrie raspunsul...
            </div>
          </article>
        ) : null}
      </div>

      {error ? (
        <p className="mx-4 rounded-lg border border-[#d6c981] bg-[#fff7cc] p-4 text-sm font-semibold leading-6 text-[#5d531c] sm:mx-5">
          {error}
        </p>
      ) : null}

      <div className="border-t border-[#ece6d6] p-4 sm:p-5">
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {prompts.map((prompt) => (
            <button
              className="shrink-0 rounded-lg border border-[#ded9c8] bg-[#fbfaf4] px-3 py-2 text-xs font-black text-[#4d554b] transition hover:border-[#123f31] hover:text-[#123f31]"
              key={prompt}
              onClick={() => setMessage(prompt)}
              type="button"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="rounded-lg border border-[#d8d2bf] bg-[#fbfaf4] p-3">
        <label className="sr-only" htmlFor="coach-message">
          Mesaj pentru coach
        </label>
        <textarea
          className="min-h-24 w-full resize-none bg-transparent text-sm font-semibold leading-6 outline-none"
          id="coach-message"
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void sendMessage();
            }
          }}
          placeholder="Scrie mesajul tau..."
          value={message}
        />
        <button
          className="mt-3 min-h-12 w-full rounded-lg bg-[#c8ff55] px-4 py-3 text-sm font-black text-[#101211] shadow-sm transition hover:bg-[#b9f242] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={message.trim().length < 2 || isLoading}
          onClick={sendMessage}
          type="button"
        >
          {isLoading ? "Se trimite..." : "Trimite"}
        </button>
        </div>
      </div>
    </section>
  );
}
