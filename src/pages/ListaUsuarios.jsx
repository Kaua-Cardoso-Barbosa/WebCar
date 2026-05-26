import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_URL } from "../App";
import Header from "../components/Header/Header";
import SidebarMenu from "../components/SidebarMenu/SidebarMenu";
import Footer from "../components/Footer/Footer";
import css from "./ListaUsuarios.module.css";

const IMAGEM_USUARIO_PADRAO = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="18" fill="#f1f5f9"/>
  <circle cx="60" cy="46" r="22" fill="#94a3b8"/>
  <path d="M25 102c5-23 19-34 35-34s30 11 35 34" fill="#94a3b8"/>
</svg>
`)}`;

function imagensUsuario(usuario) {
    if (!usuario?.id_usuario) return [IMAGEM_USUARIO_PADRAO];

    return [
        usuario.imagem,
        `${API_URL}/uploads/Usuarios/${usuario.id_usuario}.jpg`,
        `${API_URL}/uploads/usuarios/${usuario.id_usuario}.jpg`,
        `${API_URL}/static/uploads/Usuarios/${usuario.id_usuario}.jpg`,
        `${API_URL}/static/uploads/usuarios/${usuario.id_usuario}.jpg`,
        IMAGEM_USUARIO_PADRAO,
    ].filter(Boolean);
}

function tentarProximaImagem(e, imagens) {
    const indiceAtual = Number(e.currentTarget.dataset.indice || 0);
    const proximoIndice = indiceAtual + 1;

    if (proximoIndice < imagens.length) {
        e.currentTarget.dataset.indice = String(proximoIndice);
        e.currentTarget.src = imagens[proximoIndice];
    }
}

function getCampo(objeto, nomes, fallback = "") {
    for (const nome of nomes) {
        if (objeto?.[nome] !== undefined && objeto?.[nome] !== null && objeto?.[nome] !== "") {
            return objeto[nome];
        }
    }

    return fallback;
}

