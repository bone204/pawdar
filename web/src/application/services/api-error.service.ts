// Service to translate API response codes to localized user-facing messages.
// Usage: const { translateCode } = useApiErrorService();
//        translateCode(ResponseCode.EMAIL_ALREADY_REGISTERED) → "Email này đã được đăng ký..."

import { useTranslation } from "@/presentation/providers/LanguageProvider";
import { ResponseCode } from "@/shared/constants/response-codes";

interface ApiError {
  code?: string;
  message?: string;
}

export const useApiErrorService = () => {
  const { t } = useTranslation();

  /**
   * Translates a ResponseCode string to a localized message.
   * Falls back to unknown_error if the code is not mapped in the locale.
   */
  const translateCode = (code: string | undefined): string => {
    if (!code) {
      return t("api.codes.unknown_error");
    }

    const key = `api.codes.${code}` as Parameters<typeof t>[0];
    const translated = t(key);

    // If key is not found in locale, the i18n hook returns the key itself
    if (translated === key) {
      return t("api.codes.unknown_error");
    }

    return translated;
  };

  /**
   * Extracts the code from an RTK Query error object and returns a localized message.
   * Handles both RTK serialized errors and FetchBaseQuery errors.
   */
  const translateError = (error: unknown): string => {
    if (!error) return t("api.codes.unknown_error");

    const apiError = error as ApiError;

    // RTK Query transformErrorResponse returns { code, message }
    if (apiError.code) {
      return translateCode(apiError.code);
    }

    // Network-level failure (no response from server)
    return t("api.codes.network_error");
  };

  /**
   * Checks if an error code matches a specific ResponseCode.
   * Useful for conditional rendering based on specific error types.
   */
  const isErrorCode = (error: unknown, code: ResponseCode): boolean => {
    const apiError = error as ApiError;
    return apiError?.code === code;
  };

  return { translateCode, translateError, isErrorCode };
};
