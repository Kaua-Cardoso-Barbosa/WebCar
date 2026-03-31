import { Navigate } from "react-router-dom";

export default function RotaRestrita({ children }) {
    const usuarioNome = localStorage.getItem("usuario_nome");

    if (!usuarioNome) {
        return <Navigate to="/login" />;
    }

    return children;
}