import "server-only";

export type AuthPayload = {
  email: string;
  name?: string;
  password: string;
};

type AuthValidationOptions = {
  minPasswordLength?: number;
  requireName?: boolean;
};

export function parseAuthPayload(
  value: unknown,
  options: AuthValidationOptions = {},
): { data?: AuthPayload; error?: string } {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { error: "Invalid request body." };
  }

  const body = value as Record<string, unknown>;
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  const password = typeof body.password === "string" ? body.password : "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Email invalid." };
  }

  if (name !== undefined && name.length < 2) {
    return { error: "Numele trebuie sa aiba cel putin 2 caractere." };
  }

  if (options.requireName && !name) {
    return { error: "Numele trebuie sa aiba cel putin 2 caractere." };
  }

  if (password.length < (options.minPasswordLength ?? 1)) {
    return { error: "Parola trebuie sa aiba cel putin 10 caractere." };
  }

  return {
    data: {
      email,
      name,
      password,
    },
  };
}
