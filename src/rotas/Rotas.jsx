import {Routes, Route} from 'react-router-dom'; 
import { Inicial } from '../paginas/Inicial';
import { CadUsuario } from '../paginas/CadUsuario';
import { CadTarefa } from '../paginas/CadTarefa';
import { Quadro } from '../components/Quadro';
import { EditarTarefa } from '../components/EditarTarefa';
import { Home } from '../paginas/Home';

export function Rotas(){
    return(
        <Routes>
            <Route path='/' element={<Home/>}>
                <Route index element ={<Quadro />} />
                <Route path='inicial' element={<Inicial/>} />
                <Route path= 'cadUsuario' element={<CadUsuario />} />
                <Route path='cadTarefa' element={<CadTarefa />}/>
                <Route path="/editar/:id" element={<EditarTarefa />} />
            </Route>
        </Routes>
    )
}