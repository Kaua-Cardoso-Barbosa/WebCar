import css from "./Catalogo.module.css"
import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer/Footer.jsx";
import Card from "../components/Cards/Card.jsx";
import Filtro from "../components/Filtro/Filtro.jsx";

export default function Catalogo(){
    return (
        <>

            <Header />

            <div style={{display: "flex"}}>
                <div className="col-lg-3">
                    <Filtro />
                </div>
                <div>
                    <Card />
                </div>
            </div>

            <Footer />

        </>
    )
}