import React, { useMemo, useState } from "react";

type FormState = {
  company_size: string; // real field (optional)
  name: string;
  email: string;
  company: string;
  website: string;
  budget: string;
  message: string;

  // Honeypot (anti-spam) — MUST stay empty
  hp: string;
};

type SubmitState = "idle" | "sending" | "success" | "error";

export default function ContactForm() {
  const [form, setForm] = useState<FormState>({
    company_size: "",
    name: "",
    email: "",
    company: "",
    website: "",
    budget: "",
    message: "",
    hp: "",
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
    const honeypotOk = form.hp.trim().length === 0;

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
      setErrorMsg("Please fill in your name, email, and a message (min. 10 characters).");
      return;
    }

    setSubmitState("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          company: form.company.trim(),
          website: form.website.trim(),
          budget: form.budget.trim(),
          company_size: form.company_size.trim(),
          message: form.message.trim(),

          // honeypot
          hp: form.hp.trim(),

          source: "kersivo.co.uk/contact",
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };

      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "Something went wrong. Please try again.");
      }

      setSubmitState("success");
      setSuccessMsg("✅ Sent. I’ll get back to you soon.");

      setForm({
        company_size: "",
        name: "",
        email: "",
        company: "",
        website: "",
        budget: "",
        message: "",
        hp: "",
      });
    } catch (err: any) {
      setSubmitState("error");
      setErrorMsg(err?.message || "Send failed. Please try again in a moment.");
    } finally {
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
            Send an inquiry
          </h3>
          <p className="mt-2 text-[14px] md:text-[15px] leading-relaxed text-white/70">
            Tell me what you’re building — I’ll reply with a plan, timeline, and quote.
          </p>
        </div>

        {/* Honeypot (visually hidden but still in DOM) */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "-9999px",
            top: "-9999px",
            width: 1,
            height: 1,
            overflow: "hidden",
            opacity: 0,
            pointerEvents: "none",
          }}
        >
          <label>Leave this field empty</label>
          <input
            value={form.hp}
            onChange={(e) => update("hp", e.target.value)}
            autoComplete="off"
            tabIndex={-1}
          />
        </div>

        {/* Fields grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Company size (optional)"
            value={form.company_size}
            onChange={(v) => update("company_size", v)}
            placeholder="e.g. 1–10"
            autoComplete="organization"
          />

          <Field
            label="Name"
            value={form.name}
            onChange={(v) => update("name", v)}
            placeholder="Bartek"
            autoComplete="name"
            required
          />

          <Field
            label="Email"
            value={form.email}
            onChange={(v) => update("email", v)}
            placeholder="you@company.com"
            autoComplete="email"
            type="email"
            required
          />

          <Field
            label="Company (optional)"
            value={form.company}
            onChange={(v) => update("company", v)}
            placeholder="Kersivo / Your company"
            autoComplete="organization"
          />

          <Field
            label="Website (optional)"
            value={form.website}
            onChange={(v) => update("website", v)}
            placeholder="https://..."
            autoComplete="url"
          />

          {/* keep grid symmetry */}
          <div className="hidden md:block" />
        </div>

        {/* Budget */}
        <div className="mt-4">
          <label className="mb-2 block text-[13px] font-medium text-white/80">
            Budget (optional)
          </label>
          <select
            value={form.budget}
            onChange={(e) => update("budget", e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-[14px] text-white/90 outline-none transition focus:border-white/25 focus:bg-black/40"
          >
            <option value="">Select</option>
            <option value="under-1k">Under £1k</option>
            <option value="1k-3k">£1k – £3k</option>
            <option value="3k-7k">£3k – £7k</option>
            <option value="7k-15k">£7k – £15k</option>
            <option value="15k+">£15k+</option>
          </select>
        </div>

        {/* Message */}
        <div className="mt-4">
          <label className="mb-2 block text-[13px] font-medium text-white/80">
            Message
          </label>
          <textarea
            value={form.message}
            onChange={(e) => update("message", e.target.value)}
            placeholder="What do you need? Goals? Deadline? Links / inspiration?"
            rows={6}
            required
            className="w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-[14px] text-white/90 outline-none transition focus:border-white/25 focus:bg-black/40"
          />
          <div className="mt-2 text-[12px] text-white/50">
            Min. 10 characters. The clearer you are, the faster I reply.
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
            Sent directly to <span className="text-white/70">hello@kersivo.co.uk</span>
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
            <span className="mr-2">{isSending ? "Sending…" : "Send"}</span>
            <span className="opacity-70 group-hover:opacity-100 transition">→</span>
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
