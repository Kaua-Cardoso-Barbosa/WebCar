import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from "react";

export const API_URL = "http://localhost:5000";

import EditarServico from "./pages/EditarServico.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Cadastro from "./pages/Cadastro.jsx";
import RecuperarSenhaEmail from "./pages/RecuperarSenhaEmail.jsx";
import VerificarEmailSenha from "./pages/VerificarEmailSenha.jsx";
import TrocarSenha from "./pages/TrocarSenha.jsx";
import VerificarEmailConta from "./pages/VerificarEmailConta.jsx";
import RotaProtegida from "./components/RotaProtegida.jsx";
import Restrita from "./pages/Restrita.jsx";
import Not from "./pages/Not.jsx";
import Visualizar from "./pages/Visualizar.jsx";
import VisualizarVendedor from "./pages/VisualizarVendedor.jsx";
import Catalogo from "./pages/Catalogo.jsx";
import AdicionarManutencao from "./pages/AdicionarManutencao.jsx";
import VisualizarAdm from "./pages/VisualizarAdm.jsx";
import AgendarSuaVisita from "./pages/AgendeSuaVisita.jsx";
import Garagem from "./pages/Garagem.jsx";
import NovoVeiculo from "./pages/NovoVeiculo.jsx";
import EditarVeiculo from "./pages/EditarVeiculo.jsx";
import Servicos from "./pages/Servicos.jsx";
import CadastrarServico from "./pages/CadastrarServico.jsx";
import EditarManutencao from "./pages/EditarManutencao.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CadastrarMarca from "./pages/CadastrarMarca.jsx";
import AtualizarValores from "./pages/AtualizarValores.jsx";
import ListarMarcas from "./pages/ListarMarcas.jsx";
import ListaUsuarios from "./pages/ListaUsuarios.jsx";
import ConfiguracoesSite from "./pages/ConfiguracoesSite.jsx";
import MinhasCompras from "./pages/MinhasCompras.jsx";

const CONFIG_SITE_PADRAO = {
    nomeFantasia: "WebCar",
    textoBanner: "Escolha com confiança. Compre com segurança.",
    corPrimaria: "#2563EB",
    corSecundaria: "#1d4ed8",
    corTerciaria: "#0f172a",
    corFonte: "#111827",
    fonte: "Inter, Arial, sans-serif",
    logoUrl: "/Logo.png",
    bannerUrl: "/Banner.png",
};

const LOGO_CACHE_KEY = "webcar_logo_url";
const CONFIG_SITE_CACHE_KEY = "webcar_configuracoes_site";

function urlArquivo(valor, fallback) {
    if (!valor) return fallback;
    if (valor.startsWith("http") || valor.startsWith("data:") || valor.startsWith("blob:") || valor.startsWith("/")) {
        return valor;
    }

    return `${API_URL}/${valor.replace(/^\/+/, "")}`;
}

function atualizarFavicon(logoUrl) {
    let favicon =
        document.querySelector("link[rel='icon']") ||
        document.querySelector("link[rel='shortcut icon']");

    if (!favicon) {
        favicon = document.createElement("link");
        document.head.appendChild(favicon);
    }

    favicon.setAttribute("rel", "icon");
    favicon.setAttribute("href", logoUrl || CONFIG_SITE_PADRAO.logoUrl);
}

function normalizarConfiguracoesSite(data = {}) {
    return {
        nomeFantasia: data.nomeFantasia || data.nome_fantasia || data.NOME_FANTASIA || CONFIG_SITE_PADRAO.nomeFantasia,
        corPrimaria: data.corPrimaria || data.cor_primaria || data.COR_PRIMARIA || CONFIG_SITE_PADRAO.corPrimaria,
        corSecundaria: data.corSecundaria || data.cor_secundaria || data.COR_SECUNDARIA || CONFIG_SITE_PADRAO.corSecundaria,
        corTerciaria: data.corTerciaria || data.cor_terciaria || data.COR_TERCIARIA || CONFIG_SITE_PADRAO.corTerciaria,
        corFonte: data.corFonte || data.cor_fonte || data.COR_FONTE || CONFIG_SITE_PADRAO.corFonte,
        fonte: data.fonte || data.FONTE || CONFIG_SITE_PADRAO.fonte,
        textoBanner: data.textoBanner || data.texto_banner || data.descricao || data.TEXTO_BANNER || data.DESCRICAO || CONFIG_SITE_PADRAO.textoBanner,
        logoUrl: urlArquivo(data.logo_url || data.logoUrl || data.LOGO_URL, CONFIG_SITE_PADRAO.logoUrl),
        bannerUrl: urlArquivo(data.banner_url || data.bannerUrl || data.BANNER_URL, CONFIG_SITE_PADRAO.bannerUrl),
    };
}

