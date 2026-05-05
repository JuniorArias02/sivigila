import { useState } from 'react';
import * as XLSX from 'xlsx';
import { PATRONES, DB_CIE10 } from '../resources/baseDatosCie10';
import { calcularEdad } from '../../../core/utils/formateo';

export function useLectorRips() {
  const [archivos, setArchivos] = useState([]);
  const [logs, setLogs] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [datosRips, setDatosRips] = useState({ ira: [], eda: [], allCie: [], rows: [] });

  const agregarLog = (msg) => {
    setLogs(prev => [...prev, msg]);
  };

  const quitarTilde = (s) => String(s)
    .replace(/[áàäâ]/gi, 'a').replace(/[éèëê]/gi, 'e')
    .replace(/[íìïî]/gi, 'i').replace(/[óòöô]/gi, 'o')
    .replace(/[úùüû]/gi, 'u').replace(/[ñ]/gi, 'n')
    .toLowerCase().replace(/[^a-z0-9]/g, '');

  const buscarColumna = (keys, lista) => {
    for (let i = 0; i < lista.length; i++) {
      if (keys.includes(lista[i])) return lista[i];
    }
    for (let i = 0; i < lista.length; i++) {
      const nc = quitarTilde(lista[i]);
      const k = keys.find(key => quitarTilde(key) === nc);
      if (k) return k;
    }
    for (let i = 0; i < lista.length; i++) {
      const nc = quitarTilde(lista[i]);
      const k = keys.find(key => quitarTilde(key).includes(nc));
      if (k) return k;
    }
    return null;
  };

  const procesarXLSX = (nombre, buffer) => {
    return new Promise((resolve, reject) => {
      try {
        const wb = XLSX.read(buffer, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (!raw.length) {
          agregarLog(`AVISO: ${nombre} no tiene filas de datos`);
          resolve({ nombre, estado: 'err', msg: 'Archivo vacío', cntTotal: 0, cntIRA: 0, cntEDA: 0 });
          return;
        }

        const keys = Object.keys(raw[0]);
        agregarLog(`Columnas (${keys.length}): ${keys.slice(0, 6).join(' | ')}${keys.length > 6 ? ' ...' : ''}`);

        let COL_DX = buscarColumna(keys, ['Dx Sal.', 'Dx Sal', 'dx sal', 'codDiagPrincipal', 'Diagnostico', 'Dx Principal']);
        const COL_ANIOS = buscarColumna(keys, ['Anos', 'Anios', 'Edad', 'edad', 'Age']);
        const COL_FEC = buscarColumna(keys, ['Fecha Nac.', 'Fecha Nac', 'fechaNacimiento', 'Nacimiento']);
        const COL_GRUPO = buscarColumna(keys, ['Grupo Edad', 'GrupoEdad', 'grupo_edad']);
        const COL_SEXO = buscarColumna(keys, ['Sexo', 'sexo', 'Sex']);
        const COL_DOC = buscarColumna(keys, ['Beneficiario', 'numDocIdentificacion', 'NroDoc', 'Documento']);
        const COL_TD = buscarColumna(keys, ['TD', 'TipoDoc', 'Tipo Doc', 'tipoDocIdentificacion', 'TipoDocumento']);

        if (!COL_DX) {
          COL_DX = keys.find(k => {
            const v = String(raw[0][k] || '').trim().toUpperCase();
            return /^[A-Z][0-9]{2}[0-9A-Z]?X?$/.test(v);
          });
        }

        if (!COL_DX) {
          agregarLog(`ERROR: no se encontró columna de diagnóstico en ${nombre}`);
          resolve({ nombre, estado: 'err', msg: 'Sin col CIE-10', cntTotal: 0, cntIRA: 0, cntEDA: 0 });
          return;
        }

        agregarLog(`Mapeado OK -> DX="${COL_DX}" EDAD="${COL_ANIOS || '--'}" FEC_NAC="${COL_FEC || '--'}" GRUPO="${COL_GRUPO || '--'}"`);

        let cntIRA = 0, cntEDA = 0, cntTotal = 0, cntSinEdad = 0;
        const newRows = [], newIra = [], newEda = [], newCie = [];

        raw.forEach(row => {
          const cie = String(row[COL_DX] || '').trim().toUpperCase().replace(/[^A-Z0-9X]/g, '').slice(0, 5);
          if (!cie || cie.length < 3) return;
          cntTotal++;

          let edad = null;
          if (COL_ANIOS) {
            const v = row[COL_ANIOS];
            if (v !== '' && v !== null && v !== undefined) {
              const n = parseFloat(v);
              if (!isNaN(n) && n >= 0 && n <= 120) edad = Math.floor(n);
            }
          }
          if (edad === null && COL_FEC) {
            const fv = String(row[COL_FEC] || '').trim();
            if (fv) edad = calcularEdad(fv);
          }
          if (edad === null && COL_GRUPO) {
            const gv = String(row[COL_GRUPO] || '').trim();
            if (gv) {
              const lim = parseInt(gv.split('-')[0]);
              if (!isNaN(lim)) edad = lim;
            }
          }
          if (edad === null) cntSinEdad++;

          const r = {
            cie,
            edad,
            doc: COL_DOC ? String(row[COL_DOC] || '') : '',
            td: COL_TD ? String(row[COL_TD] || '') : '',
            sexo: COL_SEXO ? String(row[COL_SEXO] || '') : ''
          };
          
          newRows.push(r);
          newCie.push(cie);
          if (PATRONES.IRA.test(cie)) { newIra.push(r); cntIRA++; }
          if (PATRONES.EDA.test(cie)) { newEda.push(r); cntEDA++; }
        });

        resolve({ nombre, estado: 'ok', msg: `${cntTotal} registros | IRA: ${cntIRA} | EDA: ${cntEDA}`, cntTotal, cntIRA, cntEDA, newRows, newIra, newEda, newCie, cntSinEdad });
      } catch (err) {
        agregarLog(`Error procesando ${nombre}: ${err.message}`);
        resolve({ nombre, estado: 'err', msg: err.message, cntTotal: 0, cntIRA: 0, cntEDA: 0 });
      }
    });
  };

  const procesarTexto = (nombre, contenido) => {
    return new Promise((resolve) => {
      try {
        const lineas = contenido.split(/\r?\n/).filter(l => l.trim());
        if (!lineas.length) {
          resolve({ nombre, estado: 'err', msg: 'Archivo vacío', cntTotal: 0, cntIRA: 0, cntEDA: 0 });
          return;
        }

        const cBar = (lineas[0].match(/\|/g) || []).length;
        const cPuntoComa = (lineas[0].match(/;/g) || []).length;
        const cComa = (lineas[0].match(/,/g) || []).length;
        const sep = cBar > cPuntoComa ? (cBar > cComa ? '|' : ',') : (cPuntoComa > cComa ? ';' : ',');

        const primera = lineas[0].split(sep).map(c => c.trim().replace(/^"|"$/g, ''));
        const tieneEnc = primera.some(c => /[a-z]/i.test(c) && !/^[A-Z][0-9]{2}/.test(c.trim()));
        const dataLineas = tieneEnc ? lineas.slice(1) : lineas;
        const headers = tieneEnc ? primera : null;

        let idxCie = -1, idxFec = -1, idxEdad = -1;
        if (headers) {
          headers.forEach((h, i) => {
            const hn = quitarTilde(h);
            if (idxCie < 0 && ['coddiagprincipal', 'dxsal', 'coddiag', 'diagnostico'].some(n => hn.includes(n))) idxCie = i;
            if (idxFec < 0 && ['fechanacimiento', 'fechanac', 'nacimiento'].some(n => hn.includes(n))) idxFec = i;
            if (idxEdad < 0 && ['anos', 'edad', 'age'].some(n => hn.includes(n))) idxEdad = i;
          });
        }
        if (idxCie < 0 && dataLineas[0]) {
          dataLineas[0].split(sep).forEach((v, i) => {
            if (idxCie < 0 && /^[A-Z][0-9]{2}[0-9A-Z]?X?$/.test(String(v).trim().toUpperCase())) idxCie = i;
          });
        }

        if (idxCie < 0) {
          resolve({ nombre, estado: 'err', msg: 'Sin col CIE-10', cntTotal: 0, cntIRA: 0, cntEDA: 0 });
          return;
        }

        let cntIRA = 0, cntEDA = 0, cntTotal = 0;
        const newRows = [], newIra = [], newEda = [], newCie = [];

        dataLineas.forEach(linea => {
          if (!linea.trim()) return;
          const cols = linea.split(sep).map(c => c.trim().replace(/^"|"$/g, ''));
          const cie = (cols[idxCie] || '').toUpperCase().replace(/[^A-Z0-9X]/g, '').slice(0, 5);
          if (!cie || cie.length < 3) return;
          cntTotal++;

          let edad = null;
          if (idxEdad >= 0 && cols[idxEdad]) {
            const n = parseInt(cols[idxEdad]);
            if (!isNaN(n)) edad = n;
          }
          if (edad === null && idxFec >= 0 && cols[idxFec]) edad = calcularEdad(cols[idxFec]);

          const r = { cie, edad };
          newRows.push(r);
          newCie.push(cie);
          if (PATRONES.IRA.test(cie)) { newIra.push(r); cntIRA++; }
          if (PATRONES.EDA.test(cie)) { newEda.push(r); cntEDA++; }
        });

        resolve({ nombre, estado: 'ok', msg: `${cntTotal} filas | IRA: ${cntIRA} | EDA: ${cntEDA}`, cntTotal, cntIRA, cntEDA, newRows, newIra, newEda, newCie, cntSinEdad: 0 });
      } catch (err) {
        resolve({ nombre, estado: 'err', msg: err.message, cntTotal: 0, cntIRA: 0, cntEDA: 0 });
      }
    });
  };

  const calcularEdades = (datos) => {
    const edadA995 = (a) => {
      if (a < 1) return 0;
      if (a < 2) return 1;
      if (a < 5) return 2;
      if (a < 20) return 3;
      if (a < 40) return 4;
      if (a < 60) return 5;
      return 6;
    };
    const edadA998 = (a) => {
      if (a < 1) return 0;
      if (a < 5) return 1;
      if (a < 10) return 2;
      if (a < 15) return 3;
      if (a < 20) return 4;
      if (a < 25) return 5;
      if (a < 30) return 6;
      if (a < 35) return 7;
      if (a < 40) return 8;
      if (a < 45) return 9;
      if (a < 50) return 10;
      if (a < 55) return 11;
      if (a < 60) return 12;
      if (a < 65) return 13;
      if (a < 70) return 14;
      if (a < 75) return 15;
      if (a < 80) return 16;
      return 17;
    };

    const edaIRA = new Array(7).fill(0);
    const edaEDA = new Array(18).fill(0);
    let sinI = 0, sinE = 0;

    datos.ira.forEach(r => {
      if (r.edad !== null) edaIRA[edadA995(r.edad)]++;
      else sinI++;
    });
    datos.eda.forEach(r => {
      if (r.edad !== null) edaEDA[edadA998(r.edad)]++;
      else sinE++;
    });

    return { edaIRA, edaEDA, sinI, sinE };
  };

  const generarResumen = (nuevosDatos) => {
    const nIRA = nuevosDatos.ira.length;
    const nEDA = nuevosDatos.eda.length;
    const nTotal = nuevosDatos.rows.length;
    const nEISP = nuevosDatos.allCie.filter(c => DB_CIE10[c]).length;
    const nSI = nuevosDatos.allCie.filter(c => DB_CIE10[c] && DB_CIE10[c].startsWith('SI|')).length;

    const edades = calcularEdades(nuevosDatos);

    setResumen({
      nTotal, nIRA, nEDA, nEISP, nSI,
      ...edades
    });
  };

  const procesarArchivos = async (files) => {
    if (!files || !files.length) return;
    
    // Resetear si se quiere cargar nuevos o acumular? En el original acumulaba si se suben varios, pero resetaba al inicio de un drop.
    setLogs([]);
    setArchivos([]);
    setResumen(null);
    let tempDatos = { ira: [], eda: [], allCie: [], rows: [] };
    const arr = Array.from(files);

    const results = await Promise.all(arr.map(f => {
      return new Promise((resolve) => {
        const ext = f.name.split('.').pop().toLowerCase();
        const reader = new FileReader();
        
        if (ext === 'xlsx' || ext === 'xls') {
          reader.onload = async (e) => {
            const res = await procesarXLSX(f.name, e.target.result);
            resolve(res);
          };
          reader.onerror = () => resolve({ nombre: f.name, estado: 'err', msg: 'Error de lectura', cntTotal: 0, cntIRA: 0, cntEDA: 0 });
          reader.readAsArrayBuffer(f);
        } else {
          reader.onload = async (e) => {
            const res = await procesarTexto(f.name, e.target.result);
            resolve(res);
          };
          reader.onerror = () => resolve({ nombre: f.name, estado: 'err', msg: 'Error de lectura', cntTotal: 0, cntIRA: 0, cntEDA: 0 });
          reader.readAsText(f, 'UTF-8');
        }
      });
    }));

    results.forEach(res => {
      setArchivos(prev => [...prev, { nombre: res.nombre, estado: res.estado, msg: res.msg }]);
      if (res.estado === 'ok') {
        tempDatos.ira.push(...res.newIra);
        tempDatos.eda.push(...res.newEda);
        tempDatos.rows.push(...res.newRows);
        tempDatos.allCie.push(...res.newCie);
      }
    });

    setDatosRips(tempDatos);
    generarResumen(tempDatos);
    return tempDatos;
  };

  const limpiar = () => {
    setArchivos([]);
    setLogs([]);
    setResumen(null);
    setDatosRips({ ira: [], eda: [], allCie: [], rows: [] });
  };

  return {
    archivos,
    logs,
    resumen,
    datosRips,
    procesarArchivos,
    limpiar
  };
}
