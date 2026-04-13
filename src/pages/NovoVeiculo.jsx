import SidebarMenu from "../components/SidebarMenu/SidebarMenu";
import css from "./NovoVeiculo.module.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer/Footer.jsx";

export default function NovoVeiculo() {
    const navigate = useNavigate();

    const [marca, setMarca] = useState("");
    const [modelo, setModelo] = useState("");
    const [anoFabricacao, setAnoFabricacao] = useState("");
    const [anoModelo, setAnoModelo] = useState("");
    const [documento, setDocumento] = useState("");
    const [km, setKm] = useState("");
    const [combustivel, setCombustivel] = useState("");
    const [cambio, setCambio] = useState("");
    const [cor, setCor] = useState("");
    const [placa, setPlaca] = useState("");
    const [renavam, setRenavam] = useState("");
    const [valorCusto, setValorCusto] = useState("");
    const [valorVenda, setValorVenda] = useState("");

    const [erroRenavam, setErroRenavam] = useState("");
    const [imagem, setImagem] = useState(null);
    const [preview, setPreview] = useState(null);

    function handleImagem(e) {
        const arquivo = e.target.files[0];

        if (arquivo) {
            setImagem(arquivo);
            setPreview(URL.createObjectURL(arquivo));
        }
    }

    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);


    const [mensagem, setMensagem] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("");
    const [carregando, setCarregando] = useState(false);

    function apenasNumeros(valor) {
        return valor.replace(/\D/g, "");
    }

    function apenasLetras(valor) {
        return valor.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
    }

    function formatarMoeda(valor) {
        const numeros = valor.replace(/\D/g, "");

        if (!numeros) return "";

        const numero = (parseInt(numeros, 10) / 100).toFixed(2);
        return numero.replace(".", ",");
    }

    function formatarPlaca(valor) {
        const limpa = valor.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);

        if (limpa.length <= 3) return limpa;

        return `${limpa.slice(0, 3)}-${limpa.slice(3)}`;
    }

    function validarRenavam(valor) {
        const renavamLimpo = valor.replace(/\D/g, "");

        if (renavamLimpo.length !== 11) return false;

        const base = renavamLimpo.slice(0, 10);
        const digitoInformado = parseInt(renavamLimpo[10], 10);

        let soma = 0;
        let peso = 3;

        for (let i = 0; i < 10; i++) {
            soma += parseInt(base[i], 10) * peso;
            peso--;

            if (peso < 2) {
                peso = 9;
            }
        }

        let digitoCalculado = 11 - (soma % 11);

        if (digitoCalculado >= 10) {
            digitoCalculado = 0;
        }

        return digitoCalculado === digitoInformado;
    }

    function handleImagem(e) {
        const arquivo = e.target.files[0];

        if (arquivo) {
            setImagem(arquivo);
            setPreview(URL.createObjectURL(arquivo));
        }
    }

    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    function handleRenavam(e) {
        const valor = apenasNumeros(e.target.value).slice(0, 11);

        setRenavam(valor);

        if (valor.length === 11) {
            if (!validarRenavam(valor)) {
                setErroRenavam("RENAVAM inválido");
            } else {
                setErroRenavam("");
            }
        } else {
            setErroRenavam("");
        }
    }

    async function salvarVeiculo() {
        if (
            !marca.trim() ||
            !modelo.trim() ||
            !anoFabricacao.trim() ||
            !anoModelo.trim() ||
            !documento.trim() ||
            !km.trim() ||
            !combustivel.trim() ||
            !cambio.trim() ||
            !cor.trim() ||
            !placa.trim() ||
            !renavam.trim() ||
            !valorCusto.trim() ||
            !valorVenda.trim()
        ) {
            setMensagem("Preencha todos os campos.");
            setTipoMensagem("erro");
            return;
        }

        if (erroRenavam) {
            setMensagem("Corrija o RENAVAM antes de salvar.");
            setTipoMensagem("erro");
            return;
        }

        try {
            setCarregando(true);
            setMensagem("");
            setTipoMensagem("");

            const formData = new FormData();
            formData.append("marca", marca);
            formData.append("modelo", modelo);
            formData.append("ano_fabricacao", anoFabricacao);
            formData.append("ano_modelo", anoModelo);
            formData.append("documento", documento);
            formData.append("km", km);
            formData.append("combustivel", combustivel);
            formData.append("cambio", cambio);
            formData.append("cor", cor);
            formData.append("placa", placa);
            formData.append("renavam", renavam);
            formData.append("valor_custo", valorCusto.replace(",", "."));
            formData.append("valor_venda", valorVenda.replace(",", "."));

            if (imagem) {
                formData.append("imagem", imagem);
            }

            const response = await fetch("http://10.92.3.167:5000/cadastrar_veiculo", {
                method: "POST",
                credentials: "include",
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                setMensagem(data.mensagem || "Erro ao cadastrar veículo.");
                setTipoMensagem("erro");
                return;
            }

            setMensagem(data.mensagem || "Veículo cadastrado com sucesso.");
            setTipoMensagem("sucesso");

            navigate("/garagem");
        } catch (error) {
            setMensagem("Erro ao conectar com o servidor.");
            setTipoMensagem("erro");
        } finally {
            setCarregando(false);
        }
    }

    return (
        <>
            <Header />

            <div className={css.layout}>
                <SidebarMenu />

                <main className={css.main}>
                    <h1 className={css.titulo}>Adicionar Novo Veículo</h1>
                    <p className={css.subtitulo}>
                        Insira os dados técnicos e comerciais para disponibilizar o veículo no estoque.
                    </p>

                    {mensagem && (
                        <p className={tipoMensagem === "sucesso" ? css.sucesso : css.erroMensagem}>
                            {mensagem}
                        </p>
                    )}

                    <div className={css.uploadArea}>
                        <div className={css.containerPreview}>
                            {!preview && <img src="/Nuvem.png" alt="upload" className={css.sumir} />}

                            <input
                                type="file"
                                className={css.inputImg}
                                onChange={handleImagem}
                                accept="image/*"
                            />

                            {preview && (
                                <img
                                    src={preview}
                                    alt="preview"
                                    className={css.previewImagem}
                                />
                            )}
                        </div>
                    </div>

                    <div className={css.grid}>
                        <div className={css.box}>
                            <h3>Informações Básicas</h3>

                            <input
                                placeholder="Marca"
                                value={marca}
                                onChange={(e) => setMarca(apenasLetras(e.target.value))}
                            />

                            <input
                                placeholder="Modelo"
                                value={modelo}
                                onChange={(e) => setModelo(e.target.value)}
                            />

                            <div className={css.row}>
                                <input
                                    placeholder="Ano Fabricação"
                                    value={anoFabricacao}
                                    onChange={(e) => setAnoFabricacao(apenasNumeros(e.target.value).slice(0, 4))}
                                    maxLength={4}
                                />

                                <input
                                    placeholder="Ano Modelo"
                                    value={anoModelo}
                                    onChange={(e) => setAnoModelo(apenasNumeros(e.target.value).slice(0, 4))}
                                    maxLength={4}
                                />
                            </div>

                            <select
                                value={documento}
                                onChange={(e) => setDocumento(e.target.value)}
                            >
                                <option value="">Documento</option>
                                <option value="Pago">Pago</option>
                                <option value="Não Pago">Não Pago</option>
                            </select>
                        </div>

                        <div className={css.box}>
                            <h3>Detalhes Técnicos</h3>

                            <div className={css.row}>
                                <input
                                    placeholder="KM"
                                    value={km}
                                    onChange={(e) => setKm(apenasNumeros(e.target.value))}
                                />

                                <select
                                    value={combustivel}
                                    onChange={(e) => setCombustivel(e.target.value)}
                                >
                                    <option value="">Combustível</option>
                                    <option value="Flex">Flex</option>
                                    <option value="Gasolina">Gasolina</option>
                                    <option value="Etanol">Etanol</option>
                                    <option value="Diesel">Diesel</option>
                                </select>
                            </div>

                            <div className={css.row}>
                                <select
                                    value={cambio}
                                    onChange={(e) => setCambio(e.target.value)}
                                >
                                    <option value="">Câmbio</option>
                                    <option value="Manual">Manual</option>
                                    <option value="Automático">Automático</option>
                                </select>

                                <select
                                    value={cor}
                                    onChange={(e) => setCor(e.target.value)}
                                >
                                    <option value="">Cor</option>
                                    <option value="Preto">Preto</option>
                                    <option value="Branco">Branco</option>
                                    <option value="Prata">Prata</option>
                                    <option value="Cinza">Cinza</option>
                                    <option value="Vermelho">Vermelho</option>
                                    <option value="Azul">Azul</option>
                                </select>
                            </div>

                            <input
                                placeholder="Placa"
                                value={placa}
                                onChange={(e) => setPlaca(formatarPlaca(e.target.value))}
                                maxLength={8}
                            />

                            <input
                                placeholder="Renavam"
                                value={renavam}
                                onChange={handleRenavam}
                                maxLength={11}
                                className={erroRenavam ? css.erroInput : ""}
                            />

                            {erroRenavam && (
                                <span className={css.erro}>{erroRenavam}</span>
                            )}
                        </div>
                    </div>

                    <div className={css.box}>
                        <h3>Precificação</h3>

                        <div className={css.row}>
                            <input
                                placeholder="Valor de Custo"
                                value={valorCusto}
                                onChange={(e) => setValorCusto(formatarMoeda(e.target.value))}
                            />

                            <input
                                placeholder="Valor de Venda"
                                value={valorVenda}
                                onChange={(e) => setValorVenda(formatarMoeda(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className={css.actions}>
                        <button
                            type="button"
                            className={css.cancelar}
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            className={css.salvar}
                            onClick={salvarVeiculo}
                            disabled={carregando}
                        >
                            {carregando ? "Salvando..." : "Salvar Veículo"}
                        </button>
                    </div>
                </main>
            </div>

            <Footer />
        </>
    );
}