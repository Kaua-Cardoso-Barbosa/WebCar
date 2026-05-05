import styles from "./SidebarMenu.module.css";
import { Link, useLocation } from "react-router-dom";

export default function SidebarMenu() {
    const location = useLocation();

    return (
        <aside className={styles.sidebar}>
            <nav className={styles.menu}>
                <Link
                    to="/dashboard"
                    className={`${styles.item} ${location.pathname === "/dashboard" ? styles.active : ""}`}
                >
                    <DashboardIcon />
                    <span>Dashboard</span>
                </Link>

                <Link
                    to="/garagem"
                    className={`${styles.item} ${location.pathname === "/garagem" ? styles.active : ""}`}
                >
                    <GarageIcon />
                    <span>Garagem</span>
                </Link>

                <Link
                    to="/servicos"
                    className={`${styles.item} ${location.pathname === "/servicos" ? styles.active : ""}`}
                >
                    <ServicesIcon />
                    <span>Serviços</span>
                </Link>

                <Link to="/" className={styles.item}>
                    <SalesIcon />
                    <span>Vendas</span>
                </Link>

                <Link to="/listausuarios" className={styles.item}>
                    <UserIcon />
                    <span>Usuários</span>
                </Link>
            </nav>

            <Link to="/listarmarcas" className={styles.item}>
                <span className={styles.icon}>⊕</span>
                <span>Marcas</span>
            </Link>

            <Link to="/Cadastroveiculo" className={styles.botaoAdicionar}>
                <span>＋</span>
                Adicione veículos
            </Link>
        </aside>
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

function SalesIcon() {
    return (
        <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
            <rect x="4" y="11" width="3" height="9" rx="1" />
            <rect x="10.5" y="6" width="3" height="14" rx="1" />
            <rect x="17" y="2" width="3" height="18" rx="1" />
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