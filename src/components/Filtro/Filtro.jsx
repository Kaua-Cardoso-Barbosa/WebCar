export default function Filtro(){
    return (
        <>
            <div className="bg-white p-3 rounded shadow-sm">

                <div className="d-flex justify-content-between">
                    <h6>Filtro</h6>
                    <small className="text-primary">Resetar</small>
                </div>

                <hr />

                <div className="mb-3">
                    <strong>Marca</strong>
                    {["Tesla", "BMW", "Toyota"].map((brand) => (
                        <div className="form-check" key={brand}>
                            <input type="checkbox" className="form-check-input" />
                            <label className="form-check-label">{brand}</label>
                        </div>
                    ))}
                </div>

                <div className="mb-3">
                    <strong>Preço</strong>
                    <input type="range" className="form-range" />
                </div>

                <div className="mb-3">
                    <strong>Categoria</strong>
                    <select className="form-select">
                        <option>Todos</option>
                    </select>
                </div>

                <div className="mb-3">
                    <strong>Ano</strong>
                    <div className="d-flex gap-2">
                        <input className="form-control" placeholder="De" />
                        <input className="form-control" placeholder="Até" />
                    </div>
                </div>

            </div>
        </>
    )
}