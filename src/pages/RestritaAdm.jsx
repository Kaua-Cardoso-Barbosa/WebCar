import SidebarMenu from "../components/SidebarMenu/SidebarMenu";
import css from "./RestritaAdm.module.css";

export default function RestritaAdm() {
    const navigate = useNavigate();
    const nomeUsuario = localStorage.getItem("usuario_nome");

    async function fazerLogout() {
        try {
            await fetch("http://10.92.3.167:5000/logout", {
                method: "POST",
                credentials: "include"
            });
        } catch (error) {
            console.log("Erro ao fazer logout");
        }

        localStorage.removeItem("usuario_id");
        localStorage.removeItem("usuario_nome");
        localStorage.removeItem("usuario_email");
        localStorage.removeItem("usuario_tipo");

        navigate("/login");
    }

    return (
        <div className={css.layout}>
            <SidebarMenu />
            <Dashboard />
        </div>
    );
}