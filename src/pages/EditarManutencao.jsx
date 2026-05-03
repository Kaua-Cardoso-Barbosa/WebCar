import css from "./EditarManutencao.module.css";
import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer/Footer.jsx";
import { useState } from "react";
import { API_URL } from "../App";
import { useLocation, useNavigate } from "react-router-dom";

export default function EditarManutencao() {
    const location = useLocation();
    const navigate = useNavigate();

    const manutencao = location.state?.manutencao;
    const carro = location.state?.carro;

    const [data, setData] = useState(formatarDataParaInput(manutencao?.data));
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");
    const [salvando, setSalvando] = useState(false);
    const hoje = new Date().toISOString().split("T")[0];

    function formatarDataParaInput(dataRecebida) {
        if (!dataRecebida) return "";

        const texto = String(dataRecebida);

        if (texto.includes("-")) {
            const partes = texto.split("-");
            return `${partes[0]}-${partes[1]}-${partes[2].substring(0, 2)}`;
        }

        if (texto.includes("/")) {
            const [dia, mes, ano] = texto.split("/");
            return `${ano}-${mes}-${dia}`;
        }

        return "";
    }

    function formatarDataParaBack(dataInput) {
        const [ano, mes, dia] = dataInput.split("-");
        return `${dia}/${mes}/${ano}`;
    }

    function formatarPreco(valor) {
        return Number(valor || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        setErro("");
        setSucesso("");

        if (!manutencao?.id_manutencao) {
            setErro("Manutenção não encontrada.");
            return;
        }

        if (!carro?.ID_VEICULO) {
            setErro("Veículo não encontrado.");
            return;
        }

        if (!data) {
            setErro("Informe a data da manutenção.");
            return;
        }

        if (data < hoje) {
            setErro("A data da manutenção não pode ser passada.");
            return;
        }

        try {
            setSalvando(true);

            const response = await fetch(`${API_URL}/edicao_manutencao/${manutencao.id_manutencao}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    id_veiculo: carro.ID_VEICULO,
                    data: formatarDataParaBack(data),
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                setErro(result.mensagem || "Não foi possível salvar as alterações.");
                return;
            }

            setSucesso(result.mensagem || "Manutenção atualizada com sucesso.");

            setTimeout(() => {
                navigate(-1);
            }, 900);
        } catch (error) {
            console.error(error);
            setErro("Não foi possível salvar as alterações.");
        } finally {
            setSalvando(false);
        }
    }

    if (!manutencao || !carro) {
        return (
            <>
                <Header />
                <div className={css.container}>
                    <div className={css.card}>
                        <h2>Manutenção não encontrada</h2>
                        <button className={css.cancelar} onClick={() => navigate(-1)}>
                            Voltar
                        </button>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />

            <div className={css.container}>
                <div className={css.card}>
                    <h2>Editar manutenção</h2>

                    <p className={css.subtitulo}>
                        Veículo: <strong>{carro.MARCA} {carro.MODELO}</strong>
                    </p>

                    <div className={css.resumo}>
                        <span>Valor atual</span>
                        <strong>{formatarPreco(manutencao.valor_total)}</strong>
                    </div>

                    {erro && <div className={css.erro}>{erro}</div>}
                    {sucesso && <div className={css.sucesso}>{sucesso}</div>}

                    <form className={css.form} onSubmit={handleSubmit}>
                        <div className={css.inputgroup}>
                            <label>Data da manutenção</label>
                            <input
                                className={css.input}
                                type="date"
                                min={hoje}
                                value={data}
                                onChange={(e) => setData(e.target.value)}
                            />
                        </div>

                        <button type="submit" className={css.btn} disabled={salvando}>
                            {salvando ? "Salvando..." : "Salvar alterações"}
                        </button>

                        <button
                            type="button"
                            className={css.cancelar}
                            onClick={() => navigate(-1)}
                        >
                            Cancelar
                        </button>
                    </form>
                </div>
            </div>

            <Footer />
        </>
    );
}
