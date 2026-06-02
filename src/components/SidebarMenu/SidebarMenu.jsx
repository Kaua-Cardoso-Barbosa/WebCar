import styles from "./SidebarMenu.module.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { API_URL } from "../../App";

const AUTH_KEYS = [
    "usuario_id",
    "usuario_nome",
    "usuario_email",
    "usuario_telefone",
    "usuario_cpf",
    "usuario_tipo",
    "token",
];

export default function SidebarMenu() {
    const location = useLocation();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    function fecharMenu() {
        setOpen(false);
    }

    function limparSessaoLocal() {
        AUTH_KEYS.forEach((chave) => localStorage.removeItem(chave));

        document.cookie.split(";").forEach((cookie) => {
            const nome = cookie.split("=")[0]?.trim();
            if (!nome) return;

            document.cookie = `${nome}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
            document.cookie = `${nome}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=localhost`;
        });

        window.dispatchEvent(new CustomEvent("webcar:auth", { detail: { logado: false } }));
    }

    async function fazerLogout() {
        try {
            const response = await fetch(`${API_URL}/logout`, {
                method: "POST",
                credentials: "include",
            });

            if (!response.ok) {
                await fetch(`${API_URL}/logout`, {
                    method: "GET",
                    credentials: "include",
                });
            }
        } catch {
            // Mesmo se o servidor nao responder, a sessao local precisa sair.
        }

        limparSessaoLocal();
        fecharMenu();
        navigate("/login");
    }

    return (
        <>
            <button
                type="button"
                className={styles.hamburger}
                onClick={() => setOpen(true)}
                aria-label="Abrir menu"
            >
                ☰
            </button>

            {open && (
                <div
                    className={styles.overlay}
                    onClick={fecharMenu}
                    aria-hidden="true"
                />
            )}

            <aside className={`${styles.sidebar} ${open ? styles.open : ""}`}>
                <nav className={styles.menu}>

                    <button className={styles.close} onClick={() => setOpen(false)}>
                        ✕
                    </button>

                    <Link
                        to="/dashboard"
                        className={`${styles.item} ${location.pathname === "/dashboard" ? styles.active : ""}`}
                        onClick={fecharMenu}
                    >

                        <DashboardIcon />
                        <span>Dashboard</span>
                    </Link>


                    <Link
                        to="/garagem"
                        className={`${styles.item} ${location.pathname === "/garagem" ? styles.active : ""}`}
                        onClick={fecharMenu}
                    >
                        <GarageIcon />
                        <span>Garagem</span>
                    </Link>

                    <Link
                        to="/servicos"
                        className={`${styles.item} ${location.pathname === "/servicos" ? styles.active : ""}`}
                        onClick={fecharMenu}
                    >
                        <ServicesIcon />
                        <span>Serviços</span>
                    </Link>

                    <Link
                        to="/ListaUsuarios"
                        className={`${styles.item} ${location.pathname === "/ListaUsuarios" ? styles.active : ""}`}
                        onClick={fecharMenu}
                    >
                        <UserIcon />
                        <span>Usuários</span>
                    </Link>

                    <Link
                        to="/financeiro"
                        className={`${styles.item} ${location.pathname === "/financeiro" ? styles.active : ""}`}
                        onClick={fecharMenu}
                    >
                        <FinanceIcon />
                        <span>Financeiro</span>
                    </Link>

                    <Link to="/listarmarcas" className={styles.item} onClick={fecharMenu}>
                        <span className={styles.icon}>⊕</span>
                        <span>Marcas</span>
                    </Link>
                    <Link
                        to="/configuracoes"
                        className={`${styles.item} ${location.pathname === "/configuracoes" ? styles.active : ""}`}
                        onClick={fecharMenu}
                    >
                        <SettingsIcon />
                        <span>Configurações</span>
                    </Link>
                    <Link
                        to="/"
                        className={`${styles.item} ${location.pathname === "/" ? styles.active : ""}`}
                        onClick={fecharMenu}
                    >
                        <HomeIcon />
                        <span>Home</span>
                    </Link>
                    <button
                        type="button"
                        className={`${styles.item} ${styles.mobileLogout}`}
                        onClick={fazerLogout}
                    >
                        <LogoutIcon />
                        <span>Logout</span>
                    </button>
                </nav>
            </aside>
        </>
    );
}

function DashboardIcon() {
    return (
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
        </svg>
    );
}

function GarageIcon() {
    return (
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7h16" />
            <path d="M6 7v12h12V7" />
            <path d="M9 11h6" />
            <path d="M10 19v-4h4v4" />
            <path d="M8 3h8" />
        </svg>
    );
}

function ServicesIcon() {
    return (
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14.7 6.3a1 1 0 0 0-1.4 0l-7 7a1 1 0 0 0 0 1.4l3 3a1 1 0 0 0 1.4 0l7-7a1 1 0 0 0 0-1.4z" />
            <path d="M18 8l-2-2" />
            <path d="M5 19l3-1" />
        </svg>
    );
}

function UserIcon() {
    return (
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
            <circle cx="9.5" cy="7" r="3" />
            <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 4.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

function FinanceIcon() {
    return (
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19h16" />
            <path d="M7 16V9" />
            <path d="M12 16V5" />
            <path d="M17 16v-4" />
            <path d="M5 9l7-5 7 5" />
        </svg>
    );
}

function SettingsIcon() {
    return (
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19 12a7 7 0 0 0-.09-1.1l2.02-1.57-2-3.46-2.39.96a7.4 7.4 0 0 0-1.9-1.1L14.28 3h-4l-.36 2.73a7.4 7.4 0 0 0-1.9 1.1l-2.39-.96-2 3.46 2.02 1.57a7 7 0 0 0 0 2.2l-2.02 1.57 2 3.46 2.39-.96a7.4 7.4 0 0 0 1.9 1.1l.36 2.73h4l.36-2.73a7.4 7.4 0 0 0 1.9-1.1l2.39.96 2-3.46-2.02-1.57A7 7 0 0 0 19 12z" />
        </svg>
    );
}

function HomeIcon() {
    return (
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 11l9-8 9 8" />
            <path d="M5 10v10h14V10" />
            <path d="M9 20v-6h6v6" />
        </svg>
    );
}

function LogoutIcon() {
    return (
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
        </svg>
    );
}
