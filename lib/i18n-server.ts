import { cookies } from "next/headers";

import { LANGUAGE_COOKIE_NAME, normalizeLanguage } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/queries";

export async function getServerLanguage() {
  const cookieStore = await cookies();
  const cookieLanguage = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value;

  if (cookieLanguage) {
    return normalizeLanguage(cookieLanguage);
  }

  const user = await getCurrentUser();
  return normalizeLanguage(user?.preferredLanguage);
}
