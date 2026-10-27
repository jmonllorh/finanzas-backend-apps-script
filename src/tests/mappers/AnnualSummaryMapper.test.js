const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

class AnnualSummaryMapperTests {
  constructor() {
    this.context = vm.createContext({});
    const compiledFiles = [
      "../../../dist/dtos/common/Month.js",
      "../../../dist/dtos/common/FinancialSummaryFieldsDTO.js",
      "../../../dist/dtos/AnnualSummaryDTO.js",
      "../../../dist/utils/SpreadsheetUtils.js",
      "../../../dist/mappers/FinancialSummaryFieldsMapper.js",
      "../../../dist/mappers/AnnualSummaryMapper.js"
    ];
    for (const file of compiledFiles) {
      const script = fs.readFileSync(path.join(__dirname, file), "utf8");
      vm.runInContext(script, this.context, { filename: file });
    }
  }

  mapSheet(rows, notes, name = "Resumen 2026") {
    this.context.sheet = {
      getName: () => name,
      getDataRange: () => ({
        getValues: () => rows,
        getNotes: () => notes
      })
    };
    return vm.runInContext("mapAnnualSummary(sheet)", this.context);
  }
}

const mapperTests = new AnnualSummaryMapperTests();
const months = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];
const currentHeaders = [
  "Mes", "Alquiler", "Electricidad", "Agua", "Internet", "Inversiones",
  "Suscripciones", "Médicos", "Comida/Limpieza", "Ocio", "Deporte",
  "Transporte", "Otros", "Ahorro neto", "Ahorro bruto",
  "Total gastos comunes", "Ingresos fijos"
];

function createSummaryRows(year, headers, financialFieldCount) {
  const monthRows = months.map((month) => [
    month,
    ...Array.from({ length: financialFieldCount }, (_, index) => index + 1)
  ]);
  const extraHeaders = ["Viajes", "Bonos, ayudas, renta"];
  monthRows[11].push(...extraHeaders);
  return [
    ["", year],
    headers,
    ...monthRows,
    [`Total ${year}`, ...Array(financialFieldCount).fill(20), 100, 50],
    ["Media", ...Array(financialFieldCount).fill(2)]
  ];
}

test("AnnualSummaryMapperTests - maps months, totals, and additional columns", () => {
  const rows = createSummaryRows(2026, currentHeaders, 16);
  const notes = rows.map(() => Array(19).fill(""));
  notes[2][1] = "Nota del alquiler";

  const dto = mapperTests.mapSheet(rows, notes);

  assert.equal(dto.year, 2026);
  assert.equal(dto.months.length, 12);
  assert.deepEqual(
    JSON.parse(JSON.stringify(dto.months[0])),
    {
      month: "Enero",
      rent: 1,
      rentNote: "Nota del alquiler",
      electricity: 2,
      water: 3,
      internet: 4,
      investments: 5,
      subscriptions: 6,
      medicalExpenses: 7,
      foodAndCleaning: 8,
      leisure: 9,
      sports: 10,
      transportation: 11,
      otherExpenses: 12,
      netSavings: 13,
      grossSavings: 14,
      totalExpenses: 15,
      regularIncome: 16
    }
  );
  assert.equal(dto.total.rent, 20);
  assert.equal(dto.total.travelExpenses, 100);
  assert.equal(dto.total.bonusesAndBenefits, 50);
  assert.equal(dto.monthlyAverage.totalExpenses, 2);
});

test("AnnualSummaryMapperTests - fills missing fields with zero in older years", () => {
  const oldHeaders = currentHeaders.filter((header) => header !== "Internet");
  const rows = createSummaryRows(2025, oldHeaders, 15);
  const notes = rows.map(() => Array(18).fill(""));

  const dto = mapperTests.mapSheet(rows, notes, "Resumen 2025");

  assert.equal(dto.year, 2025);
  assert.equal(dto.months[0].internet, 0);
  assert.equal(dto.months[0].internetNote, undefined);
});

test("AnnualSummaryMapperTests - preserves null when Internet exists but is empty", () => {
  const rows = createSummaryRows(2026, currentHeaders, 16);
  rows[2][4] = "";
  const notes = rows.map(() => Array(19).fill(""));

  const dto = mapperTests.mapSheet(rows, notes);

  assert.equal(dto.months[0].internet, null);
});

test("AnnualSummaryMapperTests - omits months without values or notes", () => {
  const oldHeaders = currentHeaders.filter((header) => header !== "Internet");
  const rows = createSummaryRows(2021, oldHeaders, 15);
  for (const row of rows.slice(2, 4)) {
    for (let columnIndex = 1; columnIndex <= 11; columnIndex++) {
      row[columnIndex] = "-";
    }
    for (let columnIndex = 12; columnIndex <= 15; columnIndex++) {
      row[columnIndex] = 0;
    }
  }
  const notes = rows.map(() => Array(18).fill(""));

  const dto = mapperTests.mapSheet(rows, notes, "Resumen 2021");

  assert.deepEqual(
    JSON.parse(JSON.stringify(dto.months.map(({ month }) => month))),
    months.slice(2)
  );
});
