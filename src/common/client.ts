export const WALK_IN_EMAIL_PREFIX = "walkin+";

export const isWalkInClientEmail = (email?: string | null) => {
  if (typeof email !== "string") {
    return false;
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return false;
  }

  return normalizedEmail.startsWith(WALK_IN_EMAIL_PREFIX);
};

export const isWalkInClient = (
  client?: { email?: string | null } | null,
) => {
  if (!client) {
    return false;
  }

  return isWalkInClientEmail(client.email);
};
