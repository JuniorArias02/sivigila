import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAnalizadorBai } from '../hooks/useAnalizadorBai';
import { obtenerSemanaEpidemiologica } from '../../../core/utils/formateo';

const BADGES = {
  SI: <span className="inline-block px-[7px] py-[2px] rounded-[10px] text-[10px] font-medium whitespace-nowrap bg-[var(--color-rl)] text-[var(--color-rd)]">Superinmediata ≤6h</span>,
  I: <span className="inline-block px-[7px] py-[2px] rounded-[10px] text-[10px] font-medium whitespace-nowrap bg-[var(--color-ol)] text-[var(--color-od)]">Inmediata ≤15h</span>,
  S: <span className="inline-block px-[7px] py-[2px] rounded-[10px] text-[10px] font-medium whitespace-nowrap bg-[var(--color-al)] text-[var(--color-ad)]">Semanal — lunes</span>
};

const ACCIONES = {
  SI: <span className="text-[10px] leading-[1.4] text-[var(--color-rd)] font-medium">Verificar HOY · ≤6h · Doble verificación</span>,
  I: <span className="text-[10px] leading-[1.4] text-[var(--color-od)]">Verificar médico · ≤15h</span>,
  S: <span className="text-[10px] leading-[1.4] text-[var(--color-ad)]">Reporte próximo lunes</span>
};

