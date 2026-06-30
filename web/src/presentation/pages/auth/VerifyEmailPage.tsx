"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { APP_ROUTES } from "@/shared/constants/routes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { LanguageSwitcher } from "@/presentation/components/ui/LanguageSwitcher";
import { ThemeToggle } from "@/presentation/components/ui/ThemeToggle";
import { TextField } from "@/presentation/components/ui/TextField";
import { Button } from "@/presentation/components/ui/Button";
import { useAuth } from "@/application/hooks/useAuth";
import { useApiErrorService } from "@/application/services/api-error.service";
import { AppLogo } from "@/presentation/components/ui/AppLogo";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type VerifyState = "verifying" | "success" | "error";
type PageMode = "checking" | "resend";

// ---------------------------------------------------------------------------
// Resend form schema
// ---------------------------------------------------------------------------
const resendSchema = z.object({
  email: z
    .string()
    .min(1, "auth.validation.required")
    .email("auth.validation.invalidEmail"),
});

type ResendFormData = z.infer<typeof resendSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const VerifyEmailPage: React.FC = () => {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const resendParam = searchParams.get("resend");

  // ── State ─────────────────────────────────────────────────────────────────
  const [verifyState, setVerifyState] = useState<VerifyState>("verifying");
  const [verifyErrorCode, setVerifyErrorCode] = useState<string>("");
  const [pageMode, setPageMode] = useState<PageMode>("checking");
  const [resendSuccessMsg, setResendSuccessMsg] = useState<string>("");
  const [cooldown, setCooldown] = useState<number>(0);
  const [hasAutoVerifiedFromOtherTab, setHasAutoVerifiedFromOtherTab] = useState(false);

  // ── Cooldown timer countdown ──────────────────────────────────────────────
  useEffect(() => {
    if (cooldown === 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // ── RTK mutations ─────────────────────────────────────────────────────────
  const { verifyEmail, resendEmail, isResending, resendError } = useAuth();
  const { translateError } = useApiErrorService();

  // ── Resend form ───────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ResendFormData>({
    resolver: zodResolver(resendSchema),
    defaultValues: {
      email: email || "",
    },
  });

  // Sync email search parameter with form state
  useEffect(() => {
    if (email) {
      setValue("email", email);
    }
  }, [email, setValue]);

  // Guard against React 18 Strict Mode double-invocation of effects
  const hasVerified = useRef(false);

  // ── Auto-verify when token is present ────────────────────────────────────
  const _runVerification = useCallback(async () => {
    if (!token || hasVerified.current) return;
    hasVerified.current = true;
    try {
      await verifyEmail({ token });
      setVerifyState("success");
      
      // Notify other tabs that verification was successful
      if (typeof window !== "undefined") {
        const bc = new BroadcastChannel("email_verification");
        bc.postMessage({ status: "verified" });
        bc.close();
      }
    } catch (err: unknown) {
      const apiErr = err as { code?: string };
      // EMAIL_ALREADY_VERIFIED means the first call succeeded — treat as success
      if (apiErr?.code === "EMAIL_ALREADY_VERIFIED" || apiErr?.code === "email_already_verified") {
        setVerifyState("success");
        if (typeof window !== "undefined") {
          const bc = new BroadcastChannel("email_verification");
          bc.postMessage({ status: "verified" });
          bc.close();
        }
      } else {
        setVerifyErrorCode(apiErr?.code ?? "unknown_error");
        setVerifyState("error");
      }
    }
  }, [token, verifyEmail]);

  useEffect(() => {
    if (token) {
      _runVerification();
    }
  }, [token, _runVerification]);

  // ── Unified direct resend helper ──────────────────────────────────────────
  const _handleDirectResend = async (targetEmail: string) => {
    if (cooldown > 0 || isResending) return;
    setResendSuccessMsg("");
    try {
      await resendEmail({ email: targetEmail });
      setResendSuccessMsg(t("auth.verifyEmail.resendSuccess"));
      setCooldown(60);
    } catch (err: any) {
      if (err?.code === "email_already_verified" || err?.code === "EMAIL_ALREADY_VERIFIED") {
        setVerifyState("success");
        setHasAutoVerifiedFromOtherTab(true);
      }
    }
  };
  
  // ── Auto resend triggers once on landing if coming from login unverified ───
  const autoResendTriggered = useRef(false);
  useEffect(() => {
    if (email && resendParam === "true" && !autoResendTriggered.current) {
      autoResendTriggered.current = true;
      _handleDirectResend(email);
    }
  }, [email, resendParam, _handleDirectResend]);

  // ── Listen for verification success from other tabs ───────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || token) return;

    const bc = new BroadcastChannel("email_verification");
    bc.onmessage = (event) => {
      if (event.data?.status === "verified") {
        setVerifyState("success");
        setHasAutoVerifiedFromOtherTab(true);
      }
    };
    return () => {
      bc.close();
    };
  }, [token]);

  // ── Resend handler for form submission ─────────────────────────────────────
  const _onResendPressed = handleSubmit(async (data: ResendFormData) => {
    await _handleDirectResend(data.email);
  });

  const _onShowResend = () => setPageMode("resend");
  const _onBackToCheck = () => setPageMode("checking");

  const resendServerError = resendError ? translateError(resendError) : undefined;

  // ── CASE 1: Token in URL OR verified from other tab → Verification flow ───
  if (token || hasAutoVerifiedFromOtherTab) {
    return (
      <div className="min-h-screen flex flex-col bg-radial from-primary/5 via-transparent to-transparent">
        {/* Minimal header: logo left, controls right */}
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <AppLogo />
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>

        <div className="grow flex items-center justify-center py-12 px-6">
          <div className="w-full max-w-md bg-card border border-border p-10 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.2)] text-center">

            {/* Verifying state */}
            {verifyState === "verifying" && (
              <>
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: "2s" }} />
                  <div className="relative w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center select-none z-10">
                    <span className="text-4xl animate-spin">⏳</span>
                  </div>
                </div>
                <h2 className="text-2xl font-black tracking-tight mb-3">
                  {t("auth.verifyEmail.verifying")}
                </h2>
                <div className="flex items-center justify-center gap-1.5 mt-4">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Success state */}
            {verifyState === "success" && (
              <>
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full bg-success/20 animate-ping" style={{ animationDuration: "2.5s" }} />
                  <div className="absolute inset-0 rounded-full bg-success/15 animate-ping" style={{ animationDuration: "2.5s", animationDelay: "1.25s" }} />
                  <div className="relative w-20 h-20 rounded-full bg-success/10 flex items-center justify-center select-none z-10">
                    <span className="text-4xl">✅</span>
                  </div>
                </div>
                <h2 className="text-2xl font-black tracking-tight mb-3 text-success">
                  {t("auth.verifyEmail.successTitle")}
                </h2>
                <p className="text-sm text-muted leading-relaxed">
                  {t("auth.verifyEmail.successSubtitle")}
                </p>
                <div className="mt-8">
                  <Link href={APP_ROUTES.login}>
                    <Button className="w-full">
                      {t("auth.verifyEmail.goToLogin")}
                    </Button>
                  </Link>
                </div>
              </>
            )}

            {/* Error state */}
            {verifyState === "error" && (
              <>
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full bg-danger/20 animate-ping" style={{ animationDuration: "2.5s" }} />
                  <div className="absolute inset-0 rounded-full bg-danger/15 animate-ping" style={{ animationDuration: "2.5s", animationDelay: "1.25s" }} />
                  <div className="relative w-20 h-20 rounded-full bg-danger/10 flex items-center justify-center select-none z-10">
                    <span className="text-4xl">❌</span>
                  </div>
                </div>
                <h2 className="text-2xl font-black tracking-tight mb-3 text-danger">
                  {t("auth.verifyEmail.errorTitle")}
                </h2>
                <p className="text-sm text-muted leading-relaxed">
                  {verifyErrorCode
                    ? t(`api.codes.${verifyErrorCode}` as Parameters<typeof t>[0])
                    : t("api.codes.unknown_error")}
                </p>
                <div className="mt-8 flex flex-col gap-3">
                  {email ? (
                    <Button
                      onClick={() => _handleDirectResend(email)}
                      disabled={cooldown > 0 || isResending}
                      className="w-full"
                    >
                      {isResending
                        ? t("auth.verifyEmail.sendingEmail")
                        : cooldown > 0
                        ? `${t("auth.verifyEmail.resendButton")} (${cooldown}s)`
                        : t("auth.verifyEmail.resendButton")}
                    </Button>
                  ) : (
                    <Button
                      onClick={_onShowResend}
                      className="w-full"
                    >
                      {t("auth.verifyEmail.resendButton")}
                    </Button>
                  )}
                  <Link
                    href={APP_ROUTES.login}
                    className="group inline-flex items-center justify-center gap-1.5 text-xs text-muted hover:text-primary transition-colors duration-200 cursor-pointer select-none"
                  >
                    <span className="transition-transform duration-200 group-hover:-translate-x-1">←</span>
                    <span className="relative">
                      {t("auth.verifyEmail.backToLogin")}
                      <span className="absolute -bottom-px left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
                    </span>
                  </Link>

                  {/* Inline messages for direct resend when email is present */}
                  {email && resendServerError && (
                    <div className="p-3 bg-danger/10 text-danger rounded-xl text-xs font-semibold text-center select-none animate-pulse mt-2">
                      {resendServerError}
                    </div>
                  )}
                  {email && resendSuccessMsg && (
                    <div className="p-3 bg-success/10 text-success rounded-xl text-xs font-semibold text-center select-none mt-2">
                      {resendSuccessMsg}
                    </div>
                  )}
                </div>

                {/* Inline resend form on error page (only when email is not present) */}
                {!email && pageMode === "resend" && (
                  <div className="mt-8 pt-8 border-t border-border/50">
                    <_ResendForm
                      t={t}
                      register={register}
                      errors={errors}
                      isResending={isResending}
                      resendServerError={resendServerError}
                      resendSuccessMsg={resendSuccessMsg}
                      onResend={_onResendPressed}
                      onBack={_onBackToCheck}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <footer className="py-6 border-t border-border/10 text-center text-xs text-muted select-none">
          {t("landing.footer")}
        </footer>
      </div>
    );
  }

  // ── CASE 2: No token → "Check Your Email" page with Resend form ───────────
  return (
    <div className="min-h-screen flex flex-col bg-radial from-primary/5 via-transparent to-transparent">
      {/* Minimal header: logo left, controls right */}
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <AppLogo />
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>

      <div className="grow flex items-center justify-center py-12 px-6">
        <div className="w-full max-w-md bg-card border border-border p-10 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.2)] text-center">

          {pageMode === "checking" ? (
            <>
              {/* Icon */}
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: "2.5s" }} />
                <div className="absolute inset-0 rounded-full bg-primary/15 animate-ping" style={{ animationDuration: "2.5s", animationDelay: "1.25s" }} />
                <div className="relative w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center select-none z-10">
                  <span className="text-4xl">📬</span>
                </div>
              </div>

              <h2 className="text-2xl font-black tracking-tight mb-3">
                {t("auth.verifyEmail.title")}
              </h2>

              <p className="text-sm text-muted leading-relaxed">
                {t("auth.verifyEmail.subtitle")}
              </p>

              {email && (
                <div className="mt-4 px-4 py-2 bg-primary/5 dark:bg-primary/10 border border-primary/15 rounded-2xl inline-flex items-center gap-2 max-w-full select-all">
                  <span className="text-base leading-none">📧</span>
                  <span className="text-xs font-semibold text-primary truncate max-w-[280px]">
                    {email}
                  </span>
                </div>
              )}

              {/* Resend prompt & direct button */}
              <div className="mt-8 pt-6 border-t border-border/50 flex flex-col items-center gap-3">
                <p className="text-xs text-muted select-none">
                  {t("auth.verifyEmail.resendPrompt")}
                </p>
                {email ? (
                  <Button
                    onClick={() => _handleDirectResend(email)}
                    disabled={cooldown > 0 || isResending}
                    variant="secondary"
                    className="w-full max-w-[280px]"
                  >
                    {isResending
                      ? t("auth.verifyEmail.sendingEmail")
                      : cooldown > 0
                      ? `${t("auth.verifyEmail.resendButton")} (${cooldown}s)`
                      : t("auth.verifyEmail.resendButton")}
                  </Button>
                ) : (
                  <button
                    onClick={_onShowResend}
                    className="text-xs font-bold text-primary hover:underline cursor-pointer select-none transition-opacity hover:opacity-80"
                  >
                    {t("auth.verifyEmail.resendButton")}
                  </button>
                )}

                {/* Inline messages for direct resend */}
                {email && resendServerError && (
                  <div className="w-full max-w-[280px] p-3 bg-danger/10 text-danger rounded-xl text-xs font-semibold text-center select-none animate-pulse">
                    {resendServerError}
                  </div>
                )}
                {email && resendSuccessMsg && (
                  <div className="w-full max-w-[280px] p-3 bg-success/10 text-success rounded-xl text-xs font-semibold text-center select-none">
                    {resendSuccessMsg}
                  </div>
                )}
              </div>

              {/* Back to login */}
              <div className="mt-6">
                <Link
                  href={APP_ROUTES.login}
                  className="group inline-flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors duration-200 cursor-pointer select-none"
                >
                  <span className="transition-transform duration-200 group-hover:-translate-x-1">←</span>
                  <span className="relative">
                    {t("auth.verifyEmail.backToLogin")}
                    <span className="absolute -bottom-px left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
                  </span>
                </Link>
              </div>
            </>
          ) : (
            <_ResendForm
              t={t}
              register={register}
              errors={errors}
              isResending={isResending}
              resendServerError={resendServerError}
              resendSuccessMsg={resendSuccessMsg}
              onResend={_onResendPressed}
              onBack={_onBackToCheck}
            />
          )}
        </div>
      </div>

      <footer className="py-6 border-t border-border/10 text-center text-xs text-muted select-none">
        {t("landing.footer")}
      </footer>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Resend Form sub-component (reused in both modes)
// ---------------------------------------------------------------------------
interface ResendFormProps {
  t: (key: Parameters<ReturnType<typeof useTranslation>["t"]>[0]) => string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any;
  isResending: boolean;
  resendServerError?: string;
  resendSuccessMsg: string;
  onResend: (e?: React.BaseSyntheticEvent) => void;
  onBack: () => void;
}

const _ResendForm: React.FC<ResendFormProps> = ({
  t,
  register,
  errors,
  isResending,
  resendServerError,
  resendSuccessMsg,
  onResend,
  onBack,
}) => (
  <div className="text-left">
    <div className="text-center mb-6">
      <div className="relative w-16 h-16 mx-auto mb-4">
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: "2.5s" }} />
        <div className="relative w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center select-none z-10">
          <span className="text-3xl">✉️</span>
        </div>
      </div>
      <h3 className="text-xl font-black tracking-tight">
        {t("auth.verifyEmail.resendTitle")}
      </h3>
      <p className="text-xs text-muted mt-2 leading-relaxed">
        {t("auth.verifyEmail.resendSubtitle")}
      </p>
    </div>

    <form onSubmit={onResend} noValidate className="flex flex-col gap-4">
      {/* Server error */}
      {resendServerError && (
        <div className="p-4 bg-danger/10 text-danger rounded-xl text-xs font-semibold text-center select-none animate-pulse">
          {resendServerError}
        </div>
      )}

      {/* Success message */}
      {resendSuccessMsg && (
        <div className="p-4 bg-success/10 text-success rounded-xl text-xs font-semibold text-center select-none">
          {resendSuccessMsg}
        </div>
      )}

      <TextField
        label={t("auth.verifyEmail.emailLabel")}
        placeholder={t("auth.verifyEmail.emailPlaceholder")}
        type="email"
        error={errors.email ? t(errors.email.message) : undefined}
        disabled={isResending}
        {...register("email")}
      />

      <Button type="submit" isLoading={isResending} className="w-full">
        {isResending
          ? t("auth.verifyEmail.sendingEmail")
          : t("auth.verifyEmail.resendButton")}
      </Button>
    </form>

    <div className="mt-4 text-center">
      <button
        onClick={onBack}
        className="group inline-flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors duration-200 cursor-pointer select-none"
      >
        <span className="transition-transform duration-200 group-hover:-translate-x-1">←</span>
        <span className="relative">
          {t("auth.verifyEmail.backToCheck")}
          <span className="absolute -bottom-px left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
        </span>
      </button>
    </div>
  </div>
);
