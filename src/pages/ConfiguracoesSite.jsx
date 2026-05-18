import { useEffect, useState } from "react";
import Header from "../components/Header/Header.jsx";
import SidebarMenu from "../components/SidebarMenu/SidebarMenu.jsx";
import Footer from "../components/Footer/Footer.jsx";
import css from "./ConfiguracoesSite.module.css";
import { API_URL } from "../App";

const FONTES = [
    { label: "Inter", value: "Inter, Arial, sans-serif" },
    { label: "Arial", value: "Arial, sans-serif" },
    { label: "Georgia", value: "Georgia, serif" },
    { label: "Trebuchet", value: "'Trebuchet MS', Arial, sans-serif" },
];

const CONFIG_SITE_PADRAO = {
    idEmpresa: "",
    nomeFantasia: "WebCar",
    razaoSocial: "",
    cnpj: "",
    inscricaoEstadual: "",
    cidade: "",
    uf: "",
    rua: "",
    numeroEndereco: "0",
    cep: "0",
    chavePix: "",
    banco: "0",
    porcentagemJuro: "0",
    agencia: "0",
    conta: "0",
    porcentagemLucro: "0",
    descontoAVista: "0",
    textoBanner: "Escolha com confiança. Compre com segurança.",
    corPrimaria: "#2563EB",
    corSecundaria: "#1d4ed8",
    corTerciaria: "#0f172a",
    corFonte: "#111827",
    fonte: "Inter, Arial, sans-serif",
    logoUrl: "/Logo.png",
    bannerUrl: "/Banner.png",
};

function somenteDigitos(valor) {
    return String(valor ?? "").replace(/\D/g, "");
}

function formatarCnpj(valor) {
    return somenteDigitos(valor)
        .slice(0, 14)
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
}

function formatarCep(valor) {
    return somenteDigitos(valor)
        .slice(0, 8)
        .replace(/^(\d{5})(\d)/, "$1-$2");
}

function formatarUf(valor) {
    return String(valor ?? "")
        .replace(/[^a-zA-Z]/g, "")
        .slice(0, 2)
        .toUpperCase();
}

function formatarInteiro(valor, tamanho = 12) {
    return somenteDigitos(valor).slice(0, tamanho);
}

function formatarInscricaoEstadual(valor) {
    return somenteDigitos(valor).slice(0, 14);
}

async function criarArquivoPadrao(caminho, nome) {
    const response = await fetch(caminho);

    if (!response.ok) {
        throw new Error("Não foi possível carregar as imagens padrão.");
    }

    const blob = await response.blob();
    return new File([blob], nome, { type: blob.type || "image/png" });
}

function atualizarCacheUrl(url) {
    if (!url || url.startsWith("data:") || url.startsWith("blob:")) return url;

    const separador = url.includes("?") ? "&" : "?";
    return `${url}${separador}v=${Date.now()}`;
}

function urlArquivo(valor, fallback) {
    if (!valor) return fallback;
    if (valor.startsWith("http") || valor.startsWith("data:") || valor.startsWith("blob:") || valor.startsWith("/")) {
        return valor;
    }

    return `${API_URL}/${valor.replace(/^\/+/, "")}`;
}

