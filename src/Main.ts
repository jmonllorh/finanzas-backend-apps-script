/**
 * Función de entrada para peticiones HTTP GET.
 * @param e Objeto de evento HTTP proporcionado por Apps Script.
 * @returns Respuesta JSON con los datos financieros disponibles en la hoja de cálculo.
 */
// TODO- Añadir .md con la definición funcional del servicio, explicando cada campo de la respuesta, sus valores posibles, la unidad de medida de cada valor, etc
// TODO- Cambiar nombre métodos, clases y ficheros a inglés
function doGet(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.Content.TextOutput {
  let spreadsheetId: string | null;
  try {
    spreadsheetId = PropertiesService
      .getScriptProperties()
      .getProperty("SPREADSHEET_ID");
  } catch (error) {
    Logger.log(error);
    return crearRespuestaError(
      "No se pudo leer la propiedad SPREADSHEET_ID de Script Properties."
    );
  }
  if (spreadsheetId === null || spreadsheetId.trim() === "") {
    return crearRespuestaError(
      "La propiedad SPREADSHEET_ID de Script Properties no está configurada o está vacía."
    );
  }

  const ss: GoogleAppsScript.Spreadsheet.Spreadsheet = SpreadsheetApp.openById(
    spreadsheetId.trim()
  );

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

/**
 * Crea una respuesta JSON de error compatible con el formato común de la API.
 * @param message Descripción del error que recibirá el consumidor del servicio.
 * @returns Respuesta HTTP con estado de error y mensaje en formato JSON.
 */
function crearRespuestaError(
  message: string
): GoogleAppsScript.Content.TextOutput {
  const response = new RespuestaFinancieraDTO();
  response.status = "error";
  response.message = message;
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}
