/**
 * Función de entrada para peticiones HTTP GET.
 * @param e Objeto de evento HTTP proporcionado por Apps Script.
 * @returns Respuesta JSON con los datos financieros disponibles en la hoja de cálculo.
 */
// TODO- Añadir .md con la definición funcional del servicio, explicando cada campo de la respuesta, sus valores posibles, la unidad de medida de cada valor, etc
function doGet(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.Content.TextOutput {
  let spreadsheetId: string | null;
  try {
    spreadsheetId = PropertiesService
      .getScriptProperties()
      .getProperty("SPREADSHEET_ID");
  } catch (error) {
    Logger.log(error);
    return createErrorResponse(
      "Could not read the SPREADSHEET_ID Script Property."
    );
  }
  if (spreadsheetId === null || spreadsheetId.trim() === "") {
    return createErrorResponse(
      "The SPREADSHEET_ID Script Property is not configured or is empty."
    );
  }

  const ss: GoogleAppsScript.Spreadsheet.Spreadsheet = SpreadsheetApp.openById(
    spreadsheetId.trim()
  );

  const sheetSalaryEvolution = ss.getSheetByName("Evolución salario");
  const sheetFoodAndCleaning = ss.getSheetByName("Comida/Limpieza");
  const sheetLeisure = ss.getSheetByName("Ocio");
  const sheetSports = ss.getSheetByName("Deporte");
  const sheetTransportation = ss.getSheetByName("Transporte");
  const sheetOtherExpenses = ss.getSheetByName("Otros");
  const sheetElectricity = ss.getSheetByName("Electricidad");
  const sheetWater = ss.getSheetByName("Agua");
  const sheetGas = ss.getSheetByName("Gas");
  const sheetTravel = ss.getSheetByName("Viajes");
  const sheetInvestments = ss.getSheetByName("Inversiones");
  const sheetFundAllocations = ss.getSheetByName("MyInvestor");
  const sheetTotalBreakdown = ss.getSheetByName("Desglose total");
  const sheetsAnnualSummaries = ss.getSheets().filter(
    (sheet) => /^Resumen \d{4}$/.test(sheet.getName())
  );

  const response = new FinancialResponseDTO();
  response.status = "success";
  response.annualSummaries = sheetsAnnualSummaries.length > 0
    ? mapAnnualSummaries(sheetsAnnualSummaries)
    : null;
  response.salaryEvolution = sheetSalaryEvolution
    ? mapSalaryEvolution(sheetSalaryEvolution)
    : null;
  response.foodAndCleaning = sheetFoodAndCleaning
    ? mapExpenseCategories(sheetFoodAndCleaning)
    : null;
  response.leisure = sheetLeisure
    ? mapExpenseCategories(sheetLeisure)
    : null;
  response.sports = sheetSports
    ? mapExpenseCategories(sheetSports)
    : null;
  response.transportation = sheetTransportation
    ? mapExpenseCategories(sheetTransportation)
    : null;
  response.otherExpenses = sheetOtherExpenses
    ? mapExpenseCategories(sheetOtherExpenses)
    : null;
  response.electricity = sheetElectricity
    ? mapElectricityData(sheetElectricity)
    : null;
  response.water = sheetWater
    ? mapWaterData(sheetWater)
    : null;
  response.gas = sheetGas
    ? mapGasData(sheetGas)
    : null;
  response.travel = sheetTravel
    ? mapTravelData(sheetTravel)
    : null;
  response.investments = sheetInvestments
    ? mapInvestments(sheetInvestments)
    : null;
  response.fundAllocations = sheetFundAllocations
    ? mapFundAllocations(sheetFundAllocations)
    : null;
  response.totalBreakdown = sheetTotalBreakdown
    ? mapTotalBreakdown(sheetTotalBreakdown)
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
function createErrorResponse(
  message: string
): GoogleAppsScript.Content.TextOutput {
  const response = new FinancialResponseDTO();
  response.status = "error";
  response.message = message;
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}
