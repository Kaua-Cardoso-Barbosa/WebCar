import css from "./Banner.module.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_URL } from "../../App";

const CONFIG_SITE_PADRAO = {
    textoBanner: "Escolha com confiança. Compre com segurança.",
    bannerUrl: "/Banner.png",
};
const CONFIG_SITE_CACHE_KEY = "webcar_configuracoes_site";

function urlArquivo(valor, fallback) {
    if (!valor) return fallback;
    if (valor.startsWith("http") || valor.startsWith("data:") || valor.startsWith("blob:") || valor.startsWith("/")) {
        return valor;
    }

    return `${API_URL}/${valor.replace(/^\/+/, "")}`;
}

function normalizarConfiguracoesSite(data = {}) {
    return {
        textoBanner: data.textoBanner || data.texto_banner || data.descricao || data.TEXTO_BANNER || data.DESCRICAO || CONFIG_SITE_PADRAO.textoBanner,
        bannerUrl: urlArquivo(data.banner_url || data.bannerUrl || data.BANNER_URL, CONFIG_SITE_PADRAO.bannerUrl),
    };
}

async function carregarConfiguracoesSite() {
    const response = await fetch(`${API_URL}/verdadosempresa`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        return CONFIG_SITE_PADRAO;
    }

    const data = await response.json();
    return normalizarConfiguracoesSite(data.empresas?.[0] || {});
}

function lerConfiguracoesSiteCache() {
    try {
        const cache = localStorage.getItem(CONFIG_SITE_CACHE_KEY);
        return cache ? normalizarConfiguracoesSite(JSON.parse(cache)) : null;
    } catch {
        return null;
    }
}

export default function Banner() {
    const [config, setConfig] = useState(() => lerConfiguracoesSiteCache() || CONFIG_SITE_PADRAO);

    useEffect(() => {
        async function buscarConfiguracoes() {
            try {
                setConfig(await carregarConfiguracoesSite());
            } catch {
                setConfig(CONFIG_SITE_PADRAO);
            }
        }

        buscarConfiguracoes();

        function atualizar(e) {
            setConfig(e.detail || CONFIG_SITE_PADRAO);
        }

        function atualizarPorOutraAba(e) {
            if (e.key !== CONFIG_SITE_CACHE_KEY || !e.newValue) return;

            try {
                setConfig(normalizarConfiguracoesSite(JSON.parse(e.newValue)));
            } catch {
                // Mantem o banner atual se o cache vier invalido.
            }
        }

        function atualizarAoVoltar() {
            if (document.visibilityState === "visible") {
                buscarConfiguracoes();
            }
        }

        window.addEventListener("webcar:configuracoes-site", atualizar);
        window.addEventListener("storage", atualizarPorOutraAba);
        window.addEventListener("focus", buscarConfiguracoes);
        document.addEventListener("visibilitychange", atualizarAoVoltar);

        return () => {
            window.removeEventListener("webcar:configuracoes-site", atualizar);
            window.removeEventListener("storage", atualizarPorOutraAba);
            window.removeEventListener("focus", buscarConfiguracoes);
            document.removeEventListener("visibilitychange", atualizarAoVoltar);
        };
    }, []);

    return (
        <section className={css.banner}>
            <div className={css.bannerMedia}>
                <img
                    src={config.bannerUrl}
                    alt="Carro em destaque"
                    className={css.bannerImg}
                />

                <div className={css.bannerOverlay}></div>

                <div className={css.bannerContent}>
                    <h1>{config.textoBanner}</h1>

                    <div className={css.acoes}>
                        <Link to="/catalogo" className={css.primario}>
                            Ver catálogo
                        </Link>
                        <Link to="/Login" className={css.secundario}>
                            Entrar
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
