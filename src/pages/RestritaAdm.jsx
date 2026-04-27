import SidebarMenu from "../components/SidebarMenu/SidebarMenu";
import Dashboard from "../pages/Dashboard";
import css from "./RestritaAdm.module.css";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../App";

export default function RestritaAdm() {

    const navigate = useNavigate();

    async function fazerLogout() {
        try {
            await fetch(`${API_URL}/logout`, {
                method: "POST",
                credentials: "include"
            });
        } catch (error) {
            console.log("Erro ao fazer logout");
        }

        localStorage.clear();
        navigate("/login");
    }

    return (
        <div className={css.layout}>
            <SidebarMenu />
            <Dashboard />
        </div>
    );
}