interface ApiResponse {
  status: 'success' | 'error';
  message?: string;
  resumenesAnuales?: ResumenAnualDTO[];
  comidaLimpieza?: CategoriaGastosDTO[] | null;
  ocio?: CategoriaGastosDTO[] | null;
  deporte?: CategoriaGastosDTO[] | null;
  transporte?: CategoriaGastosDTO[] | null;
  otros?: CategoriaGastosDTO[] | null;
  electricidad?: ElectricidadDTO[];
  agua?: AguaDTO[];
  viajes?: ViajesDTO[];
  inversiones?: InversionesDTO;
  distribucionFondos?: DistribucionFondoDTO[];
  desgloseTotal?: DesgloseTotalDTO;
  evolucionSalarial?: EvolucionSalarioDTO[] | null;
}

/**
 * Función de entrada para peticiones HTTP GET.
 * @param e Objeto de evento HTTP proporcionado por Apps Script.
 */
// TODO- Renombrar a Main
// TODO- Añadir a todos los campos campo opcional con la nota de la celda
function doGet(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.Content.TextOutput {
  const spreadsheetId: string = "1OeaXm9POWakuXQc6yRH41gyydXI3J2YqhUczMC_2tSk";

  const ss: GoogleAppsScript.Spreadsheet.Spreadsheet = SpreadsheetApp.openById(spreadsheetId);

  const sheetEvolucionSalario = ss.getSheetByName("Evolución salario");
  const sheetComidaLimpieza = ss.getSheetByName("Comida/Limpieza");
  const sheetOcio = ss.getSheetByName("Ocio");
  const sheetDeporte = ss.getSheetByName("Deporte");
  const sheetTransporte = ss.getSheetByName("Transporte");
  const sheetOtros = ss.getSheetByName("Otros");

  const response: ApiResponse = {
    status: "success",
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
      : null
  };

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}
