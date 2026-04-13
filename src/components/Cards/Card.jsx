import css from "./Cards.module.css"

export default function Card({ modelo, valor, combustivel, ano, nome, km, cambio  }){
    return (
        <>
            <div className={"card" + css.cardtam + " " + (css.cardestilo)} style={{width:'100%'}}>
                <img src="Car.png" className="card-img-top" alt="..."/>
                <div style={{justifyContent: "space-between ", padding: "5px"}} className={"card-body d-flex align-items-space-between " + (css.gap130) + (css.espacomenor)}>
                    <p style={{fontWeight:"bold"}} className="card-text text-start">{modelo}</p>
                    <p style={{fontWeight:"bold", color:"#2563EB"}} className="card-text text-end">{valor}</p>
                </div>
                <p style={{padding: "5px"}}>{combustivel} • {ano} • {nome}</p>
                <div style={{marginLeft:"5px"}} className={"d-flex pt-5 " + (css.gap28 ) + " " + (css.espacogrande)}>
                    <div className="d-flex align-content-center justify-content-center align-self-center align-items-center">
                        <img src="velocimetro.png" alt="engrenagem"/>
                        <p className="mt-3">{km}</p>
                    </div>
                    <div className="d-flex align-items-center justify-content-center align-self-center">
                        <img src="engrenagem.png" alt="engrenagem"/>
                        <p className="mt-3">{cambio}</p>
                    </div>
                    <div className="d-flex align-items-center justify-content-center align-self-center">
                        <img src="gasolina.png" alt="gasolina" />
                        <p className="mt-3">{combustivel}</p>
                    </div>
                </div>

            </div>
        </>
    )
}