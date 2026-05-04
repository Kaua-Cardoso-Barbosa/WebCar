import SidebarMenu from "../components/SidebarMenu/SidebarMenu";
import css from "./EditarVeiculo.module.css";
import { API_URL } from "../App";

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

function formatarMoedaBanco(valor) {
    if (valor === null || valor === undefined || valor === "") return "";

    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

const IMAGEM_PADRAO = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
  <rect width="640" height="360" fill="#f1f5f9"/>
  <text x="320" y="180" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="28" font-weight="700" fill="#64748b">Sem imagem</text>
</svg>
`)}`;

function imagensVeiculo(idVeiculo, numeroFoto = 1) {
    if (!idVeiculo) return [IMAGEM_PADRAO];

    const versao = Date.now();

    return [
        `${API_URL}/uploads/veiculo/${idVeiculo}/foto_${numeroFoto}.jpg?v=${versao}`,
        `${API_URL}/static/uploads/veiculo/${idVeiculo}/foto_${numeroFoto}.jpg?v=${versao}`,
        `${API_URL}/static/veiculo/${idVeiculo}/foto_${numeroFoto}.jpg?v=${versao}`,
        `${API_URL}/veiculo/${idVeiculo}/foto_${numeroFoto}.jpg?v=${versao}`,
        IMAGEM_PADRAO,
    ];
}

function tentarProximaImagem(e, imagens) {
    const indiceAtual = Number(e.currentTarget.dataset.indice || 0);
    const proximoIndice = indiceAtual + 1;

    if (proximoIndice < imagens.length) {
        e.currentTarget.dataset.indice = String(proximoIndice);
        e.currentTarget.src = imagens[proximoIndice];
    }
}

export default function EditarVeiculo() {
    const location = useLocation();
    const navigate = useNavigate();
    const carro = location.state?.carro;

    const [marcas, setMarcas] = useState([]);
    const [marca, setMarca] = useState("");
    const [modelo, setModelo] = useState(carro?.MODELO || "");
    const [anoFabricacao, setAnoFabricacao] = useState(carro?.ANO_FABRICACAO || "");
    const [anoModelo, setAnoModelo] = useState(carro?.ANO_MODELO || "");
    const [documento, setDocumento] = useState(String(carro?.DOCUMENTACAO ?? ""));
    const [km, setKm] = useState(carro?.KM || "");
    const [combustivel, setCombustivel] = useState(String(carro?.COMBUSTIVEL ?? ""));
    const [cambio, setCambio] = useState(String(carro?.CAMBIO ?? ""));
    const [cor, setCor] = useState(carro?.COR || "");
    const [codigoCor, setCodigoCor] = useState(CORES_VEICULO[carro?.COR] || "#111111");
    const [placa, setPlaca] = useState(carro?.PLACA || "");
    const [renavam, setRenavam] = useState(carro?.RENAVAM || "");
    const [valorCusto, setValorCusto] = useState(() => formatarMoedaBanco(carro?.PRECO_CUSTO));
    const [valorVenda, setValorVenda] = useState(() => formatarMoedaBanco(carro?.PRECO_VENDA));
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

                    const marcaAtual = data.marcas?.find((m) => m.nome === carro?.MARCA);
                    if (marcaAtual) {
                        setMarca(String(marcaAtual.id_marca));
                    }
                }
            } catch (error) {
                console.log("Não foi possível carregar os dados. Tente novamente.", error);
            }
        }

        if (carro) buscarMarcas();
    }, [carro]);

    useEffect(() => {
        return () => {
            imagens.forEach((img) => URL.revokeObjectURL(img.preview));
        };
    }, [imagens]);

    if (!carro) {
        return (
            <>
                <Header />
                <div className="container py-5">
                    <h3>Não foi possível carregar os dados. Tente novamente.</h3>
                    <button className="btn btn-primary mt-3" onClick={() => navigate("/garagem")}>
                        Voltar para garagem
                    </button>
                </div>
                <Footer />
            </>
        );
    }

    function apenasNumeros(valor) {
        return String(valor).replace(/\D/g, "");
    }

    function formatarKm(valor) {
        const numeros = apenasNumeros(valor);
        if (!numeros) return "";

        return Number(numeros).toLocaleString("pt-BR");
    }

    function formatarMoeda(valor) {
        const numeros = String(valor).replace(/\D/g, "");
        if (!numeros) return "";

        const numero = Number(numeros) / 100;

        return numero.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function limparMoeda(valor) {
        return String(valor).replace(/\D/g, "");
    }

    function moedaParaBackend(valor) {
        return String(Number(limparMoeda(valor)) / 100);
    }

    function valorMoedaMaiorQueZero(valor) {
        return Number(limparMoeda(valor)) > 0;
    }

    function placaTemTamanhoValido(valor) {
        return String(valor).replace(/[^A-Z0-9]/gi, "").length === 7;
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
        const renavamLimpo = String(valor).replace(/\D/g, "");

        if (renavamLimpo.length !== 11) return false;

        const base = renavamLimpo.substring(0, 10);
        const digitoInformado = Number(renavamLimpo[10]);

        let soma = 0;
        let peso = 2;

        for (let i = 9; i >= 0; i--) {
            soma += Number(base[i]) * peso;
            peso++;
            if (peso > 9) peso = 2;
        }

        let digitoCalculado = 11 - (soma % 11);
        if (digitoCalculado >= 10) digitoCalculado = 0;

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

    async function salvarEdicao() {
        if (
            !marca ||
            !modelo.trim() ||
            !anoFabricacao.toString().trim() ||
            !anoModelo.toString().trim() ||
            !documento ||
            !km.toString().trim() ||
            !combustivel ||
            !cambio ||
            !cor.trim() ||
            !placa.trim() ||
            !renavam.toString().trim() ||
            !valorCusto.toString().trim() ||
            !valorVenda.toString().trim()
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
            formData.append("status", carro.STATUS ?? 0);

            imagens.forEach((img) => {
                formData.append("imagem", img.arquivo);
            });

            const response = await fetch(`${API_URL}/edicao_veiculo/${carro.ID_VEICULO}`, {
                method: "PUT",
                credentials: "include",
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                setMensagem(data.mensagem || "Não foi possível salvar as alterações.");
                setTipoMensagem("erro");
                return;
            }

            setMensagem(data.mensagem || "Veículo editado com sucesso.");
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
                            <h1 className={css.titulo}>Editar Veículo</h1>
                            <p className={css.subtitulo}>
                                Altere os dados técnicos, comerciais e fotos do veículo.
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
                            <p>Clique para adicionar novas imagens</p>
                            <small>Ao salvar, as novas imagens substituirão as fotos anteriores</small>
                        </label>

                        <div className={css.listaImagens}>
                            {imagens.length === 0 ? (
                                <div className={css.imagemPrincipal}>
                                    <img
                                        src={imagensVeiculo(carro.ID_VEICULO)[0]}
                                        data-indice="0"
                                        onError={(e) => tentarProximaImagem(e, imagensVeiculo(carro.ID_VEICULO))}
                                        alt="Imagem atual"
                                    />
                                    <span>Atual</span>
                                </div>
                            ) : (
                                imagens.map((img, index) => (
                                    <div
                                        key={img.id}
                                        className={index === 0 ? css.imagemPrincipal : css.imagemMini}
                                    >
                                        <img src={img.preview} alt="preview" />

                                        <button type="button" onClick={() => removerImagem(img.id)}>
                                            Remover
                                        </button>

                                        {index === 0 && <span>Principal</span>}
                                    </div>
                                ))
                            )}
                        </div>
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
                                    Nenhuma marca cadastrada. Cadastre uma marca antes de editar veículos.
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
                            onClick={salvarEdicao}
                            disabled={carregando}
                        >
                            {carregando ? "Salvando..." : "Salvar Alterações"}
                        </button>
                    </div>
                </main>
            </div>

            <Footer />
        </>
    );
}
