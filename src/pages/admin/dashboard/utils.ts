export const getRecentItems = <T extends { createdAt: string }>(
  items: T[],
  limit: number,
) =>
  [...items]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, limit);
