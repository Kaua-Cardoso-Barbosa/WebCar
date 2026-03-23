import css from "./Sucesso.module.css";

export default function Sucesso({ mensagem, onClose }) {
    return (
        <div className={css.overlay}>
            <div className={css.card}>
                <div className={css.icon}>✓</div>

                <h1 className="fw-bold mt-3">Sucesso!</h1>

                <p className="text-muted mt-2">
                    {mensagem}
                </p>

                <button className="btn btn-primary mt-4 px-4" onClick={onClose}>
                    Fechar
                </button>
            </div>
        </div>
    );
}