// src/lib/summary.ts
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai";

const MAX_HISTORY = 20;
const KEEP_RECENT = 10;

/**
 * Nếu messages dài hơn MAX_HISTORY, tóm tắt phần olderMessages (đầu array)
 * và trả về { summary, recent }.
 */
export async function summarizeHistory(
  history: ChatCompletionMessageParam[],
  apiKey: string
): Promise<{
  summary: string | null;
  recent: ChatCompletionMessageParam[];
}> {
  if (history.length <= MAX_HISTORY) {
    return { summary: null, recent: history };
  }

  // olderMessages: phần cần tóm tắt
  const older = history.slice(0, history.length - KEEP_RECENT);
  const recent = history.slice(history.length - KEEP_RECENT);

  const openai = new OpenAI({ apiKey });
  const promptMessages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "Bạn là trợ lý AI giúp tóm tắt nội dung hội thoại trước đây thành 2-3 câu ngắn gọn."
    },
    ...older,
    {
      role: "user",
      content: "Hãy tóm tắt nội dung trên."
    }
  ];

  const resp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: promptMessages
  });

  const summary = resp.choices[0].message.content?.trim() ?? null;
  return { summary, recent };
}
