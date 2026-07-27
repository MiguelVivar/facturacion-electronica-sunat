import { describe, expect, test } from 'bun:test';
import { desempaquetarPrimerXml, empaquetarXml, nombreComprobante } from './zip.js';

describe('nombreComprobante', () => {
  test('sigue la nomenclatura RUC-tipoDoc-serie-correlativo', () => {
    expect(nombreComprobante({ ruc: '20123456789', tipoDoc: '01', serie: 'F001', correlativo: '1' })).toBe(
      '20123456789-01-F001-1',
    );
  });
});

describe('empaquetarXml / desempaquetarPrimerXml', () => {
  test('round-trip: lo que se empaqueta se recupera igual', () => {
    const xml = '<Invoice><cbc:ID>F001-1</cbc:ID></Invoice>';
    const id = { ruc: '20123456789', tipoDoc: '01', serie: 'F001', correlativo: '1' };
    const zip = empaquetarXml(xml, id);
    const { nombreArchivo, contenido } = desempaquetarPrimerXml(zip);
    expect(nombreArchivo).toBe('20123456789-01-F001-1.xml');
    expect(contenido).toBe(xml);
  });

  test('preserva caracteres UTF-8/acentos', () => {
    const xml = '<Nota>SON CIENTO DIECIOCHO CON 00/100 SOLES, ñ á é íóú</Nota>';
    const zip = empaquetarXml(xml, { ruc: '1', tipoDoc: '01', serie: 'F001', correlativo: '1' });
    expect(desempaquetarPrimerXml(zip).contenido).toBe(xml);
  });
});
