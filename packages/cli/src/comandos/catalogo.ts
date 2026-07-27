import { buscarCatalogo } from '@miguelvivar/sunat-fe-core';

/** `sunat-fe catalogo <consulta>` — busca un código o nombre en todos los catálogos SUNAT. */
export function comandoCatalogo(consulta: string | undefined): string {
  if (!consulta) {
    return 'Uso: sunat-fe catalogo <código o texto a buscar>\nEjemplo: sunat-fe catalogo factura';
  }
  const resultados = buscarCatalogo(consulta);
  if (resultados.length === 0) {
    return `Sin resultados para "${consulta}".`;
  }
  return resultados
    .map((r) => `[${r.catalogo}] ${r.codigo} — ${r.nombre}`)
    .join('\n');
}
