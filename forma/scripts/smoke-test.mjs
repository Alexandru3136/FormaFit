const baseUrl = process.env.FORMA_BASE_URL ?? "http://localhost:3001";

const publicPages = [
  "/",
  "/login",
  "/register",
  "/pricing",
  "/terms",
  "/privacy",
  "/manifest.webmanifest",
];

const protectedPages = [
  "/dashboard",
  "/nutrition",
  "/meal-plan",
  "/workouts",
  "/coach",
  "/profile",
  "/premium",
];

function buildUrl(path) {
  return new URL(path, baseUrl).toString();
}

async function assertPage(path, expectedStatus) {
  const response = await fetch(buildUrl(path), { redirect: "manual" });

  if (response.status !== expectedStatus) {
    throw new Error(`${path} expected ${expectedStatus}, received ${response.status}`);
  }

  console.log(`ok ${path} -> ${response.status}`);
}

async function assertProtectedRedirect(path) {
  const response = await fetch(buildUrl(path), { redirect: "manual" });
  const location = response.headers.get("location") ?? "";

  if (![307, 308].includes(response.status) || !location.includes("/login")) {
    throw new Error(`${path} expected redirect to /login, received ${response.status} ${location}`);
  }

  console.log(`ok ${path} -> ${response.status} ${location}`);
}

async function assertInvalidLogin() {
  const response = await fetch(buildUrl("/api/auth/login"), {
    body: JSON.stringify({
      email: "missing-user@example.test",
      password: "wrong",
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (response.status !== 401) {
    throw new Error(`/api/auth/login invalid credentials expected 401, received ${response.status}`);
  }

  console.log("ok /api/auth/login invalid credentials -> 401");
}

async function assertI18nTranslate() {
  const response = await fetch(buildUrl("/api/i18n/translate"), {
    body: JSON.stringify({
      language: "en",
      texts: ["Intra in cont", "Forma"],
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const payload = await response.json();

  if (response.status !== 200 || !payload.translations?.["Intra in cont"]) {
    throw new Error(`/api/i18n/translate expected a translation, received ${response.status}`);
  }

  if (payload.translations.Forma) {
    throw new Error("/api/i18n/translate should not translate the product name Forma");
  }

  console.log("ok /api/i18n/translate public UI translation -> 200");
}

async function main() {
  console.log(`Smoke testing Forma at ${baseUrl}`);

  for (const page of publicPages) {
    await assertPage(page, 200);
  }

  for (const page of protectedPages) {
    await assertProtectedRedirect(page);
  }

  await assertInvalidLogin();
  await assertI18nTranslate();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
