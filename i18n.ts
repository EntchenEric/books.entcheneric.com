// i18n.ts

import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

const locales = ['en', 'de'];

export default getRequestConfig(async ({ locale }) => {
  if (!locale || !locales.includes(locale)) {
    notFound();
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});