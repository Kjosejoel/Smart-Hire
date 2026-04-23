// app/select-role/page.tsx
"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Sparkles } from "lucide-react"

function SelectRoleInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get("email") ?? ""
  const name = searchParams.get("name") ?? ""

  const [role, setRole] = useState<"seeker" | "recruiter" | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleContinue = async () => {
    if (!role) return
    setLoading(true)
    setError("")

    const res = await fetch("/api/auth/set-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, role }),
    })

    if (!res.ok) {
      setError("Something went wrong. Please try again.")
      setLoading(false)
      return
    }

    // Re-trigger Google sign in so JWT gets populated with the new user
    const { signIn } = await import("next-auth/react")
    await signIn("google", { callbackUrl: "/dashboard" })
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#020817", display: "flex",
      alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif"
    }}>
      <div style={{
        background: "#0f172a", border: "1px solid #1e293b", borderRadius: 20,
        padding: "48px 40px", width: "100%", maxWidth: 440, textAlign: "center"
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 32 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            border: "1px solid rgba(251,191,36,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Sparkles size={16} color="#fbbf24" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1, color: "#fbbf24" }}>SMARTHIRE AI</span>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", margin: "0 0 8px" }}>
          Welcome{name ? `, ${name.split(" ")[0]}` : ""}!
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", marginBottom: 32 }}>
          How are you planning to use SmartHire?
        </p>

        {/* Role cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
          {([
            {
              value: "seeker",
              icon: "◎",
              title: "Job Seeker",
              desc: "Browse jobs and apply with your resume",
              color: "#6366f1",
            },
            {
              value: "recruiter",
              icon: "◈",
              title: "Recruiter",
              desc: "Post jobs and find the best candidates",
              color: "#f59e0b",
            },
          ] as const).map((opt) => (
            <div
              key={opt.value}
              onClick={() => setRole(opt.value)}
              style={{
                border: `2px solid ${role === opt.value ? opt.color : "#1e293b"}`,
                borderRadius: 12, padding: "18px 20px", cursor: "pointer",
                background: role === opt.value ? opt.color + "10" : "transparent",
                display: "flex", alignItems: "center", gap: 16,
                textAlign: "left", transition: "all 0.15s ease",
              }}
            >
              <span style={{ fontSize: 24, color: opt.color }}>{opt.icon}</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9" }}>{opt.title}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{opt.desc}</div>
              </div>
              {role === opt.value && (
                <span style={{ marginLeft: "auto", color: opt.color, fontSize: 18 }}>✓</span>
              )}
            </div>
          ))}
        </div>

        {error && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>{error}</p>}

        <button
          onClick={handleContinue}
          disabled={!role || loading}
          style={{
            width: "100%", padding: "13px", borderRadius: 10, border: "none",
            background: role ? "linear-gradient(135deg, #f59e0b, #ef4444)" : "#1e293b",
            color: role ? "#fff" : "#334155", fontSize: 15, fontWeight: 600,
            cursor: role ? "pointer" : "not-allowed", transition: "all 0.15s ease",
            fontFamily: "inherit",
          }}
        >
          {loading ? "Setting up your account…" : "Continue →"}
        </button>
      </div>
    </div>
  )
}

export default function SelectRolePage() {
  return (
    <Suspense>
      <SelectRoleInner />
    </Suspense>
  )
}