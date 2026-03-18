import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/** Redireciona para /login quando a API retorna 401 (token expirado). */
export function Auth401Redirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const handle401 = () => {
      navigate("/login", { replace: true });
    };
    window.addEventListener("psipro:auth:401", handle401);
    return () => window.removeEventListener("psipro:auth:401", handle401);
  }, [navigate]);

  return null;
}
