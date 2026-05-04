import SidebarMenu from "../components/SidebarMenu/SidebarMenu";
import css from "./NovoVeiculo.module.css";
import { API_URL } from "../App";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer/Footer.jsx";

const CORES_VEICULO = {
    Preto: "#111111",
    Branco: "#ffffff",
    Prata: "#c0c0c0",
    Cinza: "#6b7280",
    Vermelho: "#dc2626",
    Azul: "#2563eb",
    Verde: "#16a34a",
    Amarelo: "#facc15",
    Marrom: "#7c2d12",
    Bege: "#d6b98c",
    Dourado: "#d4af37",
    Champagne: "#f7e7ce",
};

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
    const [codigoCor, setCodigoCor] = useState("#111111");
    const [placa, setPlaca] = useState("");
    const [renavam, setRenavam] = useState("");
    const [valorCusto, setValorCusto] = useState("");
    const [valorVenda, setValorVenda] = useState("");
    const [imagens, setImagens] = useState([]);

    const [erroRenavam, setErroRenavam] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [tipoMensagem, setTipoMensagem] = useState("");
    const [carregando, setCarregando] = useState(false);

    useEffect(() => {
        async function buscarMarcas() {
            try {
                const response = await fetch(`${API_URL}/buscar_marca`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({})
                });

                const data = await response.json();

                if (response.ok) {
                    setMarcas(data.marcas || []);
                }
            } catch (error) {
                console.log("Não foi possível carregar os dados. Tente novamente.", error);
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

    function formatarKm(valor) {
        const numeros = apenasNumeros(valor);
        if (!numeros) return "";

        return Number(numeros).toLocaleString("pt-BR");
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

    function moedaParaBackend(valor) {
        return String(Number(limparMoeda(valor)) / 100);
    }

    function valorMoedaMaiorQueZero(valor) {
        return Number(limparMoeda(valor)) > 0;
    }

    function placaTemTamanhoValido(valor) {
        return valor.replace(/[^A-Z0-9]/gi, "").length === 7;
    }

    function handleCor(valor) {
        setCor(valor);

        const corEncontrada = CORES_VEICULO[valor.trim()];
        if (corEncontrada) {
            setCodigoCor(corEncontrada);
        }
    }

    function handleCodigoCor(valor) {
        setCodigoCor(valor);
        setCor(valor.toUpperCase());
    }

    function formatarPlaca(valor) {
        const limpa = valor.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
        if (limpa.length <= 3) return limpa;
        return `${limpa.slice(0, 3)}-${limpa.slice(3)}`;
    }

    function validarRenavam(valor) {
        const renavamLimpo = valor.replace(/\D/g, "");

        if (renavamLimpo.length !== 11) return false;

        const base = renavamLimpo.substring(0, 10);
        const digitoInformado = Number(renavamLimpo[10]);

        let soma = 0;
        let peso = 2;

        for (let i = 9; i >= 0; i--) {
            soma += Number(base[i]) * peso;
            peso++;

            if (peso > 9) {
                peso = 2;
            }
        }

        let digitoCalculado = 11 - (soma % 11);

        if (digitoCalculado >= 10) {
            digitoCalculado = 0;
        }

        return digitoCalculado === digitoInformado;
    }

    function handleRenavam(e) {
        const valor = apenasNumeros(e.target.value).slice(0, 11);
        setRenavam(valor);

        if (valor.length > 0 && valor.length < 11) {
            setErroRenavam("RENAVAM deve ter 11 números");
        } else if (valor.length === 11 && !validarRenavam(valor)) {
            setErroRenavam("RENAVAM inválido");
        } else {
            setErroRenavam("");
        }
    }

    function handleImagens(e) {
        const arquivos = Array.from(e.target.files);

        const novas = arquivos.map((arquivo) => ({
            id: crypto.randomUUID(),
            arquivo,
            preview: URL.createObjectURL(arquivo)
        }));

        setImagens((atuais) => [...atuais, ...novas]);

        e.target.value = "";
    }

    function removerImagem(id) {
        setImagens((atuais) => {
            const removida = atuais.find((img) => img.id === id);

            if (removida) {
                URL.revokeObjectURL(removida.preview);
            }

            return atuais.filter((img) => img.id !== id);
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

        if (Number(anoFabricacao) <= 0 || Number(anoModelo) <= 0) {
            setMensagem("O ano de fabricação e o ano modelo devem ser maiores que 0.");
            setTipoMensagem("erro");
            return;
        }

        if (!placaTemTamanhoValido(placa)) {
            setMensagem("A placa deve ter 7 caracteres.");
            setTipoMensagem("erro");
            return;
        }

        if (!valorMoedaMaiorQueZero(valorCusto) || !valorMoedaMaiorQueZero(valorVenda)) {
            setMensagem("Valor de custo e valor de venda devem ser maiores que 0.");
            setTipoMensagem("erro");
            return;
        }

        if (!validarRenavam(renavam)) {
            setMensagem("Corrija o RENAVAM antes de salvar.");
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
            formData.append("km", apenasNumeros(km));
            formData.append("cor", cor);
            formData.append("cambio", cambio);
            formData.append("combustivel", combustivel);
            formData.append("renavam", renavam);
            formData.append("preco_custo", moedaParaBackend(valorCusto));
            formData.append("preco_venda", moedaParaBackend(valorVenda));
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
                setMensagem(data.mensagem || "Não foi possível salvar as alterações.");
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
            setMensagem("Não foi possível salvar as alterações.");
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
                    <div className={css.topo}>
                        <div>
                            <h1 className={css.titulo}>Adicionar Novo Veículo</h1>
                            <p className={css.subtitulo}>
                                Insira os dados técnicos e comerciais para disponibilizar o veículo no estoque.
                            </p>
                        </div>
                    </div>

                    {mensagem && (
                        <p className={tipoMensagem === "sucesso" ? css.sucesso : css.erroMensagem}>
                            {mensagem}
                        </p>
                    )}

                    <section className={css.uploadArea}>
                        <h3>Fotos do Veículo</h3>

                        <label className={css.uploadBox}>
                            <input
                                type="file"
                                onChange={handleImagens}
                                accept="image/*"
                                multiple
                            />

                            <img src="/Nuvem.png" alt="upload" />
                            <p>Clique para adicionar imagens</p>
                            <small>Você pode adicionar várias fotos e remover individualmente</small>
                        </label>

                        {imagens.length > 0 && (
                            <div className={css.listaImagens}>
                                {imagens.map((img, index) => (
                                    <div
                                        key={img.id}
                                        className={index === 0 ? css.imagemPrincipal : css.imagemMini}
                                    >
                                        <img src={img.preview} alt="preview" />

                                        <button
                                            type="button"
                                            onClick={() => removerImagem(img.id)}
                                        >
                                            Remover
                                        </button>

                                        {index === 0 && <span>Principal</span>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <div className={css.grid}>
                        <section className={css.box}>
                            <h3>Informações Básicas</h3>

                            <select value={marca} onChange={(e) => setMarca(e.target.value)}>
                                <option value="">
                                    {marcas.length === 0 ? "Nenhuma marca cadastrada" : "Selecione uma marca"}
                                </option>

                                {marcas.map((item) => (
                                    <option key={item.id_marca} value={item.id_marca}>
                                        {item.nome}
                                    </option>
                                ))}
                            </select>

                            {marcas.length === 0 && (
                                <p className={css.avisoCampo}>
                                    Nenhuma marca cadastrada. Cadastre uma marca antes de adicionar veículos.
                                </p>
                            )}

                            <input
                                placeholder="Modelo"
                                value={modelo}
                                onChange={(e) => setModelo(e.target.value)}
                            />

                            <div className={css.row}>
                                <input
                                    placeholder="Ano Fabricação"
                                    value={anoFabricacao}
                                    onChange={(e) =>
                                        setAnoFabricacao(apenasNumeros(e.target.value).slice(0, 4))
                                    }
                                    maxLength={4}
                                />

                                <input
                                    placeholder="Ano Modelo"
                                    value={anoModelo}
                                    onChange={(e) =>
                                        setAnoModelo(apenasNumeros(e.target.value).slice(0, 4))
                                    }
                                    maxLength={4}
                                />
                            </div>

                            <select value={documento} onChange={(e) => setDocumento(e.target.value)}>
                                <option value="">Documento</option>
                                <option value="0">Pago</option>
                                <option value="1">Não Pago</option>
                            </select>
                        </section>

                        <section className={css.box}>
                            <h3>Detalhes Técnicos</h3>

                            <div className={css.row}>
                                <input
                                    placeholder="KM"
                                    value={km}
                                    onChange={(e) => setKm(formatarKm(e.target.value))}
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

                                <div className={css.campoCor}>
                                    <input
                                        placeholder="Cor"
                                        value={cor}
                                        onChange={(e) => handleCor(e.target.value)}
                                        list="cores-veiculo"
                                        maxLength={30}
                                    />

                                    <label className={css.seletorCor} title="Escolher cor">
                                        <input
                                            type="color"
                                            value={codigoCor}
                                            onChange={(e) => handleCodigoCor(e.target.value)}
                                        />
                                    </label>

                                    <span className={css.codigoCor}>{codigoCor.toUpperCase()}</span>
                                </div>
                            </div>

                            <datalist id="cores-veiculo">
                                <option value="Preto" />
                                <option value="Branco" />
                                <option value="Prata" />
                                <option value="Cinza" />
                                <option value="Vermelho" />
                                <option value="Azul" />
                                <option value="Verde" />
                                <option value="Amarelo" />
                                <option value="Marrom" />
                                <option value="Bege" />
                                <option value="Dourado" />
                                <option value="Champagne" />
                            </datalist>

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

                            {erroRenavam && <span className={css.erro}>{erroRenavam}</span>}
                        </section>
                    </div>

                    <section className={css.box}>
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
                    </section>

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