function salvarConfiguracoesSiteCache(configuracoes) {
    try {
        localStorage.setItem(CONFIG_SITE_CACHE_KEY, JSON.stringify(normalizarConfiguracoesSite(configuracoes)));
    } catch {
        // Ignora falhas de cache local.
    }
}

function lerConfiguracoesSiteCache() {
    try {
        const cache = localStorage.getItem(CONFIG_SITE_CACHE_KEY);
        return cache ? normalizarConfiguracoesSite(JSON.parse(cache)) : null;
    } catch {
        return null;
    }
}

async function carregarConfiguracoesSite() {
    const response = await fetch(`${API_URL}/verdadosempresa`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        return {
            ...CONFIG_SITE_PADRAO,
            logoUrl: localStorage.getItem(LOGO_CACHE_KEY) || CONFIG_SITE_PADRAO.logoUrl,
        };
    }

    const data = await response.json();
    return normalizarConfiguracoesSite(data.empresas?.[0] || {});
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
    document.title = config.nomeFantasia || CONFIG_SITE_PADRAO.nomeFantasia;
    localStorage.setItem(LOGO_CACHE_KEY, config.logoUrl);
    salvarConfiguracoesSiteCache(config);
    atualizarFavicon(config.logoUrl);
}

function ScrollToTop() {
    const { pathname, search } = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, [pathname, search]);

    return null;
}

