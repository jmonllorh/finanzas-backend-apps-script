interface ApiResponse {
  status: 'success' | 'error';
  message?: string;
  resumenesAnuales?: ResumenAnualDTO[] | null;
  comidaLimpieza?: CategoriaGastosDTO[] | null;
  ocio?: CategoriaGastosDTO[] | null;
  deporte?: CategoriaGastosDTO[] | null;
  transporte?: CategoriaGastosDTO[] | null;
  otros?: CategoriaGastosDTO[] | null;
  electricidad?: ElectricidadDTO[] | null;
  agua?: AguaDTO[] | null;
  viajes?: ViajesDTO[] | null;
  inversiones?: InversionesDTO | null;
  distribucionFondos?: DistribucionFondoDTO[] | null;
  desgloseTotal?: DesgloseTotalDTO | null;
  evolucionSalarial?: EvolucionSalarioDTO[] | null;
}

// TODO- Analizar profundamente los DTOS y valorar si mejorar la distribución de datos (cambiar { valor, unidad } y meter en mismo nivel, revisar strings vs enums tipos activos)
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

  const response: ApiResponse = {
    status: "success",
    resumenesAnuales: sheetsResumenesAnuales.length > 0
      ? crearResumenesAnualesDTO(sheetsResumenesAnuales)
      : null,
    evolucionSalarial: sheetEvolucionSalario
      ? crearEvolucionSalarioDTOs(sheetEvolucionSalario)
      : null,
    comidaLimpieza: sheetComidaLimpieza
      ? crearCategoriaGastosDTO(sheetComidaLimpieza)
      : null,
    ocio: sheetOcio
      ? crearCategoriaGastosDTO(sheetOcio)
      : null,
    deporte: sheetDeporte
      ? crearCategoriaGastosDTO(sheetDeporte)
      : null,
    transporte: sheetTransporte
      ? crearCategoriaGastosDTO(sheetTransporte)
      : null,
    otros: sheetOtros
      ? crearCategoriaGastosDTO(sheetOtros)
      : null,
    electricidad: sheetElectricidad
      ? crearElectricidadDTO(sheetElectricidad)
      : null,
    agua: sheetAgua
      ? crearAguaDTO(sheetAgua)
      : null,
    viajes: sheetViajes
      ? crearViajesDTO(sheetViajes)
      : null,
    inversiones: sheetInversiones
      ? crearInversionesDTO(sheetInversiones)
      : null,
    distribucionFondos: sheetDistribucionFondos
      ? crearDistribucionFondosDTO(sheetDistribucionFondos)
      : null,
    desgloseTotal: sheetDesgloseTotal
      ? crearDesgloseTotalDTO(sheetDesgloseTotal)
      : null
  };

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}
