import {Routes, Route} from 'react-router-dom'; 
import { Inicial } from '../paginas/Inicial';
import { CadUsuario } from '../paginas/CadUsuario';
import { CadTarefa } from '../paginas/CadTarefa';
import { Quadro } from '../components/Quadro';
import { EditarTarefa } from '../components/EditarTarefa';

export function Rotas(){
    return(
        <Routes>
            <Route path='/' element={<Inicial />}>
                <Route index element ={<Quadro />} />
                <Route path= 'cadUsuario' element={<CadUsuario />} />
                <Route path='cadTarefa' element={<CadTarefa />}/>
                <Route path="/editar/:id" element={<EditarTarefa />} />
            </Route>
        </Routes>
    )
}