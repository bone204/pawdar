"use client";

import React, { useState } from "react";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { TextField } from "@/presentation/components/ui/TextField";
import { Button } from "@/presentation/components/ui/Button";
import { Header } from "@/presentation/components/Header";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from "@/shared/constants/routes";
import { useLoginMutation } from "@/infrastructure/rtk/api/auth.api";
import { useDispatch, useSelector } from "react-redux";
import { setAuthenticatedSession, selectIsAuthenticated } from "@/infrastructure/rtk/auth.slice";
import dynamic from "next/dynamic";
import { LOTTIES } from "@/shared/constants/lotties";
import { useEffect } from "react";

const LottiePlayer = dynamic(
  () => import("@/presentation/components/ui/LottiePlayer"),
  { ssr: false },
);

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();
  const [login] = useLoginMutation();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(APP_ROUTES.dashboard);
    }
  }, [isAuthenticated, router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const _validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = t("auth.validation.required");
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t("auth.validation.invalidEmail");
    }

    if (!password) {
      newErrors.password = t("auth.validation.required");
    } else if (password.length < 6) {
      newErrors.password = t("auth.validation.passwordLength");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const _onLoginPressed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!_validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await login({ email, password }).unwrap();

      dispatch(
        setAuthenticatedSession({
          accessToken: response.accessToken,
          user: response.user,
        }),
      );

      router.replace(APP_ROUTES.dashboard);
    } catch (err: any) {
      console.log("Login error object:", err);
      if (err?.code === "email_not_verified") {
        router.push(`${APP_ROUTES.verifyEmail}?email=${encodeURIComponent(email)}&resend=true`);
        return;
      }
      setErrors({ general: err.message || "Failed to log in" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-radial from-primary/5 via-transparent to-transparent pt-20">
      <Header />

      <div className="grow flex items-center justify-center py-12 px-6">
        <div className="w-full max-w-2xl flex flex-col gap-8">

          {/* Row 1: Title (left) + Lottie (right) */}
          <div className="flex items-center justify-center gap-4">
            <h2 className="text-4xl font-black tracking-tight">
              {t("auth.login")}
            </h2>
            <div className="shrink-0">
              <LottiePlayer
                src={LOTTIES.dog}
                className="w-24 h-24"
              />
            </div>
          </div>

          {/* Row 2: Form */}
          <div className="bg-card border border-border p-8 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
            <form onSubmit={_onLoginPressed} className="flex flex-col gap-5">
              {errors.general && (
                <div className="p-4 bg-danger/10 text-danger rounded-xl text-xs font-semibold text-center select-none animate-pulse">
                  {errors.general}
                </div>
              )}

              <TextField
                label={t("auth.emailLabel")}
                placeholder={t("auth.emailPlaceholder")}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                disabled={isLoading}
              />

              <TextField
                label={t("auth.passwordLabel")}
                placeholder={t("auth.passwordPlaceholder")}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                disabled={isLoading}
              />

              <div className="text-right select-none">
                <span className="text-xs text-primary font-bold hover:underline cursor-pointer">
                  {t("auth.forgotPassword")}
                </span>
              </div>

              <Button type="submit" isLoading={isLoading} className="w-full mt-2">
                {t("auth.login")}
              </Button>
            </form>

            <div className="mt-8 text-center text-xs text-muted select-none">
              {t("auth.noAccount")}{" "}
              <Link href={APP_ROUTES.register} className="text-primary font-bold hover:underline">
                {t("auth.register")}
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 border-t border-border/10 text-center text-xs text-muted select-none">
        {t("landing.footer")}
      </footer>
    </div>
  );
};
