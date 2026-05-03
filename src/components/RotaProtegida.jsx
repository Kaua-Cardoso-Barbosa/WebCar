import { Navigate } from "react-router-dom";

export default function RotaProtegida({ children, componente, tiposPermitidos, tipoPermitido }) {
    const usuarioId = localStorage.getItem("usuario_id");
    const usuarioTipo = Number(localStorage.getItem("usuario_tipo"));
    const conteudo = children || componente;
    const tiposAutorizados = tiposPermitidos || (tipoPermitido ? [Number(tipoPermitido)] : []);

    if (!usuarioId) {
        return <Navigate to="/login" replace />;
    }

    if (tiposAutorizados.length > 0 && !tiposAutorizados.includes(usuarioTipo)) {
        return <Navigate to="/not" replace />;
    }

    return conteudo;
}
