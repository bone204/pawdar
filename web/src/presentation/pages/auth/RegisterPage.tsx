"use client";

import React, { useState } from "react";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { TextField } from "@/presentation/components/ui/TextField";
import { Button } from "@/presentation/components/ui/Button";
import { LanguageSwitcher } from "@/presentation/components/ui/LanguageSwitcher";
import { ThemeToggle } from "@/presentation/components/ui/ThemeToggle";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const _validateForm = () => {
    const newErrors: typeof errors = {};

    if (!name) {
      newErrors.name = t("auth.validation.required");
    }

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

    if (!confirmPassword) {
      newErrors.confirmPassword = t("auth.validation.required");
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t("auth.validation.passwordMismatch");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const _onRegisterPressed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!_validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Simulating API network delay
      await new Promise((resolve) => setTimeout(resolve, 1200));
      
      // Auto-route to login after registration
      router.push("/login");
    } catch (err: any) {
      setErrors({ general: err.message || "Failed to register" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between py-8 bg-radial from-primary/5 via-transparent to-transparent">
      {/* Top Header Panel */}
      <div className="w-full max-w-7xl px-6 flex justify-between items-center select-none">
        <Link href="/" className="text-xl font-bold text-foreground">
          🐶 {t("common.appName")}
        </Link>
        <div className="flex gap-4">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>

      {/* Card Form */}
      <div className="w-full max-w-md px-6">
        <div className="bg-card border border-border p-8 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black tracking-tight">{t("auth.register")}</h2>
            <p className="text-xs text-muted mt-2">{t("landing.subtitle")}</p>
          </div>

          <form onSubmit={_onRegisterPressed} className="flex flex-col gap-4">
            {errors.general && (
              <div className="p-4 bg-danger/10 text-danger rounded-xl text-xs font-semibold text-center select-none animate-pulse">
                {errors.general}
              </div>
            )}

            <TextField
              label={t("auth.nameLabel")}
              placeholder={t("auth.namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              disabled={isLoading}
            />

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

            <TextField
              label={t("auth.confirmPasswordLabel")}
              placeholder={t("auth.confirmPasswordPlaceholder")}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              disabled={isLoading}
            />

            <Button type="submit" isLoading={isLoading} className="w-full mt-2">
              {t("auth.register")}
            </Button>
          </form>

          <div className="mt-8 text-center text-xs text-muted select-none">
            {t("auth.haveAccount")}{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">
              {t("auth.login")}
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-xs text-muted select-none">
        {t("landing.footer")}
      </div>
    </div>
  );
};
