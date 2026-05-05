import { useState, useEffect } from 'react';

export function useFicha998() {
  const [datos, setDatos] = useState({
    evento: '998', fecha: '', se: '', anio: new Date().getFullYear(),
    dpto: '54', mpio: '001', cod: '', sub: '0', razon: 'IPS Clinical House S.A.S.',
    sosp: 0, prob: 0, lab: 0, clin: 0, nexo: 0,
    sexh: 0, sexm: 0, vivos: 0, muertos: 0, hosp: 0, amb: 0,
    pais: 'Colombia', dptoProc: 'Norte de Santander', mpioProc: 'Cúcuta', barrio: '',
    otros901: '', sospecha901: '',
    notifNom: 'Josue Jesus Perez Espinel', notifCargo: 'Coordinador de Salud Pública',
    notifTel: '316 834 3174', notifEmail: ''
  });

  const [eda, setEda] = useState(new Array(18).fill(0));
  
  const [totales, setTotales] = useState({ eda: 0, clasif: 0, sex: 0, cond: 0, ha: 0 });

  useEffect(() => {
    setTotales({
      eda: eda.reduce((acc, v) => acc + (parseInt(v) || 0), 0),
      clasif: (parseInt(datos.sosp) || 0) + (parseInt(datos.prob) || 0) + (parseInt(datos.lab) || 0) + (parseInt(datos.clin) || 0) + (parseInt(datos.nexo) || 0),
      sex: (parseInt(datos.sexh) || 0) + (parseInt(datos.sexm) || 0),
      cond: (parseInt(datos.vivos) || 0) + (parseInt(datos.muertos) || 0),
      ha: (parseInt(datos.hosp) || 0) + (parseInt(datos.amb) || 0)
    });
  }, [eda, datos]);

  const handleChangeDato = (key, val) => {
    setDatos(prev => ({ ...prev, [key]: val }));
  };

  const handleEdaChange = (index, val) => {
    const newEda = [...eda];
    newEda[index] = val;
    setEda(newEda);
  };

  const limpiar = () => {
    setEda(new Array(18).fill(0));
    setDatos(prev => ({
      ...prev,
      sosp: 0, prob: 0, lab: 0, clin: 0, nexo: 0,
      sexh: 0, sexm: 0, vivos: 0, muertos: 0, hosp: 0, amb: 0
    }));
  };

  const cargarImportados = (resumen, totalAmb) => {
    if (resumen && resumen.edaEDA) {
      setEda(resumen.edaEDA);
      handleChangeDato('amb', totalAmb);
    }
  };

  const exportarTXT = () => {
    const L = ['<1a', '1-4a', '5-9a', '10-14a', '15-19a', '20-24a', '25-29a', '30-34a', '35-39a', '40-44a', '45-49a', '50-54a', '55-59a', '60-64a', '65-69a', '70-74a', '75-79a', '>=80a'];
    const evMap = { 998: '998 · Morbilidad por EDA', 830: '830 · Varicela Colectivo', 621: '621 · Parotiditis Colectivo', 901: '901 · Evento Colectivo Sin Establecer' };
    let txt = 'SIVIGILA - FICHA NOTIFICACION COLECTIVA\n' + evMap[datos.evento] + '\n';
    txt += `UPGD: ${datos.razon} | SE: ${datos.se} | Año: ${datos.anio}\n` + '='.repeat(70) + '\n\n';
    txt += 'GRUPO DE EDAD:\n';
    L.forEach((l, i) => {
      const v = parseInt(eda[i]) || 0;
      if (v) txt += `  ${l.padEnd(8)}: ${v}\n`;
    });
    txt += `TOTAL: ${totales.eda || totales.clasif}\n\n`;
    txt += `Clasificación: Sosp=${datos.sosp} Prob=${datos.prob} ConfLab=${datos.lab} ConfClin=${datos.clin} Nexo=${datos.nexo}\n`;
    txt += `Sexo: H=${datos.sexh} M=${datos.sexm}\n`;
    txt += `Condición: Vivos=${datos.vivos} Muertos=${datos.muertos}\n`;
    txt += `Ambulatorios=${datos.amb} Hospitalizados=${datos.hosp}\n`;
    txt += `Barrio/Brote: ${datos.barrio}\n\n`;
    txt += `Notificador: ${datos.notifNom}\nCorreo SIVIGILA: sivigila@ins.gov.co\n`;
    return { data: txt, filename: `Ficha998_SE${datos.se}_${datos.anio}.txt`, type: 'text/plain' };
  };

  const exportarCSV = () => {
    const L = ['<1a', '1-4a', '5-9a', '10-14a', '15-19a', '20-24a', '25-29a', '30-34a', '35-39a', '40-44a', '45-49a', '50-54a', '55-59a', '60-64a', '65-69a', '70-74a', '75-79a', '>=80a'];
    let csv = '\uFEFFCodigo,UPGD,SE,Año';
    L.forEach(l => csv += ',' + l);
    csv += ',Total,Sosp,Prob,Lab,Clin,Nexo,H,M,Hosp,Amb,Muertos\n';
    csv += `"${datos.evento}","${datos.razon}","${datos.se}","${datos.anio}",${eda.join(',')},${totales.eda || totales.clasif}`;
    csv += `,${datos.sosp},${datos.prob},${datos.lab},${datos.clin},${datos.nexo}`;
    csv += `,${datos.sexh},${datos.sexm},${datos.hosp},${datos.amb},${datos.muertos}\n`;
    return { data: csv, filename: `Ficha998_SE${datos.se}_${datos.anio}.csv`, type: 'text/csv' };
  };

  return {
    datos, setDatos: handleChangeDato,
    eda, handleEdaChange,
    totales,
    limpiar, cargarImportados,
    exportarTXT, exportarCSV
  };
}
