import css from "./Banner.module.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_URL } from "../../App";

const CONFIG_SITE_PADRAO = {
    textoBanner: "Escolha com confiança. Compre com segurança.",
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
        textoBanner: data.textoBanner || data.texto_banner || data.TEXTO_BANNER || CONFIG_SITE_PADRAO.textoBanner,
        bannerUrl: urlArquivo(data.bannerUrl || data.banner_url || data.BANNER_URL || data.banner || data.BANNER, CONFIG_SITE_PADRAO.bannerUrl),
    };
}

async function carregarConfiguracoesSite() {
    const response = await fetch(`${API_URL}/configuracoes_site`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        return CONFIG_SITE_PADRAO;
    }

    const data = await response.json();
    return normalizarConfiguracoesSite(data);
}

export default function Banner() {
    const [config, setConfig] = useState(CONFIG_SITE_PADRAO);

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

        window.addEventListener("webcar:configuracoes-site", atualizar);
        return () => window.removeEventListener("webcar:configuracoes-site", atualizar);
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
                            Ver catalogo
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
