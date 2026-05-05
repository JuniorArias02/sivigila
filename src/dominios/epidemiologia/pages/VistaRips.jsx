import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLectorRips } from '../hooks/useLectorRips';
import { obtenerSemanaEpidemiologica } from '../../../core/utils/formateo';

export function VistaRips() {
  const { archivos, logs, resumen, datosRips, procesarArchivos, limpiar } = useLectorRips();
  const [isDrag, setIsDrag] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const [sem, setSem] = useState('');
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [toast, setToast] = useState({ show: false, msg: '', type: 'info' });

  useEffect(() => {
    setSem(obtenerSemanaEpidemiologica());
  }, []);

  const showToast = (msg, type = 'info') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'info' }), 3500);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDrag(false);
    procesarArchivos(e.dataTransfer.files).then((data) => {
      if (data && data.rows.length) {
        showToast(`RIPS procesados: ${data.ira.length} IRA - ${data.eda.length} EDA`, 'ok');
      }
    });
  };

  const handleFileChange = (e) => {
    procesarArchivos(e.target.files).then((data) => {
      if (data && data.rows.length) {
        showToast(`RIPS procesados: ${data.ira.length} IRA - ${data.eda.length} EDA`, 'ok');
      }
    });
  };

  const handleEnviarA995 = () => {
    if (!datosRips.ira.length) {
      showToast('Sin datos IRA en los RIPS.', 'warn');
      return;
    }
    navigate('/ficha-995', { state: { importedIra: datosRips.ira, resumen: resumen } });
  };

  const handleEnviarA998 = () => {
    if (!datosRips.eda.length) {
      showToast('Sin datos EDA en los RIPS.', 'warn');
      return;
    }
    navigate('/ficha-998', { state: { importedEda: datosRips.eda, resumen: resumen } });
  };

  const handleEnviarABai = () => {
    if (!datosRips.allCie.length) {
      showToast('Sin CIE-10 cargados.', 'warn');
      return;
    }
    
    const seen = {};
    const lineas = [];
    datosRips.rows.forEach(r => {
      const key = r.cie + '|' + (r.doc || '');
      if (seen[key]) return;
      seen[key] = true;
      let linea = r.cie;
      if (r.doc) {
        linea += ':' + (r.td || 'CC') + ':' + r.doc;
      }
      lineas.push(linea);
    });

    navigate('/bai', { state: { cieCodes: lineas.join('\n') } });
  };

  const L995 = ['<1', '1', '2-4', '5-19', '20-39', '40-59', '≥60'];
  const L998 = ['<1a', '1-4a', '5-9a', '10-14a', '15-19a', '20-24a', '25-29a', '30-34a', '35-39a', '40-44a', '45-49a', '50-54a', '55-59a', '60-64a', '65-69a', '70-74a', '75-79a', '≥80a'];

  const mxI = resumen ? Math.max(...resumen.edaIRA, 1) : 1;
  const mxE = resumen ? Math.max(...resumen.edaEDA, 1) : 1;

  return (
    <div className="max-w-[1200px] mx-auto px-5 pb-6 pt-4">
      
      <div 
        className={`border-[2px] border-dashed rounded-[12px] p-[28px_20px] text-center cursor-pointer transition-all duration-200 mb-4 ${isDrag ? 'border-[#7B1FA2] bg-[#EDE7F6]' : 'border-[#B39DDB] bg-[#F3E5F5] hover:border-[#7B1FA2] hover:bg-[#EDE7F6]'}`}
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
        onDragLeave={() => setIsDrag(false)}
        onDrop={handleDrop}
      >
        <input type="file" ref={inputRef} multiple accept=".xlsx,.xls,.csv,.txt" className="hidden" onChange={handleFileChange} />
        <div className="text-[36px] mb-2">📁</div>
        <h3 className="text-[14px] font-semibold text-[#4A148C] mb-1">Arrastra tu archivo Excel RIPS aquí o haz clic para seleccionar</h3>
        <p className="text-[11px] text-[#7B1FA2] leading-[1.6]">
          Acepta el reporte Excel de la IPS: <code className="bg-[#CE93D8] text-[#4A148C] px-[5px] py-[1px] rounded-[3px] font-[var(--font-mono)] text-[10.5px]">.xlsx</code> / <code className="bg-[#CE93D8] text-[#4A148C] px-[5px] py-[1px] rounded-[3px] font-[var(--font-mono)] text-[10.5px]">.xls</code><br />
          Columnas que reconoce: <code className="bg-[#CE93D8] text-[#4A148C] px-[5px] py-[1px] rounded-[3px] font-[var(--font-mono)] text-[10.5px]">Dx Sal.</code> &nbsp; <code className="bg-[#CE93D8] text-[#4A148C] px-[5px] py-[1px] rounded-[3px] font-[var(--font-mono)] text-[10.5px]">Años</code> &nbsp; <code className="bg-[#CE93D8] text-[#4A148C] px-[5px] py-[1px] rounded-[3px] font-[var(--font-mono)] text-[10.5px]">Fecha Nac.</code> &nbsp; <code className="bg-[#CE93D8] text-[#4A148C] px-[5px] py-[1px] rounded-[3px] font-[var(--font-mono)] text-[10.5px]">Grupo Edad</code> &nbsp; <code className="bg-[#CE93D8] text-[#4A148C] px-[5px] py-[1px] rounded-[3px] font-[var(--font-mono)] text-[10.5px]">Sexo</code><br />
          También acepta archivos RIPS estándar <code className="bg-[#CE93D8] text-[#4A148C] px-[5px] py-[1px] rounded-[3px] font-[var(--font-mono)] text-[10.5px]">.txt</code> / <code className="bg-[#CE93D8] text-[#4A148C] px-[5px] py-[1px] rounded-[3px] font-[var(--font-mono)] text-[10.5px]">.csv</code> separados por <code className="bg-[#CE93D8] text-[#4A148C] px-[5px] py-[1px] rounded-[3px] font-[var(--font-mono)] text-[10.5px]">|</code> o <code className="bg-[#CE93D8] text-[#4A148C] px-[5px] py-[1px] rounded-[3px] font-[var(--font-mono)] text-[10.5px]">;</code> o <code className="bg-[#CE93D8] text-[#4A148C] px-[5px] py-[1px] rounded-[3px] font-[var(--font-mono)] text-[10.5px]">,</code>
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-3.5">
        {archivos.map((a, idx) => (
          <div key={idx} className={`flex items-center gap-[6px] border-[0.5px] rounded-[20px] px-3 py-1 text-[11px] ${a.estado === 'ok' ? 'border-[#5DCAA5] bg-[var(--color-tl)] text-[var(--color-td)]' : a.estado === 'err' ? 'border-[#F09595] bg-[var(--color-rl)] text-[var(--color-rd)]' : 'border-[#B39DDB] bg-[#F3E5F5] text-[#4A148C]'}`}>
            {a.estado === 'ok' ? '✓' : a.estado === 'err' ? '✗' : '...'} {a.msg ? a.msg : a.nombre}
          </div>
        ))}
      </div>

      {logs.length > 0 && (
        <div className="bg-[#1A1A18] rounded-[var(--radius-r)] p-[12px_14px] font-[var(--font-mono)] text-[11px] text-[#A8FF78] leading-[1.7] max-h-[180px] overflow-y-auto mb-3.5">
          {logs.map((log, i) => <div key={i}>{log}</div>)}
        </div>
      )}

      {resumen && (
        <div className="bg-white border-[0.5px] border-[var(--color-br)] rounded-[var(--radius-rl2)] overflow-hidden mb-3.5">
          <div className="bg-[#4A148C] p-[10px_16px] flex items-center justify-between">
            <h3 className="text-white text-[13px] font-semibold">Resumen RIPS procesados</h3>
            <span className="text-[#CE93D8] text-[11px]">SE {sem} / {anio}</span>
          </div>
          <div className="grid grid-cols-5 max-md:grid-cols-3 border-b-[0.5px] border-[var(--color-br)]">
            <div className="p-[12px_10px] text-center border-r-[0.5px] border-[var(--color-br)]">
              <div className="text-[26px] font-semibold font-[var(--font-mono)] text-[#0D2B45]">{resumen.nTotal}</div>
              <div className="text-[10px] text-[var(--color-ts)] leading-[1.3] mt-[2px]">Total<br/>registros</div>
            </div>
            <div className="p-[12px_10px] text-center border-r-[0.5px] border-[var(--color-br)]">
              <div className="text-[26px] font-semibold font-[var(--font-mono)] text-[#1565C0]">{resumen.nIRA}</div>
              <div className="text-[10px] text-[var(--color-ts)] leading-[1.3] mt-[2px]">Casos IRA<br/>(J00-J22)</div>
            </div>
            <div className="p-[12px_10px] text-center border-r-[0.5px] border-[var(--color-br)]">
              <div className="text-[26px] font-semibold font-[var(--font-mono)] text-[#2E7D32]">{resumen.nEDA}</div>
              <div className="text-[10px] text-[var(--color-ts)] leading-[1.3] mt-[2px]">Casos EDA<br/>(A0xx/K52x/K59x)</div>
            </div>
            <div className="p-[12px_10px] text-center border-r-[0.5px] border-[var(--color-br)]">
              <div className="text-[26px] font-semibold font-[var(--font-mono)] text-[#EF9F27]">{resumen.nEISP}</div>
              <div className="text-[10px] text-[var(--color-ts)] leading-[1.3] mt-[2px]">Con EISP<br/>detectado</div>
            </div>
            <div className="p-[12px_10px] text-center">
              <div className="text-[26px] font-semibold font-[var(--font-mono)] text-[#E24B4A]">{resumen.nSI}</div>
              <div className="text-[10px] text-[var(--color-ts)] leading-[1.3] mt-[2px]">Superinmediata<br/>≤6h</div>
            </div>
          </div>
          <div className="grid grid-cols-2 max-md:grid-cols-1">
            <div className="p-[14px_16px] border-r-[0.5px] border-[var(--color-br)] max-md:border-r-0 max-md:border-b-[0.5px]">
              <h4 className="text-[11px] font-semibold mb-2.5 text-[#1565C0]">IRA por grupo de edad (Ficha 995)</h4>
              {L995.map((lbl, i) => (
                <div key={i} className="flex items-center gap-2 mb-[5px]">
                  <span className="text-[10px] text-[var(--color-ts)] w-[55px] text-right shrink-0">{lbl}</span>
                  <div className="flex-1 h-[14px] bg-[var(--color-gl)] rounded-[4px] overflow-hidden">
                    <div className="h-full rounded-[4px] transition-all duration-400 bg-[var(--color-ira)]" style={{width: `${Math.round(resumen.edaIRA[i]/mxI*100)}%`}}></div>
                  </div>
                  <span className="text-[10px] font-[var(--font-mono)] font-medium w-[28px] text-right shrink-0 text-[var(--color-ira)]">{resumen.edaIRA[i]}</span>
                </div>
              ))}
              {resumen.sinI > 0 && <p className="text-[10px] text-[var(--color-ts)] mt-1.5">{resumen.sinI} registros sin edad - no asignados</p>}
            </div>
            <div className="p-[14px_16px]">
              <h4 className="text-[11px] font-semibold mb-2.5 text-[#2E7D32]">EDA por grupo de edad (Ficha 998)</h4>
              {L998.map((lbl, i) => (
                <div key={i} className="flex items-center gap-2 mb-[5px]">
                  <span className="text-[10px] text-[var(--color-ts)] w-[55px] text-right shrink-0">{lbl}</span>
                  <div className="flex-1 h-[14px] bg-[var(--color-gl)] rounded-[4px] overflow-hidden">
                    <div className="h-full rounded-[4px] transition-all duration-400 bg-[var(--color-eda)]" style={{width: `${Math.round(resumen.edaEDA[i]/mxE*100)}%`}}></div>
                  </div>
                  <span className="text-[10px] font-[var(--font-mono)] font-medium w-[28px] text-right shrink-0 text-[var(--color-eda)]">{resumen.edaEDA[i]}</span>
                </div>
              ))}
              {resumen.sinE > 0 && <p className="text-[10px] text-[var(--color-ts)] mt-1.5">{resumen.sinE} registros sin edad - no asignados</p>}
            </div>
          </div>
          <div className="p-[12px_16px] flex gap-2 flex-wrap bg-[var(--color-gl)] border-t-[0.5px] border-[var(--color-br)]">
            <button className="px-[13px] py-[7px] rounded-[var(--radius-r)] text-[12px] font-medium cursor-pointer transition-all duration-150 border-[0.5px] font-[var(--font-sans)] bg-[var(--color-ira)] text-white border-[var(--color-ira)] hover:bg-[#0d4fa3]" onClick={handleEnviarA995}>⚡ Enviar a Ficha 995 · IRA</button>
            <button className="px-[13px] py-[7px] rounded-[var(--radius-r)] text-[12px] font-medium cursor-pointer transition-all duration-150 border-[0.5px] font-[var(--font-sans)] bg-[var(--color-eda)] text-white border-[var(--color-eda)] hover:bg-[#1b5e20]" onClick={handleEnviarA998}>⚡ Enviar a Ficha 998 · EDA</button>
            <button className="px-[13px] py-[7px] rounded-[var(--radius-r)] text-[12px] font-medium cursor-pointer transition-all duration-150 border-[0.5px] font-[var(--font-sans)] bg-[var(--color-navy)] text-white border-[var(--color-navy)] hover:bg-[#0a2236]" onClick={handleEnviarABai}>⚡ Enviar CIE-10 al BAI-EISP</button>
            <button className="px-[13px] py-[7px] rounded-[var(--radius-r)] text-[12px] font-medium cursor-pointer transition-all duration-150 border-[0.5px] font-[var(--font-sans)] bg-[var(--color-rl)] text-[var(--color-rd)] border-[#F09595] hover:bg-[#f8dcdc]" onClick={limpiar}>Limpiar</button>
          </div>
        </div>
      )}

      <div className="bg-white border-[0.5px] border-[var(--color-br)] rounded-[12px] p-4 mt-4">
        <div className="text-[10px] font-semibold uppercase tracking-[1px] text-[var(--color-ts)] mb-2.5 pb-[5px] border-b-[0.5px] border-[var(--color-gm)]">Columnas reconocidas en el Excel de la IPS</div>
        <table className="w-full text-[11px] border-collapse">
          <tbody>
            <tr>
              <td className="p-[4px_8px] text-[#4A148C] font-semibold w-[130px]">Dx Sal.</td>
              <td className="p-[4px_8px] text-[var(--color-ts)]">Diagnóstico principal — columna obligatoria</td>
            </tr>
            <tr className="bg-[#F3E5F5]">
              <td className="p-[4px_8px] text-[#4A148C] font-semibold">Años</td>
              <td className="p-[4px_8px] text-[var(--color-ts)]">Edad del paciente en años — prioridad 1 para distribución por grupo</td>
            </tr>
            <tr>
              <td className="p-[4px_8px] text-[#4A148C] font-semibold">Fecha Nac.</td>
              <td className="p-[4px_8px] text-[var(--color-ts)]">Fecha de nacimiento — prioridad 2 (calcula edad automáticamente)</td>
            </tr>
            <tr className="bg-[#F3E5F5]">
              <td className="p-[4px_8px] text-[#4A148C] font-semibold">Grupo Edad</td>
              <td className="p-[4px_8px] text-[var(--color-ts)]">Grupo RIPS (000-001, 001-004, etc.) — prioridad 3</td>
            </tr>
            <tr>
              <td className="p-[4px_8px] text-[#4A148C] font-semibold">Sexo, TD, Beneficiario</td>
              <td className="p-[4px_8px] text-[var(--color-ts)]">Datos adicionales del paciente</td>
            </tr>
          </tbody>
        </table>
        <p className="text-[10px] text-[var(--color-ts)] mt-2">Puedes subir varios archivos a la vez (por ejemplo una sede diferente cada uno). Los datos se acumulan.</p>
      </div>

      {/* Toast Notification */}
      <div className={`fixed bottom-5 right-5 px-4 py-2.5 rounded-lg text-[12px] z-[9999] shadow-[0_4px_12px_rgba(0,0,0,.2)] transition-opacity duration-300 pointer-events-none max-w-[380px] ${toast.show ? 'opacity-100' : 'opacity-0'} ${toast.type === 'info' ? 'bg-[#7B1FA2] text-white' : toast.type === 'ok' ? 'bg-[#1b5e20] text-white' : toast.type === 'err' ? 'bg-[#B71C1C] text-white' : toast.type === 'warn' ? 'bg-[#E65100] text-white' : ''}`}>
        {toast.msg}
      </div>
    </div>
  );
}
