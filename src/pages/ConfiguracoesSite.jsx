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
        cnpj: data.cnpj || data.CNPJ || CONFIG_SITE_PADRAO.cnpj,
        inscricaoEstadual: data.inscricaoEstadual || data.inscricao_estadual || data.INSCRICAO_ESTADUAL || CONFIG_SITE_PADRAO.inscricaoEstadual,
        cidade: data.cidade || data.CIDADE || CONFIG_SITE_PADRAO.cidade,
        uf: data.uf || data.UF || CONFIG_SITE_PADRAO.uf,
        rua: data.rua || data.RUA || CONFIG_SITE_PADRAO.rua,
        numeroEndereco: data.numeroEndereco || data.numero_endereco || data.NUMERO_ENDERECO || CONFIG_SITE_PADRAO.numeroEndereco,
        cep: data.cep || data.CEP || CONFIG_SITE_PADRAO.cep,
        chavePix: data.chavePix || data.chave_pix || data.CHAVE_PIX || CONFIG_SITE_PADRAO.chavePix,
        banco: data.banco || data.BANCO || CONFIG_SITE_PADRAO.banco,
        porcentagemJuro: data.porcentagemJuro || data.porcentagem_juro || data.PORCENTAGEM_JURO || CONFIG_SITE_PADRAO.porcentagemJuro,
        agencia: data.agencia || data.AGENCIA || CONFIG_SITE_PADRAO.agencia,
        conta: data.conta || data.CONTA || CONFIG_SITE_PADRAO.conta,
        porcentagemLucro: data.porcentagemLucro || data.porcentagem_lucro || data.PORCENTAGEM_LUCRO || CONFIG_SITE_PADRAO.porcentagemLucro,
        descontoAVista: data.descontoAVista || data.desconto_a_vista || data.DESCONTO_A_VISTA || CONFIG_SITE_PADRAO.descontoAVista,
        textoBanner: data.textoBanner || data.texto_banner || data.TEXTO_BANNER || CONFIG_SITE_PADRAO.textoBanner,
        corPrimaria: data.corPrimaria || data.cor_primaria || data.COR_PRIMARIA || CONFIG_SITE_PADRAO.corPrimaria,
        corSecundaria: data.corSecundaria || data.cor_secundaria || data.COR_SECUNDARIA || CONFIG_SITE_PADRAO.corSecundaria,
        corTerciaria: data.corTerciaria || data.cor_terciaria || data.COR_TERCIARIA || CONFIG_SITE_PADRAO.corTerciaria,
        corFonte: data.corFonte || data.cor_fonte || data.COR_FONTE || CONFIG_SITE_PADRAO.corFonte,
        fonte: data.fonte || data.FONTE || CONFIG_SITE_PADRAO.fonte,
        logoUrl: urlArquivo(data.logoUrl || data.logo_url || data.LOGO_URL || data.logo || data.LOGO, CONFIG_SITE_PADRAO.logoUrl),
        bannerUrl: urlArquivo(data.bannerUrl || data.banner_url || data.BANNER_URL || data.banner || data.BANNER, CONFIG_SITE_PADRAO.bannerUrl),
    };
}

