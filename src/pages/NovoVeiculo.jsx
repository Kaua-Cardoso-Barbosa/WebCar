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
        fetch(`${API_URL}/buscar_marca`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({})
        })
            .then(res => res.json())
            .then(data => setMarcas(data.marcas || []));
    }, []);

    function apenasNumeros(v) {
        return v.replace(/\D/g, "");
    }

    function formatarMoeda(v) {
        const n = v.replace(/\D/g, "");
        if (!n) return "";
        return (Number(n) / 100).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function limparMoeda(v) {
        return v.replace(/\D/g, "");
    }

    function formatarPlaca(v) {
        const l = v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
        return l.length <= 3 ? l : `${l.slice(0, 3)}-${l.slice(3)}`;
    }

    function handleImagens(e) {
        const arquivos = Array.from(e.target.files);

        const novas = arquivos.map((arquivo) => ({
            arquivo,
            preview: URL.createObjectURL(arquivo)
        }));

        setImagens(prev => [...prev, ...novas]);
    }

    function removerImagem(index) {
        setImagens(prev => {
            URL.revokeObjectURL(prev[index].preview);
            return prev.filter((_, i) => i !== index);
        });
    }

    function definirPrincipal(index) {
        setImagens(prev => {
            const copia = [...prev];
            const [img] = copia.splice(index, 1);
            copia.unshift(img);
            return copia;
        });
    }

    async function salvarVeiculo() {
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

        imagens.forEach(img => {
            formData.append("imagem", img.arquivo);
        });

        try {
            setCarregando(true);

            const res = await fetch(`${API_URL}/adicionar_veiculo`, {
                method: "POST",
                credentials: "include",
                body: formData
            });

            const data = await res.json();

            if (!res.ok) {
                setMensagem(data.mensagem);
                setTipoMensagem("erro");
                return;
            }

            setMensagem("Veículo cadastrado com sucesso");
            setTipoMensagem("sucesso");

            setTimeout(() => navigate("/garagem"), 800);

        } catch {
            setMensagem("Erro ao conectar");
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

                    {mensagem && (
                        <p className={tipoMensagem === "sucesso" ? css.sucesso : css.erroMensagem}>
                            {mensagem}
                        </p>
                    )}

                    <div className={css.uploadContainer}>
                        <div className={css.boxPrincipal}>
                            <input type="file" multiple className={css.inputImg} onChange={handleImagens} />

                            {imagens[0] ? (
                                <>
                                    <img src={imagens[0].preview} />
                                    <span className={css.label}>Imagem Principal</span>
                                </>
                            ) : (
                                <p>Adicionar imagem principal</p>
                            )}
                        </div>

                        <div className={css.boxExtras}>
                            <input type="file" multiple className={css.inputImg} onChange={handleImagens} />

                            {imagens.length <= 1 && <p>Adicionar imagens extras</p>}

                            <div className={css.listaExtras}>
                                {imagens.slice(1).map((img, index) => (
                                    <div key={index} className={css.itemExtra}>
                                        <img src={img.preview} />

                                        <button onClick={() => removerImagem(index + 1)}>×</button>

                                        <button
                                            className={css.btnPrincipal}
                                            onClick={() => definirPrincipal(index + 1)}
                                        >
                                            Principal
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className={css.grid}>
                        <div className={css.box}>
                            <select value={marca} onChange={(e) => setMarca(e.target.value)}>
                                <option value="">Selecione uma marca</option>

                                {marcas.map((item, index) => (
                                    <option key={item.id_marca || index} value={item.id_marca}>
                                        {item.nome}
                                    </option>
                                ))}
                            </select>

                            <input value={modelo} onChange={e => setModelo(e.target.value)} placeholder="Modelo" />

                            <div className={css.row}>
                                <input value={anoFabricacao} onChange={e => setAnoFabricacao(apenasNumeros(e.target.value))} placeholder="Ano Fab" />
                                <input value={anoModelo} onChange={e => setAnoModelo(apenasNumeros(e.target.value))} placeholder="Ano Mod" />
                            </div>

                            <select value={documento} onChange={e => setDocumento(e.target.value)}>
                                <option value="">Documento</option>
                                <option value="0">Pago</option>
                                <option value="1">Não Pago</option>
                            </select>
                        </div>

                        <div className={css.box}>
                            <input value={km} onChange={e => setKm(apenasNumeros(e.target.value))} placeholder="KM" />

                            <select value={combustivel} onChange={e => setCombustivel(e.target.value)}>
                                <option value="">Combustível</option>
                                <option value="0">Flex</option>
                                <option value="1">Gasolina</option>
                                <option value="2">Etanol</option>
                                <option value="3">Diesel</option>
                            </select>

                            <select value={cambio} onChange={e => setCambio(e.target.value)}>
                                <option value="">Câmbio</option>
                                <option value="0">Manual</option>
                                <option value="1">Automático</option>
                            </select>

                            <select value={cor} onChange={e => setCor(e.target.value)}>
                                <option value="">Cor</option>
                                <option value="Preto">Preto</option>
                                <option value="Branco">Branco</option>
                                <option value="Prata">Prata</option>
                                <option value="Cinza">Cinza</option>
                                <option value="Vermelho">Vermelho</option>
                                <option value="Azul">Azul</option>
                            </select>

                            <input value={placa} onChange={e => setPlaca(formatarPlaca(e.target.value))} placeholder="Placa" />
                            <input value={renavam} onChange={e => setRenavam(apenasNumeros(e.target.value))} placeholder="Renavam" />
                        </div>
                    </div>

                    <div className={css.box}>
                        <div className={css.row}>
                            <input value={valorCusto} onChange={e => setValorCusto(formatarMoeda(e.target.value))} placeholder="Valor de Custo" />
                            <input value={valorVenda} onChange={e => setValorVenda(formatarMoeda(e.target.value))} placeholder="Valor de Venda" />
                        </div>
                    </div>

                    <div className={css.actions}>
                        <button className={css.cancelar} onClick={() => navigate("/garagem")}>
                            Cancelar
                        </button>

                        <button className={css.salvar} onClick={salvarVeiculo}>
                            {carregando ? "Salvando..." : "Salvar Veículo"}
                        </button>
                    </div>
                </main>
            </div>

            <Footer />
        </>
    );
}