import type { Role } from "@/lib/types";

// Access levels, each includes the ones before it
export const LEVELS = ["member", "committee", "admin"] as const;
export type Level = (typeof LEVELS)[number];

export const LEVEL_LABELS: Record<Level, string> = {
  member: "Member",
  committee: "Committee",
  admin: "Admin",
};

/* Highest level held, or null for no access. */
export function levelOf(roles: Role[]): Level | null {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (roles.includes(LEVELS[i])) return LEVELS[i];
  }
  return null;
}

/* Role array for a level, empty for no access. */
export function rolesFor(level: Level | null): Role[] {
  if (!level) return [];
  return LEVELS.slice(0, LEVELS.indexOf(level) + 1) as Role[];
}

/* Whether an actor at actorLevel may move someone from one level to another. */
export function canChangeLevel(actorLevel: Level | null, from: Level | null, to: Level | null): boolean {
  if (actorLevel === "admin") return true;
  if (actorLevel !== "committee") return false;
  // Committee can't touch admins or create them
  return from !== "admin" && to !== "admin";
}
