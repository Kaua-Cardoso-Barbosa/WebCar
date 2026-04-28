import { Navigate } from "react-router-dom";

export default function RotaProtegida({ children, tiposPermitidos = [] }) {
    const usuarioId = localStorage.getItem("usuario_id");
    const usuarioTipo = Number(localStorage.getItem("usuario_tipo"));

    if (!usuarioId) {
        return <Navigate to="/login" replace />;
    }

    if (!tiposPermitidos.includes(usuarioTipo)) {
        return <Navigate to="/login" replace />;
    }

    return children;
}