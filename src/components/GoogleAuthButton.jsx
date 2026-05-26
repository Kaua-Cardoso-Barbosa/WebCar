import { useEffect, useRef, useState } from "react";
import { API_URL } from "../App";

const GOOGLE_SCRIPT_ID = "google-identity-services";

const GOOGLE_CLIENT_ID = "92315268318-qn4id91q5o6dkg25e47h29joheito0li.apps.googleusercontent.com";
const GOOGLE_BUTTON_HEIGHT = 44;
const GOOGLE_BUTTON_WIDTH = 320;

function carregarScriptGoogle() {
    if (window.google?.accounts?.id) return Promise.resolve();

    const scriptExistente = document.getElementById(GOOGLE_SCRIPT_ID);

    if (scriptExistente) {
        return new Promise((resolve, reject) => {
            scriptExistente.addEventListener("load", resolve, { once: true });
            scriptExistente.addEventListener("error", reject, { once: true });
        });
    }

    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.id = GOOGLE_SCRIPT_ID;
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

export default function GoogleAuthButton({ className = "", onSuccess, onError }) {
    const botaoRef = useRef(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        let ativo = true;
        const clientId = GOOGLE_CLIENT_ID;

        async function prepararGoogle() {
            if (!clientId) {
                setCarregando(false);
                onError?.("Client ID do Google não configurado.");
                return;
            }

            try {
                await carregarScriptGoogle();

                if (!ativo || !botaoRef.current) return;

                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: async (respostaGoogle) => {
                        try {
                            const response = await fetch(`${API_URL}/login_google`, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                credentials: "include",
                                body: JSON.stringify({
                                    credential: respostaGoogle.credential,
                                    tipo: 2
                                })
                            });

                            const data = await response.json();

                            if (!response.ok) {
                                throw new Error(data?.mensagem || "Não foi possível entrar com Google.");
                            }

                            onSuccess?.(data);
                        } catch (error) {
                            onError?.(error.message || "Erro ao conectar com Google.");
                        }
                    }
                });

                window.google.accounts.id.renderButton(botaoRef.current, {
                    theme: "outline",
                    size: "large",
                    type: "standard",
                    shape: "pill",
                    text: "continue_with",
                    width: botaoRef.current.offsetWidth || GOOGLE_BUTTON_WIDTH
                });

                setCarregando(false);
            } catch {
                if (ativo) {
                    setCarregando(false);
                    onError?.("Não foi possível carregar o botão do Google.");
                }
            }
        }

        prepararGoogle();

        return () => {
            ativo = false;
        };
    }, [onError, onSuccess]);

    return (
        <div
            className={className}
            style={{
                minHeight: GOOGLE_BUTTON_HEIGHT,
                position: "relative"
            }}
            aria-busy={carregando}
        >
            <div
                ref={botaoRef}
                style={{
                    width: "100%",
                    minHeight: GOOGLE_BUTTON_HEIGHT,
                    opacity: carregando ? 0 : 1,
                    pointerEvents: carregando ? "none" : "auto"
                }}
            />

            {carregando && (
                <button
                    type="button"
                    disabled
                    style={{
                        alignItems: "center",
                        background: "var(--cor-superficie)",
                        border: "1px solid var(--cor-borda)",
                        borderRadius: 999,
                        color: "var(--cor-texto-neutro-650)",
                        display: "flex",
                        fontSize: 14,
                        fontWeight: 600,
                        gap: 10,
                        height: GOOGLE_BUTTON_HEIGHT,
                        justifyContent: "center",
                        left: 0,
                        lineHeight: 1,
                        padding: "0 16px",
                        position: "absolute",
                        top: 0,
                        width: "100%"
                    }}
                >
                    <span
                        aria-hidden="true"
                        style={{
                            alignItems: "center",
                            border: "1px solid var(--cor-borda)",
                            borderRadius: "50%",
                            color: "#4285f4",
                            display: "inline-flex",
                            fontSize: 14,
                            fontWeight: 700,
                            height: 22,
                            justifyContent: "center",
                            width: 22
                        }}
                    >
                        G
                    </span>
                    Carregando Google...
                </button>
            )}
        </div>
    );
}
