export type CurrentUserLite = { id: string; organizationId?: string };

export function getCurrentUserLite(): CurrentUserLite | null {
  try {
    const raw = localStorage.getItem("currentUser");
    if (!raw) return null;
    const u = JSON.parse(raw);
    if (u?.id) return { id: u.id, organizationId: u.organizationId };
  } catch {}
  return null;
}
