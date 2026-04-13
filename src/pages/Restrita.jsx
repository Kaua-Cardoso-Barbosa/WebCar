import css from "./Restrita.module.css";
import { useNavigate } from "react-router-dom";

export default function Restrita() {
    const navigate = useNavigate();

    const nomeUsuario = localStorage.getItem("usuario_nome");

    async function fazerLogout() {
        try {
            await fetch("http://10.92.3.167:5000/logout", {
                method: "POST",
                credentials: "include"
            });
        } catch (error) {
            console.log("Erro ao fazer logout");
        }

        localStorage.removeItem("usuario_id");
        localStorage.removeItem("usuario_nome");
        localStorage.removeItem("usuario_email");
        localStorage.removeItem("usuario_tipo");

        navigate("/login");
    }

    return (
        <main className={css.container}>
            <div className={css.card}>
                <h1 className={css.titulo}>
                    Olá, {nomeUsuario}
                </h1>

                <button
                    className={css.botao}
                    onClick={fazerLogout}
                >
                    Logout
                </button>
            </div>
        </main>
    );
}