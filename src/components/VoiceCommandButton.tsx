import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startListening, isVoiceRecognitionSupported, VOICE_SUGGESTIONS, type VoiceCommand } from "@/lib/voiceCommands";
import { toast } from "sonner";

const VOICE_EVENT_OPEN_NEW_SESSION = "psipro:voice:open-new-session";
const VOICE_EVENT_FOCUS_PATIENT_SEARCH = "psipro:voice:focus-patient-search";

export function VoiceCommandButton() {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);

  const handleCommand = (command: VoiceCommand) => {
    switch (command) {
      case "nova sessão":
        navigate("/sessions");
        window.dispatchEvent(new CustomEvent(VOICE_EVENT_OPEN_NEW_SESSION));
        break;
      case "agenda":
        navigate("/calendar");
        break;
      case "buscar paciente":
        navigate("/patients");
        window.dispatchEvent(new CustomEvent(VOICE_EVENT_FOCUS_PATIENT_SEARCH));
        break;
      case "dashboard":
        navigate("/");
        break;
    }
  };

  const handleClick = () => {
    if (!isVoiceRecognitionSupported()) {
      toast.error("Comando de voz não suportado neste navegador.");
      return;
    }
    if (isListening) return;

    setIsListening(true);
    toast.info(`Ouvindo... Diga: ${VOICE_SUGGESTIONS.join(", ")}.`);

    startListening({
      onCommand: (command) => {
        handleCommand(command);
        setIsListening(false);
      },
      onFeedback: (message) => {
        toast.success(message);
      },
      onError: (message) => {
        toast.error(message);
        setIsListening(false);
      },
      onNoMatch: () => {
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });
  };

  if (!isVoiceRecognitionSupported()) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      className="rounded-xl gap-2 text-muted-foreground hover:text-foreground"
      onClick={handleClick}
      disabled={isListening}
      aria-label="Ativar comando de voz. Comandos: nova sessão, pacientes, agenda de hoje, dashboard"
    >
      <Mic className={`h-4 w-4 ${isListening ? "animate-pulse text-primary" : ""}`} aria-hidden="true" />
      {isListening ? "Ouvindo..." : "Comando de voz"}
    </Button>
  );
}

export { VOICE_EVENT_OPEN_NEW_SESSION, VOICE_EVENT_FOCUS_PATIENT_SEARCH };
