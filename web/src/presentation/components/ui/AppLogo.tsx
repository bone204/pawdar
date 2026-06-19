"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { APP_ROUTES } from "@/shared/constants/routes";
import { PawPrintIcon } from "@/presentation/components/ui/Icons";

interface AppLogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  isLink?: boolean;
  onClick?: () => void;
  // If true, uses the React Icon component instead of the 🐾 emoji
  useReactIcon?: boolean;
  // Route to link to, defaults to home "/"
  href?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  className = "",
  iconClassName = "",
  textClassName = "",
  isLink = true,
  onClick,
  useReactIcon = true,
  href = APP_ROUTES.home,
}) => {
  const { t } = useTranslation();

  const content = (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none group ${
        isLink ? "cursor-pointer" : ""
      } ${className}`}
    >
      {useReactIcon ? (
        <PawPrintIcon
          className={`w-7 h-7 text-primary group-hover:scale-110 transition-transform duration-300 shrink-0 ${iconClassName}`}
        />
      ) : (
        <span
          className={`text-2xl group-hover:scale-110 transition-transform duration-300 shrink-0 ${iconClassName}`}
        >
          🐾
        </span>
      )}
      <span
        className={`font-black text-2xl bg-linear-to-r from-primary to-amber-600 bg-clip-text text-transparent leading-none ${textClassName}`}
      >
        {t("common.appName") || "PAWDAR"}
      </span>
    </div>
  );

  if (isLink) {
    return (
      <Link href={href} className="inline-block shrink-0">
        {content}
      </Link>
    );
  }

  return content;
};
