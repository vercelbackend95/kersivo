import React, { useMemo, useState } from "react";

type FormState = {
  name: string;
  email: string;
  company: string;
  website: string;
  budget: string;
  message: string;
  // Honeypot (anty-spam) — ma zostać puste
  company_size: string;
};

type SubmitState = "idle" | "sending" | "success" | "error";

export default function ContactForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    company: "",
    website: "",
    budget: "",
    message: "",
    company_size: "",
  });

  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  const isSending = submitState === "sending";

  const canSubmit = useMemo(() => {
    const nameOk = form.name.trim().length >= 2;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
    const messageOk = form.message.trim().length >= 10;

    // honeypot must be empty
    const honeypotOk = form.company_size.trim().length === 0;

    return nameOk && emailOk && messageOk && honeypotOk && !isSending;
  }, [form, isSending]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!canSubmit) {
      setSubmitState("error");
      setErrorMsg("Uzupełnij poprawnie: imię, e-mail i wiadomość (min. 10 znaków).");
      return;
    }

    setSubmitState("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // send only what we need
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          company: form.company.trim(),
          website: form.website.trim(),
          budget: form.budget.trim(),
          message: form.message.trim(),
          company_size: form.company_size.trim(), // honeypot
          source: "kersivo.co.uk/contact",
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };

      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "Coś poszło nie tak. Spróbuj ponownie.");
      }

      setSubmitState("success");
      setSuccessMsg("✅ Wysłane. Odezwę się najszybciej jak się da.");

      // reset form (keep honeypot empty)
      setForm({
        name: "",
        email: "",
        company: "",
        website: "",
        budget: "",
        message: "",
        company_size: "",
      });
    } catch (err: any) {
      setSubmitState("error");
      setErrorMsg(err?.message || "Błąd wysyłki. Spróbuj ponownie za chwilę.");
    } finally {
      // allow another send after short beat (prevents double-click spam)
      setTimeout(() => {
        setSubmitState((s) => (s === "sending" ? "idle" : s));
      }, 400);
    }
  }

  return (
    <div className="w-full">
      <form
        onSubmit={onSubmit}
        className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl"
      >
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-[20px] md:text-[22px] font-semibold tracking-tight text-white">
            Wyślij zapytanie
          </h3>
          <p className="mt-2 text-[14px] md:text-[15px] leading-relaxed text-white/70">
            Napisz co budujemy, a ja wrócę z planem, terminem i wyceną.
          </p>
        </div>

        {/* Honeypot (hidden) */}
        <div className="hidden">
          <label className="text-white">Company size</label>
          <input
            value={form.company_size}
            onChange={(e) => update("company_size", e.target.value)}
            autoComplete="off"
            tabIndex={-1}
          />
        </div>

        {/* Fields grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Imię"
            value={form.name}
            onChange={(v) => update("name", v)}
            placeholder="Bartek"
            autoComplete="name"
            required
          />

          <Field
            label="E-mail"
            value={form.email}
            onChange={(v) => update("email", v)}
            placeholder="you@company.com"
            autoComplete="email"
            type="email"
            required
          />

          <Field
            label="Firma"
            value={form.company}
            onChange={(v) => update("company", v)}
            placeholder="Kersivo / Twoja firma"
            autoComplete="organization"
          />

          <Field
            label="Website"
            value={form.website}
            onChange={(v) => update("website", v)}
            placeholder="https://..."
            autoComplete="url"
          />
        </div>

        {/* Budget */}
        <div className="mt-4">
          <label className="mb-2 block text-[13px] font-medium text-white/80">
            Budżet
          </label>
          <div className="relative">
            <select
              value={form.budget}
              onChange={(e) => update("budget", e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-[14px] text-white/90 outline-none transition focus:border-white/25 focus:bg-black/40"
            >
              <option value="">Wybierz (opcjonalnie)</option>
              <option value="under-1k">Poniżej £1k</option>
              <option value="1k-3k">£1k – £3k</option>
              <option value="3k-7k">£3k – £7k</option>
              <option value="7k-15k">£7k – £15k</option>
              <option value="15k+">£15k+</option>
            </select>
          </div>
        </div>

        {/* Message */}
        <div className="mt-4">
          <label className="mb-2 block text-[13px] font-medium text-white/80">
            Wiadomość
          </label>
          <textarea
            value={form.message}
            onChange={(e) => update("message", e.target.value)}
            placeholder="Co potrzebujesz? Jakie cele? Deadline? Linki / inspiracje?"
            rows={6}
            required
            className="w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-[14px] text-white/90 outline-none transition focus:border-white/25 focus:bg-black/40"
          />
          <div className="mt-2 text-[12px] text-white/50">
            Min. 10 znaków. Im konkretniej, tym szybciej odpiszę.
          </div>
        </div>

        {/* Status */}
        {(submitState === "error" || submitState === "success") && (
          <div
            className={[
              "mt-4 rounded-2xl border px-4 py-3 text-[13px]",
              submitState === "success"
                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
                : "border-rose-500/25 bg-rose-500/10 text-rose-200",
            ].join(" ")}
          >
            {submitState === "success" ? successMsg : errorMsg}
          </div>
        )}

        {/* CTA */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="text-[12px] text-white/50">
            Wysyłka idzie prosto na <span className="text-white/70">hello@kersivo.co.uk</span>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className={[
              "group relative inline-flex items-center justify-center rounded-2xl px-5 py-3 text-[14px] font-semibold transition",
              "border border-white/10 bg-white/10 text-white",
              "hover:bg-white/14 hover:border-white/20",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              "shadow-[0_12px_40px_rgba(0,0,0,0.45)]",
            ].join(" ")}
          >
            <span className="mr-2">
              {isSending ? "Wysyłam…" : "Wyślij"}
            </span>
            <span className="opacity-70 group-hover:opacity-100 transition">→</span>

            {/* subtle glow */}
            <span className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.22),transparent_55%)]" />
          </button>
        </div>
      </form>
    </div>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-[13px] font-medium text-white/80">
        {props.label}
      </label>
      <input
        type={props.type || "text"}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        autoComplete={props.autoComplete}
        required={props.required}
        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-[14px] text-white/90 outline-none transition focus:border-white/25 focus:bg-black/40"
      />
    </div>
  );
}
