import { useState, useEffect } from 'react';

export function useFicha995() {
  const [datos, setDatos] = useState({
    dpto: '54', mpio: '001', codigo: '', sub: '0', razon: 'IPS Clinical House S.A.S.',
    fecha: '', se: '', anio: new Date().getFullYear(), dpto2: '54', mpio2: '001',
    notifNom: 'Josue Jesus Perez Espinel', notifCargo: 'Coordinador de Salud Pública',
    notifTel: '316 834 3174', notifEmail: ''
  });

  const [ira, setIra] = useState(new Array(7).fill(0));
  const [todas, setTodas] = useState(new Array(7).fill(0));
  
  const [totales, setTotales] = useState({ ira: 0, todas: 0 });

  useEffect(() => {
    setTotales({
      ira: ira.reduce((acc, v) => acc + (parseInt(v) || 0), 0),
      todas: todas.reduce((acc, v) => acc + (parseInt(v) || 0), 0)
    });
  }, [ira, todas]);

  const handleChangeDato = (key, val) => {
    setDatos(prev => ({ ...prev, [key]: val }));
  };

  const handleIraChange = (index, val) => {
    const newIra = [...ira];
    newIra[index] = val;
    setIra(newIra);
  };

  const handleTodasChange = (index, val) => {
    const newTodas = [...todas];
    newTodas[index] = val;
    setTodas(newTodas);
  };

  const limpiar = () => {
    setIra(new Array(7).fill(0));
    setTodas(new Array(7).fill(0));
  };

  const cargarImportados = (resumen) => {
    if (resumen && resumen.edaIRA) {
      setIra(resumen.edaIRA);
    }
  };

  const exportarTXT = () => {
    const L = ['<1', '1', '2-4', '5-19', '20-39', '40-59', '>=60'];
    let txt = 'SIVIGILA - FICHA 995 - Morbilidad por IRA\n';
    txt += `UPGD: ${datos.razon} | SE: ${datos.se} | Año: ${datos.anio} | Fecha: ${datos.fecha}\n`;
    txt += '='.repeat(70) + '\n\n';
    txt += 'Indicador'.padEnd(45) + L.map(l => l.padStart(6)).join('') + '  TOTAL\n';
    txt += '-'.repeat(70) + '\n';
    txt += 'IRA CE y Urgencias (J00-J22)'.padEnd(45) + ira.map(v => String(v).padStart(6)).join('') + '  ' + totales.ira + '\n';
    txt += 'Total CE y Urgencias'.padEnd(45) + todas.map(v => String(v).padStart(6)).join('') + '  ' + totales.todas + '\n';
    txt += 'Hospitalizaciones IRAG / UCI IRAG / Muertes = 0 (IPS sin hospitalización)\n\n';
    txt += `Notificador: ${datos.notifNom}\nCorreo SIVIGILA: sivigila@ins.gov.co\n`;
    return { data: txt, filename: `Ficha995_SE${datos.se}_${datos.anio}.txt`, type: 'text/plain' };
  };

  const exportarCSV = () => {
    let csv = '\uFEFFCodigo,UPGD,SE,Año,Indicador,<1,1,2-4,5-19,20-39,40-59,>=60,TOTAL\n';
    csv += `"995","${datos.razon}","${datos.se}","${datos.anio}","IRA CE y Urgencias J00-J22",${ira.join(',')},${totales.ira}\n`;
    csv += `"995","${datos.razon}","${datos.se}","${datos.anio}","Total CE y Urgencias",${todas.join(',')},${totales.todas}\n`;
    ['Hospitalizaciones IRAG', 'Total hospitalizaciones', 'UCI IRAG', 'Total UCI', 'Muertes IRAG', 'Total muertes'].forEach(l => {
      csv += `"995","${datos.razon}","${datos.se}","${datos.anio}","${l}",0,0,0,0,0,0,0,0\n`;
    });
    return { data: csv, filename: `Ficha995_SE${datos.se}_${datos.anio}.csv`, type: 'text/csv' };
  };

  return {
    datos, setDatos: handleChangeDato,
    ira, handleIraChange,
    todas, handleTodasChange,
    totales,
    limpiar, cargarImportados,
    exportarTXT, exportarCSV
  };
}
