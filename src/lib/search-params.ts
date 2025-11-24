import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

// Home page search and filter params
export const homeSearchParsers = {
  s: parseAsString.withDefault(""),
  tags: parseAsArrayOf(parseAsString).withDefault([]),
};

export const homeSearchParamsCache = createSearchParamsCache(homeSearchParsers);

// Auth redirect params
export const authRedirectParsers = {
  from: parseAsString,
};

export const authRedirectParamsCache =
  createSearchParamsCache(authRedirectParsers);

// Sign in mode params
const signInModes = ["email", "email-otp", "password"] as const;
export type SignInMode = (typeof signInModes)[number];

export const signInModeParsers = {
  mode: parseAsStringLiteral(signInModes).withDefault("email"),
};

export const signInModeParamsCache = createSearchParamsCache(signInModeParsers);

// Email verification params
export const emailVerificationParsers = {
  email: parseAsString,
  token: parseAsString,
};

export const emailVerificationParamsCache = createSearchParamsCache(
  emailVerificationParsers
);

// Unsubscribe params (same as email verification)
export const unsubscribeParsers = {
  email: parseAsString,
  token: parseAsString,
};

export const unsubscribeParamsCache =
  createSearchParamsCache(unsubscribeParsers);
