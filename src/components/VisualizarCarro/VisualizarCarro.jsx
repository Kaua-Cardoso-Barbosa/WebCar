import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { API_URL } from "../../App";
import { authHeaders } from "../../utils/authSession";
import css from "./VisualizarCarro.module.css";

const IMAGEM_PADRAO = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="520" viewBox="0 0 900 520">
  <rect width="900" height="520" fill="#f1f5f9"/>
  <text x="450" y="260" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="34" font-weight="700" fill="#64748b">Sem imagem</text>
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

function testarImagem(urls) {
    return new Promise((resolve) => {
        let indice = 0;

        function tentar() {
            if (indice >= urls.length) {
                resolve(null);
                return;
            }

            const img = new Image();
            img.onload = () => resolve(urls[indice]);
            img.onerror = () => {
                indice += 1;
                tentar();
            };
            img.src = urls[indice];
        }

        tentar();
    });
}

function textoCombustivel(valor) {
    if (String(valor) === "0") return "Flex";
    if (String(valor) === "1") return "Gasolina";
    if (String(valor) === "2") return "Etanol";
    if (String(valor) === "3") return "Diesel";
    return valor || "Não informado";
}

function textoCambio(valor) {
    if (String(valor) === "0") return "Manual";
    if (String(valor) === "1") return "Automatico";
    return valor || "Não informado";
}

