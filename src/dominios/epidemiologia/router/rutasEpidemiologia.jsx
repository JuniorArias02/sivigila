import { Route } from 'react-router-dom';
import { VistaBai } from '../pages/VistaBai';
import { VistaRips } from '../pages/VistaRips';
import { VistaFicha995 } from '../pages/VistaFicha995';
import { VistaFicha998 } from '../pages/VistaFicha998';

export const rutasEpidemiologia = (
  <>
    <Route path="/bai" element={<VistaBai />} />
    <Route path="/rips" element={<VistaRips />} />
    <Route path="/ficha-995" element={<VistaFicha995 />} />
    <Route path="/ficha-998" element={<VistaFicha998 />} />
  </>
);
