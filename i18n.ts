import { getRequestConfig } from "next-intl/server";

import { defaultLocale, locales } from "./i18n/routing";

export default getRequestConfig(async ({ locale, requestLocale }) => {
  const requestedLocale = locale ?? (await requestLocale);

  const finalLocale =
    requestedLocale && locales.includes(requestedLocale as (typeof locales)[number])
      ? requestedLocale
      : defaultLocale;

  return {
    locale: finalLocale,
    messages: (await import(`./messages/${finalLocale}.json`)).default,
  };
});
