// Gemini 텍스트 생성 호출을 공통 형태로 감싼 얇은 래퍼 모음입니다.
import { GoogleGenAI } from "@google/genai";

// Gemini SDK가 던지는 원본 오류를 사용자 표시용 짧은 문장으로 정리합니다.
function normalizeGeminiErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error ?? "");
  const trimmed = raw.trim();

  let parsedMessage = trimmed;
  let parsedStatus = "";
  let parsedCode = 0;

  try {
    const parsed = JSON.parse(trimmed) as {
      error?: { code?: number; message?: string; status?: string };
    };
    parsedMessage = parsed.error?.message?.trim() || parsedMessage;
    parsedStatus = String(parsed.error?.status ?? "").trim();
    parsedCode = Number(parsed.error?.code ?? 0);
  } catch {
    // 원본이 JSON이 아닐 수도 있으므로 그대로 다음 규칙으로 분기합니다.
  }

  const haystack = `${trimmed}\n${parsedMessage}\n${parsedStatus}`.toLowerCase();

  if (
    parsedCode === 503 ||
    haystack.includes("503") ||
    haystack.includes("unavailable") ||
    haystack.includes("high demand")
  ) {
    return "AI 요청이 많아 요약 생성이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.";
  }

  if (haystack.includes("fetch failed")) {
    return "AI 서비스 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.";
  }

  if (haystack.includes("api key")) {
    return "AI 설정이 올바르지 않습니다. API 키를 확인해 주세요.";
  }

  return parsedMessage || "AI 요약 생성 중 오류가 발생했습니다.";
}

/**
 * Gemini API 호출용 클라이언트를 생성합니다.
 * `GEMINI_API_KEY`는 `process.env.GEMINI_API_KEY`에서 읽습니다.
 */
function createGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY가 설정되지 않았습니다.");
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * 단일 사용자 프롬프트로 Gemini에 텍스트 생성을 요청하고, 응답 본문 텍스트를 반환합니다.
 *
 * @param prompt - 사용자 메시지
 * @param model - 사용할 모델 ID (기본값: `gemini-2.5-flash`)
 * @returns 모델이 생성한 텍스트
 * @throws 응답에 텍스트가 없을 때
 */
export async function generateGeminiText(
  prompt: string,
  model: string = "gemini-2.5-flash",
): Promise<string> {
  try {
    const ai = createGeminiClient();
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const text = response.text;
    if (text == null || text === "") {
      throw new Error("Gemini response did not include text");
    }
    return text;
  } catch (error) {
    throw new Error(normalizeGeminiErrorMessage(error));
  }
}

/**
 * 시스템 지시와 사용자 프롬프트를 한 줄 바꿈으로 이어 붙인 뒤, 단일 프롬프트로 생성을 요청합니다.
 *
 * @param systemPrompt - 시스템 역할/지시 문구
 * @param userPrompt - 사용자 메시지
 * @param model - 사용할 모델 ID (기본값: `gemini-2.5-flash`)
 * @returns 모델이 생성한 텍스트
 * @throws 응답에 텍스트가 없을 때
 */
export async function generateGeminiTextWithSystemPrompt(
  systemPrompt: string,
  userPrompt: string,
  model: string = "gemini-2.5-flash",
): Promise<string> {
  const combinedPrompt = `${systemPrompt}\n${userPrompt}`;
  return generateGeminiText(combinedPrompt, model);
}

/**
 * 스트리밍으로 Gemini 텍스트 생성을 요청하고, 각 청크의 `text`를 순차적으로 yield합니다.
 *
 * @param prompt - 사용자 메시지
 * @param model - 사용할 모델 ID (기본값: `gemini-2.5-flash`)
 * @yields 스트림 청크별 텍스트 조각
 */
export async function* generateGeminiTextStream(
  prompt: string,
  model: string = "gemini-2.5-flash",
): AsyncGenerator<string, void, unknown> {
  try {
    const ai = createGeminiClient();
    const responseStream = await ai.models.generateContentStream({
      model,
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text != null && text !== "") {
        yield text;
      }
    }
  } catch (error) {
    throw new Error(normalizeGeminiErrorMessage(error));
  }
}
