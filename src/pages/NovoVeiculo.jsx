import SidebarMenu from "../components/SidebarMenu/SidebarMenu";
import css from "./NovoVeiculo.module.css";
import { API_URL } from "../App";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer/Footer.jsx";

export default function NovoVeiculo() {
    const navigate = useNavigate();

    const [marcas, setMarcas] = useState([]);
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
    const [imagens, setImagens] = useState([]);

    const [mensagem, setMensagem] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("");
    const [carregando, setCarregando] = useState(false);

    useEffect(() => {
        async function buscarMarcas() {
            try {
                const response = await fetch(`${API_URL}/buscar_marca`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({})
                });

                const data = await response.json();

                if (response.ok) {
                    setMarcas(data.marcas || []);
                } else {
                    console.log("Erro ao buscar marcas:", data);
                }
            } catch (error) {
                console.log("Erro ao conectar ao buscar marcas:", error);
            }
        }

        buscarMarcas();
    }, []);

    useEffect(() => {
        return () => {
            imagens.forEach((img) => URL.revokeObjectURL(img.preview));
        };
    }, [imagens]);

    function apenasNumeros(valor) {
        return valor.replace(/\D/g, "");
    }

    function formatarMoeda(valor) {
        const numeros = valor.replace(/\D/g, "");

        if (!numeros) return "";

        const numero = Number(numeros) / 100;

        return numero.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function limparMoeda(valor) {
        return valor.replace(/\D/g, "");
    }

    function formatarPlaca(valor) {
        const limpa = valor.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);

        if (limpa.length <= 3) return limpa;

        return `${limpa.slice(0, 3)}-${limpa.slice(3)}`;
    }

    function handleImagens(e) {
        const arquivos = Array.from(e.target.files);

        const novasImagens = arquivos.map((arquivo) => ({
            arquivo,
            preview: URL.createObjectURL(arquivo)
        }));

        setImagens((atuais) => [...atuais, ...novasImagens]);
    }

    function removerImagem(index) {
        setImagens((atuais) => {
            URL.revokeObjectURL(atuais[index].preview);
            return atuais.filter((_, i) => i !== index);
        });
    }

    async function salvarVeiculo() {
        if (
            !marca ||
            !modelo.trim() ||
            !anoFabricacao.trim() ||
            !anoModelo.trim() ||
            !documento ||
            !km.trim() ||
            !combustivel ||
            !cambio ||
            !cor ||
            !placa.trim() ||
            !renavam.trim() ||
            !valorCusto.trim() ||
            !valorVenda.trim()
        ) {
            setMensagem("Preencha todos os campos.");
            setTipoMensagem("erro");
            return;
        }

        if (renavam.length !== 11) {
            setMensagem("RENAVAM deve ter 11 números.");
            setTipoMensagem("erro");
            return;
        }

        try {
            setCarregando(true);
            setMensagem("");
            setTipoMensagem("");

            const formData = new FormData();
            formData.append("id_marca", marca);
            formData.append("modelo", modelo);
            formData.append("ano_fabricacao", anoFabricacao);
            formData.append("ano_modelo", anoModelo);
            formData.append("placa", placa);
            formData.append("km", km);
            formData.append("cor", cor);
            formData.append("cambio", cambio);
            formData.append("combustivel", combustivel);
            formData.append("renavam", renavam);
            formData.append("preco_custo", limparMoeda(valorCusto));
            formData.append("preco_venda", limparMoeda(valorVenda));
            formData.append("documentacao", documento);

            imagens.forEach((img) => {
                formData.append("imagem", img.arquivo);
            });

            const response = await fetch(`${API_URL}/adicionar_veiculo`, {
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

            setTimeout(() => {
                navigate("/garagem");
            }, 800);
        } catch (error) {
            console.log(error);
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
                        <input
                            type="file"
                            className={css.inputImg}
                            onChange={handleImagens}
                            accept="image/*"
                            multiple
                        />

                        <div className={css.galeria}>
                            {imagens.length === 0 && (
                                <div className={css.uploadTexto}>
                                    <img src="/Nuvem.png" alt="upload" />
                                    <p>Clique para adicionar imagens</p>
                                </div>
                            )}

                            {imagens.map((img, index) => (
                                <div
                                    className={index === 0 ? css.previewGrande : css.previewPequeno}
                                    key={index}
                                >
                                    <img src={img.preview} alt="preview" />

                                    <button type="button" onClick={() => removerImagem(index)}>
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={css.grid}>
                        <div className={css.box}>
                            <h3>Informações Básicas</h3>

                            <select value={marca} onChange={(e) => setMarca(e.target.value)}>
                                <option value="">Selecione uma marca</option>

                                {marcas.map((item) => (
                                    <option key={item.id_marca} value={item.id_marca}>
                                        {item.nome}
                                    </option>
                                ))}
                            </select>

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

                            <select value={documento} onChange={(e) => setDocumento(e.target.value)}>
                                <option value="">Documento</option>
                                <option value="0">Pago</option>
                                <option value="1">Não Pago</option>
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

                                <select value={combustivel} onChange={(e) => setCombustivel(e.target.value)}>
                                    <option value="">Combustível</option>
                                    <option value="0">Flex</option>
                                    <option value="1">Gasolina</option>
                                    <option value="2">Etanol</option>
                                    <option value="3">Diesel</option>
                                </select>
                            </div>

                            <div className={css.row}>
                                <select value={cambio} onChange={(e) => setCambio(e.target.value)}>
                                    <option value="">Câmbio</option>
                                    <option value="0">Manual</option>
                                    <option value="1">Automático</option>
                                </select>

                                <select value={cor} onChange={(e) => setCor(e.target.value)}>
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
                                onChange={(e) => setRenavam(apenasNumeros(e.target.value).slice(0, 11))}
                                maxLength={11}
                            />
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
                            onClick={() => navigate("/garagem")}
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