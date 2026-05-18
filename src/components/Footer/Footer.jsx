import { useEffect, useState } from "react";
import { API_URL } from "../../App";

const LOGO_PADRAO = "/Logo.png";
const LOGO_CACHE_KEY = "webcar_logo_url";
const CONFIG_SITE_CACHE_KEY = "webcar_configuracoes_site";

function urlArquivo(valor, fallback) {
    if (!valor) return fallback;
    if (valor.startsWith("http") || valor.startsWith("data:") || valor.startsWith("blob:") || valor.startsWith("/")) {
        return valor;
    }

    return `${API_URL}/${valor.replace(/^\/+/, "")}`;
}

async function carregarLogoSite() {
    const response = await fetch(`${API_URL}/verdadosempresa`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) return localStorage.getItem(LOGO_CACHE_KEY) || LOGO_PADRAO;

    const data = await response.json();
    const empresa = data.empresas?.[0] || {};

    const logoUrl = urlArquivo(empresa.logo_url || empresa.logoUrl || empresa.LOGO_URL, LOGO_PADRAO);
    localStorage.setItem(LOGO_CACHE_KEY, logoUrl);
    return logoUrl;
}

function lerLogoConfiguracoesCache() {
    try {
        const cache = localStorage.getItem(CONFIG_SITE_CACHE_KEY);
        if (!cache) return null;

        const config = JSON.parse(cache);
        return config.logoUrl || config.logo_url || config.LOGO_URL || null;
    } catch {
        return null;
    }
}

export default function Footer() {
    const [logoUrl, setLogoUrl] = useState(() => lerLogoConfiguracoesCache() || localStorage.getItem(LOGO_CACHE_KEY) || LOGO_PADRAO);

    useEffect(() => {
        async function buscarLogo() {
            try {
                setLogoUrl(await carregarLogoSite());
            } catch {
                setLogoUrl(LOGO_PADRAO);
            }
        }

        buscarLogo();

        function atualizar(e) {
            const novaLogo = e.detail?.logoUrl || LOGO_PADRAO;
            localStorage.setItem(LOGO_CACHE_KEY, novaLogo);
            setLogoUrl(novaLogo);
        }

        function atualizarPorOutraAba(e) {
            if (e.key !== CONFIG_SITE_CACHE_KEY || !e.newValue) return;

            try {
                const config = JSON.parse(e.newValue);
                const novaLogo = config.logoUrl || config.logo_url || config.LOGO_URL || LOGO_PADRAO;
                localStorage.setItem(LOGO_CACHE_KEY, novaLogo);
                setLogoUrl(novaLogo);
            } catch {
                // Mantem a logo atual se o cache vier invalido.
            }
        }

        function atualizarAoVoltar() {
            if (document.visibilityState === "visible") {
                buscarLogo();
            }
        }

        window.addEventListener("webcar:configuracoes-site", atualizar);
        window.addEventListener("storage", atualizarPorOutraAba);
        window.addEventListener("focus", buscarLogo);
        document.addEventListener("visibilitychange", atualizarAoVoltar);

        return () => {
            window.removeEventListener("webcar:configuracoes-site", atualizar);
            window.removeEventListener("storage", atualizarPorOutraAba);
            window.removeEventListener("focus", buscarLogo);
            document.removeEventListener("visibilitychange", atualizarAoVoltar);
        };
    }, []);

    return (
        <footer className="container py-5">
            <div className="row justify-content-between">
                <div className="col-md-4 mb-4">
                    <div className="d-flex align-items-center gap-2 mb-3">
                        <img src={logoUrl} alt="Logo" width="60" height="40" />
                    </div>

                    <p className="text-secondary">
                        Líder em soluções modernas para compra e venda
                        de veículos. Gerencie seu estoque com
                        inteligência de dados.
                    </p>
                </div>

                <div className="col-md-2">
                    <h6 className="fw-bold">Empresa</h6>
                    <ul className="nav flex-column">
                        <li className="nav-item mb-2">
                            <a href="#" className="nav-link p-0 text-secondary">
                                Sobre nós
                            </a>
                        </li>
                        <li className="nav-item">
                            <a href="#" className="nav-link p-0 text-secondary">
                                Contato
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <hr className="my-4" />

            <div className="d-flex justify-content-between text-secondary small">
                <div>Todos os direitos reservados.</div>
                <div>Portugues (Brasil)</div>
            </div>
        </footer>
    );
}
