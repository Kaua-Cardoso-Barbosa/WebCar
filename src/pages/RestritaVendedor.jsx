import css from "./RestritaVendedor.module.css";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../App";

export default function RestritaVendedor() {

    const navigate = useNavigate();
    const nomeUsuario = localStorage.getItem("usuario_nome");

    async function fazerLogout() {
        try {
            await fetch(`${API_URL}/logout`, {
                method: "POST",
                credentials: "include"
            });
        } catch (error) {
            console.log("Erro ao fazer logout");
        }

        localStorage.clear();
        navigate("/login");
    }


    return (
        <main className={css.container}>
            <div className={css.card}>
                <h1 className={css.titulo}>Olá, {nomeUsuario}</h1>
                <p className={css.texto}>Essa página é exclusiva para vendedor.</p>

                <button className={css.botao} onClick={fazerLogout}>
                    Logout
                </button>
            </div>
        </main>
    );
}