async function carregarConfiguracoesSite() {
    const response = await fetch(`${API_URL}/configuracoes_site`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.mensagem || "Nao foi possivel carregar os dados da empresa.");
    }

    const data = await response.json();
    const empresa = data.empresa || data.configuracoes || data;

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
                setErro(error.message || "Nao foi possivel carregar os dados da empresa.");
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
        logo_url: logoArquivo?.preview || form.logoUrl,
        banner_url: bannerArquivo?.preview || form.bannerUrl,
    });

    function atualizarCampo(campo, valor) {
        setMensagem("");
        setErro("");
        setForm((dados) => ({
            ...dados,
            [campo]: valor,
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

    async function salvarConfiguracoes(e) {
        e.preventDefault();

        try {
            setSalvando(true);
            setMensagem("");
            setErro("");

            const formData = new FormData();
            formData.append("cnpj", form.cnpj);
            formData.append("nome_fantasia", form.nomeFantasia);
            formData.append("razao_social", form.razaoSocial);
            formData.append("cidade", form.cidade);
            formData.append("inscricao_estadual", form.inscricaoEstadual);
            formData.append("cep", form.cep);
            formData.append("rua", form.rua);
            formData.append("uf", form.uf);
            formData.append("numero_endereco", form.numeroEndereco);
            formData.append("chave_pix", form.chavePix);
            formData.append("banco", form.banco);
            formData.append("porcentagem_juro", form.porcentagemJuro);
            formData.append("agencia", form.agencia);
            formData.append("conta", form.conta);
            formData.append("porcentagem_lucro", form.porcentagemLucro);
            formData.append("desconto_a_vista", form.descontoAVista);
            formData.append("texto_banner", form.textoBanner);
            formData.append("descricao", form.textoBanner);
            formData.append("cor_primaria", form.corPrimaria);
            formData.append("cor_secundaria", form.corSecundaria);
            formData.append("cor_terciaria", form.corTerciaria);
            formData.append("cor_fonte", form.corFonte);
            formData.append("fonte", form.fonte);

            if (logoArquivo?.file) formData.append("logo", logoArquivo.file);
            if (bannerArquivo?.file) {
                formData.append("banner", bannerArquivo.file);
                formData.append("imagem", bannerArquivo.file);
            }

            if (!form.idEmpresa) {
                setErro("Empresa nao encontrada para editar. Verifique se a rota /configuracoes_site esta retornando id_empresa.");
                return;
            }

            const response = await fetch(`${API_URL}/edicao_empresa/${form.idEmpresa}`, {
                method: "PUT",
                credentials: "include",
                body: formData,
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                setErro(data.mensagem || "Nao foi possivel salvar as configuracoes.");
                return;
            }

            const configuracoesSalvas = normalizarConfiguracoesSite({
                ...form,
                ...(data.configuracoes || data.empresa || data),
            });
            setForm(configuracoesSalvas);
            setLogoArquivo(null);
            setBannerArquivo(null);
            aplicarConfiguracoesSite(configuracoesSalvas);
            window.dispatchEvent(new CustomEvent("webcar:configuracoes-site", { detail: configuracoesSalvas }));
            setMensagem(data.mensagem || "Configuracoes salvas com sucesso.");
        } catch {
            setErro("Nao foi possivel conectar com o servidor.");
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
                            <span>Personalizacao</span>
                            <h1>Configuracoes do site</h1>
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
                                <strong>#{form.idEmpresa || "-"}</strong>
                            </div>

                            <div className={css.empresaResumoGrid}>
                                <label>
                                    <span>Razao social</span>
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
                                    />
                                </label>

                                <label>
                                    <span>Inscricao estadual</span>
                                    <input
                                        type="text"
                                        value={form.inscricaoEstadual}
                                        onChange={(e) => atualizarCampo("inscricaoEstadual", e.target.value)}
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
                                    <span>Numero</span>
                                    <input
                                        type="number"
                                        value={form.numeroEndereco}
                                        onChange={(e) => atualizarCampo("numeroEndereco", e.target.value)}
                                    />
                                </label>

                                <label>
                                    <span>CEP</span>
                                    <input
                                        type="number"
                                        value={form.cep}
                                        onChange={(e) => atualizarCampo("cep", e.target.value)}
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
                                        type="number"
                                        value={form.banco}
                                        onChange={(e) => atualizarCampo("banco", e.target.value)}
                                    />
                                </label>
                            </div>
                        </section>

                        <div className={css.grid}>
                            <div>

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
                                        Primaria
                                        <input
                                            type="color"
                                            value={form.corPrimaria}
                                            onChange={(e) => atualizarCampo("corPrimaria", e.target.value)}
                                        />
                                    </label>

                                    <label>
                                        Secundaria
                                        <input
                                            type="color"
                                            value={form.corSecundaria}
                                            onChange={(e) => atualizarCampo("corSecundaria", e.target.value)}
                                        />
                                    </label>

                                    <label>
                                        Terciaria
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
                                        <span>Midia</span>
                                        <h2>Imagens</h2>
                                    </div>
                                </div>

                                <label className={css.upload}>
                                    Logo
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => selecionarArquivo("logo", e.target.files?.[0])}
                                    />
                                </label>

                                <label className={css.upload}>
                                    Imagem do banner
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => selecionarArquivo("banner", e.target.files?.[0])}
                                    />
                                </label>
                            </section>

                            <button type="submit" className={css.salvar} disabled={salvando}>
                                {salvando ? "Salvando..." : "Salvar configuracoes"}
                            </button>
                            </div>

                        <aside className={css.preview}>
                            <div className={css.previewBarra}>
                                <span>Previa</span>
                            </div>

                            <div className={css.previewHeader}>
                                <div>
                                    <img src={preview.logoUrl} alt="Logo" />
                                    <strong style={{ color: preview.corTerciaria }}>WebCar</strong>
                                </div>

                                <nav>
                                    <span style={{ color: preview.corFonte }}>Comprar</span>
                                    <span style={{ color: preview.corFonte }}>Servicos</span>
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
                                    <span style={{ background: preview.corPrimaria }}>Ver catalogo</span>
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
                                <span style={{ color: preview.corPrimaria }}>Selecionados para voce</span>
                                <strong style={{ color: preview.corTerciaria }}>Veiculos em destaque</strong>
                                <p style={{ color: preview.corFonte }}>
                                    A home acompanha a identidade escolhida quando as configuracoes forem salvas.
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
