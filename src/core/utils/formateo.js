export function calcularEdad(fechaNacimiento, fechaReferencia = new Date()) {
  if (!fechaNacimiento) return null;
  
  const s = String(fechaNacimiento).replace(/\s/g, '');
  let d, m, a;
  
  if (/^\d{8}$/.test(s)) {
    a = +s.slice(0, 4);
    m = +s.slice(4, 6);
    d = +s.slice(6, 8);
  } else if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const p = s.split('-');
    a = +p[0];
    m = +p[1];
    d = +p[2];
  } else if (/^\d{2}\/\d{2}\/\d{4}/.test(s)) {
    const p = s.split('/');
    d = +p[0];
    m = +p[1];
    a = +p[2];
  } else {
    return null;
  }
  
  const ref = new Date(fechaReferencia);
  let edad = ref.getFullYear() - a;
  
  if (ref.getMonth() + 1 < m || (ref.getMonth() + 1 === m && ref.getDate() < d)) {
    edad--;
  }
  
  return edad >= 0 && edad <= 120 ? edad : null;
}

export function obtenerSemanaEpidemiologica(fecha = new Date()) {
  const s = new Date(fecha.getFullYear(), 0, 1);
  return Math.ceil(((fecha - s) / 86400000 + s.getDay() + 1) / 7);
}