function formatarPreco(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function apenasNumeros(valor) {
    return String(valor || "").replace(/\D/g, "");
}

function formatarCpf(valor) {
    const numeros = apenasNumeros(valor).slice(0, 11);

    if (numeros.length <= 3) return numeros;
    if (numeros.length <= 6) return `${numeros.slice(0, 3)}.${numeros.slice(3)}`;
    if (numeros.length <= 9) return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`;

    return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`;
}

function cpfValido(valor) {
    const cpf = apenasNumeros(valor);

    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let soma = 0;

    for (let i = 0; i < 9; i += 1) {
        soma += Number(cpf[i]) * (10 - i);
    }

    let digito = (soma * 10) % 11;
    if (digito === 10) digito = 0;
    if (digito !== Number(cpf[9])) return false;

    soma = 0;

    for (let i = 0; i < 10; i += 1) {
        soma += Number(cpf[i]) * (11 - i);
    }

    digito = (soma * 10) % 11;
    if (digito === 10) digito = 0;

    return digito === Number(cpf[10]);
}

function formatarTelefone(valor) {
    const numeros = apenasNumeros(valor).slice(0, 11);

    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;

    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
}

function clienteNaoEncontrado(mensagem = "") {
    const texto = String(mensagem)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    return (
        (texto.includes("cpf") || texto.includes("cliente") || texto.includes("usuario")) &&
        (texto.includes("nao encontrado") || texto.includes("nao cadastrado") || texto.includes("inexistente"))
    );
}

function normalizarDescontoAVista(data = {}) {
    const empresa = data.empresas?.[0] || data.empresa?.[0] || data.empresa || data[0] || data;
    const valor =
        empresa.DESCONTO_A_VISTA ??
        empresa.desconto_a_vista ??
        empresa.descontoAVista ??
        empresa.desconto ??
        empresa.porcentagem ??
        0;

    const numero = Number(valor);

    return Number.isFinite(numero) && numero > 0 ? numero : 0;
}

function normalizarPorcentagemJuro(data = {}) {
    const empresa = data.empresas?.[0] || data.empresa?.[0] || data.empresa || data[0] || data;
    const valor =
        empresa.PORCENTAGEM_JURO ??
        empresa.porcentagem_juro ??
        empresa.porcentagemJuro ??
        empresa.juro ??
        empresa.JURO;

    const numero = Number(valor);

    return Number.isFinite(numero) && numero >= 0 ? numero : null;
}

function calcularValorAVista(valor, descontoAVista) {
    const preco = Number(valor || 0);
    const desconto = Number(descontoAVista || 0);

    if (!Number.isFinite(preco) || !Number.isFinite(desconto) || desconto <= 0) {
        return preco;
    }

    return preco - (preco * desconto) / 100;
}

function calcularFinanciamento(valor, porcentagemJuro, parcelas) {
    const preco = Number(valor || 0);
    const juro = Number(porcentagemJuro || 0) / 100;
    const quantidadeParcelas = Number(parcelas || 0);

    if (!Number.isFinite(preco) || preco <= 0 || quantidadeParcelas <= 0) {
        return { parcelaMensal: 0, valorTotal: 0 };
    }

    if (!Number.isFinite(juro) || juro <= 0) {
        return {
            parcelaMensal: preco / quantidadeParcelas,
            valorTotal: preco,
        };
    }

    const parcelaMensal = preco * juro / (1 - (1 + juro) ** -quantidadeParcelas);

    return {
        parcelaMensal,
        valorTotal: parcelaMensal * quantidadeParcelas,
    };
}

export default function VisualizarCarro({ modoVendedor = false }) {
    const { id } = useParams();
    const navigate = useNavigate();

    const [carro, setCarro] = useState(null);
    const imagemSemFoto = { numero: 0, urls: [IMAGEM_PADRAO], placeholder: true };
    const [imagens, setImagens] = useState([imagemSemFoto]);
    const [imagemSelecionada, setImagemSelecionada] = useState(imagemSemFoto);
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [modalCompraAberta, setModalCompraAberta] = useState(false);
    const [modalConfirmacaoCompraAberta, setModalConfirmacaoCompraAberta] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const [erroCompra, setErroCompra] = useState("");
    const [gerandoQrCode, setGerandoQrCode] = useState(false);
    const [compraConcluida, setCompraConcluida] = useState(false);
    const [tempoQrCode, setTempoQrCode] = useState(60);
    const [descontoAVista, setDescontoAVista] = useState(0);
    const [porcentagemJuro, setPorcentagemJuro] = useState(null);
    const [carregandoJuro, setCarregandoJuro] = useState(false);
    const [formaPagamento, setFormaPagamento] = useState(0);
    const [parcelas, setParcelas] = useState(12);
    const [cpfClienteVenda, setCpfClienteVenda] = useState("");
    const [mensagemVenda, setMensagemVenda] = useState("");
    const [mensagemSucessoPagina, setMensagemSucessoPagina] = useState("");
    const [modalCadastroClienteAberta, setModalCadastroClienteAberta] = useState(false);
    const [modalDadosCompraAberta, setModalDadosCompraAberta] = useState(false);
    const [salvandoDadosCompra, setSalvandoDadosCompra] = useState(false);
    const [erroDadosCompra, setErroDadosCompra] = useState("");
    const [dadosCompraCliente, setDadosCompraCliente] = useState({
        telefone: "",
        cpf: "",
    });
    const [etapaCadastroCliente, setEtapaCadastroCliente] = useState("cadastro");
    const [salvandoCadastroCliente, setSalvandoCadastroCliente] = useState(false);
    const [erroCadastroCliente, setErroCadastroCliente] = useState("");
    const [cadastroClienteVenda, setCadastroClienteVenda] = useState({
        nome: "",
        telefone: "",
        email: "",
        cpf: "",
        senha: "",
        confirmarSenha: "",
        codigo: "",
    });

    async function carregarImagensDisponiveis(idVeiculo) {
        if (!idVeiculo) {
            setImagens([imagemSemFoto]);
            setImagemSelecionada(imagemSemFoto);
            return;
        }

        const primeiraImagem = {
            numero: 1,
            urls: [...imagensVeiculo(idVeiculo, 1), IMAGEM_PADRAO],
            placeholder: false,
        };

        setImagens([primeiraImagem]);
        setImagemSelecionada(primeiraImagem);

        const encontradas = [];

        for (let numero = 1; numero <= 10; numero += 1) {
            const urls = imagensVeiculo(idVeiculo, numero);
            const urlValida = await testarImagem(urls);

            if (!urlValida) break;

            encontradas.push({
                numero,
                urls: [urlValida],
                placeholder: false,
            });

            setImagens([...encontradas]);

            if (numero === 1) {
                setImagemSelecionada(encontradas[0]);
            }
        }

        const listaFinal = encontradas.length > 0 ? encontradas : [imagemSemFoto];

        setImagens(listaFinal);
        setImagemSelecionada(listaFinal[0]);
    }

    useEffect(() => {
        async function buscarVeiculo() {
            try {
                setCarregando(true);
                setErro("");

                const response = await fetch(`${API_URL}/buscar_veiculo`, {
                    method: "POST",
                    headers: authHeaders({
                        "Content-Type": "application/json",
                    }),
                    credentials: "include",
                    body: JSON.stringify({ id_veiculo: id }),
                });

                const data = await response.json();

                if (!response.ok) {
                    setErro(data.mensagem || "Não foi possível carregar o veículo.");
                    return;
                }

                const veiculo = data.veiculos?.[0] || data[0] || data;

                if (!veiculo?.ID_VEICULO) {
                    setErro("Veículo não encontrado.");
                    return;
                }

                setCarro(veiculo);
                carregarImagensDisponiveis(veiculo.ID_VEICULO);

                await carregarDescontoAVistaEmpresa();
                if (modoVendedor) {
                    await carregarTaxaJuroEmpresa();
                }
            } catch {
                setErro("Erro ao conectar com o servidor.");
            } finally {
                setCarregando(false);
            }
        }

        buscarVeiculo();
    }, [id, modoVendedor]);

    async function carregarDescontoAVistaEmpresa() {
        try {
            const rotas = ["/verporcentagem_desconto", "/verdadosempresa"];

            for (const rota of rotas) {
                const responseDesconto = await fetch(`${API_URL}${rota}`, {
                    method: "GET",
                    headers: authHeaders(),
                    credentials: "include",
                });

                if (responseDesconto.ok) {
                    const dataDesconto = await responseDesconto.json();
                    const desconto = normalizarDescontoAVista(dataDesconto);

                    if (desconto > 0) {
                        setDescontoAVista(desconto);
                        return desconto;
                    }
                }
            }

            setDescontoAVista(0);
            return 0;
        } catch {
            setDescontoAVista(0);
            return 0;
        }
    }

    async function carregarTaxaJuroEmpresa() {
        try {
            setCarregandoJuro(true);

            const rotas = ["/verdadosempresa", "/verporcentagem_juro"];

            for (const rota of rotas) {
                const responseEmpresa = await fetch(`${API_URL}${rota}`, {
                    method: "GET",
                    headers: authHeaders(),
                    credentials: "include",
                });

                if (responseEmpresa.ok) {
                    const dataEmpresa = await responseEmpresa.json();
                    const taxa = normalizarPorcentagemJuro(dataEmpresa);

                    if (taxa !== null) {
                        setPorcentagemJuro(taxa);
                        return taxa;
                    }
                }
            }

            setPorcentagemJuro(null);
            return null;
        } catch {
            setPorcentagemJuro(null);
            return null;
        } finally {
            setCarregandoJuro(false);
        }
    }

    useEffect(() => {
        return () => {
            if (qrCodeUrl) {
                URL.revokeObjectURL(qrCodeUrl);
            }
        };
    }, [qrCodeUrl]);

    useEffect(() => {
        if (!modalCompraAberta || !qrCodeUrl || erroCompra || gerandoQrCode || compraConcluida) {
            return;
        }

        setTempoQrCode(60);

        const contador = setInterval(() => {
            setTempoQrCode((tempoAtual) => Math.max(0, tempoAtual - 1));
        }, 1000);

        const expiracao = setTimeout(() => {
            finalizarCompraPix();
        }, 60000);

        return () => {
            clearInterval(contador);
            clearTimeout(expiracao);
        };
    }, [modalCompraAberta, qrCodeUrl, erroCompra, gerandoQrCode, compraConcluida]);

    async function abrirCompra() {
        if (!carro?.ID_VEICULO) return;

        if (modoVendedor) {
            setErroCompra("");
            setMensagemVenda("");
            setMensagemSucessoPagina("");
            setCompraConcluida(false);
            setTempoQrCode(60);
            setFormaPagamento(0);
            setParcelas(12);
            setCpfClienteVenda("");
            if (qrCodeUrl) {
                URL.revokeObjectURL(qrCodeUrl);
                setQrCodeUrl("");
            }
            setModalCompraAberta(true);
            return;
        }

        const usuarioId = localStorage.getItem("usuario_id");
        const usuarioTipo = Number(localStorage.getItem("usuario_tipo"));
        const telefoneUsuario = apenasNumeros(localStorage.getItem("usuario_telefone"));
        const cpfUsuario = apenasNumeros(localStorage.getItem("usuario_cpf"));

        if (!usuarioId || usuarioTipo !== 2) {
            if (qrCodeUrl) {
                URL.revokeObjectURL(qrCodeUrl);
                setQrCodeUrl("");
            }

            setCompraConcluida(false);
            setGerandoQrCode(false);
            setTempoQrCode(60);
            navigate("/login", { state: { voltarPara: `/Visualizar/${carro.ID_VEICULO}` } });
            return;
        }

        if (telefoneUsuario.length < 10 || !cpfValido(cpfUsuario)) {
            abrirDadosCompraCliente();
            return;
        }

        try {
            setErroCompra("");
            setCompraConcluida(false);
            setTempoQrCode(60);
            setGerandoQrCode(true);
            setModalCompraAberta(true);

            if (qrCodeUrl) {
                URL.revokeObjectURL(qrCodeUrl);
                setQrCodeUrl("");
            }

            const response = await fetch(`${API_URL}/adicionar_venda`, {
                method: "POST",
                headers: authHeaders({
                    "Content-Type": "application/json",
                }),
                credentials: "include",
                body: JSON.stringify({
                    id_veiculo: carro.ID_VEICULO,
                    forma_pagamento: 0,
                }),
            });

            const tipoResposta = response.headers.get("content-type") || "";

            if (!response.ok || tipoResposta.includes("application/json")) {
                const data = tipoResposta.includes("application/json") ? await response.json() : null;
                setErroCompra(data?.mensagem || "Não foi possível gerar o QR Code da compra.");
                return;
            }

            const imagemQrCode = await response.blob();
            setQrCodeUrl(URL.createObjectURL(imagemQrCode));
        } catch {
            setErroCompra("Erro ao conectar com o servidor para gerar o QR Code.");
        } finally {
            setGerandoQrCode(false);
        }
    }

    function clicarCompraPrincipal() {
        if (modoVendedor) {
            abrirCompra();
            return;
        }

        setModalConfirmacaoCompraAberta(true);
    }

    function cancelarConfirmacaoCompra() {
        setModalConfirmacaoCompraAberta(false);
    }

    function confirmarCompraCliente() {
        setModalConfirmacaoCompraAberta(false);
        abrirCompra();
    }

    function fecharCompra() {
        setModalCompraAberta(false);
        setErroCompra("");
        setCompraConcluida(false);
        setMensagemVenda("");
        setTempoQrCode(60);
    }

    function abrirDadosCompraCliente() {
        setDadosCompraCliente({
            telefone: formatarTelefone(localStorage.getItem("usuario_telefone") || ""),
            cpf: formatarCpf(localStorage.getItem("usuario_cpf") || ""),
        });
        setErroDadosCompra("");
        setModalDadosCompraAberta(true);
    }

    function fecharDadosCompraCliente() {
        setModalDadosCompraAberta(false);
        setErroDadosCompra("");
        setSalvandoDadosCompra(false);
    }

    function atualizarDadosCompraCliente(campo, valor) {
        const normalizadores = {
            telefone: formatarTelefone,
            cpf: formatarCpf,
        };

        setErroDadosCompra("");
        setDadosCompraCliente((dados) => ({
            ...dados,
            [campo]: normalizadores[campo](valor),
        }));
    }

    async function salvarDadosCompraCliente(e) {
        e.preventDefault();

        const idUsuario = localStorage.getItem("usuario_id");
        const telefone = apenasNumeros(dadosCompraCliente.telefone);
        const cpf = apenasNumeros(dadosCompraCliente.cpf);

        if (!idUsuario) {
            setErroDadosCompra("Usuario nao encontrado. Faca login novamente.");
            return;
        }

        if (telefone.length < 10 || telefone.length > 11) {
            setErroDadosCompra("Informe um telefone valido.");
            return;
        }

        if (!cpfValido(cpf)) {
            setErroDadosCompra("Informe um CPF valido.");
            return;
        }

        try {
            setSalvandoDadosCompra(true);
            setErroDadosCompra("");

            const formData = new FormData();
            formData.append("nome", localStorage.getItem("usuario_nome") || "");
            formData.append("email", localStorage.getItem("usuario_email") || "");
            formData.append("telefone", telefone);
            formData.append("cpf", cpf);

            const response = await fetch(`${API_URL}/edicao_usuario/${idUsuario}`, {
                method: "PUT",
                headers: authHeaders(),
                credentials: "include",
                body: formData,
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                setErroDadosCompra(data.mensagem || "Nao foi possivel salvar seus dados.");
                return;
            }

            localStorage.setItem("usuario_telefone", telefone);
            localStorage.setItem("usuario_cpf", cpf);
            window.dispatchEvent(new CustomEvent("webcar:auth", { detail: { logado: true } }));

            fecharDadosCompraCliente();
            await abrirCompra();
        } catch {
            setErroDadosCompra("Erro ao conectar com o servidor.");
        } finally {
            setSalvandoDadosCompra(false);
        }
    }

    function finalizarCompraPix() {
        setModalCompraAberta(false);
        setErroCompra("");
        setCompraConcluida(false);
        setMensagemVenda("");
        setTempoQrCode(60);

        if (qrCodeUrl) {
            URL.revokeObjectURL(qrCodeUrl);
            setQrCodeUrl("");
        }

        setMensagemSucessoPagina(
            modoVendedor
                ? "Venda à vista concluída com sucesso."
                : "Carro comprado com sucesso."
        );
    }

    async function executarVenda(cpfVenda, permitirCadastro = true) {
        if (!carro?.ID_VEICULO || gerandoQrCode) return;

        if (!cpfValido(cpfVenda)) {
            setErroCompra("Informe um CPF valido para registrar a venda.");
            return;
        }

        try {
            setErroCompra("");
            setMensagemVenda("");
            setMensagemSucessoPagina("");
            setCompraConcluida(false);
            setGerandoQrCode(true);
            setTempoQrCode(60);

            if (Number(formaPagamento) === 1 && porcentagemJuro === null) {
                const taxa = await carregarTaxaJuroEmpresa();

                if (taxa === null) {
                    setErroCompra("Não foi possível carregar a taxa de juros cadastrada pela empresa.");
                    return;
                }
            }

            if (qrCodeUrl) {
                URL.revokeObjectURL(qrCodeUrl);
                setQrCodeUrl("");
            }

            const payload = {
                id_veiculo: carro.ID_VEICULO,
                cpf_cliente: apenasNumeros(cpfVenda),
                forma_pagamento: Number(formaPagamento),
            };

            if (Number(formaPagamento) === 1) {
                payload.parcela = Number(parcelas);
            }

            const response = await fetch(`${API_URL}/adicionar_venda`, {
                method: "POST",
                headers: authHeaders({
                    "Content-Type": "application/json",
                }),
                credentials: "include",
                body: JSON.stringify(payload),
            });

            const tipoResposta = response.headers.get("content-type") || "";

            if (!response.ok || tipoResposta.includes("application/json")) {
                const data = tipoResposta.includes("application/json") ? await response.json() : null;

                if (!response.ok) {
                    if (permitirCadastro && clienteNaoEncontrado(data?.mensagem)) {
                        setErroCompra("");
                        abrirCadastroClienteVenda(cpfVenda);
                        return;
                    }

                    setErroCompra(data?.mensagem || "Não foi possível registrar a venda.");
                    return;
                }

                setModalCompraAberta(false);
                setMensagemSucessoPagina(data?.mensagem || "Venda concluída com sucesso.");
                return;
            }

            const imagemQrCode = await response.blob();
            setQrCodeUrl(URL.createObjectURL(imagemQrCode));
            setMensagemVenda("Venda à vista registrada. Use o QR Code Pix para o pagamento.");
        } catch {
            setErroCompra("Erro ao conectar com o servidor para registrar a venda.");
        } finally {
            setGerandoQrCode(false);
        }
    }

    function atualizarCadastroCliente(campo, valor) {
        const normalizadores = {
            cpf: formatarCpf,
            telefone: formatarTelefone,
        };

        setErroCadastroCliente("");
        setCadastroClienteVenda((dados) => ({
            ...dados,
            [campo]: normalizadores[campo] ? normalizadores[campo](valor) : valor,
        }));
    }

    function abrirCadastroClienteVenda(cpf) {
        setCadastroClienteVenda({
            nome: "",
            telefone: "",
            email: "",
            cpf: formatarCpf(cpf),
            senha: "",
            confirmarSenha: "",
            codigo: "",
        });
        setErroCadastroCliente("");
        setEtapaCadastroCliente("cadastro");
        setModalCadastroClienteAberta(true);
    }

    function fecharCadastroClienteVenda() {
        setModalCadastroClienteAberta(false);
        setErroCadastroCliente("");
        setSalvandoCadastroCliente(false);
    }

    async function registrarVenda() {
        await executarVenda(cpfClienteVenda);
    }

    async function cadastrarClienteVenda(e) {
        e.preventDefault();

        if (
            !cadastroClienteVenda.nome.trim() ||
            !cadastroClienteVenda.telefone.trim() ||
            !cadastroClienteVenda.email.trim() ||
            !cadastroClienteVenda.cpf.trim() ||
            !cadastroClienteVenda.senha.trim() ||
            !cadastroClienteVenda.confirmarSenha.trim()
        ) {
            setErroCadastroCliente("Preencha todos os campos.");
            return;
        }

        if (!cpfValido(cadastroClienteVenda.cpf)) {
            setErroCadastroCliente("Informe um CPF valido.");
            return;
        }

        if (cadastroClienteVenda.senha !== cadastroClienteVenda.confirmarSenha) {
                setErroCadastroCliente("As senhas não coincidem.");
            return;
        }

        try {
            setSalvandoCadastroCliente(true);
            setErroCadastroCliente("");

            const formData = new FormData();
            formData.append("nome", cadastroClienteVenda.nome);
            formData.append("telefone", apenasNumeros(cadastroClienteVenda.telefone));
            formData.append("email", cadastroClienteVenda.email);
            formData.append("cpf", apenasNumeros(cadastroClienteVenda.cpf));
            formData.append("senha", cadastroClienteVenda.senha);
            formData.append("confirma", cadastroClienteVenda.confirmarSenha);
            formData.append("tipo", "2");

            const response = await fetch(`${API_URL}/adicionar_usuario`, {
                method: "POST",
                headers: authHeaders(),
                credentials: "include",
                body: formData,
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                setErroCadastroCliente(data.mensagem || "Não foi possível cadastrar o cliente.");
                return;
            }

            setEtapaCadastroCliente("codigo");
        } catch {
            setErroCadastroCliente("Erro ao conectar com o servidor.");
        } finally {
            setSalvandoCadastroCliente(false);
        }
    }

    async function verificarCadastroClienteVenda(e) {
        e.preventDefault();

        if (!cadastroClienteVenda.codigo.trim()) {
            setErroCadastroCliente("Digite o código enviado para o e-mail.");
            return;
        }

        try {
            setSalvandoCadastroCliente(true);
            setErroCadastroCliente("");

            const response = await fetch(`${API_URL}/verificar_email`, {
                method: "POST",
                credentials: "include",
                headers: authHeaders({
                    "Content-Type": "application/json",
                }),
                body: JSON.stringify({
                    email: cadastroClienteVenda.email,
                    codigo: cadastroClienteVenda.codigo,
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                setErroCadastroCliente(data.mensagem || "Codigo invalido.");
                return;
            }

            const cpfCadastrado = cadastroClienteVenda.cpf;
            setCpfClienteVenda(formatarCpf(cpfCadastrado));
            fecharCadastroClienteVenda();
            await executarVenda(cpfCadastrado, false);
        } catch {
            setErroCadastroCliente("Erro ao conectar com o servidor.");
        } finally {
            setSalvandoCadastroCliente(false);
        }
    }

    function concluirCompra() {
        finalizarCompraPix();
    }

    if (carregando) {
        return <div className={css.carregando}>Carregando...</div>;
    }

    if (erro || !carro) {
        return (
            <div className={css.estado}>
                <div className={css.erro}>{erro || "Veículo não encontrado."}</div>
                <button type="button" className={css.comprar} onClick={() => navigate("/catalogo")}>
                    Voltar para o catálogo
                </button>
            </div>
        );
    }

    const detalhes = [
        {
            icon: "speedometer2",
            title: "QUILOMETRAGEM",
            value: `${Number(carro.KM || 0).toLocaleString("pt-BR")} km`,
        },
        {
            icon: "gear",
            title: "CAMBIO",
            value: textoCambio(carro.CAMBIO),
        },
        {
            icon: "fuel-pump",
            title: "COMBUSTIVEL",
            value: textoCombustivel(carro.COMBUSTIVEL),
        },
        {
            icon: "palette",
            title: "COR",
            value: carro.COR || "Não informado",
        },
    ];
    const valorAVista = calcularValorAVista(carro.PRECO_VENDA, descontoAVista);
    const temDescontoAVista = Number(descontoAVista) > 0 && valorAVista < Number(carro.PRECO_VENDA || 0);
    const taxaJuroCarregada = porcentagemJuro !== null;
    const financiamento = taxaJuroCarregada
        ? calcularFinanciamento(carro.PRECO_VENDA, porcentagemJuro, parcelas)
        : { parcelaMensal: 0, valorTotal: Number(carro.PRECO_VENDA || 0) };
    const valorModal = Number(formaPagamento) === 0 ? valorAVista : financiamento.valorTotal;
    const deveMostrarRetornoVenda = gerandoQrCode || Boolean(erroCompra) || Boolean(qrCodeUrl) || compraConcluida;
    const parceladoSemTaxa = Number(formaPagamento) === 1 && (!taxaJuroCarregada || carregandoJuro);

    return (
        <main className={css.pagina}>
            <section className={css.hero}>
                <div className={css.conteudo}>
                    <div className={css.barraTopo}>
                        <button className={css.voltar} onClick={() => navigate("/catalogo")}>
                            Voltar ao catálogo
                        </button>

                    </div>

                    {mensagemSucessoPagina && (
                        <div className={css.alertaSucesso}>
                            {mensagemSucessoPagina}
                        </div>
                    )}

                    <div className={css.gridPrincipal}>
                        <div className={css.galeria}>
                            <div className={css.imagemPrincipal}>
                            <img
                                src={imagemSelecionada.urls[0]}
                                data-indice="0"
                                onError={(e) => tentarProximaImagem(e, imagemSelecionada.urls)}
                                alt={`${carro.MARCA || "Veículo"} ${carro.MODELO || ""}`}
                            />
                        </div>

                            <div className={css.miniaturas}>
                            {!imagemSelecionada.placeholder &&
                                imagens.map((img, index) => (
                                    <img
                                        key={img.numero}
                                        src={img.urls[0]}
                                        data-indice="0"
                                        onError={(e) => tentarProximaImagem(e, img.urls)}
                                        onClick={() => setImagemSelecionada(img)}
                                        className={imagemSelecionada.numero === img.numero ? css.miniaturaAtiva : ""}
                                        alt={`Imagem ${index + 1}`}
                                    />
                                ))}
                        </div>
                    </div>

                        <aside className={css.painelCompra}>
                            <div className={css.painelTopo}>
                                <span className={css.etiqueta}>Disponível</span>
                                <span className={css.condicao}>Estoque WebCar</span>
                            </div>

                            <h1>{carro.MARCA} {carro.MODELO}</h1>

                            <div className={css.precoBox}>
                                <span>Valor no Pix à vista</span>
                                {temDescontoAVista && (
                                    <del>{formatarPreco(carro.PRECO_VENDA)}</del>
                                )}
                                <strong>{formatarPreco(valorAVista)}</strong>
                                {temDescontoAVista && (
                                    <small>{descontoAVista}% de desconto aplicado</small>
                                )}
                            </div>

                            <div className={css.resumoRapido}>
                                <div>
                                    <span>Ano</span>
                                    <strong>{carro.ANO_MODELO || "Não informado"}</strong>
                                </div>
                                <div>
                                    <span>Quilometragem</span>
                                    <strong>{Number(carro.KM || 0).toLocaleString("pt-BR")} km</strong>
                                </div>
                                <div>
                                    <span>Câmbio</span>
                                    <strong>{textoCambio(carro.CAMBIO)}</strong>
                                </div>
                            </div>

                            <button
                                type="button"
                                className={css.comprar}
                                onClick={clicarCompraPrincipal}
                            >
                                {modoVendedor ? "Vender" : "Comprar"}
                            </button>

                            <div className={css.garantias}>
                                <span><i className="bi bi-qr-code"></i> Pagamento via Pix</span>
                                {modoVendedor && (
                                    <span><i className="bi bi-credit-card"></i> Venda à vista ou parcelada</span>
                                )}
                                <span><i className="bi bi-shield-check"></i> Dados do veículo conferidos</span>
                                {!modoVendedor && (
                                    <span><i className="bi bi-check2-circle"></i> Compra simulada para teste</span>
                                )}
                            </div>
                        </aside>
                    </div>
                </div>
            </section>

            <section className={css.detalhesSecao}>
                <div className={css.conteudo}>
                    <div className={css.detalhesGrid}>
                        {detalhes.map((item) => (
                            <div className={css.detalheCard} key={item.title}>
                                <i className={`bi bi-${item.icon}`}></i>
                                <span>{item.title}</span>
                                <strong>{item.value}</strong>
                            </div>
                        ))}
                    </div>

                    <div className={css.descricao}>
                        <div>
                            <span className={css.etiquetaEscura}>Detalhes</span>
                            <h2>{carro.MARCA} {carro.MODELO}</h2>
                        </div>

                        <p>
                            {carro.MARCA} {carro.MODELO}, ano {carro.ANO_MODELO}, cor{" "}
                            {carro.COR || "não informada"}, com{" "}
                            {Number(carro.KM || 0).toLocaleString("pt-BR")} km, câmbio{" "}
                            {textoCambio(carro.CAMBIO)} e combustível {textoCombustivel(carro.COMBUSTIVEL)}.
                        </p>
                    </div>
                </div>
            </section>

            {modalConfirmacaoCompraAberta && (
                <div className={css.modalFundo}>
                    <div className={`${css.modalCompra} ${css.modalConfirmacao}`}>
                        <div className={css.modalTopo}>
                            <div>
                                <span className={css.etiquetaEscura}>Confirmação</span>
                                <h3>Tem certeza que deseja comprar?</h3>
                            </div>
                        </div>

                        <div className={css.resumoModal}>
                            <strong>{carro.MARCA} {carro.MODELO}</strong>
                            <span>{formatarPreco(valorAVista)}</span>
                        </div>

                        <p className={css.textoModal}>
                            Ao confirmar, a compra será registrada e o QR Code Pix será gerado para pagamento.
                        </p>

                        <div className={css.modalAcoes}>
                            <button
                                type="button"
                                className={css.botaoFechar}
                                onClick={cancelarConfirmacaoCompra}
                            >
                                Não
                            </button>
                            <button
                                type="button"
                                className={css.botaoConcluir}
                                onClick={confirmarCompraCliente}
                            >
                                Sim, comprar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modalDadosCompraAberta && (
                <div className={css.modalFundo}>
                    <div className={`${css.modalCompra} ${css.modalConfirmacao}`}>
                        <div className={css.modalTopo}>
                            <div>
                                <span className={css.etiquetaEscura}>Dados do cliente</span>
                                <h3>Complete seus dados</h3>
                            </div>
                            <button
                                type="button"
                                className={css.fecharIcone}
                                onClick={fecharDadosCompraCliente}
                                aria-label="Fechar modal"
                            >
                                x
                            </button>
                        </div>

                        <p className={css.textoModal}>
                            Para finalizar sua primeira compra, informe CPF e telefone.
                        </p>

                        <form className={`${css.formaPagamento} ${css.formDadosCompra}`} onSubmit={salvarDadosCompraCliente}>
                            <label className={css.campoVenda}>
                                <span>Telefone</span>
                                <input
                                    value={dadosCompraCliente.telefone}
                                    onChange={(e) => atualizarDadosCompraCliente("telefone", e.target.value)}
                                    placeholder="(11) 99999-9999"
                                    inputMode="numeric"
                                    maxLength={15}
                                />
                            </label>

                            <label className={css.campoVenda}>
                                <span>CPF</span>
                                <input
                                    value={dadosCompraCliente.cpf}
                                    onChange={(e) => atualizarDadosCompraCliente("cpf", e.target.value)}
                                    placeholder="000.000.000-00"
                                    inputMode="numeric"
                                    maxLength={14}
                                />
                            </label>

                            {erroDadosCompra && <p className={css.erroCompra}>{erroDadosCompra}</p>}

                            <div className={css.modalAcoes}>
                                <button
                                    type="button"
                                    className={css.botaoFechar}
                                    onClick={fecharDadosCompraCliente}
                                    disabled={salvandoDadosCompra}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className={css.botaoConcluir} disabled={salvandoDadosCompra}>
                                    {salvandoDadosCompra ? "Salvando..." : "Salvar e continuar"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {modalCompraAberta && (
                <div className={css.modalFundo}>
                    <div className={css.modalCompra}>
                        <div className={css.modalTopo}>
                            <div>
                                <span className={css.etiquetaEscura}>{modoVendedor ? "Venda" : "Pagamento Pix"}</span>
                                <h3>{modoVendedor ? "Registrar venda" : "Finalize sua compra"}</h3>
                            </div>
                            {modoVendedor && (
                                <button
                                    type="button"
                                    className={css.fecharIcone}
                                    onClick={fecharCompra}
                                    aria-label="Fechar modal"
                                >
                                    x
                                </button>
                            )}
                        </div>

                        <div className={css.resumoModal}>
                            <strong>{carro.MARCA} {carro.MODELO}</strong>
                            <span>{parceladoSemTaxa ? "Carregando juros" : formatarPreco(valorModal)}</span>
                        </div>

                        {modoVendedor && (
                            <div className={css.formaPagamento}>
                                <label className={css.campoVenda}>
                                    <span>CPF do cliente</span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={14}
                                        value={cpfClienteVenda}
                                        onChange={(e) => setCpfClienteVenda(formatarCpf(e.target.value))}
                                        placeholder="000.000.000-00"
                                    />
                                </label>

                                <div className={css.opcoesPagamento}>
                                    <button
                                        type="button"
                                        className={Number(formaPagamento) === 0 ? css.opcaoAtiva : ""}
                                        onClick={() => setFormaPagamento(0)}
                                    >
                                        à vista
                                    </button>
                                    <button
                                        type="button"
                                        className={Number(formaPagamento) === 1 ? css.opcaoAtiva : ""}
                                        onClick={() => {
                                            setFormaPagamento(1);
                                            if (porcentagemJuro === null) {
                                                carregarTaxaJuroEmpresa();
                                            }
                                        }}
                                    >
                                        Parcelado
                                    </button>
                                </div>

                                {Number(formaPagamento) === 1 && (
                                    <label className={css.campoVenda}>
                                        <span>Parcelas</span>
                                        <select
                                            value={parcelas}
                                            onChange={(e) => setParcelas(Number(e.target.value))}
                                            disabled={!taxaJuroCarregada || carregandoJuro}
                                        >
                                            {[6, 12, 18, 24, 36, 48, 60].map((quantidade) => (
                                                <option value={quantidade} key={quantidade}>
                                                    {taxaJuroCarregada
                                                        ? `${quantidade}x de ${formatarPreco(calcularFinanciamento(carro.PRECO_VENDA, porcentagemJuro, quantidade).parcelaMensal)}`
                                                        : `${quantidade}x`}
                                                </option>
                                            ))}
                                        </select>
                                        {!taxaJuroCarregada && (
                                            <small className={css.avisoTaxa}>
                                                {carregandoJuro
                                                    ? "Carregando taxa de juros da empresa."
                                                    : "Não foi possível carregar a taxa de juros da empresa."}
                                            </small>
                                        )}
                                    </label>
                                )}

                                <div className={css.resumoPagamento}>
                                    <div>
                                        <span>Forma de pagamento</span>
                                        <strong>{Number(formaPagamento) === 0 ? "à vista no Pix" : `${parcelas} parcelas`}</strong>
                                    </div>
                                    {Number(formaPagamento) === 0 && temDescontoAVista && (
                                        <>
                                            <div>
                                                <span>Valor original</span>
                                                <strong className={css.valorRiscado}>{formatarPreco(carro.PRECO_VENDA)}</strong>
                                            </div>
                                            <div>
                                                <span>Desconto à vista</span>
                                                <strong className={css.valorDesconto}>{descontoAVista}%</strong>
                                            </div>
                                        </>
                                    )}
                                    <div>
                                        <span>{Number(formaPagamento) === 0 ? "Valor com desconto" : "Valor total financiado"}</span>
                                        <strong>{parceladoSemTaxa ? "Carregando juros" : formatarPreco(valorModal)}</strong>
                                    </div>
                                    {Number(formaPagamento) === 1 && (
                                        <div>
                                            <span>Juros</span>
                                            <strong>{taxaJuroCarregada ? `${porcentagemJuro}%` : "Carregando"}</strong>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {deveMostrarRetornoVenda && (
                            <div className={css.qrCodeArea}>
                                {gerandoQrCode && <p>{modoVendedor ? "Registrando venda..." : "Gerando QR Code..."}</p>}

                                {!gerandoQrCode && erroCompra && (
                                    <p className={css.erroCompra}>{erroCompra}</p>
                                )}

                                {!gerandoQrCode && qrCodeUrl && !erroCompra && (
                                    <>
                                        <img src={qrCodeUrl} alt="QR Code Pix para pagamento" />
                                        {mensagemVenda && (
                                            <p className={css.mensagemQr}>
                                                {mensagemVenda}
                                            </p>
                                        )}
                                        <p className={css.expiracaoQr}>
                                            QR Code expira em {tempoQrCode}s
                                        </p>
                                    </>
                                )}

                                {compraConcluida && (
                                    <p className={css.sucessoCompra}>
                                        {mensagemVenda || "Compra concluída com sucesso. Pagamento simulado como aprovado."}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className={css.modalAcoes}>
                            {modoVendedor && (
                                <button
                                    type="button"
                                    className={css.botaoFechar}
                                    onClick={fecharCompra}
                                >
                                    Fechar
                                </button>
                            )}
                            <button
                                type="button"
                                className={css.botaoConcluir}
                                onClick={modoVendedor && !qrCodeUrl ? registrarVenda : concluirCompra}
                                disabled={modoVendedor ? gerandoQrCode || compraConcluida || parceladoSemTaxa : !qrCodeUrl || gerandoQrCode || compraConcluida}
                            >
                                {modoVendedor && qrCodeUrl ? "Concluir" : modoVendedor ? "Registrar venda" : "Concluir"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modalCadastroClienteAberta && (
                <div className={css.modalFundo}>
                    <div className={css.modalCompra}>
                        <div className={css.modalTopo}>
                            <div>
                                <span className={css.etiquetaEscura}>Cliente</span>
                                <h3>{etapaCadastroCliente === "cadastro" ? "Cadastrar cliente" : "Confirmar cadastro"}</h3>
                            </div>
                            <button
                                type="button"
                                className={css.fecharIcone}
                                onClick={fecharCadastroClienteVenda}
                                aria-label="Fechar modal"
                            >
                                x
                            </button>
                        </div>

                        {etapaCadastroCliente === "cadastro" ? (
                            <form className={css.formaPagamento} onSubmit={cadastrarClienteVenda}>
                                <label className={css.campoVenda}>
                                    <span>Nome completo</span>
                                    <input
                                        value={cadastroClienteVenda.nome}
                                        onChange={(e) => atualizarCadastroCliente("nome", e.target.value)}
                                        placeholder="Nome do cliente"
                                    />
                                </label>

                                <label className={css.campoVenda}>
                                    <span>Telefone</span>
                                    <input
                                        value={cadastroClienteVenda.telefone}
                                        onChange={(e) => atualizarCadastroCliente("telefone", e.target.value)}
                                        placeholder="(11) 99999-9999"
                                        inputMode="numeric"
                                        maxLength={15}
                                    />
                                </label>

                                <label className={css.campoVenda}>
                                    <span>Email</span>
                                    <input
                                        type="email"
                                        value={cadastroClienteVenda.email}
                                        onChange={(e) => atualizarCadastroCliente("email", e.target.value)}
                                        placeholder="cliente@email.com"
                                    />
                                </label>

                                <label className={css.campoVenda}>
                                    <span>CPF</span>
                                    <input
                                        value={cadastroClienteVenda.cpf}
                                        onChange={(e) => atualizarCadastroCliente("cpf", e.target.value)}
                                        placeholder="000.000.000-00"
                                        inputMode="numeric"
                                        maxLength={14}
                                    />
                                </label>

                                <div className={css.duasColunas}>
                                    <label className={css.campoVenda}>
                                        <span>Senha</span>
                                        <input
                                            type="password"
                                            value={cadastroClienteVenda.senha}
                                            onChange={(e) => atualizarCadastroCliente("senha", e.target.value)}
                                        />
                                    </label>

                                    <label className={css.campoVenda}>
                                        <span>Confirmar senha</span>
                                        <input
                                            type="password"
                                            value={cadastroClienteVenda.confirmarSenha}
                                            onChange={(e) => atualizarCadastroCliente("confirmarSenha", e.target.value)}
                                        />
                                    </label>
                                </div>

                                {erroCadastroCliente && <p className={css.erroCompra}>{erroCadastroCliente}</p>}

                                <div className={css.modalAcoes}>
                                    <button type="button" className={css.botaoFechar} onClick={fecharCadastroClienteVenda}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className={css.botaoConcluir} disabled={salvandoCadastroCliente}>
                                        {salvandoCadastroCliente ? "Cadastrando..." : "Cadastrar"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form className={css.formaPagamento} onSubmit={verificarCadastroClienteVenda}>
                                <p className={css.textoModal}>
                                    Digite o código enviado para {cadastroClienteVenda.email}.
                                </p>

                                <label className={css.campoVenda}>
                                    <span>Codigo</span>
                                    <input
                                        value={cadastroClienteVenda.codigo}
                                        onChange={(e) => atualizarCadastroCliente("codigo", e.target.value)}
                                        placeholder="000000"
                                        inputMode="numeric"
                                        maxLength={6}
                                    />
                                </label>

                                {erroCadastroCliente && <p className={css.erroCompra}>{erroCadastroCliente}</p>}

                                <div className={css.modalAcoes}>
                                    <button type="button" className={css.botaoFechar} onClick={() => setEtapaCadastroCliente("cadastro")}>
                                        Voltar
                                    </button>
                                    <button type="submit" className={css.botaoConcluir} disabled={salvandoCadastroCliente}>
                                        {salvandoCadastroCliente ? "Verificando..." : "Verificar e vender"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