function normalizarConfiguracoesSite(data = {}) {
    return {
        idEmpresa: data.idEmpresa || data.id_empresa || data.ID_EMPRESA || CONFIG_SITE_PADRAO.idEmpresa,
        nomeFantasia: data.nomeFantasia || data.nome_fantasia || data.NOME_FANTASIA || CONFIG_SITE_PADRAO.nomeFantasia,
        razaoSocial: data.razaoSocial || data.razao_social || data.RAZAO_SOCIAL || CONFIG_SITE_PADRAO.razaoSocial,
        cnpj: formatarCnpj(data.cnpj || data.CNPJ || CONFIG_SITE_PADRAO.cnpj),
        inscricaoEstadual: formatarInscricaoEstadual(data.inscricaoEstadual || data.inscricao_estadual || data.INSCRICAO_ESTADUAL || CONFIG_SITE_PADRAO.inscricaoEstadual),
        cidade: data.cidade || data.CIDADE || CONFIG_SITE_PADRAO.cidade,
        uf: formatarUf(data.uf || data.UF || CONFIG_SITE_PADRAO.uf),
        rua: data.rua || data.RUA || CONFIG_SITE_PADRAO.rua,
        numeroEndereco: formatarInteiro(data.numeroEndereco || data.numero_endereco || data.NUMERO_ENDERECO || CONFIG_SITE_PADRAO.numeroEndereco),
        cep: formatarCep(data.cep || data.CEP || CONFIG_SITE_PADRAO.cep),
        chavePix: data.chavePix || data.chave_pix || data.CHAVE_PIX || CONFIG_SITE_PADRAO.chavePix,
        banco: formatarInteiro(data.banco || data.BANCO || CONFIG_SITE_PADRAO.banco, 3),
        porcentagemJuro: data.porcentagemJuro || data.porcentagem_juro || data.PORCENTAGEM_JURO || CONFIG_SITE_PADRAO.porcentagemJuro,
        agencia: formatarInteiro(data.agencia || data.AGENCIA || CONFIG_SITE_PADRAO.agencia, 6),
        conta: data.conta || data.CONTA || CONFIG_SITE_PADRAO.conta,
        porcentagemLucro: data.porcentagemLucro || data.porcentagem_lucro || data.PORCENTAGEM_LUCRO || CONFIG_SITE_PADRAO.porcentagemLucro,
        descontoAVista: data.descontoAVista || data.desconto_a_vista || data.DESCONTO_A_VISTA || CONFIG_SITE_PADRAO.descontoAVista,
        textoBanner: data.textoBanner || data.texto_banner || data.descricao || data.TEXTO_BANNER || data.DESCRICAO || CONFIG_SITE_PADRAO.textoBanner,
        corPrimaria: data.corPrimaria || data.cor_primaria || data.COR_PRIMARIA || CONFIG_SITE_PADRAO.corPrimaria,
        corSecundaria: data.corSecundaria || data.cor_secundaria || data.COR_SECUNDARIA || CONFIG_SITE_PADRAO.corSecundaria,
        corTerciaria: data.corTerciaria || data.cor_terciaria || data.COR_TERCIARIA || CONFIG_SITE_PADRAO.corTerciaria,
        corFonte: data.corFonte || data.cor_fonte || data.COR_FONTE || CONFIG_SITE_PADRAO.corFonte,
        fonte: data.fonte || data.FONTE || CONFIG_SITE_PADRAO.fonte,
        logoUrl: urlArquivo(data.logo_url || data.logoUrl || data.LOGO_URL, CONFIG_SITE_PADRAO.logoUrl),
        bannerUrl: urlArquivo(data.banner_url || data.bannerUrl || data.BANNER_URL, CONFIG_SITE_PADRAO.bannerUrl),
    };
}

async function carregarConfiguracoesSite() {
    const response = await fetch(`${API_URL}/verdadosempresa`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.mensagem || "Não foi possível carregar os dados da empresa.");
    }

    const data = await response.json();
    const empresa = data.empresas[0];

    if (!empresa) {
        throw new Error("Nenhuma empresa encontrada para este administrador.");
    }

    return normalizarConfiguracoesSite(empresa);
}

function aplicarConfiguracoesSite(configuracoes) {
    const config = normalizarConfiguracoesSite(configuracoes);
    const root = document.documentElement;

    root.style.setProperty("--cor-primaria", config.corPrimaria);
    root.style.setProperty("--cor-secundaria", config.corSecundaria);
    root.style.setProperty("--cor-terciaria", config.corTerciaria);
    root.style.setProperty("--cor-principal", config.corPrimaria);
    root.style.setProperty("--cor-azul-menu", config.corPrimaria);
    root.style.setProperty("--cor-azul-botao", config.corPrimaria);
    root.style.setProperty("--cor-azul-acao", config.corSecundaria);
    root.style.setProperty("--cor-azul-acao-hover", config.corSecundaria);
    root.style.setProperty("--cor-azul-marinho", config.corSecundaria);
    root.style.setProperty("--cor-texto-titulo-escuro", config.corTerciaria);
    root.style.setProperty("--cor-texto-dashboard", config.corTerciaria);
    root.style.setProperty("--cor-texto-principal", config.corFonte);
    root.style.setProperty("--fonte-site", config.fonte);
    document.body.style.fontFamily = config.fonte;
}

