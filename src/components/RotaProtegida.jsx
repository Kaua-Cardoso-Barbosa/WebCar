import { Navigate } from "react-router-dom";

export default function RotaProtegida(props) {
    const usuarioId = localStorage.getItem("usuario_id");
    const tipoUsuario = localStorage.getItem("usuario_tipo");

    if (!usuarioId) {
        return <Navigate to="/login" />;
    }

    if (tipoUsuario !== props.tipoPermitido) {
        return <Navigate to="/login" />;
    }

    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/login" replace />;
    }



    return props.componente;
}