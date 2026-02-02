import React, { useMemo, useRef, useState } from "react";

type ApiResp = { ok: boolean; id?: string; error?: string };

function fileToBase64(file: File): Promise<{ base64: string; name: string; type: string; size: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.onload = () => {
      const result = String(reader.result || "");
      const parts = result.split(",");
      const base64 = parts.length > 1 ? parts[1] : "";
      resolve({ base64, name: file.name, type: file.type || "application/octet-stream", size: file.size });
    };
    reader.readAsDataURL(file);
  });
}

export default function ContactForm() {
  const [service, setService] = useState("Website");
  const [budget, setBudget] = useState("Under £2k");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const fileRef = useRef<HTMLInputElement | null>(null);

  // Anti-bot: store "start" moment
  const startedAt = useMemo(() => Date.now(), []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (status === "sending") return;

    // quick client validation (server validates again)
    if (name.trim().length < 2) return setStatus("error"), setErrorMsg("Please enter your full name.");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setStatus("error"), setErrorMsg("Please enter a valid email.");
    if (message.trim().length < 10) return setStatus("error"), setErrorMsg("Project details must be at least 10 characters.");

    setStatus("sending");

    try {
      // attachment (optional)
      let attachment: any = null;
      const file = fileRef.current?.files?.[0];

      if (file) {
        const maxBytes = 4 * 1024 * 1024;
        if (file.size > maxBytes) {
          setStatus("error");
          setErrorMsg("File is too large (max 4MB).");
          return;
        }

        const allowed = new Set(["image/png", "image/jpeg", "image/webp", "application/pdf"]);
        if (file.type && !allowed.has(file.type)) {
          setStatus("error");
          setErrorMsg("Unsupported file type. Use PNG/JPG/WebP/PDF.");
          return;
        }

        attachment = await fileToBase64(file);
      }

      const payload = {
        service,
        budget,
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        startedAt,
        hp: "", // honeypot (must exist in payload, kept empty)
        attachment,
      };

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      // safer parsing: if server returns HTML/empty, we still show a real error
      const text = await res.text();
      let data: ApiResp | null = null;
      try {
        data = JSON.parse(text);
      } catch {
        data = { ok: false, error: "Server returned a non-JSON response." };
      }

      if (!res.ok || !data?.ok) {
        setStatus("error");
        setErrorMsg(data?.error || "Something went wrong. Please try again.");
        return;
      }

      setStatus("sent");
      // optional: clear fields (leave service/budget)
      setName("");
      setEmail("");
      setMessage("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={onSubmit}>
      {/* Keep your existing markup / classes here.
          I’m only showing logical bindings — plug them into your current UI. */}

      {/* Example hooks — replace with your existing UI elements */}
      <input type="hidden" name="hp" value="" />

      {/* service pills -> call setService(...) */}
      {/* budget pills -> call setBudget(...) */}

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full name"
        autoComplete="name"
      />

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        autoComplete="email"
      />

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Project details"
      />

      <input ref={fileRef} type="file" />

      <button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Submit inquiry"}
      </button>

      {status === "sent" && <div>Sent. Clean and simple — we’ll reply soon.</div>}
      {status === "error" && <div style={{ color: "tomato" }}>{errorMsg}</div>}
    </form>
  );
}
