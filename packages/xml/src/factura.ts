import { calcularCabecera } from '@miguelvivar/sunat-fe-core';
import type { DatosFacturaBoleta } from './tipos.js';
import { escaparXml, formatearFecha, formatearMonto } from './util.js';
import { montoALetras } from './numeroALetras.js';

/**
 * Genera el XML UBL 2.1 (SIN FIRMAR) de una Factura o Boleta de Venta.
 *
 * Estructura y orden de elementos siguen el esquema público UBL 2.1 + el perfil peruano de SUNAT
 * (mismos nombres de campo que Greenter/Lycet — ver references/document-types.md del skill).
 * El bloque cac:Signature es un marcador estructural: la firma criptográfica real la añade
 * sunat-fe-signer en una fase posterior, no este paquete.
 *
 * IMPORTANTE: esta función no ha sido validada contra el XSD real de SUNAT ni contra su
 * webservice — ver PRODUCT.md / DESIGN.md del proyecto para el estado de verificación por capa.
 */
export function generarXmlFacturaBoleta(datos: DatosFacturaBoleta): string {
  const { items, montos } = calcularCabecera(datos.items);
  const idComprobante = `${datos.serie}-${datos.correlativo}`;
  const montoEnLetras = montoALetras(montos.mtoImpVenta, datos.moneda);

  const lineasItem = items
    .map(
      (item, i) => `  <cac:InvoiceLine>
    <cbc:ID>${i + 1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="${escaparXml(item.unidad)}">${item.cantidad}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="${escaparXml(datos.moneda)}">${formatearMonto(item.mtoValorVenta)}</cbc:LineExtensionAmount>
    <cac:PricingReference>
      <cac:AlternativeConditionPrice>
        <cbc:PriceAmount currencyID="${escaparXml(datos.moneda)}">${formatearMonto(item.mtoPrecioUnitario)}</cbc:PriceAmount>
        <cbc:PriceTypeCode>01</cbc:PriceTypeCode>
      </cac:AlternativeConditionPrice>
    </cac:PricingReference>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="${escaparXml(datos.moneda)}">${formatearMonto(item.igv)}</cbc:TaxAmount>
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="${escaparXml(datos.moneda)}">${formatearMonto(item.mtoValorVenta)}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="${escaparXml(datos.moneda)}">${formatearMonto(item.igv)}</cbc:TaxAmount>
        <cac:TaxCategory>
          <cbc:Percent>18</cbc:Percent>
          <cbc:TaxExemptionReasonCode>${escaparXml(item.tipAfeIgv)}</cbc:TaxExemptionReasonCode>
          <cac:TaxScheme>
            <cbc:ID>1000</cbc:ID>
            <cbc:Name>IGV</cbc:Name>
            <cbc:TaxTypeCode>VAT</cbc:TaxTypeCode>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Description>${escaparXml(item.descripcion)}</cbc:Description>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="${escaparXml(datos.moneda)}">${formatearMonto(item.mtoValorUnitario)}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="ISO-8859-1"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
  xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
  xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2">
  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionContent/>
    </ext:UBLExtension>
  </ext:UBLExtensions>
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>2.0</cbc:CustomizationID>
  <cbc:ID>${escaparXml(idComprobante)}</cbc:ID>
  <cbc:IssueDate>${formatearFecha(datos.fechaEmision)}</cbc:IssueDate>
  <cbc:InvoiceTypeCode listID="0101">${escaparXml(datos.tipoDoc)}</cbc:InvoiceTypeCode>
  <cbc:Note languageLocaleID="1000">${escaparXml(montoEnLetras)}</cbc:Note>
  <cbc:DocumentCurrencyCode>${escaparXml(datos.moneda)}</cbc:DocumentCurrencyCode>
  <cac:Signature>
    <cbc:ID>${escaparXml(datos.emisor.ruc)}</cbc:ID>
    <cac:SignatoryParty>
      <cac:PartyIdentification>
        <cbc:ID>${escaparXml(datos.emisor.ruc)}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>${escaparXml(datos.emisor.razonSocial)}</cbc:Name>
      </cac:PartyName>
    </cac:SignatoryParty>
    <cac:DigitalSignatureAttachment>
      <cac:ExternalReference>
        <cbc:URI>#SignatureSP</cbc:URI>
      </cac:ExternalReference>
    </cac:DigitalSignatureAttachment>
  </cac:Signature>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="6">${escaparXml(datos.emisor.ruc)}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>${escaparXml(datos.emisor.nombreComercial ?? datos.emisor.razonSocial)}</cbc:Name>
      </cac:PartyName>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${escaparXml(datos.emisor.razonSocial)}</cbc:RegistrationName>
        <cac:RegistrationAddress>
          <cbc:AddressTypeCode>0000</cbc:AddressTypeCode>
          <cac:AddressLine>
            <cbc:Line>${escaparXml(datos.emisor.direccion)}</cbc:Line>
          </cac:AddressLine>
        </cac:RegistrationAddress>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="${escaparXml(datos.cliente.tipoDocumento)}">${escaparXml(datos.cliente.numeroDocumento)}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${escaparXml(datos.cliente.razonSocialONombre)}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${escaparXml(datos.moneda)}">${formatearMonto(montos.mtoIGV)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${escaparXml(datos.moneda)}">${formatearMonto(montos.mtoOperGravadas)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${escaparXml(datos.moneda)}">${formatearMonto(montos.mtoIGV)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cac:TaxScheme>
          <cbc:ID>1000</cbc:ID>
          <cbc:Name>IGV</cbc:Name>
          <cbc:TaxTypeCode>VAT</cbc:TaxTypeCode>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${escaparXml(datos.moneda)}">${formatearMonto(montos.valorVenta)}</cbc:LineExtensionAmount>
    <cbc:TaxInclusiveAmount currencyID="${escaparXml(datos.moneda)}">${formatearMonto(montos.subTotal)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${escaparXml(datos.moneda)}">${formatearMonto(montos.mtoImpVenta)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
${lineasItem}
</Invoice>`;
}
