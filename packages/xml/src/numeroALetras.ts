// Conversión de un monto a letras en español, para la leyenda 1000 ("MONTO EN LETRAS") que SUNAT
// exige en toda Factura/Boleta. Cubre montos hasta 999,999,999.99 — más que suficiente para el
// caso normal de facturación; un monto mayor es un caso raro que vale la pena revisar a mano.

const UNIDADES = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
const DIEZ_A_DIECINUEVE = [
  'DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE',
  'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE',
];
const DECENAS = [
  '', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA',
];
const CENTENAS = [
  '', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS',
  'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS',
];

const NOMBRE_MONEDA: Record<string, { singular: string; plural: string }> = {
  PEN: { singular: 'SOL', plural: 'SOLES' },
  USD: { singular: 'DOLAR AMERICANO', plural: 'DOLARES AMERICANOS' },
  EUR: { singular: 'EURO', plural: 'EUROS' },
};

function decenasYUnidades(n: number): string {
  if (n < 10) return UNIDADES[n]!;
  if (n < 20) return DIEZ_A_DIECINUEVE[n - 10]!;
  if (n === 20) return 'VEINTE';
  if (n < 30) return `VEINTI${UNIDADES[n - 20]}`;
  const decena = Math.floor(n / 10);
  const unidad = n % 10;
  return unidad === 0 ? DECENAS[decena]! : `${DECENAS[decena]} Y ${UNIDADES[unidad]}`;
}

function centenasBloque(n: number): string {
  if (n === 0) return '';
  if (n === 100) return 'CIEN';
  const centena = Math.floor(n / 100);
  const resto = n % 100;
  const partes = [];
  if (centena > 0) partes.push(CENTENAS[centena]);
  if (resto > 0) partes.push(decenasYUnidades(resto));
  return partes.join(' ');
}

/** Convierte un entero (0 a 999,999,999) a letras en español. */
export function enteroALetras(n: number): string {
  if (n === 0) return 'CERO';
  if (n < 0 || n > 999_999_999 || !Number.isInteger(n)) {
    throw new Error(`enteroALetras solo soporta enteros entre 0 y 999,999,999 (recibido: ${n})`);
  }

  const millones = Math.floor(n / 1_000_000);
  const miles = Math.floor((n % 1_000_000) / 1000);
  const resto = n % 1000;

  const partes: string[] = [];
  if (millones > 0) {
    partes.push(millones === 1 ? 'UN MILLON' : `${centenasBloque(millones)} MILLONES`);
  }
  if (miles > 0) {
    partes.push(miles === 1 ? 'MIL' : `${centenasBloque(miles)} MIL`);
  }
  if (resto > 0) {
    partes.push(centenasBloque(resto));
  }
  return partes.join(' ').trim();
}

/**
 * Convierte un monto (con céntimos) a la leyenda que SUNAT espera, p.ej.:
 * montoALetras(118, 'PEN') → "SON CIENTO DIECIOCHO CON 00/100 SOLES"
 */
export function montoALetras(monto: number, moneda: string): string {
  const nombreMoneda = NOMBRE_MONEDA[moneda];
  if (!nombreMoneda) {
    throw new Error(`Moneda desconocida para montoALetras: "${moneda}" (catálogo 02: PEN, USD, EUR)`);
  }
  const parteEntera = Math.floor(monto);
  const centimos = Math.round((monto - parteEntera) * 100);
  const nombre = parteEntera === 1 ? nombreMoneda.singular : nombreMoneda.plural;
  const centimosTexto = String(centimos).padStart(2, '0');
  return `SON ${enteroALetras(parteEntera)} CON ${centimosTexto}/100 ${nombre}`;
}
