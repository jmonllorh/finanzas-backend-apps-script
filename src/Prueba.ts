// Opcional: Define las interfaces para estructurar la respuesta
interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

/**
 * Función de entrada para peticiones HTTP GET.
 * @param e Objeto de evento HTTP proporcionado por Apps Script.
 */
function doGet(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.Content.TextOutput {
  const spreadsheetId: string = "1OeaXm9POWakuXQc6yRH41gyydXI3J2YqhUczMC_2tSk";
  
  const ss: GoogleAppsScript.Spreadsheet.Spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheetResumen: GoogleAppsScript.Spreadsheet.Sheet | null = ss.getSheetByName("Resumen 2026");

  if (!sheetResumen) {
    const errorResponse: ApiResponse = {
      status: 'error',
      message: 'No se encontró la hoja "Resumen 2026"'
    };

    return ContentService
      .createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Obtiene los datos como una matriz bidimensional (any[][])
  const dataResumen: any[][] = sheetResumen.getDataRange().getValues();

  const response: ApiResponse<any[][]> = {
    status: "error",
    data: dataResumen
  };

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}