import { useEffect } from "react";
import css from "./Sucesso.module.css";

export default function Sucesso({ mensagem, onClose }) {
    useEffect(() => {
        if (!onClose) return undefined;

        const timer = setTimeout(() => {
            onClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={css.overlay}>
            <div className={css.card}>
                <div className={css.icon}>&#10003;</div>

                <h1 className="fw-bold mt-3">Sucesso!</h1>

                <p className="text-muted mt-2">
                    {mensagem}
                </p>
            </div>
        </div>
    );
}