export function VistaBai() {
  const { resultados, metricas, evList, filtro, setFiltro, analizar, limpiar, exportarCSV, exportarTXT } = useAnalizadorBai();
  const [cieText, setCieText] = useState('');
  const [sem, setSem] = useState('');
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [sede, setSede] = useState('PAMI');
  const navigate = useNavigate();
  const location = useLocation();
  const [toast, setToast] = useState({ show: false, msg: '', type: 'info' });

  useEffect(() => {
    setSem(obtenerSemanaEpidemiologica());
  }, []);

  // Recibir CIEs desde la tab RIPS si se envían por state de React Router
  useEffect(() => {
    if (location.state?.cieCodes) {
      setCieText(location.state.cieCodes);
      setTimeout(() => {
        analizar(location.state.cieCodes);
        window.history.replaceState({}, document.title) // limpiar state
      }, 100);
    }
  }, [location.state, analizar]);

  const showToast = (msg, type = 'info') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'info' }), 3500);
  };

  const handleAnalizar = () => {
    const res = analizar(cieText);
    if (res.error) showToast(res.error, 'warn');
  };

  const handleEjemplo = () => {
    const texto = 'G820:CC:27894298\nJ219:CC:1093603352\nA150:CC:60335055\nA920:TI:1093782530\nB24X:CC:37393074\nA514:CC:88232586\nB181:CC:27667587\nM069:CC:60282435\nA90X:CC:1005052161\nI64X:CC:60424862\nR509\nA91X:CC:13473704';
    setCieText(texto);
    setSem(10);
    setTimeout(() => analizar(texto), 0);
  };

  const handleDescargar = (fn) => {
    const file = fn(sem, anio, sede);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\uFEFF' + file.data], { type: file.type + ';charset=utf-8' }));
    a.download = file.filename;
    a.click();
  };

  const copiarTabla = () => {
    let txt = 'BAI-EISP v7 — IPS Clinical House\n\nCategoría\tCIE-10\tEvento\tCód.\tTipo Doc.\tN° Doc\n';
    resultados.forEach(r => txt += (r.cat === 'SI' ? 'SUPERINMEDIATA' : r.cat === 'I' ? 'INMEDIATA' : 'SEMANAL') + '\t' + r.cie + '\t' + r.evento + '\t' + r.cod + '\t' + (r.tipo || '') + '\t' + (r.doc || '') + '\n');
    navigator.clipboard.writeText(txt).then(() => showToast('Tabla copiada al portapapeles', 'ok')).catch(() => showToast('No se pudo copiar', 'err'));
  };

  const filResultados = filtro === 'all' ? resultados : resultados.filter(r => r.cat === filtro);
  const showIds = metricas.ira > 0 || metricas.eda > 0;
  const isAnalizado = metricas.total > 0;

  return (
    <div className="max-w-[1200px] mx-auto px-5 pb-6 grid grid-cols-[300px_1fr] max-md:grid-cols-1 gap-4 items-start pt-4">
      <aside>
        <div className="bg-white border-[0.5px] border-[var(--color-br)] rounded-[var(--radius-rl2)] overflow-hidden mb-3">
          <div className="bg-[var(--color-navy)] px-4 py-[11px]">
            <h2 className="text-white text-[13px] font-medium">Datos del período</h2>
            <p className="text-white/45 text-[11px] mt-[2px] leading-[1.4]">Semana epidemiológica, sede y diagnósticos.</p>
          </div>
          <div className="p-4">
            <div className="mb-[11px]">
              <span className="text-[11px] font-medium text-[var(--color-ts)] uppercase tracking-[0.8px] mb-[5px] block">Semana / Año</span>
              <div className="flex gap-2 items-center">
                <input type="number" min="1" max="53" value={sem} onChange={e => setSem(e.target.value)} className="w-[68px]" />
                <span className="leading-[30px] text-[12px] text-[var(--color-ts)]">/</span>
                <input type="number" value={anio} onChange={e => setAnio(e.target.value)} className="w-[76px]" />
              </div>
            </div>
            <div className="mb-[11px]">
              <span className="text-[11px] font-medium text-[var(--color-ts)] uppercase tracking-[0.8px] mb-[5px] block">Sede</span>
              <select value={sede} onChange={e => setSede(e.target.value)} className="w-full">
                <option>PAMI</option><option>Quinta Vélez</option><option>Caobos</option>
                <option>Domiciliaria</option><option>Todas las sedes</option>
              </select>
            </div>
            <div className="mb-[11px]">
              <span className="text-[11px] font-medium text-[var(--color-ts)] uppercase tracking-[0.8px] mb-[5px] block">Diagnósticos CIE-10</span>
              <div className="bg-[var(--color-bl)] border-[0.5px] border-[#85B7EB] rounded-[var(--radius-r)] py-2 px-[11px] mb-2 text-[10.5px] text-[var(--color-bd)] leading-[1.75]">
                <strong>Formatos aceptados:</strong><br/>
                Solo: <code className="bg-black/10 rounded-[3px] px-1 py-[1px] font-[var(--font-mono)] text-[10px]">J219</code> &nbsp; 
                Varios: <code className="bg-black/10 rounded-[3px] px-1 py-[1px] font-[var(--font-mono)] text-[10px]">A920, G820</code><br/>
                Con doc: <code className="bg-black/10 rounded-[3px] px-1 py-[1px] font-[var(--font-mono)] text-[10px]">J219:CC:27894298</code><br/>
                Separar con coma, punto y coma o salto de línea.
              </div>
              <textarea 
                placeholder="A920:CC:1093603352&#10;J219:CC:60335055&#10;A150, B24X, M069"
                value={cieText}
                onChange={e => setCieText(e.target.value)}
              />
            </div>
            <div className="flex gap-1.5 flex-wrap mt-2">
              <button className="px-[13px] py-[7px] rounded-[var(--radius-r)] text-[12px] font-medium cursor-pointer transition-all duration-150 border-[0.5px] font-[var(--font-sans)] bg-[var(--color-navy)] text-white border-[var(--color-navy)] hover:bg-[#0a2236] flex-1" onClick={handleAnalizar}>Analizar RIPS</button>
              <button className="px-[13px] py-[7px] rounded-[var(--radius-r)] text-[12px] font-medium cursor-pointer transition-all duration-150 border-[0.5px] font-[var(--font-sans)] bg-[var(--color-gl)] text-[var(--color-ts)] border-[var(--color-gm)] hover:bg-[var(--color-gm)] hover:text-[var(--color-tx)]" onClick={handleEjemplo}>Ejemplo</button>
              <button className="px-[13px] py-[7px] rounded-[var(--radius-r)] text-[12px] font-medium cursor-pointer transition-all duration-150 border-[0.5px] font-[var(--font-sans)] bg-[var(--color-rl)] text-[var(--color-rd)] border-[#F09595] hover:bg-[#f8dcdc]" onClick={() => {setCieText(''); limpiar();}}>Limpiar</button>
            </div>
          </div>
        </div>
        
        <div className="bg-white border-[0.5px] border-[var(--color-br)] rounded-[var(--radius-rl2)] overflow-hidden mb-3">
          <div className="px-4 py-[11px]" style={{background: '#1e3d0e'}}><h2 className="text-[#C0DD97] text-[13px] font-medium">Categorías · N. Santander 2026</h2></div>
          <div className="p-2.5 px-3.5">
            <table className="w-full mt-2 border-collapse text-[10.5px]">
              <tbody>
                <tr>
                  <td className="p-1 px-[7px] border-b-[0.5px] border-[var(--color-br)] align-top"><span className="bg-[var(--color-rl)] text-[var(--color-rd)] rounded-[4px] px-[5px] py-[2px] font-medium whitespace-nowrap inline-block text-[10px]">SUPERINMEDIATA ≤6h</span></td>
                  <td className="p-1 px-[7px] border-b-[0.5px] border-[var(--color-br)] align-top text-[var(--color-ts)] text-[10px]">Sarampión, Rubéola, Tosferina, Difteria, Fiebre Amarilla, Dengue Grave, Parálisis Flácida, Rabia Humana, Cólera, Meningitis Bacteriana, Morbilidad Materna Extrema, Ébola, MPOX, Acc. Ofídico, Desnutrición Aguda, Ev. Adverso Vacunación</td>
                </tr>
                <tr>
                  <td className="p-1 px-[7px] border-b-[0.5px] border-[var(--color-br)] align-top"><span className="bg-[var(--color-ol)] text-[var(--color-od)] rounded-[4px] px-[5px] py-[2px] font-medium whitespace-nowrap inline-block text-[10px]">INMEDIATA ≤15h</span></td>
                  <td className="p-1 px-[7px] border-b-[0.5px] border-[var(--color-br)] align-top text-[var(--color-ts)] text-[10px]">ESI-IRAG Centinela, IRA Virus Nuevo, IRAG Inusitada, Mortalidad Materna, Tétanos Neonatal, Sínd. Rubéola Congénita, Leishmaniasis Visceral, Brotes ETA, Rabia Animal, Violencias de Género</td>
                </tr>
                <tr>
                  <td className="p-1 px-[7px] align-top"><span className="bg-[var(--color-al)] text-[var(--color-ad)] rounded-[4px] px-[5px] py-[2px] font-medium whitespace-nowrap inline-block text-[10px]">SEMANAL (lunes)</span></td>
                  <td className="p-1 px-[7px] align-top text-[var(--color-ts)] text-[10px]">Chikungunya, Dengue, ZIKA, TB, VIH/SIDA, Hepatitis, Malaria, Leptospirosis, Sífilis, Parotiditis, Varicela · <strong>IRA 995 · EDA 998</strong></td>
                </tr>
              </tbody>
            </table>
            <div className="mt-2 p-[7px] bg-[var(--color-rl)] rounded-[5px] text-[var(--color-rd)] text-[10px] leading-[1.5]">PRIMER FILTRO — Doble verificación diagnóstica del Coordinador SP antes de notificar.</div>
          </div>
        </div>
      </aside>

      <main>
        <div className="grid grid-cols-4 max-sm:grid-cols-2 gap-2 mb-2.5">
          <div className="bg-white border-[0.5px] border-[var(--color-br)] rounded-[var(--radius-r)] py-2.5 px-2 text-center">
            <div className="text-[22px] font-medium font-[var(--font-mono)] text-[var(--color-navy)]">{isAnalizado ? metricas.total : '—'}</div>
            <div className="text-[10px] text-[var(--color-ts)] mt-[2px] leading-[1.3]">Códigos<br/>ingresados</div>
          </div>
          <div className="bg-white border-[0.5px] border-[var(--color-br)] rounded-[var(--radius-r)] py-2.5 px-2 text-center">
            <div className="text-[22px] font-medium font-[var(--font-mono)] text-[var(--color-rm)]">{isAnalizado ? metricas.si : '—'}</div>
            <div className="text-[10px] text-[var(--color-ts)] mt-[2px] leading-[1.3]">Superinmediata<br/>≤6h</div>
          </div>
          <div className="bg-white border-[0.5px] border-[var(--color-br)] rounded-[var(--radius-r)] py-2.5 px-2 text-center">
            <div className="text-[22px] font-medium font-[var(--font-mono)] text-[var(--color-om)]">{isAnalizado ? metricas.i : '—'}</div>
            <div className="text-[10px] text-[var(--color-ts)] mt-[2px] leading-[1.3]">Inmediata<br/>≤15h</div>
          </div>
          <div className="bg-white border-[0.5px] border-[var(--color-br)] rounded-[var(--radius-r)] py-2.5 px-2 text-center">
            <div className="text-[22px] font-medium font-[var(--font-mono)] text-[var(--color-am)]">{isAnalizado ? metricas.s : '—'}</div>
            <div className="text-[10px] text-[var(--color-ts)] mt-[2px] leading-[1.3]">Semanal<br/>(lunes)</div>
          </div>
        </div>

        {showIds && (
          <div className="grid grid-cols-2 gap-2 mb-2.5">
            <div className="bg-white border-[0.5px] border-[var(--color-br)] rounded-[var(--radius-r)] py-2.5 px-3 flex flex-col gap-[2px] border-l-[3px] border-l-[var(--color-ira)]">
              <span className="text-[28px] font-medium font-[var(--font-mono)] text-[var(--color-ira)]">{metricas.ira}</span>
              <span className="text-[11px] text-[var(--color-ts)] leading-[1.3]">Morbilidad por <strong>IRA</strong></span>
              <span className="text-[10px] font-medium px-1.5 py-[1px] rounded-[9px] inline-block mt-[2px] w-fit bg-[var(--color-ira-l)] text-[var(--color-ira)]">Cód. 995</span>
            </div>
            <div className="bg-white border-[0.5px] border-[var(--color-br)] rounded-[var(--radius-r)] py-2.5 px-3 flex flex-col gap-[2px] border-l-[3px] border-l-[var(--color-eda)]">
              <span className="text-[28px] font-medium font-[var(--font-mono)] text-[var(--color-eda)]">{metricas.eda}</span>
              <span className="text-[11px] text-[var(--color-ts)] leading-[1.3]">Morbilidad por <strong>EDA</strong></span>
              <span className="text-[10px] font-medium px-1.5 py-[1px] rounded-[9px] inline-block mt-[2px] w-fit bg-[var(--color-eda-l)] text-[var(--color-eda)]">Cód. 998</span>
            </div>
          </div>
        )}

        {isAnalizado && resultados.length > 0 && (
          <div className="bg-white border-[0.5px] border-[var(--color-br)] rounded-[var(--radius-rl2)] overflow-hidden mb-3">
            <div className="py-2 px-3.5 border-b-[0.5px] border-[var(--color-br)] flex items-center justify-between">
              <h4 className="text-[12px] font-medium text-[var(--color-tx)]">Cuantificación por evento</h4>
              <span className="text-[10px] text-[var(--color-ts)]">Casos por tipo de EISP</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[11.5px]">
                <thead>
                  <tr>
                    <th className="text-left px-[9px] py-[5px] text-[10px] font-medium uppercase tracking-[0.6px] text-[var(--color-ts)] border-b-[0.5px] border-[var(--color-br)] bg-[var(--color-gl)] w-[55px]">Casos</th>
                    <th className="text-left px-[9px] py-[5px] text-[10px] font-medium uppercase tracking-[0.6px] text-[var(--color-ts)] border-b-[0.5px] border-[var(--color-br)] bg-[var(--color-gl)]">Evento EISP</th>
                    <th className="text-left px-[9px] py-[5px] text-[10px] font-medium uppercase tracking-[0.6px] text-[var(--color-ts)] border-b-[0.5px] border-[var(--color-br)] bg-[var(--color-gl)] w-[70px]">Cód.</th>
                    <th className="text-left px-[9px] py-[5px] text-[10px] font-medium uppercase tracking-[0.6px] text-[var(--color-ts)] border-b-[0.5px] border-[var(--color-br)] bg-[var(--color-gl)] w-[100px]">Categoría</th>
                  </tr>
                </thead>
                <tbody>
                  {evList.map(e => (
                    <tr key={e.cod} className="hover:bg-[var(--color-gl)]">
                      <td className="px-[9px] py-1.5 border-b-[0.5px] border-black/5 align-middle">
                        <span className={`font-[var(--font-mono)] text-[13px] font-semibold min-w-[32px] inline-block text-center px-1.5 py-[1px] rounded-[5px] ${e.cat === 'SI' ? 'bg-[var(--color-rl)] text-[var(--color-rd)]' : e.cat === 'I' ? 'bg-[var(--color-ol)] text-[var(--color-od)]' : 'bg-[var(--color-al)] text-[var(--color-ad)]'}`}>{e.n}</span>
                      </td>
                      <td className="px-[9px] py-1.5 border-b-[0.5px] border-black/5 align-middle">
                        <div className="text-[11px] text-[var(--color-tx)]">{e.evento}</div>
                      </td>
                      <td className="px-[9px] py-1.5 border-b-[0.5px] border-black/5 align-middle">
                        <span className="text-[10px] text-[var(--color-ts)] font-[var(--font-mono)]">{e.cod}</span>
                      </td>
                      <td className="px-[9px] py-1.5 border-b-[0.5px] border-black/5 align-middle">{BADGES[e.cat]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mb-2.5 flex flex-col gap-[7px]">
          {metricas.si > 0 && <div className="rounded-[var(--radius-r)] py-[9px] px-3 text-[12px] leading-[1.5] flex gap-[9px] items-start bg-[var(--color-rl)] border-[0.5px] border-[#F09595] text-[var(--color-rd)]"><span className="font-bold text-[14px]">!</span><div><strong>SUPERINMEDIATA ≤6h:</strong> {metricas.si} código(s). Verificar HOY y notificar ≤6h.</div></div>}
          {metricas.i > 0 && <div className="rounded-[var(--radius-r)] py-[9px] px-3 text-[12px] leading-[1.5] flex gap-[9px] items-start bg-[var(--color-ol)] border-[0.5px] border-[#F0997B] text-[var(--color-od)]"><span className="font-bold text-[14px]">!</span><div><strong>INMEDIATA ≤15h:</strong> {metricas.i} código(s). Verificar con médico y notificar ≤15h.</div></div>}
          {metricas.s > 0 && <div className="rounded-[var(--radius-r)] py-[9px] px-3 text-[12px] leading-[1.5] flex gap-[9px] items-start bg-[var(--color-al)] border-[0.5px] border-[#FAC775] text-[var(--color-ad)]"><span>i</span><div><strong>SEMANAL:</strong> {metricas.s} código(s) para el reporte del próximo lunes.</div></div>}
          {isAnalizado && metricas.si === 0 && metricas.i === 0 && metricas.s === 0 && <div className="rounded-[var(--radius-r)] py-[9px] px-3 text-[12px] leading-[1.5] flex gap-[9px] items-start bg-[var(--color-tl)] border-[0.5px] border-[#5DCAA5] text-[var(--color-td)]"><span>✓</span><div>Sin EISP en los {metricas.total} códigos analizados. Conservar como evidencia del BAI.</div></div>}
        </div>

        <div className="bg-white border-[0.5px] border-[var(--color-br)] rounded-[var(--radius-rl2)] overflow-hidden">
          <div className="py-2.5 px-3.5 border-b-[0.5px] border-[var(--color-br)] flex items-center justify-between flex-wrap gap-[7px]">
            <h3 className="text-[13px] font-medium">{isAnalizado ? (resultados.length ? `${resultados.length} EISP detectados de ${metricas.total} códigos` : 'Sin EISP detectados') : 'Resultados del análisis'}</h3>
            
            {resultados.length > 0 && (
              <div className="flex gap-[5px] flex-wrap items-center print:hidden">
                <span className="text-[11px] text-[var(--color-ts)]">Filtrar:</span>
                <button className={`px-[9px] py-[3px] rounded-[20px] text-[11px] font-medium cursor-pointer border-[0.5px] transition-all duration-100 font-[var(--font-sans)] ${filtro === 'all' ? 'bg-[var(--color-navy)] text-white border-[var(--color-navy)]' : 'bg-[var(--color-gl)] text-[var(--color-ts)] border-[var(--color-gm)] hover:bg-[var(--color-gm)]'}`} onClick={() => setFiltro('all')}>Todos</button>
                <button className={`px-[9px] py-[3px] rounded-[20px] text-[11px] font-medium cursor-pointer border-[0.5px] transition-all duration-100 font-[var(--font-sans)] ${filtro === 'SI' ? 'bg-[var(--color-rl)] text-[var(--color-rd)] border-[#F09595]' : 'bg-[var(--color-gl)] text-[var(--color-ts)] border-[var(--color-gm)] hover:bg-[var(--color-gm)]'}`} onClick={() => setFiltro('SI')}>Superinmediata</button>
                <button className={`px-[9px] py-[3px] rounded-[20px] text-[11px] font-medium cursor-pointer border-[0.5px] transition-all duration-100 font-[var(--font-sans)] ${filtro === 'I' ? 'bg-[var(--color-ol)] text-[var(--color-od)] border-[#F0997B]' : 'bg-[var(--color-gl)] text-[var(--color-ts)] border-[var(--color-gm)] hover:bg-[var(--color-gm)]'}`} onClick={() => setFiltro('I')}>Inmediata</button>
                <button className={`px-[9px] py-[3px] rounded-[20px] text-[11px] font-medium cursor-pointer border-[0.5px] transition-all duration-100 font-[var(--font-sans)] ${filtro === 'S' ? 'bg-[var(--color-al)] text-[var(--color-ad)] border-[#FAC775]' : 'bg-[var(--color-gl)] text-[var(--color-ts)] border-[var(--color-gm)] hover:bg-[var(--color-gm)]'}`} onClick={() => setFiltro('S')}>Semanal</button>
              </div>
            )}
          </div>

          {!isAnalizado ? (
            <div className="text-center py-8 px-5 text-[var(--color-ts)] text-[13px]">
              <div className="text-[28px] mb-2">🔍</div>
              <div className="font-medium text-[var(--color-tx)] mb-1">Pega los códigos CIE-10 y presiona "Analizar RIPS"</div>
              <div className="text-[11px]">v7.0 · Lector RIPS automático · Fichas 995 y 998 · Norte de Santander 2026</div>
            </div>
          ) : resultados.length === 0 ? (
            <div className="text-center py-8 px-5 text-[var(--color-ts)] text-[13px]">
              <div className="text-[28px] mb-2">✅</div>
              <div className="font-medium text-[var(--color-td)] mb-1">Sin EISP detectados</div>
              <div className="text-[11px]">Conservar como evidencia del BAI en el SGC.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[11.5px]">
                <thead>
                  <tr>
                    <th className="text-left px-[9px] py-1.5 text-[10px] font-medium uppercase tracking-[0.6px] text-[var(--color-ts)] border-b-[0.5px] border-[var(--color-br)] bg-[var(--color-gl)] whitespace-nowrap w-[78px]">Fecha</th>
                    <th className="text-left px-[9px] py-1.5 text-[10px] font-medium uppercase tracking-[0.6px] text-[var(--color-ts)] border-b-[0.5px] border-[var(--color-br)] bg-[var(--color-gl)] whitespace-nowrap w-[115px]">N° Documento</th>
                    <th className="text-left px-[9px] py-1.5 text-[10px] font-medium uppercase tracking-[0.6px] text-[var(--color-ts)] border-b-[0.5px] border-[var(--color-br)] bg-[var(--color-gl)] whitespace-nowrap w-[145px]">CIE-10</th>
                    <th className="text-left px-[9px] py-1.5 text-[10px] font-medium uppercase tracking-[0.6px] text-[var(--color-ts)] border-b-[0.5px] border-[var(--color-br)] bg-[var(--color-gl)] whitespace-nowrap w-[175px]">Evento EISP</th>
                    <th className="text-left px-[9px] py-1.5 text-[10px] font-medium uppercase tracking-[0.6px] text-[var(--color-ts)] border-b-[0.5px] border-[var(--color-br)] bg-[var(--color-gl)] whitespace-nowrap w-[55px]">Cód.</th>
                    <th className="text-left px-[9px] py-1.5 text-[10px] font-medium uppercase tracking-[0.6px] text-[var(--color-ts)] border-b-[0.5px] border-[var(--color-br)] bg-[var(--color-gl)] whitespace-nowrap w-[115px]">Categoría</th>
                    <th className="text-left px-[9px] py-1.5 text-[10px] font-medium uppercase tracking-[0.6px] text-[var(--color-ts)] border-b-[0.5px] border-[var(--color-br)] bg-[var(--color-gl)] whitespace-nowrap">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filResultados.map((r, i) => (
                    <tr key={i} className="hover:bg-[var(--color-gl)]">
                      <td className="px-[9px] py-[7px] border-b-[0.5px] border-black/5 align-top text-[11px] text-[var(--color-ts)]">{r.fecha}</td>
                      <td className="px-[9px] py-[7px] border-b-[0.5px] border-black/5 align-top">
                        {r.doc ? (
                          <>
                            <div className="font-[var(--font-mono)] text-[11px] font-medium text-[var(--color-tx)]">{r.doc}</div>
                            {r.tipo && <div className="text-[10px] text-[var(--color-ts)]">{r.tipo}</div>}
                          </>
                        ) : <span className="text-[var(--color-ts)] text-[10px]">—</span>}
                      </td>
                      <td className="px-[9px] py-[7px] border-b-[0.5px] border-black/5 align-top">
                        <span className="font-[var(--font-mono)] text-[11px] font-medium text-[var(--color-navy)] bg-[var(--color-bl)] px-[5px] py-[1px] rounded-[4px] whitespace-nowrap inline-block mb-[2px]">{r.cie}</span>
                      </td>
                      <td className="px-[9px] py-[7px] border-b-[0.5px] border-black/5 align-top">
                        <div className="text-[11px] text-[var(--color-tx)]">{r.evento}</div>
                        <div className="text-[10px] text-[var(--color-ts)] font-[var(--font-mono)]">Cód. {r.cod}</div>
                      </td>
                      <td className="px-[9px] py-[7px] border-b-[0.5px] border-black/5 align-top">
                        <span className="text-[10px] text-[var(--color-ts)] font-[var(--font-mono)]">{r.cod}</span>
                      </td>
                      <td className="px-[9px] py-[7px] border-b-[0.5px] border-black/5 align-top">{BADGES[r.cat]}</td>
                      <td className="px-[9px] py-[7px] border-b-[0.5px] border-black/5 align-top">{ACCIONES[r.cat]}</td>
                    </tr>
                  ))}
                  {filResultados.length === 0 && (
                    <tr><td colSpan="7" className="text-center p-5 text-[var(--color-ts)]">Sin resultados para este filtro.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {resultados.length > 0 && (
            <div className="p-2 px-3.5 border-t-[0.5px] border-[var(--color-br)] flex gap-[7px] flex-wrap bg-[var(--color-gl)] print:hidden">
              <button className="px-[13px] py-[7px] rounded-[var(--radius-r)] text-[12px] font-medium cursor-pointer transition-all duration-150 border-[0.5px] font-[var(--font-sans)] bg-[var(--color-tl)] text-[var(--color-td)] border-[#5DCAA5] hover:bg-[#c2efdd]" onClick={() => handleDescargar(exportarCSV)}>Exportar CSV</button>
              <button className="px-[13px] py-[7px] rounded-[var(--radius-r)] text-[12px] font-medium cursor-pointer transition-all duration-150 border-[0.5px] font-[var(--font-sans)] bg-[var(--color-tl)] text-[var(--color-td)] border-[#5DCAA5] hover:bg-[#c2efdd]" onClick={() => handleDescargar(exportarTXT)}>Exportar TXT</button>
              <button className="px-[13px] py-[7px] rounded-[var(--radius-r)] text-[12px] font-medium cursor-pointer transition-all duration-150 border-[0.5px] font-[var(--font-sans)] bg-[var(--color-gl)] text-[var(--color-ts)] border-[var(--color-gm)] hover:bg-[var(--color-gm)] hover:text-[var(--color-tx)]" onClick={copiarTabla}>Copiar tabla</button>
              <button className="px-[13px] py-[7px] rounded-[var(--radius-r)] text-[12px] font-medium cursor-pointer transition-all duration-150 border-[0.5px] font-[var(--font-sans)] bg-[var(--color-gl)] text-[var(--color-ts)] border-[var(--color-gm)] hover:bg-[var(--color-gm)] hover:text-[var(--color-tx)]" onClick={() => window.print()}>Imprimir</button>
              <button className="px-[13px] py-[7px] rounded-[var(--radius-r)] text-[12px] font-medium cursor-pointer transition-all duration-150 border-[0.5px] font-[var(--font-sans)] bg-[var(--color-ira)] text-white border-[var(--color-ira)] hover:bg-[#0d4fa3]" onClick={() => navigate('/ficha-995')}>→ Ficha 995</button>
              <button className="px-[13px] py-[7px] rounded-[var(--radius-r)] text-[12px] font-medium cursor-pointer transition-all duration-150 border-[0.5px] font-[var(--font-sans)] bg-[var(--color-eda)] text-white border-[var(--color-eda)] hover:bg-[#1b5e20]" onClick={() => navigate('/ficha-998')}>→ Ficha 998</button>
            </div>
          )}
        </div>
      </main>

      {/* Toast Notification */}
      <div className={`fixed bottom-5 right-5 px-4 py-2.5 rounded-lg text-[12px] z-[9999] shadow-[0_4px_12px_rgba(0,0,0,.2)] transition-opacity duration-300 pointer-events-none max-w-[380px] ${toast.show ? 'opacity-100' : 'opacity-0'} ${toast.type === 'info' ? 'bg-[#7B1FA2] text-white' : toast.type === 'ok' ? 'bg-[#1b5e20] text-white' : toast.type === 'err' ? 'bg-[#B71C1C] text-white' : 'bg-[#E65100] text-white'}`}>
        {toast.msg}
      </div>
    </div>
  );
}
