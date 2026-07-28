import { describe, expect, test } from 'bun:test';
import { generarXmlFacturaBoleta } from './factura.js';
import { etiquetasBalanceadas } from './util.js';
import type { DatosFacturaBoleta } from './tipos.js';

const datosEjemplo: DatosFacturaBoleta = {
  tipoDoc: '01',
  serie: 'F001',
  correlativo: '1',
  fechaEmision: new Date('2026-07-27T00:00:00Z'),
  moneda: 'PEN',
  emisor: {
    ruc: '20123456789',
    razonSocial: 'Distribuidora Andina S.A.C.',
    direccion: 'Av. Ejemplo 123, Lima',
  },
  cliente: {
    tipoDocumento: '6',
    numeroDocumento: '20999999999',
    razonSocialONombre: 'Cliente de Prueba S.A.C.',
  },
  items: [
    {
      cantidad: 1,
      descripcion: 'Servicio de consultoría',
      unidad: 'ZZ',
      mtoValorUnitario: 100,
      tipAfeIgv: '10',
    },
  ],
};

describe('generarXmlFacturaBoleta', () => {
  const xml = generarXmlFacturaBoleta(datosEjemplo);

  test('produce XML bien formado (etiquetas balanceadas)', () => {
    expect(etiquetasBalanceadas(xml)).toBe(true);
  });

  test('incluye el ID del comprobante (serie-correlativo)', () => {
    expect(xml).toContain('<cbc:ID>F001-1</cbc:ID>');
  });

  test('incluye el tipoDoc correcto en InvoiceTypeCode', () => {
    expect(xml).toContain('<cbc:InvoiceTypeCode listID="0101">01</cbc:InvoiceTypeCode>');
  });

  test('incluye los montos calculados: S/100 + IGV 18% = S/118 (ejemplo verificado)', () => {
    expect(xml).toContain('<cbc:PayableAmount currencyID="PEN">118.00</cbc:PayableAmount>');
    expect(xml).toContain('<cbc:TaxAmount currencyID="PEN">18.00</cbc:TaxAmount>');
  });

  test('incluye la leyenda del monto en letras (catálogo 52, código 1000)', () => {
    expect(xml).toContain('languageLocaleID="1000"');
    expect(xml).toContain('SON CIENTO DIECIOCHO CON 00/100 SOLES');
  });

  test('escapa datos del cliente/emisor para evitar inyección de XML', () => {
    const datosConComillas: DatosFacturaBoleta = {
      ...datosEjemplo,
      cliente: { ...datosEjemplo.cliente, razonSocialONombre: 'Cliente "& Cía" <Test>' },
    };
    const xmlEscapado = generarXmlFacturaBoleta(datosConComillas);
    expect(etiquetasBalanceadas(xmlEscapado)).toBe(true);
    expect(xmlEscapado).toContain('Cliente &quot;&amp; Cía&quot; &lt;Test&gt;');
  });

  test('trae un marcador de firma estructural, no una firma criptográfica real', () => {
    expect(xml).toContain('<cac:Signature>');
    expect(xml).not.toContain('<ds:SignatureValue>');
  });

  test('Factura en USD (catálogo 02) con ítems gravados + exonerados: moneda y leyenda correctas', () => {
    const xmlUsd = generarXmlFacturaBoleta({
      ...datosEjemplo,
      moneda: 'USD',
      items: [
        { cantidad: 1, descripcion: 'Servicio gravado', unidad: 'ZZ', mtoValorUnitario: 100, tipAfeIgv: '10' },
        { cantidad: 1, descripcion: 'Producto exonerado', unidad: 'NIU', mtoValorUnitario: 50, tipAfeIgv: '20' },
      ],
    });
    expect(etiquetasBalanceadas(xmlUsd)).toBe(true);
    expect(xmlUsd).toContain('<cbc:DocumentCurrencyCode>USD</cbc:DocumentCurrencyCode>');
    // gravado 100 (+ IGV 18) + exonerado 50 (sin IGV) = 168.00
    expect(xmlUsd).toContain('<cbc:PayableAmount currencyID="USD">168.00</cbc:PayableAmount>');
    expect(xmlUsd).toContain('<cbc:TaxAmount currencyID="USD">18.00</cbc:TaxAmount>');
    expect(xmlUsd).toContain('<cbc:TaxableAmount currencyID="USD">100.00</cbc:TaxableAmount>');
    expect(xmlUsd).toContain('SON CIENTO SESENTA Y OCHO CON 00/100 DOLARES AMERICANOS');
  });

  test('un comprobante con varios items y baldes mixtos sigue bien formado', () => {
    const xmlMixto = generarXmlFacturaBoleta({
      ...datosEjemplo,
      items: [
        ...datosEjemplo.items,
        { cantidad: 2, descripcion: 'Producto exonerado', unidad: 'NIU', mtoValorUnitario: 25, tipAfeIgv: '20' },
      ],
    });
    expect(etiquetasBalanceadas(xmlMixto)).toBe(true);
    expect(xmlMixto).toContain('Producto exonerado');
  });
});
