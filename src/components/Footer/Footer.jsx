import { useEffect, useState } from "react";
import { API_URL } from "../../App";

const LOGO_PADRAO = "/Logo.png";
const LOGO_CACHE_KEY = "webcar_logo_url";

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

export default function Footer() {
    const [logoUrl, setLogoUrl] = useState(() => localStorage.getItem(LOGO_CACHE_KEY) || LOGO_PADRAO);

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

        window.addEventListener("webcar:configuracoes-site", atualizar);
        return () => window.removeEventListener("webcar:configuracoes-site", atualizar);
    }, []);

    return (
        <footer className="container py-5">
            <div className="row justify-content-between">
                <div className="col-md-4 mb-4">
                    <div className="d-flex align-items-center gap-2 mb-3">
                        <img src={logoUrl} alt="Logo" width="60" height="40" />
                    </div>

                    <p className="text-secondary">
                        Lider em solucoes modernas para compra e venda
                        de veiculos. Gerencie seu estoque com
                        inteligencia de dados.
                    </p>
                </div>

                <div className="col-md-2">
                    <h6 className="fw-bold">Empresa</h6>
                    <ul className="nav flex-column">
                        <li className="nav-item mb-2">
                            <a href="#" className="nav-link p-0 text-secondary">
                                Sobre Nos
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
