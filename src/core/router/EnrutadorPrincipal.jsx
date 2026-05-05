import { Routes, Route, Navigate } from 'react-router-dom';
import LayoutMain from '../layouts/LayoutMain';
import { rutasEpidemiologia } from '../../dominios/epidemiologia/router/rutasEpidemiologia';

export default function EnrutadorPrincipal() {
  return (
    <Routes>
      <Route path="/" element={<LayoutMain />}>
        {/* Aquí inyectamos las rutas del dominio */}
        {rutasEpidemiologia}
        
        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/bai" replace />} />
      </Route>
    </Routes>
  );
}
