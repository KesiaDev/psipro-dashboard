import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { PsiProLogo } from "@/components/PsiProLogo";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="dark min-h-screen dark-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-6">
            <PsiProLogo size="lg" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Criar Conta</h1>
          <p className="text-sm text-muted-foreground">Comece a usar o PsiPro gratuitamente</p>
        </div>

        {/* Form */}
        <div className="glass-card p-8 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Nome</Label>
                <Input placeholder="Maria" className="input-premium h-11" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Sobrenome</Label>
                <Input placeholder="Costa" className="input-premium h-11" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">CRP</Label>
              <Input placeholder="06/12345" className="input-premium h-11" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">E-mail</Label>
              <Input type="email" placeholder="seu@email.com" className="input-premium h-11" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Senha</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  className="input-premium h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <Button variant="gold" className="w-full h-11 rounded-xl text-sm font-semibold">
            Criar Conta
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Ao criar uma conta, você concorda com os{" "}
            <span className="text-primary cursor-pointer">Termos de Uso</span> e{" "}
            <span className="text-primary cursor-pointer">Política de Privacidade</span>.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
