import css from "./Cards.module.css"

export default function Card(){
    return (
        <>
            <div className={"card" + css.cardtam + " " + (css.cardestilo)} style={{width:'100%'}}>
                <img src="Car.png" className="card-img-top" alt="..."/>
                <div style={{justifyContent: "space-between ", padding: "5px"}} className={"card-body d-flex align-items-space-between " + (css.gap130) + (css.espacomenor)}>
                    <p style={{fontWeight:"bold"}} className="card-text text-start">BMW M4</p>
                    <p style={{fontWeight:"bold", color:"#2563EB"}} className="card-text text-end">R$89,900</p>
                </div>
                <p style={{padding: "5px"}}>Gasolina • 2014 • RWD</p>
                <div style={{marginLeft:"5px"}} className={"d-flex pt-5 " + (css.gap28 ) + " " + (css.espacogrande)}>
                    <div className="d-flex align-content-center justify-content-center align-self-center align-items-center">
                        <img src="velocimetro.png" alt="engrenagem"/>
                        <p className="mt-3">12,400m</p>
                    </div>
                    <div className="d-flex align-items-center justify-content-center align-self-center">
                        <img src="engrenagem.png" alt="engrenagem"/>
                        <p className="mt-3">Auto</p>
                    </div>
                    <div className="d-flex align-items-center justify-content-center align-self-center">
                        <img src="gasolina.png" alt="gasolina" />
                        <p className="mt-3">Gasolina</p>
                    </div>
                </div>

            </div>
        </>
    )
}