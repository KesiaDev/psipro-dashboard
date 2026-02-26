import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail } from "lucide-react";
import { PsiProLogo } from "@/components/PsiProLogo";

const ForgotPassword = () => {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-6">
            <PsiProLogo size="lg" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            {sent ? "E-mail Enviado" : "Recuperar Senha"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {sent
              ? "Verifique sua caixa de entrada para redefinir a senha."
              : "Insira seu e-mail para receber o link de recuperação."}
          </p>
        </div>

        {/* Form */}
        <div className="glass-card p-8 space-y-6">
          {sent ? (
            <div className="flex flex-col items-center py-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent mb-4">
                <Mail className="h-7 w-7 text-accent-foreground" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Enviamos as instruções para <span className="text-foreground font-medium">{email}</span>
              </p>
              <Button
                variant="outline-gold"
                className="mt-6 rounded-xl"
                onClick={() => setSent(false)}
              >
                Reenviar e-mail
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">E-mail</Label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-premium h-11"
                />
              </div>
              <Button
                variant="gold"
                className="w-full h-11 rounded-xl text-sm font-semibold"
                onClick={() => setSent(true)}
              >
                Enviar Link de Recuperação
              </Button>
            </>
          )}
        </div>

        {/* Footer */}
        <Link
          to="/login"
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
