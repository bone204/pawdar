"use client";

import Link from "next/link";
import LottiePlayer from "@/presentation/components/ui/LottiePlayer";
import { LOTTIES } from "@/shared/constants/lotties";
import { APP_ROUTES } from "@/shared/constants/routes";
import { useTranslation } from "@/presentation/providers/LanguageProvider";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <main
      style={{
        minHeight: "100dvh",
        backgroundColor: "var(--background)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      {/* Lottie animation */}
      <div
        style={{
          width: "min(300px, 75vw)",
          height: "min(300px, 75vw)",
          flexShrink: 0,
          background: "transparent",
          borderRadius: "50%",
          overflow: "hidden",
          marginBottom: "2.5rem",
        }}
      >
        <LottiePlayer
          src={LOTTIES.notFound}
          loop
          autoplay
          style={{ background: "transparent" }}
        />
      </div>

      {/* Error code */}
      <p
        style={{
          fontSize: "clamp(4rem, 10vw, 7rem)",
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: "-0.04em",
          color: "var(--primary)",
          marginBottom: "0.25rem",
          fontFamily: "var(--font-merriweather), serif",
          userSelect: "none",
        }}
      >
        {t("notFound.code")}
      </p>

      {/* Heading */}
      <h1
        style={{
          fontSize: "clamp(1.4rem, 4vw, 2.25rem)",
          fontWeight: 800,
          color: "var(--foreground)",
          marginBottom: "0.75rem",
          fontFamily: "var(--font-merriweather), serif",
          letterSpacing: "-0.015em",
        }}
      >
        {t("notFound.title")}
      </h1>

      {/* Description */}
      <p
        style={{
          fontSize: "clamp(0.9rem, 2.5vw, 1.05rem)",
          color: "var(--muted)",
          maxWidth: "30rem",
          lineHeight: 1.65,
          marginBottom: "2.5rem",
          fontFamily: "var(--font-merriweather), serif",
          fontWeight: 300,
        }}
      >
        {t("notFound.desc")}
      </p>

      {/* Back home button */}
      <Link
        href={APP_ROUTES.home}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.75rem 2rem",
          borderRadius: "9999px",
          backgroundColor: "var(--primary)",
          color: "var(--primary-foreground)",
          fontFamily: "var(--font-merriweather), serif",
          fontWeight: 700,
          fontSize: "0.95rem",
          textDecoration: "none",
          transition: "opacity 0.2s ease, transform 0.2s ease",
          boxShadow:
            "0 4px 24px color-mix(in srgb, var(--primary) 35%, transparent)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.opacity = "0.88";
          (e.currentTarget as HTMLAnchorElement).style.transform =
            "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.opacity = "1";
          (e.currentTarget as HTMLAnchorElement).style.transform =
            "translateY(0)";
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        {t("notFound.cta")}
      </Link>
    </main>
  );
}