function formatarPreco(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function formatarData(valor) {
    if (!valor) return "Não informado";

    const data = new Date(valor);

    if (Number.isNaN(data.getTime())) return String(valor);

    return data.toLocaleDateString("pt-BR");
}

function normalizarCompra(compra) {
    const parcelas = getCampo(compra, ["parcelas", "PARCELAS", "itens_financiamento", "ITENS_FINANCIAMENTO"], []);

    return {
        idVenda: getCampo(compra, ["id_venda", "ID_VENDA"]),
        marca: getCampo(compra, ["marca", "MARCA"], "Marca"),
        modelo: getCampo(compra, ["modelo", "MODELO"], "Modelo"),
        placa: getCampo(compra, ["placa", "PLACA"]),
        dataVenda: getCampo(compra, ["data_venda", "DATA_VENDA"]),
        valorVenda: Number(getCampo(compra, ["valor_venda", "VALOR_VENDA"], 0)),
        formaPagamento: Number(getCampo(compra, ["forma_pagamento", "FORMA_PAGAMENTO"], 0)),
        financiamento: {
            idFinanciamento: getCampo(compra, ["id_financiamento", "ID_FINANCIAMENTO"]),
            valorOriginal: Number(getCampo(compra, ["valor_original", "VALOR_ORIGINAL"], 0)),
            valorFinanciado: Number(getCampo(compra, ["valor_financiado", "VALOR_FINANCIADO", "valor_venda_financiamento", "VALOR_VENDA_FINANCIAMENTO"], 0)),
        },
        parcelas: Array.isArray(parcelas) ? parcelas : [],
    };
}

function normalizarVendaUsuario(venda) {
    return {
        idVenda: getCampo(venda, ["id_venda", "ID_VENDA"]),
        dataVenda: getCampo(venda, ["data_venda", "DATA_VENDA"]),
        cliente: getCampo(venda, ["cliente", "CLIENTE", "nome_cliente"], "Sem cliente"),
        veiculo: getCampo(venda, ["veiculo", "VEICULO"], `${getCampo(venda, ["marca", "MARCA"], "")} ${getCampo(venda, ["modelo", "MODELO"], "")}`.trim()),
        placa: getCampo(venda, ["placa", "PLACA"], "Nao informada"),
        formaPagamento: getCampo(venda, ["forma_pagamento", "FORMA_PAGAMENTO"], "Nao informado"),
        valorVenda: Number(getCampo(venda, ["valor_venda", "VALOR_VENDA"], 0)),
        lucroBruto: Number(getCampo(venda, ["lucro_bruto", "LUCRO_BRUTO", "lucro"], 0)),
    };
}

export default function ListaUsuario() {
    const [usuarios, setUsuarios] = useState([]);
    const [busca, setBusca] = useState("");
    const [tiposSelecionados, setTiposSelecionados] = useState([]);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");
    const [modalSituacao, setModalSituacao] = useState(false);
    const [usuarioSituacao, setUsuarioSituacao] = useState(null);
    const [novaSituacao, setNovaSituacao] = useState(null);
    const [motivoBloqueio, setMotivoBloqueio] = useState("");
    const [erroSituacao, setErroSituacao] = useState("");
    const [salvandoSituacao, setSalvandoSituacao] = useState(false);
    const [modalCadastro, setModalCadastro] = useState(false);
    const [cadastro, setCadastro] = useState({
        nome: "",
        telefone: "",
        email: "",
        cpf: "",
        senha: "",
        confirma: "",
        tipo: "1",
    });
    const [imagemCadastro, setImagemCadastro] = useState(null);
    const [previewCadastro, setPreviewCadastro] = useState(null);
    const [salvandoCadastro, setSalvandoCadastro] = useState(false);
    const [erroCadastro, setErroCadastro] = useState("");
    const [modalEdicao, setModalEdicao] = useState(false);
    const [usuarioEdicao, setUsuarioEdicao] = useState(null);
    const [edicao, setEdicao] = useState({
        nome: "",
        telefone: "",
        email: "",
        cpf: "",
        senha: "",
        tipo: "2",
    });
    const [imagemEdicao, setImagemEdicao] = useState(null);
    const [previewEdicao, setPreviewEdicao] = useState(null);
    const [salvandoEdicao, setSalvandoEdicao] = useState(false);
    const [erroEdicao, setErroEdicao] = useState("");
    const [alterarSenhaEdicao, setAlterarSenhaEdicao] = useState(false);
    const [modalCompras, setModalCompras] = useState(false);
    const [usuarioCompras, setUsuarioCompras] = useState(null);
    const [comprasUsuario, setComprasUsuario] = useState([]);
    const [vendasUsuario, setVendasUsuario] = useState([]);
    const [tipoModalUsuario, setTipoModalUsuario] = useState("compras");
    const [carregandoCompras, setCarregandoCompras] = useState(false);
    const [erroCompras, setErroCompras] = useState("");
    const [sucessoCompras, setSucessoCompras] = useState("");
    const [baixandoParcela, setBaixandoParcela] = useState("");
    const [parcelasComprasAbertas, setParcelasComprasAbertas] = useState({});

    const navigate = useNavigate();
    const location = useLocation();

    function apenasNumeros(valor) {
        return String(valor).replace(/\D/g, "");
    }

    function formatarTelefone(valor) {
        const numeros = apenasNumeros(valor).slice(0, 11);

        if (numeros.length <= 2) return numeros;
        if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;

        return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    }

    function formatarCpf(valor) {
        const numeros = apenasNumeros(valor).slice(0, 11);

        if (numeros.length <= 3) return numeros;
        if (numeros.length <= 6) return `${numeros.slice(0, 3)}.${numeros.slice(3)}`;
        if (numeros.length <= 9) return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`;

        return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`;
    }

    function textoTipo(tipo) {
        if (Number(tipo) === 0) return "Administrador";
        if (Number(tipo) === 1) return "Vendedor";
        if (Number(tipo) === 2) return "Cliente";
        return "Não informado";
    }

    function classeTipo(tipo) {
        if (Number(tipo) === 0) return css.admin;
        if (Number(tipo) === 1) return css.vendedor;
        if (Number(tipo) === 2) return css.cliente;
        return css.semTipo;
    }

    const usuariosFiltrados = usuarios.filter((usuario) => {
        const situacao = Number(usuario.situacao ?? usuario.SITUACAO);

        if (![0, 1].includes(situacao)) {
            return false;
        }

        const termo = busca.trim().toLowerCase();
        const textoBusca = [
            usuario.nome,
            usuario.email,
            usuario.telefone,
            usuario.cpf,
            textoTipo(usuario.tipo),
        ].filter(Boolean).join(" ").toLowerCase();

        const passaBusca = !termo || textoBusca.includes(termo);
        const passaTipo =
            tiposSelecionados.length === 0 ||
            tiposSelecionados.includes(String(usuario.tipo));

        return passaBusca && passaTipo;
    });

    const totalPaginas = Math.max(1, Math.ceil(usuariosFiltrados.length / 15));
    const inicioPagina = (paginaAtual - 1) * 15;
    const usuariosPaginados = usuariosFiltrados.slice(inicioPagina, inicioPagina + 15);

    const usuariosAtivos = usuarios.filter((usuario) =>
        [0, 1].includes(Number(usuario.situacao ?? usuario.SITUACAO))
    );
    const totalClientes = usuariosAtivos.filter((usuario) => Number(usuario.tipo) === 2).length;
    const totalVendedores = usuariosAtivos.filter((usuario) => Number(usuario.tipo) === 1).length;
    const totalAdmins = usuariosAtivos.filter((usuario) => Number(usuario.tipo) === 0).length;

    async function buscarUsuarios() {
        try {
            setCarregando(true);
            setErro("");

            const res = await fetch(`${API_URL}/buscar_usuario`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({}),
            });

            const data = await res.json();

            if (!res.ok) {
                setUsuarios([]);
                setErro(data.mensagem || "Não foi possível carregar os usuários.");
                return;
            }

            setUsuarios(data.usuarios || []);
        } catch {
            setUsuarios([]);
            setErro("Erro ao conectar com o servidor.");
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        buscarUsuarios();
    }, []);

    useEffect(() => {
        if (location.state?.mensagem) {
            setSucesso(location.state.mensagem);
            navigate(location.pathname, { replace: true, state: null });
        }
    }, [location, navigate]);

    useEffect(() => {
        setPaginaAtual(1);
    }, [busca, tiposSelecionados]);

    useEffect(() => {
        return () => {
            if (previewCadastro) {
                URL.revokeObjectURL(previewCadastro);
            }
        };
    }, [previewCadastro]);

    function editarUsuario(usuario) {
        abrirModalEdicao(usuario);
    }

    function alternarTipo(tipo) {
        setTiposSelecionados((tiposAtuais) =>
            tiposAtuais.includes(tipo)
                ? tiposAtuais.filter((item) => item !== tipo)
                : [...tiposAtuais, tipo]
        );
    }

    function resetarFiltros() {
        setBusca("");
        setTiposSelecionados([]);
        setPaginaAtual(1);
    }

    function abrirModalSituacao(usuario, situacao) {
        setErro("");
        setSucesso("");
        setErroSituacao("");
        setMotivoBloqueio("");
        setUsuarioSituacao(usuario);
        setNovaSituacao(situacao);
        setModalSituacao(true);
    }

    function fecharModalSituacao() {
        setUsuarioSituacao(null);
        setNovaSituacao(null);
        setMotivoBloqueio("");
        setErroSituacao("");
        setSalvandoSituacao(false);
        setModalSituacao(false);
    }

    function atualizarCadastro(campo, valor) {
        setErroCadastro("");
        setCadastro((dadosAtuais) => ({
            ...dadosAtuais,
            [campo]: valor,
        }));
    }

    function atualizarEdicao(campo, valor) {
        setErroEdicao("");
        setEdicao((dadosAtuais) => ({
            ...dadosAtuais,
            [campo]: valor,
        }));
    }

    function abrirModalCadastro() {
        setErro("");
        setSucesso("");
        setCadastro({
            nome: "",
            telefone: "",
            email: "",
            cpf: "",
            senha: "",
            confirma: "",
            tipo: "1",
        });
        setImagemCadastro(null);
        setPreviewCadastro(null);
        setErroCadastro("");
        setModalCadastro(true);
    }

    function fecharModalCadastro() {
        setModalCadastro(false);
        setImagemCadastro(null);
        setPreviewCadastro(null);
        setSalvandoCadastro(false);
        setErroCadastro("");
    }

    function abrirModalEdicao(usuario) {
        setErro("");
        setSucesso("");
        setUsuarioEdicao(usuario);
        setEdicao({
            nome: usuario.nome || "",
            telefone: formatarTelefone(usuario.telefone || ""),
            email: usuario.email || "",
            cpf: formatarCpf(usuario.cpf || ""),
            senha: "",
            tipo: String(usuario.tipo ?? "2"),
        });
        setImagemEdicao(null);
        setPreviewEdicao(imagensUsuario(usuario)[0]);
        setErroEdicao("");
        setAlterarSenhaEdicao(false);
        setModalEdicao(true);
    }

    function fecharModalEdicao() {
        setModalEdicao(false);
        setUsuarioEdicao(null);
        setImagemEdicao(null);
        setPreviewEdicao(null);
        setSalvandoEdicao(false);
        setErroEdicao("");
        setAlterarSenhaEdicao(false);
    }

    function selecionarImagemCadastro(e) {
        const arquivo = e.target.files[0];

        if (!arquivo) return;

        setErroCadastro("");

        if (previewCadastro) {
            URL.revokeObjectURL(previewCadastro);
        }

        setImagemCadastro(arquivo);
        setPreviewCadastro(URL.createObjectURL(arquivo));
    }

    function selecionarImagemEdicao(e) {
        const arquivo = e.target.files[0];

        if (!arquivo) return;

        setErroEdicao("");

        if (previewEdicao?.startsWith("blob:")) {
            URL.revokeObjectURL(previewEdicao);
        }

        setImagemEdicao(arquivo);
        setPreviewEdicao(URL.createObjectURL(arquivo));
    }

    async function alterarSituacaoUsuario() {
        if (!usuarioSituacao || novaSituacao === null || salvandoSituacao) return;

        if (novaSituacao === 1 && !motivoBloqueio.trim()) {
            setErroSituacao("Informe o motivo do bloqueio para enviar ao usuário.");
            return;
        }

        try {
            setSalvandoSituacao(true);
            setErroSituacao("");

            let res;

            if (novaSituacao === 1) {
                res = await fetch(`${API_URL}/bloquear_usuario/${usuarioSituacao.id_usuario}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ motivo_bloqueio: motivoBloqueio.trim() }),
                });
            } else {
                const formData = new FormData();
                formData.append("situacao", String(novaSituacao));

                res = await fetch(`${API_URL}/alterar_situacao/${usuarioSituacao.id_usuario}`, {
                    method: "PUT",
                    credentials: "include",
                    body: formData,
                });
            }

            const data = await res.json();

            if (!res.ok) {
                setErroSituacao(data.mensagem || "Erro ao alterar situação do usuário.");
                return;
            }

            setSucesso(
                novaSituacao === 1
                    ? data.mensagem || "Usuario bloqueado e e-mail enviado com sucesso."
                    : "Usuario desbloqueado com sucesso."
            );
            fecharModalSituacao();
            buscarUsuarios();
        } catch {
            setErroSituacao("Erro ao alterar situação do usuário.");
        } finally {
            setSalvandoSituacao(false);
        }
    }

    async function cadastrarUsuarioInterno(e) {
        e.preventDefault();

        if (
            !cadastro.nome.trim() ||
            !cadastro.email.trim() ||
            !cadastro.cpf.trim() ||
            !cadastro.senha ||
            !cadastro.confirma
        ) {
            setErroCadastro("Preencha todos os campos obrigatorios.");
            return;
        }

        if (cadastro.senha !== cadastro.confirma) {
            setErroCadastro("As senhas não coincidem.");
            return;
        }

        try {
            setErroCadastro("");
            setSucesso("");
            setSalvandoCadastro(true);

            const formData = new FormData();
            formData.append("nome", cadastro.nome);
            formData.append("telefone", apenasNumeros(cadastro.telefone));
            formData.append("email", cadastro.email);
            formData.append("cpf", apenasNumeros(cadastro.cpf));
            formData.append("senha", cadastro.senha);
            formData.append("confirma", cadastro.confirma);
            formData.append("tipo", cadastro.tipo);

            if (imagemCadastro) {
                formData.append("imagem", imagemCadastro);
            }

            const response = await fetch(`${API_URL}/adicionar_usuario`, {
                method: "POST",
                credentials: "include",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                setErroCadastro(data.mensagem || "Não foi possível cadastrar o usuário.");
                return;
            }

            setSucesso("Usuario cadastrado com sucesso.");
            fecharModalCadastro();
            buscarUsuarios();
        } catch {
            setErroCadastro("Não foi possível cadastrar o usuário.");
        } finally {
            setSalvandoCadastro(false);
        }
    }

    async function salvarEdicaoUsuario(e) {
        e.preventDefault();

        if (!usuarioEdicao?.id_usuario || salvandoEdicao) return;

        if (!edicao.nome.trim() || !edicao.email.trim() || !edicao.telefone.trim() || !edicao.cpf.trim()) {
            setErroEdicao("Preencha nome, email, telefone e CPF.");
            return;
        }

        try {
            setErroEdicao("");
            setSucesso("");
            setSalvandoEdicao(true);

            const formData = new FormData();
            formData.append("nome", edicao.nome);
            formData.append("telefone", apenasNumeros(edicao.telefone));
            formData.append("email", edicao.email);
            formData.append("cpf", apenasNumeros(edicao.cpf));
            formData.append("tipo", edicao.tipo);

            if (alterarSenhaEdicao && edicao.senha.trim()) {
                formData.append("senha", edicao.senha);
            }

            if (imagemEdicao) {
                formData.append("imagem", imagemEdicao);
            }

            const response = await fetch(`${API_URL}/edicao_usuario/${usuarioEdicao.id_usuario}`, {
                method: "PUT",
                credentials: "include",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                setErroEdicao(data.mensagem || "Não foi possível editar o usuário.");
                return;
            }

            setSucesso(data.mensagem || "Usuario atualizado com sucesso.");
            fecharModalEdicao();
            buscarUsuarios();
        } catch {
            setErroEdicao("Não foi possível editar o usuário.");
        } finally {
            setSalvandoEdicao(false);
        }
    }

    async function buscarComprasUsuario(idUsuario) {
        try {
            setCarregandoCompras(true);
            setErroCompras("");
            setComprasUsuario([]);

            const response = await fetch(`${API_URL}/minhas_compras?id_usuario=${idUsuario}`, {
                method: "GET",
                credentials: "include",
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                setErroCompras(data.mensagem || "Não foi possível carregar as compras do usuário.");
                return;
            }

            setComprasUsuario((data.compras || data.vendas || []).map(normalizarCompra));
        } catch {
            setErroCompras("Erro ao conectar com o servidor.");
        } finally {
            setCarregandoCompras(false);
        }
    }

    async function buscarVendasUsuario(idUsuario) {
        try {
            setCarregandoCompras(true);
            setErroCompras("");
            setVendasUsuario([]);

            const response = await fetch(`${API_URL}/minhas_vendas?id_usuario=${idUsuario}`, {
                method: "GET",
                credentials: "include",
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                setErroCompras(data.mensagem || "NÃ£o foi possÃ­vel carregar as vendas do vendedor.");
                return;
            }

            setVendasUsuario((data.vendas || []).map(normalizarVendaUsuario));
        } catch {
            setErroCompras("Erro ao conectar com o servidor.");
        } finally {
            setCarregandoCompras(false);
        }
    }

    function abrirModalComprasUsuario(usuario) {
        setTipoModalUsuario("compras");
        setUsuarioCompras(usuario);
        setModalCompras(true);
        buscarComprasUsuario(usuario.id_usuario);
    }

    function abrirModalVendasUsuario(usuario) {
        setTipoModalUsuario("vendas");
        setUsuarioCompras(usuario);
        setModalCompras(true);
        buscarVendasUsuario(usuario.id_usuario);
    }

    function fecharModalComprasUsuario() {
        setModalCompras(false);
        setUsuarioCompras(null);
        setComprasUsuario([]);
        setVendasUsuario([]);
        setTipoModalUsuario("compras");
        setErroCompras("");
        setSucessoCompras("");
        setCarregandoCompras(false);
        setBaixandoParcela("");
        setParcelasComprasAbertas({});
    }

    function alternarParcelasCompra(idVenda) {
        setParcelasComprasAbertas((atuais) => ({
            ...atuais,
            [idVenda]: !atuais[idVenda],
        }));
    }

    async function darBaixaParcela(idFinanciamento, numeroParcela) {
        const chaveBaixa = `${idFinanciamento}-${numeroParcela}`;

        try {
            setBaixandoParcela(chaveBaixa);
            setErroCompras("");
            setSucesso("");
            setSucessoCompras("");

            const response = await fetch(`${API_URL}/adicionar_baixa/${idFinanciamento}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ parcela: Number(numeroParcela) }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                setErroCompras(data.mensagem || "Não foi possível dar baixa na parcela.");
                return;
            }

            setSucesso(data.mensagem || "Baixa realizada com sucesso.");
            setSucessoCompras(data.mensagem || "Baixa realizada com sucesso.");

            if (usuarioCompras?.id_usuario) {
                await buscarComprasUsuario(usuarioCompras.id_usuario);
            }
        } catch {
            setErroCompras("Erro ao dar baixa na parcela.");
        } finally {
            setBaixandoParcela("");
        }
    }

    async function retirarBaixaParcela(idFinanciamento, numeroParcela) {
        const chaveBaixa = `${idFinanciamento}-${numeroParcela}`;

        try {
            setBaixandoParcela(chaveBaixa);
            setErroCompras("");
            setSucesso("");
            setSucessoCompras("");

            const response = await fetch(`${API_URL}/retirar_baixa/${idFinanciamento}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ parcela: Number(numeroParcela) }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                setErroCompras(data.mensagem || "Não foi possível retirar a baixa da parcela.");
                return;
            }

            setSucesso(data.mensagem || "Baixa retirada com sucesso.");
            setSucessoCompras(data.mensagem || "Baixa retirada com sucesso.");

            if (usuarioCompras?.id_usuario) {
                await buscarComprasUsuario(usuarioCompras.id_usuario);
            }
        } catch {
            setErroCompras("Erro ao retirar baixa da parcela.");
        } finally {
            setBaixandoParcela("");
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
                            <h1>Usuarios</h1>
                            <p>Gerencie clientes, vendedores e administradores cadastrados.</p>
                        </div>

                        <button
                            type="button"
                            className={css.botaoNovo}
                            onClick={abrirModalCadastro}
                        >
                            <span className={css.mais}>+</span>
                            Adicionar vendedor/adm
                        </button>
                    </div>

                    <section className={css.cards}>
                        <div className={css.card}>
                            <span className={`${css.iconeBox} ${css.azul}`}>Qtd</span>
                            <div>
                                <p className={css.cardLabel}>Usuarios totais</p>
                                <h2 className={css.cardValor}>{usuariosAtivos.length}</h2>
                            </div>
                        </div>

                        <div className={css.card}>
                            <span className={`${css.iconeBox} ${css.verde}`}>Cli</span>
                            <div>
                                <p className={css.cardLabel}>Clientes</p>
                                <h2 className={css.cardValor}>{totalClientes}</h2>
                            </div>
                        </div>

                        <div className={css.card}>
                            <span className={`${css.iconeBox} ${css.laranja}`}>Vend</span>
                            <div>
                                <p className={css.cardLabel}>Vendedores</p>
                                <h2 className={css.cardValor}>{totalVendedores}</h2>
                            </div>
                        </div>

                        <div className={css.card}>
                            <span className={`${css.iconeBox} ${css.roxo}`}>Adm</span>
                            <div>
                                <p className={css.cardLabel}>Administradores</p>
                                <h2 className={css.cardValor}>{totalAdmins}</h2>
                            </div>
                        </div>
                    </section>

                    {erro && <p className={css.erro}>{erro}</p>}
                    {sucesso && <p className={css.sucesso}>{sucesso}</p>}

                    <section className={css.filtros}>
                        <div className={css.busca}>
                            <input
                                type="text"
                                placeholder="Buscar por nome, email, telefone ou tipo..."
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                            />
                        </div>

                        <div className={css.filtroTipos}>
                            <button
                                type="button"
                                className={`${css.filtroBotao} ${tiposSelecionados.includes("2") ? css.ativoCliente : ""}`}
                                onClick={() => alternarTipo("2")}
                            >
                                Cliente
                            </button>

                            <button
                                type="button"
                                className={`${css.filtroBotao} ${tiposSelecionados.includes("1") ? css.ativoVendedor : ""}`}
                                onClick={() => alternarTipo("1")}
                            >
                                Vendedor
                            </button>

                            <button
                                type="button"
                                className={`${css.filtroBotao} ${tiposSelecionados.includes("0") ? css.ativoAdmin : ""}`}
                                onClick={() => alternarTipo("0")}
                            >
                                Administrador
                            </button>

                            <button type="button" className={css.resetar} onClick={resetarFiltros}>
                                Limpar filtros
                            </button>
                        </div>
                    </section>

                    <section className={css.tabelaCard}>
                        <table className={css.tabela}>
                            <thead>
                            <tr>
                                <th>FOTO</th>
                                <th>NOME</th>
                                <th>EMAIL</th>
                                <th>TIPO</th>
                                <th>ACOES</th>
                            </tr>
                            </thead>

                            <tbody>
                            {carregando ? (
                                <tr>
                                    <td colSpan="5" className={css.vazio}>
                                        Carregando dados...
                                    </td>
                                </tr>
                            ) : usuariosFiltrados.length > 0 ? (
                                usuariosPaginados.map((usuario) => (
                                    <tr
                                        key={usuario.id_usuario}
                                        className={Number(usuario.situacao) === 1 ? css.linhaBloqueada : ""}
                                    >
                                        <td data-label="Foto">
                                            <img
                                                src={imagensUsuario(usuario)[0]}
                                                data-indice="0"
                                                alt={usuario.nome}
                                                className={`${css.logoUsuario} ${classeTipo(usuario.tipo)}`}
                                                onError={(e) => tentarProximaImagem(e, imagensUsuario(usuario))}
                                            />
                                        </td>

                                        <td data-label="Nome" className={css.nomeUsuario}>{usuario.nome}</td>
                                        <td data-label="Email">{usuario.email || "Não informado"}</td>

                                        <td data-label="Tipo">
                                            <span className={`${css.tipo} ${classeTipo(usuario.tipo)}`}>
                                                {textoTipo(usuario.tipo)}
                                            </span>
                                        </td>

                                        <td data-label="Acoes">
                                            <div className={css.acoes}>
                                                {Number(usuario.situacao) === 1 ? (
                                                    <button
                                                        type="button"
                                                        className={`${css.icone} ${css.desbloquear}`}
                                                        onClick={() => abrirModalSituacao(usuario, 0)}
                                                    >
                                                        Desbloquear
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className={css.icone}
                                                            onClick={() => editarUsuario(usuario)}
                                                        >
                                                            Editar
                                                        </button>

                                                        {Number(usuario.tipo) === 2 && (
                                                            <button
                                                                type="button"
                                                                className={css.icone}
                                                                onClick={() => abrirModalComprasUsuario(usuario)}
                                                            >
                                                                Parcelas
                                                            </button>
                                                        )}

                                                        {Number(usuario.tipo) === 1 && (
                                                            <button
                                                                type="button"
                                                                className={css.icone}
                                                                onClick={() => abrirModalVendasUsuario(usuario)}
                                                            >
                                                                Vendas
                                                            </button>
                                                        )}

                                                        <button
                                                            type="button"
                                                            className={`${css.icone} ${css.bloquear}`}
                                                            onClick={() => abrirModalSituacao(usuario, 1)}
                                                        >
                                                            Bloquear
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className={css.vazio}>
                                        Nenhum usuário encontrado.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>

                        <div className={css.paginacao}>
                            <button
                                type="button"
                                disabled={paginaAtual === 1}
                                onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
                            >
                                Anterior
                            </button>

                            <span>{paginaAtual} / {totalPaginas}</span>

                            <button
                                type="button"
                                disabled={paginaAtual === totalPaginas}
                                onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
                            >
                                Proxima
                            </button>
                        </div>
                    </section>
                </main>
            </div>

            {modalSituacao && (
                <div className={css.modalFundo}>
                    <div className={css.modal}>
                        <h2>
                            {novaSituacao === 1 ? "Confirmar bloqueio" : "Confirmar desbloqueio"}
                        </h2>

                        <p>
                            Tem certeza que deseja{" "}
                            {novaSituacao === 1 ? "bloquear" : "desbloquear"} o usuário{" "}
                            <strong>{usuarioSituacao?.nome}</strong>?
                        </p>

                        {novaSituacao === 1 && (
                            <label className={css.campoModal}>
                                Motivo do bloqueio
                                <textarea
                                    value={motivoBloqueio}
                                    onChange={(e) => {
                                        setMotivoBloqueio(e.target.value);
                                        setErroSituacao("");
                                    }}
                                    placeholder="Explique o motivo que sera enviado por e-mail"
                                    rows={4}
                                    disabled={salvandoSituacao}
                                />
                            </label>
                        )}

                        {erroSituacao && <p className={css.erroModal}>{erroSituacao}</p>}

                        <div className={css.modalBotoes}>
                            <button
                                type="button"
                                className={css.cancelar}
                                onClick={fecharModalSituacao}
                                disabled={salvandoSituacao}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                className={novaSituacao === 1 ? css.excluir : css.confirmar}
                                onClick={alterarSituacaoUsuario}
                                disabled={
                                    salvandoSituacao ||
                                    (novaSituacao === 1 && !motivoBloqueio.trim())
                                }
                            >
                                {salvandoSituacao
                                    ? "Enviando..."
                                    : novaSituacao === 1
                                        ? "Bloquear e enviar e-mail"
                                        : "Desbloquear"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modalCompras && (
                <div className={css.modalFundo}>
                    <div className={css.modalCompras}>
                        <div className={css.modalTopo}>
                            <div>
                                <h2>{tipoModalUsuario === "vendas" ? "Vendas do vendedor" : "Compras e parcelas"}</h2>
                                <p>
                                    {tipoModalUsuario === "vendas"
                                        ? `${usuarioCompras?.nome || "Vendedor"} - vendas realizadas e clientes atendidos.`
                                        : `${usuarioCompras?.nome || "Cliente"} - acompanhe os financiamentos e baixas.`}
                                </p>
                            </div>

                            <button
                                type="button"
                                className={css.fecharModal}
                                onClick={fecharModalComprasUsuario}
                                aria-label="Fechar"
                            >
                                x
                            </button>
                        </div>

                        {erroCompras && <p className={css.erroCadastro}>{erroCompras}</p>}
                        {sucessoCompras && <p className={css.sucessoModal}>{sucessoCompras}</p>}

                        {carregandoCompras ? (
                            <p className={css.estadoCompras}>
                                {tipoModalUsuario === "vendas" ? "Carregando vendas..." : "Carregando compras..."}
                            </p>
                        ) : tipoModalUsuario === "vendas" ? (
                            vendasUsuario.length === 0 && !erroCompras ? (
                                <p className={css.estadoCompras}>Esse vendedor ainda nÃ£o possui vendas registradas.</p>
                            ) : (
                                <div className={css.listaCompras}>
                                    {vendasUsuario.map((venda) => (
                                        <article className={css.compraUsuario} key={venda.idVenda}>
                                            <div className={css.compraTopo}>
                                                <div>
                                                    <span>{venda.formaPagamento}</span>
                                                    <h3>{venda.veiculo || "VeÃ­culo nÃ£o informado"}</h3>
                                                    <p>{venda.placa || "Placa nÃ£o informada"} - {formatarData(venda.dataVenda)}</p>
                                                </div>

                                                <strong>{formatarPreco(venda.valorVenda)}</strong>
                                            </div>

                                            <div className={css.resumoFinanciamento}>
                                                <div>
                                                    <span>Cliente</span>
                                                    <strong>{venda.cliente}</strong>
                                                </div>
                                                <div>
                                                    <span>Valor vendido</span>
                                                    <strong>{formatarPreco(venda.valorVenda)}</strong>
                                                </div>
                                                <div>
                                                    <span>Lucro bruto</span>
                                                    <strong>{formatarPreco(venda.lucroBruto)}</strong>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )
                        ) : comprasUsuario.length === 0 && !erroCompras ? (
                            <p className={css.estadoCompras}>Esse cliente ainda não possui compras registradas.</p>
                        ) : (
                            <div className={css.listaCompras}>
                                {comprasUsuario.map((compra) => {
                                    const ehFinanciamento = Number(compra.formaPagamento) === 1;
                                    const parcelasVisiveis = Boolean(parcelasComprasAbertas[compra.idVenda]);
                                    const parcelasPagas = compra.parcelas.filter((parcela) =>
                                        Number(getCampo(parcela, ["status", "STATUS"], 0)) === 1
                                    ).length;

                                    return (
                                        <article className={css.compraUsuario} key={compra.idVenda}>
                                            <div className={css.compraTopo}>
                                                <div>
                                                    <span>{ehFinanciamento ? "Financiamento" : "à vista"}</span>
                                                    <h3>{compra.marca} {compra.modelo}</h3>
                                                    <p>{compra.placa || "Placa não informada"} - {formatarData(compra.dataVenda)}</p>
                                                </div>

                                                <strong>{formatarPreco(compra.valorVenda)}</strong>
                                            </div>

                                            {ehFinanciamento ? (
                                                <>
                                                    <div className={css.resumoFinanciamento}>
                                                        <div>
                                                            <span>Valor original</span>
                                                            <strong>{formatarPreco(compra.financiamento.valorOriginal)}</strong>
                                                        </div>
                                                        <div>
                                                            <span>Total financiado</span>
                                                            <strong>{formatarPreco(compra.financiamento.valorFinanciado || compra.valorVenda)}</strong>
                                                        </div>
                                                        <div>
                                                            <span>Parcelas pagas</span>
                                                            <strong>{parcelasPagas}/{compra.parcelas.length}</strong>
                                                        </div>
                                                    </div>

                                                    <div className={css.parcelasControle}>
                                                        <span>{compra.parcelas.length} parcelas - {compra.parcelas.length - parcelasPagas} em aberto</span>
                                                        <button
                                                            type="button"
                                                            className={css.verParcelas}
                                                            onClick={() => alternarParcelasCompra(compra.idVenda)}
                                                        >
                                                            {parcelasVisiveis ? "Ocultar parcelas" : "Ver parcelas"}
                                                        </button>
                                                    </div>

                                                    {parcelasVisiveis && (
                                                        <div className={css.parcelasAdmin}>
                                                            {compra.parcelas.length > 0 ? (
                                                            compra.parcelas.map((parcela) => {
                                                                const numero = getCampo(parcela, ["numero_parcela", "NUMERO_PARCELA"]);
                                                                const valor = getCampo(parcela, ["valor_parcela", "VALOR_PARCELA"], 0);
                                                                const vencimento = getCampo(parcela, ["data_vencimento", "DATA_VENCIMENTO"]);
                                                                const pagamento = getCampo(parcela, ["data_pagamento", "DATA_PAGAMENTO"]);
                                                                const paga = Number(getCampo(parcela, ["status", "STATUS"], 0)) === 1;
                                                                const chaveBaixa = `${compra.financiamento.idFinanciamento}-${numero}`;

                                                                return (
                                                                    <div className={css.parcelaAdmin} key={`${compra.idVenda}-${numero}`}>
                                                                        <div>
                                                                            <strong>Parcela {numero}</strong>
                                                                            <span>Vence {formatarData(vencimento)}</span>
                                                                        </div>

                                                                        <div>
                                                                            <strong>{formatarPreco(valor)}</strong>
                                                                            <span className={paga ? css.parcelaPaga : css.parcelaAberta}>
                                                                                {paga ? `Pago em ${formatarData(pagamento)}` : "Em aberto"}
                                                                            </span>
                                                                        </div>

                                                                        <button
                                                                            type="button"
                                                                            className={`${css.baixarParcela} ${paga ? css.retirarBaixa : ""}`}
                                                                            disabled={baixandoParcela === chaveBaixa}
                                                                            onClick={() =>
                                                                                paga
                                                                                    ? retirarBaixaParcela(compra.financiamento.idFinanciamento, numero)
                                                                                    : darBaixaParcela(compra.financiamento.idFinanciamento, numero)
                                                                            }
                                                                        >
                                                                            {baixandoParcela === chaveBaixa
                                                                                ? "Salvando..."
                                                                                : paga
                                                                                    ? "Retirar baixa"
                                                                                    : "Dar baixa"}
                                                                        </button>
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <p className={css.estadoCompras}>Nenhuma parcela encontrada.</p>
                                                        )}
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <p className={css.estadoCompras}>Compra à vista, sem parcelas.</p>
                                            )}
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {modalCadastro && (
                <div className={css.modalFundo}>
                    <div className={css.modalCadastro}>
                        <div className={css.modalTopo}>
                            <div>
                                <h2>Adicionar usuário interno</h2>
                                <p>Use o mesmo padrao do cadastro, escolhendo o tipo de acesso.</p>
                            </div>

                            <button
                                type="button"
                                className={css.fecharModal}
                                onClick={fecharModalCadastro}
                                aria-label="Fechar"
                            >
                                x
                            </button>
                        </div>

                        <form className={css.formCadastro} onSubmit={cadastrarUsuarioInterno}>
                            <div className={css.tipoCadastro}>
                                <button
                                    type="button"
                                    className={`${css.tipoCadastroBotao} ${cadastro.tipo === "1" ? css.tipoCadastroAtivo : ""}`}
                                    onClick={() => atualizarCadastro("tipo", "1")}
                                >
                                    Vendedor
                                </button>

                                <button
                                    type="button"
                                    className={`${css.tipoCadastroBotao} ${cadastro.tipo === "0" ? css.tipoCadastroAtivo : ""}`}
                                    onClick={() => atualizarCadastro("tipo", "0")}
                                >
                                    Administrador
                                </button>
                            </div>

                            <label className={css.uploadCadastro}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={selecionarImagemCadastro}
                                />

                                {previewCadastro ? (
                                    <img src={previewCadastro} alt="Preview" />
                                ) : (
                                    <span>Adicionar imagem</span>
                                )}
                            </label>

                            {erroCadastro && (
                                <p className={css.erroCadastro}>
                                    {erroCadastro}
                                </p>
                            )}

                            <div className={css.campo}>
                                <label>Nome completo</label>
                                <input
                                    type="text"
                                    placeholder="Digite o nome completo"
                                    value={cadastro.nome}
                                    onChange={(e) => atualizarCadastro("nome", e.target.value)}
                                />
                            </div>

                            <div className={css.gradeCampos}>
                                <div className={css.campo}>
                                    <label>Telefone</label>
                                    <input
                                        type="text"
                                        placeholder="(11) 99999-9999"
                                        inputMode="numeric"
                                        maxLength={15}
                                        value={cadastro.telefone}
                                        onChange={(e) =>
                                            atualizarCadastro("telefone", formatarTelefone(e.target.value))
                                        }
                                    />
                                </div>

                                <div className={css.campo}>
                                    <label>CPF</label>
                                    <input
                                        type="text"
                                        placeholder="000.000.000-00"
                                        inputMode="numeric"
                                        maxLength={14}
                                        value={cadastro.cpf}
                                        onChange={(e) =>
                                            atualizarCadastro("cpf", formatarCpf(e.target.value))
                                        }
                                    />
                                </div>
                            </div>

                            <div className={css.campo}>
                                <label>Email</label>
                                <input
                                    type="email"
                                    placeholder="email@exemplo.com"
                                    value={cadastro.email}
                                    onChange={(e) => atualizarCadastro("email", e.target.value)}
                                />
                            </div>

                            <div className={css.gradeCampos}>
                                <div className={css.campo}>
                                    <label>Senha</label>
                                    <input
                                        type="password"
                                        placeholder="Digite a senha"
                                        value={cadastro.senha}
                                        onChange={(e) => atualizarCadastro("senha", e.target.value)}
                                    />
                                </div>

                                <div className={css.campo}>
                                    <label>Confirmar senha</label>
                                    <input
                                        type="password"
                                        placeholder="Confirme a senha"
                                        value={cadastro.confirma}
                                        onChange={(e) => atualizarCadastro("confirma", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className={css.modalBotoes}>
                                <button
                                    type="button"
                                    className={css.cancelar}
                                    onClick={fecharModalCadastro}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className={css.confirmar}
                                    disabled={salvandoCadastro}
                                >
                                    {salvandoCadastro ? "Cadastrando..." : "Cadastrar"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {modalEdicao && (
                <div className={css.modalFundo}>
                    <div className={css.modalCadastro}>
                        <div className={css.modalTopo}>
                            <div>
                                <h2>Editar usuário</h2>
                                <p>Atualize os dados cadastrais e o tipo de acesso.</p>
                            </div>

                            <button
                                type="button"
                                className={css.fecharModal}
                                onClick={fecharModalEdicao}
                                aria-label="Fechar"
                            >
                                x
                            </button>
                        </div>

                        <form className={css.formCadastro} onSubmit={salvarEdicaoUsuario}>
                            <div className={css.tipoCadastro}>
                                <button
                                    type="button"
                                    className={`${css.tipoCadastroBotao} ${edicao.tipo === "2" ? css.tipoCadastroAtivo : ""}`}
                                    onClick={() => atualizarEdicao("tipo", "2")}
                                >
                                    Cliente
                                </button>

                                <button
                                    type="button"
                                    className={`${css.tipoCadastroBotao} ${edicao.tipo === "1" ? css.tipoCadastroAtivo : ""}`}
                                    onClick={() => atualizarEdicao("tipo", "1")}
                                >
                                    Vendedor
                                </button>

                                <button
                                    type="button"
                                    className={`${css.tipoCadastroBotao} ${edicao.tipo === "0" ? css.tipoCadastroAtivo : ""}`}
                                    onClick={() => atualizarEdicao("tipo", "0")}
                                >
                                    Administrador
                                </button>
                            </div>

                            <label className={css.uploadCadastro}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={selecionarImagemEdicao}
                                />

                                {previewEdicao ? (
                                    <img src={previewEdicao} alt="Preview" />
                                ) : (
                                    <span>Alterar imagem</span>
                                )}
                            </label>

                            {erroEdicao && (
                                <p className={css.erroCadastro}>
                                    {erroEdicao}
                                </p>
                            )}

                            <div className={css.campo}>
                                <label>Nome completo</label>
                                <input
                                    type="text"
                                    placeholder="Digite o nome completo"
                                    value={edicao.nome}
                                    onChange={(e) => atualizarEdicao("nome", e.target.value)}
                                />
                            </div>

                            <div className={css.gradeCampos}>
                                <div className={css.campo}>
                                    <label>Telefone</label>
                                    <input
                                        type="text"
                                        placeholder="(11) 99999-9999"
                                        inputMode="numeric"
                                        maxLength={15}
                                        value={edicao.telefone}
                                        onChange={(e) =>
                                            atualizarEdicao("telefone", formatarTelefone(e.target.value))
                                        }
                                    />
                                </div>

                                <div className={css.campo}>
                                    <label>CPF</label>
                                    <input
                                        type="text"
                                        placeholder="000.000.000-00"
                                        inputMode="numeric"
                                        maxLength={14}
                                        value={edicao.cpf}
                                        onChange={(e) =>
                                            atualizarEdicao("cpf", formatarCpf(e.target.value))
                                        }
                                    />
                                </div>
                            </div>

                            <div className={css.campo}>
                                <label>Email</label>
                                <input
                                    type="email"
                                    placeholder="email@exemplo.com"
                                    value={edicao.email}
                                    onChange={(e) => atualizarEdicao("email", e.target.value)}
                                />
                            </div>

                            <div className={css.campoSenhaOpcional}>
                                <button
                                    type="button"
                                    className={css.botaoSenhaOpcional}
                                    onClick={() => {
                                        setAlterarSenhaEdicao((valorAtual) => !valorAtual);
                                        atualizarEdicao("senha", "");
                                    }}
                                >
                                    {alterarSenhaEdicao ? "Manter senha atual" : "Alterar senha"}
                                </button>

                                {alterarSenhaEdicao && (
                                    <div className={css.campo}>
                                        <label>Nova senha</label>
                                        <input
                                            type="password"
                                            placeholder="Digite a nova senha"
                                            autoComplete="new-password"
                                            value={edicao.senha}
                                            onChange={(e) => atualizarEdicao("senha", e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className={css.modalBotoes}>
                                <button
                                    type="button"
                                    className={css.cancelar}
                                    onClick={fecharModalEdicao}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className={css.confirmar}
                                    disabled={salvandoEdicao}
                                >
                                    {salvandoEdicao ? "Salvando..." : "Salvar alterações"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
}
