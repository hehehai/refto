import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

// Can be imported from a shared config
const supportedLanguages = [
  { id: "en", locale: "en", title: "English", isDefault: true },
  { id: "zh_CN", locale: "zh-CN", title: "简体中文" },
];

const baseLanguage = supportedLanguages.find((l) => l.isDefault)!;

export const i18n = {
  ids: supportedLanguages.map((l) => l.id),
  locales: supportedLanguages.map((l) => l.locale),
  defaultId: baseLanguage.id,
  defaultLocale: baseLanguage.locale,
  languages: supportedLanguages,
};

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!i18n.locales.includes(locale)) notFound();

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
