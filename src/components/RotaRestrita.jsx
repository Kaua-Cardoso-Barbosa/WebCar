import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function RotaRestrita({ children }) {
    const [logado, setLogado] = useState(null);

    useEffect(() => {
        async function verificarLogin() {
            try {
                const response = await fetch("http://10.92.3.145:5000/verificar_login", {
                    method: "GET",
                    credentials: "include"
                });

                if (response.ok) {
                    setLogado(true);
                } else {
                    setLogado(false);
                }
            } catch (erro) {
                setLogado(false);
            }
        }

        verificarLogin();
    }, []);

    // enquanto verifica
    if (logado === null) {
        return <p>Carregando...</p>;
    }

    // não logado → volta pro login
    if (!logado) {
        return <Navigate to="/login" />;
    }

    // logado → entra na página
    return children;
}