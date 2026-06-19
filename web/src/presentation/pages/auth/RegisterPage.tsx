"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { APP_ROUTES } from "@/shared/constants/routes";
import { TextField } from "@/presentation/components/ui/TextField";
import { Button } from "@/presentation/components/ui/Button";
import { Header } from "@/presentation/components/Header";
import { useSignUpMutation } from "@/infrastructure/rtk/api/auth.api";
import { useApiErrorService } from "@/application/services/api-error.service";
import dynamic from "next/dynamic";
import { LOTTIES } from "@/shared/constants/lotties";

const LottiePlayer = dynamic(
  () => import("@/presentation/components/ui/LottiePlayer"),
  { ssr: false },
);

// ---------------------------------------------------------------------------
// Zod schema — mirrors server-side validation rules
// ---------------------------------------------------------------------------
const signUpSchema = z
  .object({
    fullName: z.string().min(1, "auth.validation.required"),
    email: z
      .string()
      .min(1, "auth.validation.required")
      .email("auth.validation.invalidEmail"),
    password: z
      .string()
      .min(1, "auth.validation.required")
      .min(6, "auth.validation.passwordLength"),
    confirmPassword: z.string().min(1, "auth.validation.required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "auth.validation.passwordMismatch",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [signUp, { isLoading, error }] = useSignUpMutation();
  const { translateError } = useApiErrorService();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const _onRegisterPressed = handleSubmit(async (data: SignUpFormData) => {
    try {
      await signUp({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      }).unwrap();

      router.push(`${APP_ROUTES.verifyEmail}?email=${encodeURIComponent(data.email)}`);
    } catch {
      // Error is handled via RTK Query error state — no additional action needed
    }
  });

  const serverError = error ? translateError(error) : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-radial from-primary/5 via-transparent to-transparent pt-20">
      <Header />

      <div className="grow flex items-center justify-center py-12 px-6">
        <div className="w-full max-w-2xl flex flex-col gap-4">

          {/* Row 1: Title (left) + Lottie (right) */}
          <div className="flex items-center justify-center gap-4">
            <h2 className="text-4xl font-black tracking-tight">
              {t("auth.register")}
            </h2>
            <div className="shrink-0">
              <LottiePlayer
                src={LOTTIES.cat}
                className="w-32 h-32"
              />
            </div>
          </div>

          {/* Row 2: Form */}
          <div className="bg-card border border-border p-8 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
            <form onSubmit={_onRegisterPressed} noValidate className="flex flex-col gap-4">
              {/* Server-side error banner */}
              {serverError && (
                <div className="p-4 bg-danger/10 text-danger rounded-xl text-xs font-semibold text-center select-none animate-pulse">
                  {serverError}
                </div>
              )}

              <TextField
                label={t("auth.nameLabel")}
                placeholder={t("auth.namePlaceholder")}
                error={errors.fullName ? t(errors.fullName.message as Parameters<typeof t>[0]) : undefined}
                disabled={isLoading}
                {...register("fullName")}
              />

              <TextField
                label={t("auth.emailLabel")}
                placeholder={t("auth.emailPlaceholder")}
                type="email"
                error={errors.email ? t(errors.email.message as Parameters<typeof t>[0]) : undefined}
                disabled={isLoading}
                {...register("email")}
              />

              <TextField
                label={t("auth.passwordLabel")}
                placeholder={t("auth.passwordPlaceholder")}
                type="password"
                error={errors.password ? t(errors.password.message as Parameters<typeof t>[0]) : undefined}
                disabled={isLoading}
                {...register("password")}
              />

              <TextField
                label={t("auth.confirmPasswordLabel")}
                placeholder={t("auth.confirmPasswordPlaceholder")}
                type="password"
                error={
                  errors.confirmPassword
                    ? t(errors.confirmPassword.message as Parameters<typeof t>[0])
                    : undefined
                }
                disabled={isLoading}
                {...register("confirmPassword")}
              />

              <Button type="submit" isLoading={isLoading} className="w-full mt-2">
                {t("auth.register")}
              </Button>
            </form>

            <div className="mt-8 text-center text-xs text-muted select-none">
              {t("auth.haveAccount")}{" "}
              <Link href={APP_ROUTES.login} className="text-primary font-bold hover:underline">
                {t("auth.login")}
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
