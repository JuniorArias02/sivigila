import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useFicha995 } from '../hooks/useFicha995';
import { obtenerSemanaEpidemiologica } from '../../../core/utils/formateo';

export function VistaFicha995() {
  const { datos, setDatos, ira, handleIraChange, todas, handleTodasChange, totales, limpiar, cargarImportados, exportarTXT, exportarCSV } = useFicha995();
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
      cargarImportados(location.state.resumen);
      const sin = location.state.resumen.sinI;
      setBannerText(`Importado: ${location.state.importedIra.length} casos IRA por grupo de edad${sin ? ` | ${sin} sin edad` : ''}`);
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

  return (
    <div className="max-w-[1200px] mx-auto px-5 pb-6 pt-4">
      <div className="bg-white border-[0.5px] border-[var(--color-br)] rounded-[var(--radius-rl2)] overflow-hidden mb-3.5">
        <div className="p-[12px_18px] flex items-center justify-between bg-[#0d47a1]">
          <div>
            <h2 className="text-white text-[13px] font-semibold">Ficha Notificación Colectiva · Morbilidad por IRA</h2>
            <span className="text-white/55 text-[10.5px]">FOR-R02.0000-076 V:04 2024-03-01 · Cód. INS 995</span>
          </div>
          <span className="bg-[var(--color-ira-l)] text-[var(--color-ira)] px-2.5 py-[3px] rounded-[20px] text-[11px] font-bold font-[var(--font-mono)]">Cód. 995</span>
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
              <div className="flex flex-col gap-[3px] flex-1 min-w-[80px] max-w-[60px]">
                <label className="text-[10px] font-medium text-[var(--color-ts)] uppercase tracking-[0.5px]">Dpto.<span className="text-[var(--color-rm)] text-[9px]">*</span></label>
                <input type="text" value={datos.dpto} onChange={e => setDatos('dpto', e.target.value)} maxLength="2" />
              </div>
              <div className="flex flex-col gap-[3px] flex-1 min-w-[80px] max-w-[70px]">
                <label className="text-[10px] font-medium text-[var(--color-ts)] uppercase tracking-[0.5px]">Mpio.<span className="text-[var(--color-rm)] text-[9px]">*</span></label>
                <input type="text" value={datos.mpio} onChange={e => setDatos('mpio', e.target.value)} maxLength="3" />
              </div>
              <div className="flex flex-col gap-[3px] flex-1 min-w-[80px] max-w-[110px]">
                <label className="text-[10px] font-medium text-[var(--color-ts)] uppercase tracking-[0.5px]">Código IPS<span className="text-[var(--color-rm)] text-[9px]">*</span></label>
                <input type="text" value={datos.codigo} onChange={e => setDatos('codigo', e.target.value)} placeholder="######" />
              </div>
              <div className="flex flex-col gap-[3px] flex-1 min-w-[80px] max-w-[60px]">
                <label className="text-[10px] font-medium text-[var(--color-ts)] uppercase tracking-[0.5px]">Sub Índ.</label>
                <input type="text" value={datos.sub} onChange={e => setDatos('sub', e.target.value)} maxLength="2" />
              </div>
              <div className="flex flex-col gap-[3px] flex-1 min-w-[80px]">
                <label className="text-[10px] font-medium text-[var(--color-ts)] uppercase tracking-[0.5px]">1.2 Razón social UPGD<span className="text-[var(--color-rm)] text-[9px]">*</span></label>
                <input type="text" value={datos.razon} onChange={e => setDatos('razon', e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2.5 flex-wrap mb-2.5">
              <div className="flex flex-col gap-[3px] flex-1 min-w-[80px] max-w-[140px]">
                <label className="text-[10px] font-medium text-[var(--color-ts)] uppercase tracking-[0.5px]">1.3 Fecha notificación<span className="text-[var(--color-rm)] text-[9px]">*</span></label>
                <input type="text" value={datos.fecha} onChange={e => setDatos('fecha', e.target.value)} placeholder="dd/mm/aaaa" />
                <div className="text-[9.5px] text-[var(--color-ts)] leading-[1.4] mt-[2px]">Último día SE</div>
              </div>
              <div className="flex flex-col gap-[3px] flex-1 min-w-[80px] max-w-[90px]">
                <label className="text-[10px] font-medium text-[var(--color-ts)] uppercase tracking-[0.5px]">1.4 SE<span className="text-[var(--color-rm)] text-[9px]">*</span></label>
                <input type="number" value={datos.se} onChange={e => setDatos('se', e.target.value)} min="1" max="53" />
              </div>
              <div className="flex flex-col gap-[3px] flex-1 min-w-[80px] max-w-[90px]">
                <label className="text-[10px] font-medium text-[var(--color-ts)] uppercase tracking-[0.5px]">1.5 Año<span className="text-[var(--color-rm)] text-[9px]">*</span></label>
                <input type="number" value={datos.anio} onChange={e => setDatos('anio', e.target.value)} />
              </div>
              <div className="flex flex-col gap-[3px] flex-1 min-w-[80px] max-w-[60px]">
                <label className="text-[10px] font-medium text-[var(--color-ts)] uppercase tracking-[0.5px]">Dpto. notif.</label>
                <input type="text" value={datos.dpto2} onChange={e => setDatos('dpto2', e.target.value)} maxLength="2" />
              </div>
              <div className="flex flex-col gap-[3px] flex-1 min-w-[80px] max-w-[70px]">
                <label className="text-[10px] font-medium text-[var(--color-ts)] uppercase tracking-[0.5px]">Mpio. notif.</label>
                <input type="text" value={datos.mpio2} onChange={e => setDatos('mpio2', e.target.value)} maxLength="3" />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-[10px] font-semibold uppercase tracking-[1px] text-[var(--color-ts)] mb-2 pb-1 border-b-[0.5px] border-[var(--color-gm)]">2. Consulta Semana a Archivos RIPS — Grupos de Edad</div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr>
                    <th className="p-[5px_10px] text-[9.5px] font-semibold uppercase tracking-[0.4px] border-[0.5px] text-left min-w-[190px] bg-[var(--color-ira-l)] text-[#fff] border-[#90CAF9]" style={{background: '#0d47a1'}}>Servicio / CIE-10</th>
                    <th className="p-[5px_7px] text-[9.5px] font-semibold uppercase tracking-[0.4px] border-[0.5px] text-center bg-[var(--color-ira-l)] text-[var(--color-ira)] border-[#90CAF9]">&lt;1</th>
                    <th className="p-[5px_7px] text-[9.5px] font-semibold uppercase tracking-[0.4px] border-[0.5px] text-center bg-[var(--color-ira-l)] text-[var(--color-ira)] border-[#90CAF9]">1</th>
                    <th className="p-[5px_7px] text-[9.5px] font-semibold uppercase tracking-[0.4px] border-[0.5px] text-center bg-[var(--color-ira-l)] text-[var(--color-ira)] border-[#90CAF9]">2–4</th>
                    <th className="p-[5px_7px] text-[9.5px] font-semibold uppercase tracking-[0.4px] border-[0.5px] text-center bg-[var(--color-ira-l)] text-[var(--color-ira)] border-[#90CAF9]">5–19</th>
                    <th className="p-[5px_7px] text-[9.5px] font-semibold uppercase tracking-[0.4px] border-[0.5px] text-center bg-[var(--color-ira-l)] text-[var(--color-ira)] border-[#90CAF9]">20–39</th>
                    <th className="p-[5px_7px] text-[9.5px] font-semibold uppercase tracking-[0.4px] border-[0.5px] text-center bg-[var(--color-ira-l)] text-[var(--color-ira)] border-[#90CAF9]">40–59</th>
                    <th className="p-[5px_7px] text-[9.5px] font-semibold uppercase tracking-[0.4px] border-[0.5px] text-center bg-[var(--color-ira-l)] text-[var(--color-ira)] border-[#90CAF9]">≥60</th>
                    <th className="p-[5px_7px] text-[9.5px] font-semibold uppercase tracking-[0.4px] border-[0.5px] text-center min-w-[54px]" style={{background:'#B0C4DE', color:'#0d47a1', borderColor:'#91aed4'}}>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td rowSpan="2" className="p-[4px_10px] text-[10.5px] font-bold border-[0.5px] text-left align-middle bg-[#C9E0FF] text-[#0d47a1] border-[#BBDEFB]">MORBILIDAD POR IRA<br/><small className="font-normal text-[9px]">Consulta Ext. + Urgencias</small></td>
                    <td colSpan="8" className="p-[3px_10px_3px_18px] text-[10px] text-[var(--color-ts)] italic border-[0.5px] text-left bg-[#F0F7FF] border-[#BBDEFB]">Total IRA consulta externa y urgencias (J00–J22, U071–U072)</td>
                  </tr>
                  <tr>
                    {[0,1,2,3,4,5,6].map(i => (
                      <td key={`ira-${i}`} className="p-[4px_5px] border-[0.5px] text-center align-middle border-[#BBDEFB]">
                        <input type="number" min="0" value={ira[i]} onChange={e => handleIraChange(i, e.target.value)} className="w-[44px] p-[3px_4px] text-[11px] font-[var(--font-mono)] bg-white border-[0.5px] border-[#90CAF9] focus:border-[var(--color-ira)] rounded-[4px] text-center outline-none" />
                      </td>
                    ))}
                    <td className="p-[4px_5px] border-[0.5px] text-center align-middle font-bold font-[var(--font-mono)] text-[13px] bg-[var(--color-ira-l)] text-[var(--color-ira)] border-[#BBDEFB]">{totales.ira}</td>
                  </tr>
                  <tr>
                    <td rowSpan="2" className="p-[4px_10px] border-[0.5px] border-[#BBDEFB] bg-[#C9E0FF] text-[#0d47a1] border-t-[#90CAF9] align-middle"></td>
                    <td colSpan="8" className="p-[3px_10px_3px_18px] text-[10px] text-[var(--color-ts)] italic border-[0.5px] text-left bg-[#F0F7FF] border-[#BBDEFB]">Total consultas externas y urgencias (todas las causas)</td>
                  </tr>
                  <tr>
                    {[0,1,2,3,4,5,6].map(i => (
                      <td key={`tod-${i}`} className="p-[4px_5px] border-[0.5px] text-center align-middle border-[#BBDEFB]">
                        <input type="number" min="0" value={todas[i]} onChange={e => handleTodasChange(i, e.target.value)} className="w-[44px] p-[3px_4px] text-[11px] font-[var(--font-mono)] bg-white border-[0.5px] border-[#90CAF9] focus:border-[var(--color-ira)] rounded-[4px] text-center outline-none" />
                      </td>
                    ))}
                    <td className="p-[4px_5px] border-[0.5px] text-center align-middle font-bold font-[var(--font-mono)] text-[13px] bg-[var(--color-ira-l)] text-[var(--color-ira)] border-[#BBDEFB]">{totales.todas}</td>
                  </tr>
                  <tr>
                    <td colSpan="9" className="p-[6px_10px] border-[0.5px] bg-[#F8F8F8] text-[var(--color-ts)] text-[10px] italic">
                      🏥 Hospitalización IRAG, UCI por IRAG y Muertes por IRAG = <strong>0</strong> (IPS sin hospitalización).
                      Todas las causas de hospitalización, UCI y muerte = <strong>0</strong>. Se reportarán como cero en la ficha SIVIGILA.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-[var(--color-ts)] mt-2 leading-[1.5]">💡 Usa el botón "⚡ Enviar datos a Ficha 995" desde la pestaña <strong>Cargar RIPS</strong> para autocompletar por grupo de edad desde los archivos RIPS.</p>
          </div>

          <div className="mb-4">
            <div className="text-[10px] font-semibold uppercase tracking-[1px] text-[var(--color-ts)] mb-2 pb-1 border-b-[0.5px] border-[var(--color-gm)]">3. Datos del Notificador</div>
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
                <label className="text-[10px] font-medium text-[var(--color-ts)] uppercase tracking-[0.5px]">Correo electrónico</label>
                <input type="text" value={datos.notifEmail} onChange={e => setDatos('notifEmail', e.target.value)} placeholder="correo@clinicalhouse.co" />
              </div>
            </div>
            <p className="text-[10px] text-[var(--color-ts)] mt-[4px] leading-[1.5]">Correo destino SIVIGILA: <strong>sivigila@ins.gov.co</strong></p>
          </div>

          <div className="bg-[var(--color-gl)] border-[0.5px] border-[var(--color-gm)] rounded-[var(--radius-r)] p-3 mt-3">
            <h4 className="text-[11px] font-semibold text-[var(--color-navy)] mb-2">Resumen Ficha 995</h4>
            <div className="grid grid-cols-4 max-sm:grid-cols-2 gap-2">
              <div className="bg-white border-[0.5px] border-[var(--color-br)] rounded-[6px] p-[8px_10px] text-center">
                <div className="text-[26px] font-semibold font-[var(--font-mono)] text-[var(--color-ira)]">{totales.ira}</div>
                <div className="text-[10px] text-[var(--color-ts)] leading-[1.3] mt-[2px]">IRA Consulta Ext.<br/>+ Urgencias</div>
              </div>
              <div className="bg-white border-[0.5px] border-[var(--color-br)] rounded-[6px] p-[8px_10px] text-center">
                <div className="text-[26px] font-semibold font-[var(--font-mono)] text-[var(--color-ts)]">{totales.todas}</div>
                <div className="text-[10px] text-[var(--color-ts)] leading-[1.3] mt-[2px]">Total consultas<br/>todas causas</div>
              </div>
              <div className="bg-white border-[0.5px] border-[var(--color-br)] rounded-[6px] p-[8px_10px] text-center">
                <div className="text-[26px] font-semibold font-[var(--font-mono)] text-[#9E9E9E]">0</div>
                <div className="text-[10px] text-[var(--color-ts)] leading-[1.3] mt-[2px]">UCI IRAG<br/>(sin hosp.)</div>
              </div>
              <div className="bg-white border-[0.5px] border-[var(--color-br)] rounded-[6px] p-[8px_10px] text-center">
                <div className="text-[26px] font-semibold font-[var(--font-mono)] text-[#9E9E9E]">0</div>
                <div className="text-[10px] text-[var(--color-ts)] leading-[1.3] mt-[2px]">Muertes IRAG<br/>(sin hosp.)</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap mt-3 print:hidden">
            <button className="px-[13px] py-[7px] rounded-[var(--radius-r)] text-[12px] font-medium cursor-pointer transition-all duration-150 border-[0.5px] font-[var(--font-sans)] bg-[var(--color-ira)] text-white border-[var(--color-ira)] hover:bg-[#0d4fa3]" onClick={() => handleDescargar(exportarTXT)}>📄 Exportar TXT</button>
            <button className="px-[13px] py-[7px] rounded-[var(--radius-r)] text-[12px] font-medium cursor-pointer transition-all duration-150 border-[0.5px] font-[var(--font-sans)] bg-[var(--color-ira)] text-white border-[var(--color-ira)] hover:bg-[#0d4fa3]" onClick={() => handleDescargar(exportarCSV)}>📊 Exportar CSV</button>
            <button className="px-[13px] py-[7px] rounded-[var(--radius-r)] text-[12px] font-medium cursor-pointer transition-all duration-150 border-[0.5px] font-[var(--font-sans)] bg-[var(--color-gl)] text-[var(--color-ts)] border-[var(--color-gm)] hover:bg-[var(--color-gm)] hover:text-[var(--color-tx)]" onClick={() => window.print()}>🖨️ Imprimir</button>
            <button className="px-[13px] py-[7px] rounded-[var(--radius-r)] text-[12px] font-medium cursor-pointer transition-all duration-150 border-[0.5px] font-[var(--font-sans)] bg-[var(--color-rl)] text-[var(--color-rd)] border-[#F09595] hover:bg-[#f8dcdc]" onClick={handleLimpiar}>Limpiar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
