import { useState } from 'react';
import { DB_CIE10, PATRONES } from '../resources/baseDatosCie10';

export function useAnalizadorBai() {
  const [resultados, setResultados] = useState([]);
  const [metricas, setMetricas] = useState({ total: 0, si: 0, i: 0, s: 0, ira: 0, eda: 0 });
  const [evList, setEvList] = useState([]);
  const [filtro, setFiltro] = useState('all');
  
  const parsear = (raw) => {
    const hoy = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const items = [];
    raw.split(/[,;\n\r]+/).map(s => s.trim()).filter(Boolean).forEach(line => {
      const p = line.split(':').map(s => s.trim());
      let cie = '', doc = '', tipo = '';
      if (p.length === 1) cie = p[0];
      else if (p.length === 2) { cie = p[0]; doc = p[1]; }
      else { cie = p[0]; tipo = p[1]; doc = p[2]; }
      cie = cie.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (cie.length >= 3) items.push({ cie, doc, tipo, fecha: hoy });
    });
    return items;
  };

  const analizar = (raw) => {
    if (!raw) return { error: 'Pega los diagnósticos primero.' };
    const items = parsear(raw);
    
    const nuevosResultados = [];
    items.forEach(it => {
      if (DB_CIE10[it.cie]) {
        const [cat, evento, cod] = DB_CIE10[it.cie].split('|');
        nuevosResultados.push({ ...it, cat, evento, cod });
      }
    });

    const ord = { SI: 0, I: 1, S: 2 };
    nuevosResultados.sort((a, b) => (ord[a.cat] || 2) - (ord[b.cat] || 2) || a.cie.localeCompare(b.cie));
    
    const nSI = nuevosResultados.filter(r => r.cat === 'SI').length;
    const nI = nuevosResultados.filter(r => r.cat === 'I').length;
    const nS = nuevosResultados.filter(r => r.cat === 'S').length;
    
    let nIRA = 0, nEDA = 0;
    items.forEach(it => {
      if (PATRONES.IRA.test(it.cie)) nIRA++;
      if (PATRONES.EDA.test(it.cie)) nEDA++;
    });

    const evMap = {};
    nuevosResultados.forEach(r => {
      const k = r.evento + '|||' + r.cod + '|||' + r.cat;
      if (!evMap[k]) evMap[k] = { evento: r.evento, cod: r.cod, cat: r.cat, n: 0 };
      evMap[k].n++;
    });
    
    const newEvList = Object.values(evMap).sort((a, b) => (ord[a.cat] || 2) - (ord[b.cat] || 2) || b.n - a.n);

    setResultados(nuevosResultados);
    setEvList(newEvList);
    setMetricas({ total: items.length, si: nSI, i: nI, s: nS, ira: nIRA, eda: nEDA });
    setFiltro('all');
    
    return { success: true };
  };

  const limpiar = () => {
    setResultados([]);
    setEvList([]);
    setMetricas({ total: 0, si: 0, i: 0, s: 0, ira: 0, eda: 0 });
    setFiltro('all');
  };

  const exportarCSV = (sem, anio, sede) => {
    let csv = '\uFEFFCategoría,Cód.SIVIGILA,CIE-10,Evento EISP,Tipo Doc.,N° Documento,Fecha,SE,Año,Sede\n';
    resultados.forEach(r => {
      const cat = r.cat === 'SI' ? 'SUPERINMEDIATA ≤6h' : r.cat === 'I' ? 'INMEDIATA ≤15h' : 'SEMANAL';
      csv += `"${cat}","${r.cod}","${r.cie}","${r.evento.replace(/"/g, '""')}","${r.tipo || ''}","${r.doc || ''}","${r.fecha || ''}","${sem}","${anio}","${sede}"\n`;
    });
    return { data: csv, filename: `BAI_EISP_v7_SE${sem}_${anio}.csv`, type: 'text/csv' };
  };

  const exportarTXT = (sem, anio, sede) => {
    let txt = `IPS CLINICAL HOUSE S.A.S. · BAI-EISP v7 · SE${sem}/${anio}\nSede: ${sede} | ${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}\n${'═'.repeat(55)}\n\n`;
    ['SI', 'I', 'S'].forEach(cat => {
      const gr = resultados.filter(r => r.cat === cat);
      if (!gr.length) return;
      txt += (cat === 'SI' ? 'SUPERINMEDIATA ≤6h' : cat === 'I' ? 'INMEDIATA ≤15h' : 'SEMANAL') + ':\n' + '─'.repeat(40) + '\n';
      gr.forEach(r => {
        txt += `  ${r.cie.padEnd(7)} Cód.${r.cod.padEnd(10)}${r.doc ? `Doc:${r.tipo ? r.tipo + ':' : ''}${r.doc} ` : ''}${r.evento}\n`;
      });
      txt += '\n';
    });
    txt += `${'═'.repeat(55)}\nCoordinador SP: Josue Jesus Perez Espinel\n`;
    return { data: txt, filename: `BAI_EISP_v7_SE${sem}_${anio}.txt`, type: 'text/plain' };
  };

  return {
    resultados,
    metricas,
    evList,
    filtro,
    setFiltro,
    analizar,
    limpiar,
    exportarCSV,
    exportarTXT
  };
}
