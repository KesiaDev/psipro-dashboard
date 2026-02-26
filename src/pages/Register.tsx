import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { PsiProLogo } from "@/components/PsiProLogo";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [crp, setCrp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({ title: "A senha deve ter pelo menos 8 caracteres", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, { first_name: firstName, last_name: lastName, crp });
    setLoading(false);
    if (error) {
      toast({ title: "Erro ao criar conta", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Conta criada!", description: "Verifique seu e-mail para confirmar o cadastro." });
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-6">
            <PsiProLogo size="lg" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Criar Conta</h1>
          <p className="text-sm text-muted-foreground">Comece a usar o PsiPro gratuitamente</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Nome</Label>
                <Input placeholder="Maria" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input-premium h-11" required />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Sobrenome</Label>
                <Input placeholder="Costa" value={lastName} onChange={(e) => setLastName(e.target.value)} className="input-premium h-11" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">CRP</Label>
              <Input placeholder="06/12345" value={crp} onChange={(e) => setCrp(e.target.value)} className="input-premium h-11" required />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">E-mail</Label>
              <Input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="input-premium h-11" required />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Senha</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-premium h-11 pr-10"
                  required
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

          <Button variant="gold" className="w-full h-11 rounded-xl text-sm font-semibold" disabled={loading}>
            {loading ? "Criando..." : "Criar Conta"}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Ao criar uma conta, você concorda com os{" "}
            <span className="text-primary cursor-pointer">Termos de Uso</span> e{" "}
            <span className="text-primary cursor-pointer">Política de Privacidade</span>.
          </p>
        </form>

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
