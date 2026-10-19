function doGet2(e) {
  var spreadsheetId = "1OeaXm9POWakuXQc6yRH41gyydXI3J2YqhUczMC_2tSk";
  var ss = SpreadsheetApp.openById(spreadsheetId);

  var sheetResumen = ss.getSheetByName("Resumen 2026");
  var dataResumen = sheetResumen.getDataRange().getValues();

  // Resto de tu lógica para parsear y devolver el JSON...
  var response = {
    status: "success",
    data: dataResumen
  };

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}