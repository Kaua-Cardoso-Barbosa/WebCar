export function salvarSessaoUsuario(data) {
    const usuario = data?.usuario;
    if (!usuario) return null;

    localStorage.setItem("usuario_id", usuario.id_usuario);
    localStorage.setItem("usuario_nome", usuario.nome);
    localStorage.setItem("usuario_email", usuario.email);
    localStorage.setItem("usuario_tipo", usuario.tipo);

    const imagemUsuario = usuario.imagem || usuario.imagem_google || usuario.foto_google;

    if (imagemUsuario) {
        localStorage.setItem("usuario_imagem", imagemUsuario);
    } else {
        localStorage.removeItem("usuario_imagem");
    }

    if (usuario.telefone) {
        localStorage.setItem("usuario_telefone", usuario.telefone);
    } else {
        localStorage.removeItem("usuario_telefone");
    }

    if (usuario.cpf) {
        localStorage.setItem("usuario_cpf", usuario.cpf);
    } else {
        localStorage.removeItem("usuario_cpf");
    }

    if (data.token) {
        localStorage.setItem("token", data.token);
    }

    window.dispatchEvent(new CustomEvent("webcar:auth", { detail: { logado: true } }));
    return usuario;
}

export function rotaDepoisLogin(usuario, voltarPara) {
    const tipo = Number(usuario?.tipo);

    if (tipo === 0) return "/dashboard";
    if (tipo === 1) return "/catalogo";
    if (tipo === 2) return voltarPara || "/catalogo";

    return "/login";
}

export function authHeaders(headers = {}) {
    const token = localStorage.getItem("token");

    if (!token) return headers;

    return {
        ...headers,
        Authorization: `Bearer ${token}`,
    };
}
