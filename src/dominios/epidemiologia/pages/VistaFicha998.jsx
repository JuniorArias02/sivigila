import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useFicha998 } from '../hooks/useFicha998';
import { obtenerSemanaEpidemiologica } from '../../../core/utils/formateo';

export function VistaFicha998() {
  const { datos, setDatos, eda, handleEdaChange, totales, limpiar, cargarImportados, exportarTXT, exportarCSV } = useFicha998();
  const location = useLocation();
  const [showBanner, setShowBanner] = useState(false);
  const [bannerText, setBannerText] = useState('');

  useEffect(() => {
    const hoy = new Date();
    const ds = String(hoy.getDate()).padStart(2, '0') + '/' + String(hoy.getMonth() + 1).padStart(2, '0') + '/' + hoy.getFullYear();
    setDatos('fecha', ds);
    setDatos('se', obtenerSemanaEpidemiologica());
    setDatos('anio', hoy.getFullYear());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (location.state?.resumen) {
      cargarImportados(location.state.resumen, location.state.importedEda?.length || 0);
      const sin = location.state.resumen.sinE;
      setBannerText(`Importado: ${location.state.importedEda.length} casos EDA por grupo de edad${sin ? ` | ${sin} sin edad` : ''}`);
      setShowBanner(true);
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const handleDescargar = (fn) => {
    const file = fn();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\uFEFF' + file.data], { type: file.type + ';charset=utf-8' }));
    a.download = file.filename;
    a.click();
  };

  const handleLimpiar = () => {
    limpiar();
    setShowBanner(false);
  };

  const nombreEvento = { 998: 'EDA', 830: 'Varicela', 621: 'Parotiditis', 901: 'S/E' }[datos.evento] || 'EDA';

  return (
    <div className="max-w-[1200px] mx-auto px-5 pb-6 pt-4">
      <div className="bg-white border-[0.5px] border-[var(--color-br)] rounded-[var(--radius-rl2)] overflow-hidden mb-3.5">
        <div className="p-[12px_18px] flex items-center justify-between bg-[#1b5e20]">
          <div>
            <h2 className="text-white text-[13px] font-semibold">Ficha Notificación Colectiva · EDA / Brotes / Varicela / Parotiditis</h2>
            <span className="text-white/55 text-[10.5px]">FOR-R02.0000-076 V:06 2024-10-08 · Cód. INS 998 / 830 / 621 / 901</span>
          </div>
          <span className="bg-[var(--color-eda-l)] text-[var(--color-eda)] px-2.5 py-[3px] rounded-[20px] text-[11px] font-bold font-[var(--font-mono)]">Cód. 998</span>
        </div>
        
        <div className="p-[18px]">
          {showBanner && (
            <div className="flex items-center gap-2 bg-[#EDE7F6] border-[0.5px] border-[#CE93D8] rounded-[var(--radius-r)] p-[8px_12px] text-[11px] text-[#4A148C] mb-2.5">
              <span className="text-[16px]">✅</span>
              <span>{bannerText}</span>
            </div>
          )}

          <div className="mb-4">
            <div className="text-[10px] font-semibold uppercase tracking-[1px] text-[var(--color-ts)] mb-2 pb-1 border-b-[0.5px] border-[var(--color-gm)]">1. Información General</div>
            <div className="flex gap-2.5 flex-wrap mb-2.5">
              <div className="flex flex-col gap-[3px] flex-1 min-w-[80px] max-w-[200px]">
                <label className="text-[10px] font-medium text-[var(--color-ts)] uppercase tracking-[0.5px]">1.1 Evento<span className="text-[var(--color-rm)] text-[9px]">*</span></label>
                <select value={datos.evento} onChange={e => setDatos('evento', e.target.value)}>
                  <option value="998">998 · Morbilidad por EDA</option>
                  <option value="830">830 · Varicela Colectivo</option>
                  <option value="621">621 · Parotiditis Colectivo</option>
                  <option value="901">901 · Evento Colectivo Sin Establecer</option>
                </select>
              </div>
              <div className="flex flex-col gap-[3px] flex-1 min-w-[80px] max-w-[140px]">
                <label className="text-[10px] font-medium text-[var(--color-ts)] uppercase tracking-[0.5px]">1.2 Fecha<span className="text-[var(--color-rm)] text-[9px]">*</span></label>
                <input type="text" value={datos.fecha} onChange={e => setDatos('fecha', e.target.value)} placeholder="dd/mm/aaaa" />
              </div>
              <div className="flex flex-col gap-[3px] flex-1 min-w-[80px] max-w-[90px]">
                <label className="text-[10px] font-medium text-[var(--color-ts)] uppercase tracking-[0.5px]">1.3 SE<span className="text-[var(--color-rm)] text-[9px]">*</span></label>
                <input type="number" value={datos.se} onChange={e => setDatos('se', e.target.value)} min="1" max="53" />
              </div>
              <div className="flex flex-col gap-[3px] flex-1 min-w-[80px] max-w-[90px]">
                <label className="text-[10px] font-medium text-[var(--color-ts)] uppercase tracking-[0.5px]">1.4 Año<span className="text-[var(--color-rm)] text-[9px]">*</span></label>
                <input type="number" value={datos.anio} onChange={e => setDatos('anio', e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2.5 flex-wrap mb-2.5">
              <div className="flex flex-col gap-[3px] flex-1 min-w-[80px] max-w-[60px]">
                <label className="text-[10px] font-medium text-[var(--color-ts)] uppercase tracking-[0.5px]">Dpto.</label>
                <input type="text" value={datos.dpto} onChange={e => setDatos('dpto', e.target.value)} maxLength="2" />
              </div>
              <div className="flex flex-col gap-[3px] flex-1 min-w-[80px] max-w-[70px]">
                <label className="text-[10px] font-medium text-[var(--color-ts)] uppercase tracking-[0.5px]">Mpio.</label>
                <input type="text" value={datos.mpio} onChange={e => setDatos('mpio', e.target.value)} maxLength="3" />
              </div>
              <div className="flex flex-col gap-[3px] flex-1 min-w-[80px] max-w-[110px]">
                <label className="text-[10px] font-medium text-[var(--color-ts)] uppercase tracking-[0.5px]">Código IPS</label>
                <input type="text" value={datos.cod} onChange={e => setDatos('cod', e.target.value)} placeholder="######" />
              </div>
              <div className="flex flex-col gap-[3px] flex-1 min-w-[80px] max-w-[60px]">
                <label className="text-[10px] font-medium text-[var(--color-ts)] uppercase tracking-[0.5px]">Sub Índ.</label>
                <input type="text" value={datos.sub} onChange={e => setDatos('sub', e.target.value)} maxLength="2" />
              </div>
              <div className="flex flex-col gap-[3px] flex-1 min-w-[80px]">
                <label className="text-[10px] font-medium text-[var(--color-ts)] uppercase tracking-[0.5px]">1.7 Razón social UPGD<span className="text-[var(--color-rm)] text-[9px]">*</span></label>
                <input type="text" value={datos.razon} onChange={e => setDatos('razon', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-[10px] font-semibold uppercase tracking-[1px] text-[var(--color-ts)] mb-2 pb-1 border-b-[0.5px] border-[var(--color-gm)]">2.1 Grupo de Edad — N° de Casos</div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr>
                    <th className="p-[5px_7px] text-[9.5px] font-semibold uppercase tracking-[0.4px] border-[0.5px] text-center bg-[var(--color-eda-l)] text-[var(--color-eda)] border-[#A5D6A7]" style={{background:'#1b5e20', color:'#fff'}}>Grupo</th>
                    {['<1a', '1-4a', '5-9a', '10-14a', '15-19a', '20-24a', '25-29a', '30-34a', '35-39a', '40-44a', '45-49a', '50-54a', '55-59a', '60-64a', '65-69a', '70-74a', '75-79a', '≥80a'].map(g => (
                      <th key={g} className="p-[5px_7px] text-[9.5px] font-semibold uppercase tracking-[0.4px] border-[0.5px] text-center bg-[var(--color-eda-l)] text-[var(--color-eda)] border-[#A5D6A7]">{g}</th>
                    ))}
                    <th className="p-[5px_7px] text-[9.5px] font-semibold uppercase tracking-[0.4px] border-[0.5px] text-center min-w-[54px]" style={{background:'#1b5e20', color:'#fff', borderColor:'#1b5e20'}}>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-[4px_10px] text-[10.5px] font-semibold border-[0.5px] text-left bg-[var(--color-eda-l)] text-[var(--color-eda)] border-[#A5D6A7]">Casos EDA</td>
                    {eda.map((v, i) => (
                      <td key={`eda-${i}`} className="p-[4px_5px] border-[0.5px] text-center border-[#C8E6C9]">
                        <input type="number" min="0" value={v} onChange={e => handleEdaChange(i, e.target.value)} className="w-[44px] p-[3px_4px] text-[11px] font-[var(--font-mono)] bg-white border-[0.5px] border-[#A5D6A7] focus:border-[var(--color-eda)] rounded-[4px] text-center outline-none" />
                      </td>
                    ))}
                    <td className="p-[4px_5px] border-[0.5px] text-center font-bold font-[var(--font-mono)] text-[13px] bg-[var(--color-eda-l)] text-[var(--color-eda)] border-[#C8E6C9]">{totales.eda}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-[var(--color-ts)] mt-1.5 leading-[1.5]">💡 Usa "⚡ Enviar datos a Ficha 998" desde la pestaña <strong>Cargar RIPS</strong> para autocompletar desde archivos RIPS.</p>
          </div>

          <div className="mb-4">
            <div className="grid grid-cols-3 max-md:grid-cols-1 gap-4">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[1px] text-[var(--color-ts)] mb-2 pb-1 border-b-[0.5px] border-[var(--color-gm)]">2.2 Clasificación</div>
                <div className="flex gap-1.5 flex-wrap">
                  {['sosp', 'prob', 'lab', 'clin', 'nexo'].map(k => (
                    <div key={k} className="flex flex-col gap-[3px] flex-1 min-w-[70px]">
                      <label className="text-[10px] font-medium text-[var(--color-ts)] uppercase tracking-[0.5px]">{k === 'sosp' ? 'Sosp.' : k === 'prob' ? 'Prob.' : k === 'lab' ? 'Conf.Lab.' : k === 'clin' ? 'Conf.Clín.' : 'Nexo Epi.'}</label>
                      <input type="number" min="0" value={datos[k]} onChange={e => setDatos(k, e.target.value)} />
                    </div>
                  ))}
                  <div className="flex flex-col gap-[3px] flex-1 min-w-[50px]">
                    <label className="text-[10px] font-bold text-[var(--color-navy)] uppercase tracking-[0.5px]">TOTAL</label>
                    <div className="text-[18px] font-bold text-[var(--color-navy)] font-[var(--font-mono)] py-1.5">{totales.clasif}</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[1px] text-[var(--color-ts)] mb-2 pb-1 border-b-[0.5px] border-[var(--color-gm)]">2.3 Sexo</div>
                <div className="flex gap-2">
                  <div className="flex flex-col gap-[3px] flex-1">
                    <label className="text-[10px] font-medium text-[var(--color-ts)] uppercase tracking-[0.5px]">Hombres</label>
                    <input type="number" min="0" value={datos.sexh} onChange={e => setDatos('sexh', e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-[3px] flex-1">
                    <label className="text-[10px] font-medium text-[var(--color-ts)] uppercase tracking-[0.5px]">Mujeres</label>
                    <input type="number" min="0" value={datos.sexm} onChange={e => setDatos('sexm', e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-[3px] flex-1">
                    <label className="text-[10px] font-bold text-[var(--color-navy)] uppercase tracking-[0.5px]">Total</label>
                    <div className="text-[18px] font-bold text-[var(--color-navy)] font-[var(--font-mono)] py-1.5">{totales.sex}</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[1px] text-[var(--color-ts)] mb-2 pb-1 border-b-[0.5px] border-[var(--color-gm)]">2.4 Condición Final</div>
                <div className="flex gap-2">
                  <div className="flex flex-col gap-[3px] flex-1">
                    <label className="text-[10px] font-medium text-[var(--color-ts)] uppercase tracking-[0.5px]">Vivos</label>
                    <input type="number" min="0" value={datos.vivos} onChange={e => setDatos('vivos', e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-[3px] flex-1">
                    <label className="text-[10px] font-medium text-[var(--color-ts)] uppercase tracking-[0.5px]">Muertos</label>
                    <input type="number" min="0" value={datos.muertos} onChange={e => setDatos('muertos', e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-[3px] flex-1">
                    <label className="text-[10px] font-bold text-[var(--color-navy)] uppercase tracking-[0.5px]">Total</label>
                    <div className="text-[18px] font-bold text-[var(--color-navy)] font-[var(--font-mono)] py-1.5">{totales.cond}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex gap-2.5 flex-wrap">
              <div className="flex flex-col gap-[3px] flex-1 min-w-[80px] max-w-[120px]">
                <label className="text-[10px] font-medium text-[var(--color-ts)] uppercase tracking-[0.5px]">2.5 Hospitalizados</label>
                <input type="number" min="0" value={datos.hosp} onChange={e => setDatos('hosp', e.target.value)} />
              </div>
              <div className="flex flex-col gap-[3px] flex-1 min-w-[80px] max-w-[120px]">
                <label className="text-[10px] font-medium text-[var(--color-ts)] uppercase tracking-[0.5px]">2.6 Ambulatorios</label>
                <input type="number" min="0" value={datos.amb} onChange={e => setDatos('amb', e.target.value)} />
              </div>
              <div className="flex flex-col gap-[3px] flex-1 min-w-[80px] max-w-[90px]">
                <label className="text-[10px] font-bold text-[var(--color-navy)] uppercase tracking-[0.5px]">Total</label>
                <div className="text-[18px] font-bold text-[var(--color-navy)] font-[var(--font-mono)] py-1.5">{totales.ha}</div>
              </div>
              <div className="flex flex-col gap-[3px] flex-1 min-w-[80px] max-w-[120px]">
                <label className="text-[10px] font-medium text-[var(--color-ts)] uppercase tracking-[0.5px]">2.7 País Proc.</label>
                <input type="text" value={datos.pais} onChange={e => setDatos('pais', e.target.value)} />
              </div>
              <div className="flex flex-col gap-[3px] flex-1 min-w-[80px] max-w-[180px]">
                <label className="text-[10px] font-medium text-[var(--color-ts)] uppercase tracking-[0.5px]">Dpto. Proc.</label>
                <input type="text" value={datos.dptoProc} onChange={e => setDatos('dptoProc', e.target.value)} />
              </div>
              <div className="flex flex-col gap-[3px] flex-1 min-w-[80px] max-w-[160px]">
                <label className="text-[10px] font-medium text-[var(--color-ts)] uppercase tracking-[0.5px]">Mpio. Proc.</label>
                <input type="text" value={datos.mpioProc} onChange={e => setDatos('mpioProc', e.target.value)} />
              </div>
              <div className="flex flex-col gap-[3px] flex-1 min-w-[80px]">
                <label className="text-[10px] font-medium text-[var(--color-ts)] uppercase tracking-[0.5px]">2.8 Barrio / Sector / Brote</label>
                <input type="text" value={datos.barrio} onChange={e => setDatos('barrio', e.target.value)} placeholder="Nombre del brote o barrio" />
              </div>
            </div>
          </div>

          {datos.evento === '901' && (
            <div className="mb-4">
              <div className="text-[10px] font-semibold uppercase tracking-[1px] text-[var(--color-od)] mb-2 pb-1 border-b-[0.5px] border-[var(--color-gm)]">3. Otros Eventos Colectivos — Solo INS 901</div>
              <div className="flex gap-2.5 flex-wrap text-[12px]">
                <label className="flex items-center gap-1"><input type="radio" name="sosp901" value="1" onChange={e => setDatos('sospecha901', e.target.value)} checked={datos.sospecha901 === '1'} /> 1. Síndrome mano, pie, boca</label>
                <label className="flex items-center gap-1"><input type="radio" name="sosp901" value="2" onChange={e => setDatos('sospecha901', e.target.value)} checked={datos.sospecha901 === '2'} /> 2. Conjuntivitis</label>
                <label className="flex items-center gap-1"><input type="radio" name="sosp901" value="4" onChange={e => setDatos('sospecha901', e.target.value)} checked={datos.sospecha901 === '4'} /> 4. Brucelosis</label>
                <label className="flex items-center gap-1"><input type="radio" name="sosp901" value="5" onChange={e => setDatos('sospecha901', e.target.value)} checked={datos.sospecha901 === '5'} /> 5. Hepatitis aguda de origen desconocido</label>
                <label className="flex items-center gap-1"><input type="radio" name="sosp901" value="6" onChange={e => setDatos('sospecha901', e.target.value)} checked={datos.sospecha901 === '6'} /> 6. Otros</label>
              </div>
              <div className="flex gap-2.5 mt-2">
                <div className="flex flex-col gap-[3px] flex-1">
                  <label className="text-[10px] font-medium text-[var(--color-ts)] uppercase tracking-[0.5px]">3.1.2 ¿Cuáles otros?</label>
                  <input type="text" value={datos.otros901} onChange={e => setDatos('otros901', e.target.value)} placeholder="Especificar si marcó Otros" />
                </div>
              </div>
            </div>
          )}

          <div className="mb-4">
            <div className="text-[10px] font-semibold uppercase tracking-[1px] text-[var(--color-ts)] mb-2 pb-1 border-b-[0.5px] border-[var(--color-gm)]">Datos del Notificador</div>
            <div className="flex gap-2.5 flex-wrap mb-2.5">
              <div className="flex flex-col gap-[3px] flex-1 min-w-[80px]">
                <label className="text-[10px] font-medium text-[var(--color-ts)] uppercase tracking-[0.5px]">Nombre responsable<span className="text-[var(--color-rm)] text-[9px]">*</span></label>
                <input type="text" value={datos.notifNom} onChange={e => setDatos('notifNom', e.target.value)} />
              </div>
              <div className="flex flex-col gap-[3px] flex-1 min-w-[80px] max-w-[220px]">
                <label className="text-[10px] font-medium text-[var(--color-ts)] uppercase tracking-[0.5px]">Cargo<span className="text-[var(--color-rm)] text-[9px]">*</span></label>
                <input type="text" value={datos.notifCargo} onChange={e => setDatos('notifCargo', e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2.5 flex-wrap mb-2.5">
              <div className="flex flex-col gap-[3px] flex-1 min-w-[80px] max-w-[180px]">
                <label className="text-[10px] font-medium text-[var(--color-ts)] uppercase tracking-[0.5px]">Teléfono</label>
                <input type="text" value={datos.notifTel} onChange={e => setDatos('notifTel', e.target.value)} />
              </div>
              <div className="flex flex-col gap-[3px] flex-1 min-w-[80px]">
                <label className="text-[10px] font-medium text-[var(--color-ts)] uppercase tracking-[0.5px]">Correo</label>
                <input type="text" value={datos.notifEmail} onChange={e => setDatos('notifEmail', e.target.value)} placeholder="correo@clinicalhouse.co" />
              </div>
            </div>
            <p className="text-[10px] text-[var(--color-ts)] mt-[4px] leading-[1.5]">Correo destino SIVIGILA: <strong>sivigila@ins.gov.co</strong></p>
          </div>

          <div className="bg-[#F1F8F1] border-[0.5px] border-[#A5D6A7] rounded-[var(--radius-r)] p-3 mt-3">
            <h4 className="text-[11px] font-semibold text-[var(--color-eda)] mb-2">Resumen Ficha 998</h4>
            <div className="grid grid-cols-5 max-md:grid-cols-2 gap-2">
              <div className="bg-white border-[0.5px] border-[var(--color-br)] rounded-[6px] p-[8px_10px] text-center">
                <div className="text-[26px] font-semibold font-[var(--font-mono)] text-[var(--color-eda)]">{totales.eda || totales.clasif}</div>
                <div className="text-[10px] text-[var(--color-ts)] leading-[1.3] mt-[2px]">Total casos</div>
              </div>
              <div className="bg-white border-[0.5px] border-[var(--color-br)] rounded-[6px] p-[8px_10px] text-center">
                <div className="text-[26px] font-semibold font-[var(--font-mono)] text-[var(--color-eda)]">{datos.amb}</div>
                <div className="text-[10px] text-[var(--color-ts)] leading-[1.3] mt-[2px]">Ambulatorios</div>
              </div>
              <div className="bg-white border-[0.5px] border-[var(--color-br)] rounded-[6px] p-[8px_10px] text-center">
                <div className="text-[26px] font-semibold font-[var(--font-mono)] text-[#9E9E9E]">0</div>
                <div className="text-[10px] text-[var(--color-ts)] leading-[1.3] mt-[2px]">Hosp. (sin<br/>internación)</div>
              </div>
              <div className="bg-white border-[0.5px] border-[var(--color-br)] rounded-[6px] p-[8px_10px] text-center">
                <div className="text-[26px] font-semibold font-[var(--font-mono)] text-[var(--color-rd)]">{datos.muertos}</div>
                <div className="text-[10px] text-[var(--color-ts)] leading-[1.3] mt-[2px]">Muertos</div>
              </div>
              <div className="bg-white border-[0.5px] border-[var(--color-br)] rounded-[6px] p-[8px_10px] text-center">
                <div className="text-[var(--color-navy)] text-[16px] font-semibold pt-1 font-[var(--font-mono)]">{nombreEvento}</div>
                <div className="text-[10px] text-[var(--color-ts)] leading-[1.3] mt-[2px]">Evento</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap mt-3 print:hidden">
            <button className="px-[13px] py-[7px] rounded-[var(--radius-r)] text-[12px] font-medium cursor-pointer transition-all duration-150 border-[0.5px] font-[var(--font-sans)] bg-[var(--color-eda)] text-white border-[var(--color-eda)] hover:bg-[#1b5e20]" onClick={() => handleDescargar(exportarTXT)}>📄 Exportar TXT</button>
            <button className="px-[13px] py-[7px] rounded-[var(--radius-r)] text-[12px] font-medium cursor-pointer transition-all duration-150 border-[0.5px] font-[var(--font-sans)] bg-[var(--color-eda)] text-white border-[var(--color-eda)] hover:bg-[#1b5e20]" onClick={() => handleDescargar(exportarCSV)}>📊 Exportar CSV</button>
            <button className="px-[13px] py-[7px] rounded-[var(--radius-r)] text-[12px] font-medium cursor-pointer transition-all duration-150 border-[0.5px] font-[var(--font-sans)] bg-[var(--color-gl)] text-[var(--color-ts)] border-[var(--color-gm)] hover:bg-[var(--color-gm)] hover:text-[var(--color-tx)]" onClick={() => window.print()}>🖨️ Imprimir</button>
            <button className="px-[13px] py-[7px] rounded-[var(--radius-r)] text-[12px] font-medium cursor-pointer transition-all duration-150 border-[0.5px] font-[var(--font-sans)] bg-[var(--color-rl)] text-[var(--color-rd)] border-[#F09595] hover:bg-[#f8dcdc]" onClick={handleLimpiar}>Limpiar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
