import css from "./AdicionarManutencao.module.css";
import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer/Footer.jsx";
import { useState } from "react";
import { API_URL } from "../App";

export default function AdicionarManutencao() {

    const [preco, setPreco] = useState("");
    const [tipo, setTipo] = useState("");
    const [dateTime, setDateTime] = useState("");
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();

        setErro("");
        setSucesso("");

        if (!preco || !tipo || !dateTime || !sucesso) {
            setErro("Preencha todos os campos");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/adicionar_manutencao`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    preco,
                    tipo,
                    dateTime
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setErro(data.mensagem || "Erro ao adicionar manutenção");
                return;
            }

            setSucesso("Manutenção adicionada com sucesso!");

            // limpa os campos
            setPreco("");
            setTipo("");
            setDateTime("");

        } catch (error) {
            setErro("Erro ao conectar com o servidor");
        }
    }

    return (
        <>
            <Header />

            <div className={css.container}>
                <div className={css.card}>
                    <h2 style={{ fontWeight: "bold" }}>Editar manutenção!</h2>

                    <form className={css.form} onSubmit={handleSubmit}>

                        <div className={css.inputgroup}>
                            <label style={{ fontWeight: "500" }}>Preço</label>
                            <input
                                className={css.seeelect}
                                type="text"
                                placeholder="R$:"
                                value={preco}
                                onChange={(e) => setPreco(e.target.value.replace(/\D/g, ""))}
                            />
                        </div>

                        <div className={css.inputgroup}>
                            <label style={{ fontWeight: "500" }}>Tipo</label>
                            <input
                                className={css.seeelect}
                                type="text"
                                placeholder="Ex: Troca de Pneu"
                                value={tipo}
                                onChange={(e) => setTipo(e.target.value)}
                            />
                        </div>

                        <div className={css.inputgroup}>
                            <label style={{ fontWeight: "500" }}>Data e Hora:</label>
                            <input
                                className={css.seeelect}
                                placeholder="DD/MM/YYYY XX:XX"
                                type="datetime-local"
                                value={dateTime}
                                onChange={(e) => setDateTime(e.target.value)}
                            />
                        </div>

                        <button type="submit" className={css.btn}>
                            Confirmar <span>→</span>
                        </button>

                        {erro && <p style={{ color: "red" }}>{erro}</p>}
                        {sucesso && <p style={{ color: "green" }}>{sucesso}</p>}

                    </form>
                </div>
            </div>

            <Footer />
        </>
    );
}