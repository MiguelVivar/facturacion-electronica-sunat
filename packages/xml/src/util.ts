/** Escapa los cinco caracteres especiales de XML. Nunca insertes texto de usuario sin pasar por esto. */
export function escaparXml(valor: string | number): string {
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Formatea una fecha como YYYY-MM-DD (xsd:date), en UTC para evitar desfases de zona horaria. */
export function formatearFecha(fecha: Date): string {
  return fecha.toISOString().slice(0, 10);
}

/** Formatea un monto con exactamente 2 decimales, como SUNAT espera en los campos numéricos. */
export function formatearMonto(monto: number): string {
  return monto.toFixed(2);
}

/**
 * Verificación mecánica mínima de que una cadena XML tiene las etiquetas balanceadas
 * (no es un parser completo ni valida el esquema — solo detecta un error de plantilla obvio).
 */
export function etiquetasBalanceadas(xml: string): boolean {
  const pila: string[] = [];
  const patron = /<\/?([a-zA-Z][\w:.-]*)\b[^>]*?(\/?)>/g;
  let coincidencia: RegExpExecArray | null;
  while ((coincidencia = patron.exec(xml)) !== null) {
    const [completa, nombre, autocierre] = coincidencia;
    if (autocierre === '/' || completa.startsWith('<?')) continue;
    if (completa.startsWith('</')) {
      if (pila.pop() !== nombre) return false;
    } else {
      pila.push(nombre!);
    }
  }
  return pila.length === 0;
}
