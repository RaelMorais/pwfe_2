import { Outlet } from "react-router-dom";
import { BarraNavegacao } from "../components/BarraNavegação";
import { Cabecalho } from "../components/Cabecalho";
// import { Quadro } from "../components/Quadro";

export function Inicial(){
    return(
        <>
            <BarraNavegacao />
            <Cabecalho />
            <Outlet/>
        </>
        
    )
}