export default function App() {
    useEffect(() => {
        async function iniciarConfiguracoesSite() {
            try {
                const cache = lerConfiguracoesSiteCache();
                if (cache) aplicarConfiguracoesSite(cache);

                const configuracoes = await carregarConfiguracoesSite();
                aplicarConfiguracoesSite(configuracoes);
            } catch {
                aplicarConfiguracoesSite({});
            }
        }

        iniciarConfiguracoesSite();

        function atualizarConfiguracoesSite(e) {
            aplicarConfiguracoesSite(e.detail || {});
        }

        function atualizarConfiguracoesSiteDeOutraAba(e) {
            if (e.key !== CONFIG_SITE_CACHE_KEY || !e.newValue) return;

            try {
                aplicarConfiguracoesSite(JSON.parse(e.newValue));
            } catch {
                // Se o cache vier invalido, mantem o estado atual.
            }
        }

        function recarregarConfiguracoesAoVoltar() {
            if (document.visibilityState === "visible") {
                iniciarConfiguracoesSite();
            }
        }

        window.addEventListener("webcar:configuracoes-site", atualizarConfiguracoesSite);
        window.addEventListener("storage", atualizarConfiguracoesSiteDeOutraAba);
        window.addEventListener("focus", iniciarConfiguracoesSite);
        document.addEventListener("visibilitychange", recarregarConfiguracoesAoVoltar);

        return () => {
            window.removeEventListener("webcar:configuracoes-site", atualizarConfiguracoesSite);
            window.removeEventListener("storage", atualizarConfiguracoesSiteDeOutraAba);
            window.removeEventListener("focus", iniciarConfiguracoesSite);
            document.removeEventListener("visibilitychange", recarregarConfiguracoesAoVoltar);
        };
    }, []);

    return (
        <BrowserRouter>
            <ScrollToTop />
            <Routes>

                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cadastro" element={<Cadastro />} />
                <Route path="/recuperarSenhaEmail" element={<RecuperarSenhaEmail />} />
                <Route path="/verificarEmailSenha" element={<VerificarEmailSenha />} />
                <Route path="/trocarSenha" element={<TrocarSenha />} />
                <Route path="/verificarEmailConta" element={<VerificarEmailConta />} />
                <Route path="/Visualizar/:id" element={<Visualizar />} />
                <Route
                    path="/VisualizarVendedor/:id"
                    element={
                        <RotaProtegida tiposPermitidos={[1]}>
                            <VisualizarVendedor />
                        </RotaProtegida>
                    }
                />
                <Route path="/not" element={<Not />} />
                <Route
                    path="/VisualizarAdm"
                    element={
                        <RotaProtegida tiposPermitidos={[0]}>
                            <VisualizarAdm />
                        </RotaProtegida>
                    }
                />

                <Route
                    path="/ListaUsuarios"
                    element={
                    <RotaProtegida tiposPermitidos={[0]}>
                        <ListaUsuarios />
                    </RotaProtegida>
                    }
                />

                <Route
                    path="/Agendar"
                    element={
                        <RotaProtegida>
                            <AgendarSuaVisita />
                        </RotaProtegida>
                    }
                />
                <Route
                    path="/garagem"
                    element={
                        <RotaProtegida tiposPermitidos={[0]}>
                            <Garagem />
                        </RotaProtegida>
                    }
                />
                <Route
                    path="/Cadastroveiculo"
                    element={
                        <RotaProtegida tiposPermitidos={[0]}>
                            <NovoVeiculo />
                        </RotaProtegida>
                    }
                />
                <Route
                    path="/EdicaoVeiculo"
                    element={
                        <RotaProtegida tiposPermitidos={[0]}>
                            <EditarVeiculo />
                        </RotaProtegida>
                    }
                />
                <Route
                    path="/cadastrarservicos"
                    element={
                        <RotaProtegida tiposPermitidos={[0]}>
                            <CadastrarServico />
                        </RotaProtegida>
                    }
                />
                <Route
                    path="/adicionarmanutencao"
                    element={
                        <RotaProtegida tiposPermitidos={[0]}>
                            <AdicionarManutencao />
                        </RotaProtegida>
                    }
                />
                <Route
                    path="/editarmanutencao"
                    element={
                        <RotaProtegida tiposPermitidos={[0]}>
                            <EditarManutencao />
                        </RotaProtegida>
                    }
                />
                <Route
                    path="/servicos"
                    element={
                        <RotaProtegida tiposPermitidos={[0]}>
                            <Servicos />
                        </RotaProtegida>
                    }
                />
                <Route
                    path="/cadastrarmarca"
                    element={
                        <RotaProtegida tiposPermitidos={[0]}>
                            <CadastrarMarca />
                        </RotaProtegida>
                    }
                />
                <Route
                    path="/atualizarvalores"
                    element={
                        <RotaProtegida tiposPermitidos={[0]}>
                            <AtualizarValores />
                        </RotaProtegida>
                    }
                />
                <Route
                    path="/editarservico/:id_servico"
                    element={
                        <RotaProtegida tiposPermitidos={[0]}>
                            <EditarServico />
                        </RotaProtegida>
                    }
                />

                <Route
                    path="/listarmarcas"
                    element={
                        <RotaProtegida tiposPermitidos={[0]}>
                            <ListarMarcas />
                        </RotaProtegida>
                    }
                />
                <Route
                    path="/configuracoes"
                    element={
                        <RotaProtegida tiposPermitidos={[0]}>
                            <ConfiguracoesSite />
                        </RotaProtegida>
                    }
                />
                <Route path="*" element={<Not />} />

                <Route
                    path="/catalogo"
                    element={<Catalogo />}
                />

                <Route
                    path="/minhas-compras"
                    element={
                        <RotaProtegida tiposPermitidos={[2]}>
                            <MinhasCompras />
                        </RotaProtegida>
                    }
                />

                <Route
                    path="/restrita"
                    element={
                        <RotaProtegida>
                            <Restrita />
                        </RotaProtegida>
                    }
                />


                <Route
                    path="/dashboard"
                    element={
                        <RotaProtegida tiposPermitidos={[0]}>
                            <Dashboard />
                        </RotaProtegida>
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}
