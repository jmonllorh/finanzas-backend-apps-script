/**
 * Función de entrada para peticiones HTTP GET.
 * @param e Objeto de evento HTTP proporcionado por Apps Script.
 */
function doGet(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.Content.TextOutput {
  const spreadsheetId: string = "1OeaXm9POWakuXQc6yRH41gyydXI3J2YqhUczMC_2tSk";

  const ss: GoogleAppsScript.Spreadsheet.Spreadsheet = SpreadsheetApp.openById(spreadsheetId);

  const sheetEvolucionSalario = ss.getSheetByName("Evolución salario");
  const sheetComidaLimpieza = ss.getSheetByName("Comida/Limpieza");
  const sheetOcio = ss.getSheetByName("Ocio");
  const sheetDeporte = ss.getSheetByName("Deporte");
  const sheetTransporte = ss.getSheetByName("Transporte");
  const sheetOtros = ss.getSheetByName("Otros");
  const sheetElectricidad = ss.getSheetByName("Electricidad");
  const sheetAgua = ss.getSheetByName("Agua");
  const sheetViajes = ss.getSheetByName("Viajes");
  const sheetInversiones = ss.getSheetByName("Inversiones");
  const sheetDistribucionFondos = ss.getSheetByName("MyInvestor");
  const sheetDesgloseTotal = ss.getSheetByName("Desglose total");
  const sheetsResumenesAnuales = ss.getSheets().filter(
    (sheet) => /^Resumen \d{4}$/.test(sheet.getName())
  );

  const response = new RespuestaFinancieraDTO();
  response.status = "success";
  response.resumenesAnuales = sheetsResumenesAnuales.length > 0
    ? crearResumenesAnualesDTO(sheetsResumenesAnuales)
    : null;
  response.evolucionSalarial = sheetEvolucionSalario
    ? crearEvolucionSalarioDTOs(sheetEvolucionSalario)
    : null;
  response.comidaLimpieza = sheetComidaLimpieza
    ? crearCategoriaGastosDTO(sheetComidaLimpieza)
    : null;
  response.ocio = sheetOcio
    ? crearCategoriaGastosDTO(sheetOcio)
    : null;
  response.deporte = sheetDeporte
    ? crearCategoriaGastosDTO(sheetDeporte)
    : null;
  response.transporte = sheetTransporte
    ? crearCategoriaGastosDTO(sheetTransporte)
    : null;
  response.otros = sheetOtros
    ? crearCategoriaGastosDTO(sheetOtros)
    : null;
  response.electricidad = sheetElectricidad
    ? crearElectricidadDTO(sheetElectricidad)
    : null;
  response.agua = sheetAgua
    ? crearAguaDTO(sheetAgua)
    : null;
  response.viajes = sheetViajes
    ? crearViajesDTO(sheetViajes)
    : null;
  response.inversiones = sheetInversiones
    ? crearInversionesDTO(sheetInversiones)
    : null;
  response.distribucionFondos = sheetDistribucionFondos
    ? crearDistribucionFondosDTO(sheetDistribucionFondos)
    : null;
  response.desgloseTotal = sheetDesgloseTotal
    ? crearDesgloseTotalDTO(sheetDesgloseTotal)
    : null;

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}
