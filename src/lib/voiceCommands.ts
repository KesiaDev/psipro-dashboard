/**
 * Web Speech API - reconhecimento de voz para comandos.
 * Compatível com Chrome, Edge, Safari (webkitSpeechRecognition).
 * @see https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
 */

export type VoiceCommand = "nova sessão" | "abrir agenda" | "buscar paciente";

export type VoiceCommandHandler = (command: VoiceCommand, transcript: string) => void;

const COMMAND_KEYWORDS: Record<VoiceCommand, string[]> = {
  "nova sessão": ["nova sessão", "nova sessao", "criar sessão", "criar sessao"],
  "abrir agenda": ["abrir agenda", "ir para agenda", "ver agenda", "agenda"],
  "buscar paciente": ["buscar paciente", "buscar pacientes", "procurar paciente", "ir para pacientes"],
};

function normalizeTranscript(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .trim();
}

function matchCommand(transcript: string): VoiceCommand | null {
  const normalized = normalizeTranscript(transcript);
  for (const [command, keywords] of Object.entries(COMMAND_KEYWORDS)) {
    for (const kw of keywords) {
      if (normalized.includes(normalizeTranscript(kw))) {
        return command as VoiceCommand;
      }
    }
  }
  return null;
}

export function isVoiceRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  const SpeechRecognition = (window as Window & { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition;
  const webkitSpeechRecognition = (window as Window & { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition;
  return !!(SpeechRecognition || webkitSpeechRecognition);
}

export function getSpeechRecognition(): typeof SpeechRecognition | null {
  if (typeof window === "undefined") return null;
  const SpeechRecognition = (window as Window & { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition;
  const webkitSpeechRecognition = (window as Window & { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition;
  return SpeechRecognition ?? webkitSpeechRecognition ?? null;
}

export type StartListeningOptions = {
  onCommand: VoiceCommandHandler;
  onFeedback?: (message: string) => void;
  onError?: (error: string) => void;
  onNoMatch?: (transcript: string) => void;
  onEnd?: () => void;
};

export function startListening({
  onCommand,
  onFeedback,
  onError,
  onNoMatch,
  onEnd,
}: StartListeningOptions): void {
  const Recognition = getSpeechRecognition();
  if (!Recognition) {
    onError?.("Reconhecimento de voz não suportado neste navegador.");
    return;
  }

  const recognition = new Recognition();
  recognition.lang = "pt-BR";
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const result = event.results[event.results.length - 1];
    const transcript = result[0]?.transcript ?? "";
    const command = matchCommand(transcript);

    if (command) {
      onFeedback?.(`Comando detectado: ${command}`);
      onCommand(command, transcript);
    } else if (transcript.trim()) {
      onNoMatch?.(transcript);
      onFeedback?.(`Nenhum comando reconhecido em: "${transcript}"`);
    }
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    if (event.error === "no-speech") {
      onFeedback?.("Nenhuma fala detectada. Tente novamente.");
    } else if (event.error === "not-allowed") {
      onError?.("Permissão de microfone negada.");
    } else {
      onError?.(`Erro: ${event.error}`);
    }
  };

  recognition.onend = () => {
    onEnd?.();
  };

  recognition.start();
}
