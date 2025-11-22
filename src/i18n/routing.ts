import { defineRouting } from "next-intl/routing";

export type SiteLocale = "en" | "zh-CN";

// Can be imported from a shared config
export const supportedLanguages = [
  { id: "en", locale: "en", title: "English", isDefault: true },
  { id: "zh_CN", locale: "zh-CN", title: "简体中文" },
];

export enum SupportLocale {
  en = "en",
  zh_CN = "zh-CN",
}

const baseLanguage = supportedLanguages.find((l) => l.isDefault)!;

export const routing = defineRouting({
  locales: supportedLanguages.map((l) => l.locale),
  defaultLocale: baseLanguage.locale,
  localePrefix: "as-needed",
});

// Legacy export for compatibility
export const i18n = {
  ids: supportedLanguages.map((l) => l.id),
  locales: supportedLanguages.map((l) => l.locale),
  defaultId: baseLanguage.id,
  defaultLocale: baseLanguage.locale,
  languages: supportedLanguages,
};
