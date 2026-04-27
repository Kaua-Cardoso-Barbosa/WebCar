import { useState } from "react";
import css from "./AgendeSuaVisita.module.css";
import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer/Footer.jsx";
import { API_URL } from "../App";

export default function AgendarSuaVisita() {
    const [nome, setNome] = useState("");
    const [celular, setCelular] = useState("");
    const [dataHora, setDataHora] = useState("");
    const [mensagem, setMensagem] = useState("");

    async function agendarVisita(e) {
        e.preventDefault();

        try {
            const response = await fetch(`${API_URL}/agendar_visita`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nome: nome,
                    celular: celular,
                    data_hora: dataHora
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setMensagem(data.mensagem || "Erro ao agendar visita");
                return;
            }

            setMensagem(data.mensagem || "Visita agendada com sucesso");
            setNome("");
            setCelular("");
            setDataHora("");
        } catch (error) {
            setMensagem("Erro ao conectar com o servidor");
        }
    }

    return (
        <>
            <Header />

            <div className={css.container}>
                <div className={css.card}>
                    <h2 style={{ fontWeight: "bold" }}>Agende sua visita!</h2>
                    <p className={css.subtitulo}>
                        Agende uma visita para ver seu veículo na loja
                    </p>

                    <form className={css.form} onSubmit={agendarVisita}>
                        <div className={css.inputgroup}>
                            <label style={{ fontWeight: "500" }}>Nome completo</label>
                            <input
                                className={css.seeelect}
                                type="text"
                                placeholder="Ex: Maria Silva dos Santos"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                            />
                        </div>

                        <div className={css.inputgroup}>
                            <label style={{ fontWeight: "500" }}>Número de celular</label>
                            <input
                                className={css.seeelect}
                                type="text"
                                placeholder="(11) 0000-0000"
                                value={celular}
                                onChange={(e) => setCelular(e.target.value)}
                            />
                        </div>

                        <div className={css.inputgroup}>
                            <label style={{ fontWeight: "500" }}>Data/Hora</label>
                            <input
                                className={css.seeelect}
                                type="text"
                                placeholder="24/8/2026"
                                value={dataHora}
                                onChange={(e) => setDataHora(e.target.value)}
                            />
                        </div>

                        <button type="submit" className={css.btn}>
                            Confirmar <span>→</span>
                        </button>
                    </form>

                    {mensagem && <p>{mensagem}</p>}
                </div>
            </div>

            <Footer />
        </>
    );
}