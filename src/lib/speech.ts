/**
 * Web Speech API - síntese de fala para acessibilidade.
 * Compatível com Chrome, Edge, Safari.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
 */

const PT_BR = "pt-BR";

/**
 * Verifica se a Web Speech API está disponível.
 */
export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Faz a leitura em voz alta do texto informado.
 * @param text - Texto a ser falado
 * @param options - Opções adicionais (rate, volume, etc.)
 */
export function speakText(
  text: string,
  options?: { lang?: string; rate?: number; volume?: number; onEnd?: () => void }
): void {
  if (!text?.trim()) return;
  if (!isSpeechSupported()) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = options?.lang ?? PT_BR;
  utterance.rate = options?.rate ?? 1;
  utterance.volume = options?.volume ?? 1;

  if (options?.onEnd) {
    utterance.onend = options.onEnd;
  }

  window.speechSynthesis.cancel(); // interrompe leitura anterior
  window.speechSynthesis.speak(utterance);
}

/**
 * Interrompe a leitura em andamento.
 */
export function stopSpeech(): void {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
}