export default function ConfiguracoesSite() {
    const [form, setForm] = useState(CONFIG_SITE_PADRAO);
    const [logoArquivo, setLogoArquivo] = useState(null);
    const [bannerArquivo, setBannerArquivo] = useState(null);
    const [salvando, setSalvando] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [erro, setErro] = useState("");

    useEffect(() => {
        async function buscarConfiguracoes() {
            try {
                const configuracoes = await carregarConfiguracoesSite();
                setForm(configuracoes);
            } catch (error) {
                setErro(error.message || "Não foi possível carregar os dados da empresa.");
                setForm(CONFIG_SITE_PADRAO);
            }
        }

        buscarConfiguracoes();
    }, []);

    useEffect(() => {
        return () => {
            if (logoArquivo?.preview) URL.revokeObjectURL(logoArquivo.preview);
            if (bannerArquivo?.preview) URL.revokeObjectURL(bannerArquivo.preview);
        };
    }, [logoArquivo, bannerArquivo]);

    const preview = normalizarConfiguracoesSite({
        ...form,
        logoUrl: logoArquivo?.preview || form.logoUrl,
        bannerUrl: bannerArquivo?.preview || form.bannerUrl,
    });

    function normalizarValorCampo(campo, valor) {
        const mascaras = {
            cnpj: formatarCnpj,
            inscricaoEstadual: formatarInscricaoEstadual,
            uf: formatarUf,
            numeroEndereco: (novoValor) => formatarInteiro(novoValor),
            cep: formatarCep,
            banco: (novoValor) => formatarInteiro(novoValor, 3),
            agencia: (novoValor) => formatarInteiro(novoValor, 6),
            porcentagemJuro: (novoValor) => String(novoValor).replace(",", "."),
            porcentagemLucro: (novoValor) => String(novoValor).replace(",", "."),
            descontoAVista: (novoValor) => String(novoValor).replace(",", "."),
        };

        return mascaras[campo] ? mascaras[campo](valor) : valor;
    }

    function atualizarCampo(campo, valor) {
        setMensagem("");
        setErro("");
        setForm((dados) => ({
            ...dados,
            [campo]: normalizarValorCampo(campo, valor),
        }));
    }

    function selecionarArquivo(tipo, arquivo) {
        setMensagem("");
        setErro("");

        if (!arquivo) return;

        const previewArquivo = {
            file: arquivo,
            preview: URL.createObjectURL(arquivo),
        };

        if (tipo === "logo") {
            if (logoArquivo?.preview) URL.revokeObjectURL(logoArquivo.preview);
            setLogoArquivo(previewArquivo);
            return;
        }

        if (bannerArquivo?.preview) URL.revokeObjectURL(bannerArquivo.preview);
        setBannerArquivo(previewArquivo);
    }

    function montarFormData(dados, arquivos = {}) {
        const formData = new FormData();
        formData.append("cnpj", somenteDigitos(dados.cnpj));
        formData.append("nome_fantasia", dados.nomeFantasia);
        formData.append("razao_social", dados.razaoSocial);
        formData.append("cidade", dados.cidade);
        formData.append("inscricao_estadual", somenteDigitos(dados.inscricaoEstadual));
        formData.append("cep", somenteDigitos(dados.cep));
        formData.append("rua", dados.rua);
        formData.append("uf", dados.uf);
        formData.append("numero_endereco", somenteDigitos(dados.numeroEndereco));
        formData.append("chave_pix", dados.chavePix);
        formData.append("banco", somenteDigitos(dados.banco));
        formData.append("porcentagem_juro", dados.porcentagemJuro);
        formData.append("agencia", somenteDigitos(dados.agencia));
        formData.append("conta", dados.conta);
        formData.append("porcentagem_lucro", dados.porcentagemLucro);
        formData.append("desconto_a_vista", dados.descontoAVista);
        formData.append("descricao", dados.textoBanner);
        formData.append("cor_primaria", dados.corPrimaria);
        formData.append("cor_secundaria", dados.corSecundaria);
        formData.append("cor_terciaria", dados.corTerciaria);
        formData.append("cor_fonte", dados.corFonte);
        formData.append("fonte", dados.fonte);

        if (arquivos.logo) formData.append("logo", arquivos.logo);
        if (arquivos.banner) formData.append("banner", arquivos.banner);

        return formData;
    }

    async function enviarConfiguracoes(dados, arquivos = {}) {
        if (!dados.idEmpresa) {
            throw new Error("Empresa não encontrada para editar. Verifique se a rota /verdadosempresa está retornando id_empresa.");
        }

        const response = await fetch(`${API_URL}/edicao_empresa/${dados.idEmpresa}`, {
            method: "PUT",
            credentials: "include",
            body: montarFormData(dados, arquivos),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.mensagem || "Não foi possível salvar as configurações.");
        }

        return data;
    }

    async function resetarConfiguracoesVisuais() {
        if (logoArquivo?.preview) URL.revokeObjectURL(logoArquivo.preview);
        if (bannerArquivo?.preview) URL.revokeObjectURL(bannerArquivo.preview);

        const configuracoesResetadas = normalizarConfiguracoesSite({
            ...form,
            textoBanner: CONFIG_SITE_PADRAO.textoBanner,
            corPrimaria: CONFIG_SITE_PADRAO.corPrimaria,
            corSecundaria: CONFIG_SITE_PADRAO.corSecundaria,
            corTerciaria: CONFIG_SITE_PADRAO.corTerciaria,
            corFonte: CONFIG_SITE_PADRAO.corFonte,
            fonte: CONFIG_SITE_PADRAO.fonte,
            logoUrl: CONFIG_SITE_PADRAO.logoUrl,
            bannerUrl: CONFIG_SITE_PADRAO.bannerUrl,
        });

        setLogoArquivo(null);
        setBannerArquivo(null);
        setForm(configuracoesResetadas);
        aplicarConfiguracoesSite(configuracoesResetadas);
        window.dispatchEvent(new CustomEvent("webcar:configuracoes-site", { detail: configuracoesResetadas }));
        setErro("");
        setMensagem("");

        try {
            setSalvando(true);
            const logoPadrao = await criarArquivoPadrao(CONFIG_SITE_PADRAO.logoUrl, "logo_padrao.png");
            const bannerPadrao = await criarArquivoPadrao(CONFIG_SITE_PADRAO.bannerUrl, "banner_padrao.png");

            await enviarConfiguracoes(configuracoesResetadas, {
                logo: logoPadrao,
                banner: bannerPadrao,
            });

            let configuracoesSalvas = {
                ...configuracoesResetadas,
                logoUrl: CONFIG_SITE_PADRAO.logoUrl,
                bannerUrl: CONFIG_SITE_PADRAO.bannerUrl,
            };

            try {
                const configuracoesRecarregadas = await carregarConfiguracoesSite();
                configuracoesSalvas = {
                    ...configuracoesRecarregadas,
                    logoUrl: atualizarCacheUrl(configuracoesRecarregadas.logoUrl),
                    bannerUrl: atualizarCacheUrl(configuracoesRecarregadas.bannerUrl),
                };
            } catch {
                // Se o reload falhar, mantém os padrões locais que acabaram de ser enviados.
            }

            setForm(configuracoesSalvas);
            aplicarConfiguracoesSite(configuracoesSalvas);
            window.dispatchEvent(new CustomEvent("webcar:configuracoes-site", { detail: configuracoesSalvas }));
            setMensagem("Configurações visuais resetadas com sucesso.");
        } catch (error) {
            setErro(error.message || "Não foi possível resetar as configurações.");
        } finally {
            setSalvando(false);
        }
    }

    async function salvarConfiguracoes(e) {
        e.preventDefault();

        try {
            setSalvando(true);
            setMensagem("");
            setErro("");

            const data = await enviarConfiguracoes(form, {
                logo: logoArquivo?.file,
                banner: bannerArquivo?.file,
            });

            let configuracoesSalvas = normalizarConfiguracoesSite(form);

            try {
                const configuracoesRecarregadas = await carregarConfiguracoesSite();
                configuracoesSalvas = {
                    ...configuracoesRecarregadas,
                    logoUrl: logoArquivo?.file ? atualizarCacheUrl(configuracoesRecarregadas.logoUrl) : configuracoesRecarregadas.logoUrl,
                    bannerUrl: bannerArquivo?.file ? atualizarCacheUrl(configuracoesRecarregadas.bannerUrl) : configuracoesRecarregadas.bannerUrl,
                };
            } catch {
                // O PUT retorna apenas mensagem; se o reload falhar, mantém o estado local editado.
            }

            setForm(configuracoesSalvas);
            setLogoArquivo(null);
            setBannerArquivo(null);
            aplicarConfiguracoesSite(configuracoesSalvas);
            window.dispatchEvent(new CustomEvent("webcar:configuracoes-site", { detail: configuracoesSalvas }));
            setMensagem(data.mensagem || "Configurações salvas com sucesso.");
        } catch {
            setErro("Não foi possível conectar com o servidor.");
        } finally {
            setSalvando(false);
        }
    }

    return (
        <>
            <Header />

            <div className={css.layout}>
                <SidebarMenu />

                <main className={css.pagina}>
                    <div className={css.topo}>
                        <div>
                            <span>Personalização</span>
                            <h1>Configurações do site</h1>
                        </div>
                    </div>

                    {mensagem && <p className={css.sucesso}>{mensagem}</p>}
                    {erro && <p className={css.erro}>{erro}</p>}

                    <form className={css.formulario} onSubmit={salvarConfiguracoes}>
                        <section className={css.empresaResumo}>
                            <div className={css.empresaResumoTopo}>
                                <div>
                                    <span>Empresa</span>
                                    <input
                                        type="text"
                                        value={form.nomeFantasia}
                                        onChange={(e) => atualizarCampo("nomeFantasia", e.target.value)}
                                        aria-label="Nome fantasia"
                                    />
                                </div>
                            </div>

                            <div className={css.empresaResumoGrid}>
                                <label>
                                    <span>Razão social</span>
                                    <input
                                        type="text"
                                        value={form.razaoSocial}
                                        onChange={(e) => atualizarCampo("razaoSocial", e.target.value)}
                                    />
                                </label>

                                <label>
                                    <span>CNPJ</span>
                                    <input
                                        type="text"
                                        value={form.cnpj}
                                        onChange={(e) => atualizarCampo("cnpj", e.target.value)}
                                        inputMode="numeric"
                                        maxLength="18"
                                        placeholder="00.000.000/0000-00"
                                    />
                                </label>

                                <label>
                                    <span>Inscrição estadual</span>
                                    <input
                                        type="text"
                                        value={form.inscricaoEstadual}
                                        onChange={(e) => atualizarCampo("inscricaoEstadual", e.target.value)}
                                        inputMode="numeric"
                                        maxLength="14"
                                    />
                                </label>

                                <label>
                                    <span>Cidade</span>
                                    <input
                                        type="text"
                                        value={form.cidade}
                                        onChange={(e) => atualizarCampo("cidade", e.target.value)}
                                    />
                                </label>

                                <label>
                                    <span>UF</span>
                                    <input
                                        type="text"
                                        value={form.uf}
                                        onChange={(e) => atualizarCampo("uf", e.target.value)}
                                        maxLength="2"
                                        placeholder="SP"
                                    />
                                </label>

                                <label>
                                    <span>Rua</span>
                                    <input
                                        type="text"
                                        value={form.rua}
                                        onChange={(e) => atualizarCampo("rua", e.target.value)}
                                    />
                                </label>

                                <label>
                                    <span>Número</span>
                                    <input
                                        type="text"
                                        value={form.numeroEndereco}
                                        onChange={(e) => atualizarCampo("numeroEndereco", e.target.value)}
                                        inputMode="numeric"
                                        maxLength="8"
                                    />
                                </label>

                                <label>
                                    <span>CEP</span>
                                    <input
                                        type="text"
                                        value={form.cep}
                                        onChange={(e) => atualizarCampo("cep", e.target.value)}
                                        inputMode="numeric"
                                        maxLength="9"
                                        placeholder="00000-000"
                                    />
                                </label>

                                <label>
                                    <span>Chave Pix</span>
                                    <input
                                        type="text"
                                        value={form.chavePix}
                                        onChange={(e) => atualizarCampo("chavePix", e.target.value)}
                                    />
                                </label>

                                <label>
                                    <span>Banco</span>
                                    <input
                                        type="text"
                                        value={form.banco}
                                        onChange={(e) => atualizarCampo("banco", e.target.value)}
                                        inputMode="numeric"
                                        maxLength="3"
                                    />
                                </label>
                            </div>
                        </section>

                        <div className={css.grid}>
                            <div>
                            <section className={css.cardFormulario}>
                                <div className={css.cardTopo}>
                                    <div>
                                        <span>Valores</span>
                                        <h2>Porcentagens comerciais</h2>
                                    </div>
                                </div>

                                <div className={css.gradeCampos}>
                                    <label>
                                        Juros
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={form.porcentagemJuro}
                                            onChange={(e) => atualizarCampo("porcentagemJuro", e.target.value)}
                                            placeholder="Ex: 1.5"
                                        />
                                    </label>

                                    <label>
                                        Lucro
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={form.porcentagemLucro}
                                            onChange={(e) => atualizarCampo("porcentagemLucro", e.target.value)}
                                            placeholder="Ex: 20"
                                        />
                                    </label>

                                    <label>
                                        Desconto a vista
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={form.descontoAVista}
                                            onChange={(e) => atualizarCampo("descontoAVista", e.target.value)}
                                            placeholder="Ex: 5"
                                        />
                                    </label>
                                </div>
                            </section>

                            <section className={css.cardFormulario}>
                                <div className={css.cardTopo}>
                                    <div>
                                        <span>Home</span>
                                        <h2>Banner e textos</h2>
                                    </div>
                                </div>

                                <label>
                                    Texto principal do banner
                                    <textarea
                                        value={form.textoBanner}
                                        onChange={(e) => atualizarCampo("textoBanner", e.target.value)}
                                        maxLength="120"
                                        rows="3"
                                    />
                                </label>

                                <label>
                                    Fonte dos textos
                                    <select
                                        value={form.fonte}
                                        onChange={(e) => atualizarCampo("fonte", e.target.value)}
                                    >
                                        {FONTES.map((fonte) => (
                                            <option key={fonte.value} value={fonte.value}>
                                                {fonte.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </section>

                            <section className={css.cardFormulario}>
                                <div className={css.cardTopo}>
                                    <div>
                                        <span>Layout</span>
                                        <h2>Cores</h2>
                                    </div>
                                </div>

                                <div className={css.cores}>
                                    <label>
                                        Primária
                                        <input
                                            type="color"
                                            value={form.corPrimaria}
                                            onChange={(e) => atualizarCampo("corPrimaria", e.target.value)}
                                        />
                                    </label>

                                    <label>
                                        Secundária
                                        <input
                                            type="color"
                                            value={form.corSecundaria}
                                            onChange={(e) => atualizarCampo("corSecundaria", e.target.value)}
                                        />
                                    </label>

                                    <label>
                                        Terciária
                                        <input
                                            type="color"
                                            value={form.corTerciaria}
                                            onChange={(e) => atualizarCampo("corTerciaria", e.target.value)}
                                        />
                                    </label>

                                    <label>
                                        Fonte
                                        <input
                                            type="color"
                                            value={form.corFonte}
                                            onChange={(e) => atualizarCampo("corFonte", e.target.value)}
                                        />
                                    </label>
                                </div>
                            </section>

                            <section className={css.cardFormulario}>
                                <div className={css.cardTopo}>
                                    <div>
                                        <span>Mídia</span>
                                        <h2>Imagens</h2>
                                    </div>
                                </div>

                                <label className={css.upload}>
                                    <span>Logo da empresa</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => selecionarArquivo("logo", e.target.files?.[0])}
                                    />
                                    <span className={css.uploadControle}>
                                        <span className={css.uploadNome}>
                                            {logoArquivo?.file?.name || "Nenhum arquivo selecionado"}
                                        </span>
                                        <span className={css.uploadBotao}>Escolher arquivo</span>
                                    </span>
                                </label>

                                <label className={css.upload}>
                                    <span>Imagem do banner</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => selecionarArquivo("banner", e.target.files?.[0])}
                                    />
                                    <span className={css.uploadControle}>
                                        <span className={css.uploadNome}>
                                            {bannerArquivo?.file?.name || "Nenhum arquivo selecionado"}
                                        </span>
                                        <span className={css.uploadBotao}>Escolher arquivo</span>
                                    </span>
                                </label>
                            </section>

                            <div className={css.acoesFormulario}>
                                <button type="button" className={css.resetar} onClick={resetarConfiguracoesVisuais} disabled={salvando}>
                                    Resetar configurações
                                </button>

                                <button type="submit" className={css.salvar} disabled={salvando}>
                                    {salvando ? "Salvando..." : "Salvar configurações"}
                                </button>
                            </div>
                            </div>

                        <aside className={css.preview}>
                            <div className={css.previewBarra}>
                                <span>Prévia</span>
                            </div>

                            <div className={css.previewHeader}>
                                <div>
                                    <img src={preview.logoUrl} alt="Logo" />
                                </div>

                                <nav>
                                    <span style={{ color: preview.corFonte }}>Comprar</span>
                                    <span style={{ color: preview.corFonte }}>Serviços</span>
                                    <span style={{ color: preview.corSecundaria }}>Entrar</span>
                                </nav>
                            </div>

                            <div
                                className={css.previewBanner}
                                style={{
                                    backgroundImage: `linear-gradient(90deg, rgba(10,20,38,.88), rgba(10,20,38,.32)), url("${preview.bannerUrl}")`,
                                    fontFamily: preview.fonte,
                                }}
                            >
                                <h2 style={{ color: "#fff" }}>{preview.textoBanner}</h2>
                                <div className={css.previewAcoes}>
                                    <span style={{ background: preview.corPrimaria }}>Ver catálogo</span>
                                    <span style={{ borderColor: preview.corSecundaria }}>Entrar</span>
                                </div>
                            </div>

                            <div className={css.previewCores}>
                                <span style={{ background: preview.corPrimaria }}></span>
                                <span style={{ background: preview.corSecundaria }}></span>
                                <span style={{ background: preview.corTerciaria }}></span>
                                <span style={{ background: preview.corFonte }}></span>
                            </div>

                            <div className={css.previewSecao}>
                                <span style={{ color: preview.corPrimaria }}>Selecionados para você</span>
                                <strong style={{ color: preview.corTerciaria }}>Veículos em destaque</strong>
                                <p style={{ color: preview.corFonte }}>
                                    A home acompanha a identidade escolhida quando as configurações forem salvas.
                                </p>
                            </div>

                        </aside>
                        </div>
                    </form>
                </main>
            </div>

            <Footer />
        </>
    );
}
