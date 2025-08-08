// src/lib/intent.ts

/**
 * Trả về true nếu userQuestion có dấu hiệu muốn biết chi tiết về ngành nghề
 */
export function needsDetailAnswer(question: string): boolean {
  const keywords = ["tìm hiểu", "chi tiết", "cho tôi biết", "ngành"];
  const q = question.toLowerCase();
  return keywords.some((k) => q.includes(k));
}
