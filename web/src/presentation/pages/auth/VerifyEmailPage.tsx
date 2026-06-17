"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { Header } from "@/presentation/components/Header";

interface VerifyEmailPageProps {
  token?: string;
}

export const VerifyEmailPage: React.FC<VerifyEmailPageProps> = ({ token }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col bg-radial from-primary/5 via-transparent to-transparent pt-20">
      <Header />

      <div className="grow flex items-center justify-center py-12 px-6">
        <div className="w-full max-w-md bg-card border border-border p-8 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.2)] text-center">

          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-4xl select-none">📬</span>
          </div>

          {/* Success badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success text-xs font-bold uppercase tracking-wider mb-6 select-none">
            {t("auth.verifyEmail.successBadge")}
          </div>

          <h2 className="text-2xl font-black tracking-tight mb-3">
            {t("auth.verifyEmail.title")}
          </h2>

          <p className="text-sm text-muted leading-relaxed mb-8">
            {t("auth.verifyEmail.subtitle")}
          </p>

          {/* Debug: show token in dev (remove in production) */}
          {token && process.env.NODE_ENV === "development" && (
            <div className="mb-6 p-3 bg-secondary rounded-xl text-xs text-muted font-mono break-all select-all">
              <span className="font-bold text-foreground">Token: </span>
              {token}
            </div>
          )}

          {/* Resend CTA */}
          <div className="text-xs text-muted select-none mb-4">
            {t("auth.verifyEmail.resendLabel")}{" "}
            <button
              type="button"
              className="text-primary font-bold hover:underline cursor-pointer"
            >
              {t("auth.verifyEmail.resendCta")}
            </button>
          </div>

          {/* Back to login */}
          <Link
            href="/login"
            className="text-xs text-muted hover:text-foreground transition-colors duration-200 cursor-pointer select-none"
          >
            ← {t("auth.verifyEmail.backToLogin")}
          </Link>
        </div>
      </div>

      <footer className="py-6 border-t border-border/10 text-center text-xs text-muted select-none">
        {t("landing.footer")}
      </footer>
    </div>
  );
};
