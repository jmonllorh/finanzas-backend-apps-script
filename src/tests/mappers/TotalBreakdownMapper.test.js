const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

class TotalBreakdownMapperTests {
  constructor() {
    this.context = vm.createContext({});
    const compiledFiles = [
      "../../../dist/dtos/common/AssetType.js",
      "../../../dist/dtos/common/FinancialSummaryFieldsDTO.js",
      "../../../dist/dtos/TotalBreakdownDTO.js",
      "../../../dist/utils/SpreadsheetUtils.js",
      "../../../dist/mappers/FinancialSummaryFieldsMapper.js",
      "../../../dist/mappers/TotalBreakdownMapper.js"
    ];
    for (const file of compiledFiles) {
      const script = fs.readFileSync(path.join(__dirname, file), "utf8");
      vm.runInContext(script, this.context, { filename: file });
    }
  }

  mapSheet(rows, notes) {
    this.context.sheet = {
      getName: () => "Desglose total",
      getDataRange: () => ({
        getValues: () => rows,
        getNotes: () => notes
      })
    };
    return vm.runInContext("mapTotalBreakdown(sheet)", this.context);
  }
}

const mapperTests = new TotalBreakdownMapperTests();
const headers = [
  "Año", "Alquiler", "Electricidad", "Agua", "Internet", "Inversiones",
  "Suscripciones", "Médicos", "Comida/Limpieza", "Ocio", "Deporte",
  "Transporte", "Otros", "Viajes", "Ahorro neto", "Ahorro bruto",
  "Total gastos", "Ingresos fijos", "Bonos, ayudas, renta", "Ingresos totales"
];

function createFinancialRow(label, baseValue) {
  return [
    label,
    ...Array.from({ length: 12 }, (_, index) => baseValue + index),
    baseValue + 12,
    baseValue + 13,
    baseValue + 14,
    baseValue + 15,
    baseValue + 16,
    baseValue + 17,
    baseValue + 18
  ];
}

test("TotalBreakdownMapperTests - maps years, aggregates, and assets", () => {
  const rows = [
    headers,
    createFinancialRow(2025, 10),
    createFinancialRow(2026, 20),
    createFinancialRow("Total", 30),
    createFinancialRow("Media mensual", 40),
    ...Array.from({ length: 19 }, () => []),
    ["", "", "Bancos", 100],
    ["", "", "Depósitos", 200],
    ["", "", "Renta variable", 300],
    ["", "", "Fondo monetario", 400],
    ["", "", "Neuberger", 500],
    ["", "", "Total", 1500]
  ];
  const notes = rows.map(() => Array(20).fill(""));

  const dto = mapperTests.mapSheet(rows, notes);

  assert.equal(dto.years.length, 2);
  assert.equal(dto.years[0].year, 2025);
  assert.equal(dto.years[0].travelExpenses, 22);
  assert.equal(dto.years[0].bonusesAndBenefits, 27);
  assert.equal(dto.years[0].totalIncome, 28);
  assert.equal(dto.total.year, null);
  assert.equal(dto.total.totalExpenses, 45);
  assert.equal(dto.monthlyAverage.rent, 40);
  assert.equal(dto.assets.length, 6);
  assert.equal(dto.assets[4].type, "Renta fija");
  assert.equal(dto.assets[4].value, 500);
  assert.equal(dto.assets[5].type, "Total");
});
