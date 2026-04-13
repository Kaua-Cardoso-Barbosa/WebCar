import SidebarMenu from "../components/SidebarMenu/SidebarMenu";
import css from "./CadastrarServico.module.css";
import { useState } from "react";
import Footer from "../components/Footer/Footer.jsx";
import Header from "../components/Header/Header.jsx";

export default function CadastrarServico() {
    const [descricao, setDescricao] = useState("");
    const [valor, setValor] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("");

    function formatarMoeda(valorDigitado) {
        const apenasNumeros = valorDigitado.replace(/\D/g, "");

        if (!apenasNumeros) return "";

        const numero = (parseInt(apenasNumeros, 10) / 100).toFixed(2);
        return numero.replace(".", ",");
    }

    function handleValor(e) {
        setValor(formatarMoeda(e.target.value));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!descricao.trim() || !valor.trim()) {
            setMensagem("Preencha a descrição e o valor do serviço.");
            setTipoMensagem("danger");
            return;
        }

        try {
            const response = await fetch("http://10.92.3.167:5000/cadastrar_servico", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    descricao: descricao,
                    valor_unitario: valor.replace(",", ".")
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setMensagem(data.mensagem || "Erro ao cadastrar serviço.");
                setTipoMensagem("danger");
                return;
            }

            setMensagem(data.mensagem || "Serviço cadastrado com sucesso.");
            setTipoMensagem("success");

            setDescricao("");
            setValor("");
        } catch (error) {
            setMensagem("Erro ao conectar com o servidor.");
            setTipoMensagem("danger");
        }
    }

    return (
        <>
            <Header />

            <div className={`d-flex ${css.layout}`}>
                <SidebarMenu />

                <main className={`flex-grow-1 p-4 ${css.main}`}>
                    <div className="container-fluid">
                        <p className={`mb-2 ${css.breadcrumbTexto}`}>
                            Serviços <span className="mx-1">›</span> Cadastrar Serviço
                        </p>

                        <h1 className={`fw-bold mb-2 ${css.titulo}`}>Cadastrar serviço</h1>
                        <p className={`mb-4 ${css.subtitulo}`}>
                            Cadastre serviços com descrição e valor, como troca de óleo, revisão e alinhamento.
                        </p>

                        {mensagem && (
                            <div className={`alert alert-${tipoMensagem} mb-4`} role="alert">
                                {mensagem}
                            </div>
                        )}

                        <div className={`card border-0 shadow-sm ${css.cardCustom}`}>
                            <div className="card-body p-4">
                                <h5 className={`fw-semibold mb-4 ${css.sectionTitle}`}>
                                    Informações do Serviço
                                </h5>

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className={`form-label ${css.label}`}>Descrição</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Ex: Troca de óleo"
                                            value={descricao}
                                            onChange={(e) => setDescricao(e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className={`form-label ${css.label}`}>Valor (R$)</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="0,00"
                                            value={valor}
                                            onChange={handleValor}
                                        />
                                    </div>

                                    <div className="d-flex justify-content-end gap-3">
                                        <button type="button" className="btn btn-light px-4 py-2 fw-semibold">
                                            Cancelar
                                        </button>

                                        <button
                                            type="submit"
                                            className={`btn px-4 py-2 fw-semibold ${css.botaoSalvar}`}
                                        >
                                            Salvar Serviço
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <Footer />
        </>
    );
}