const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

class SalaryEvolutionMapperTests {
  constructor() {
    this.context = vm.createContext({});
    const compiledFiles = [
      "../../../dist/dtos/SalaryEvolutionDTO.js",
      "../../../dist/utils/SpreadsheetUtils.js",
      "../../../dist/mappers/SalaryEvolutionMapper.js"
    ];
    for (const file of compiledFiles) {
      const script = fs.readFileSync(path.join(__dirname, file), "utf8");
      vm.runInContext(script, this.context, { filename: file });
    }
  }

  mapRow(row, columns, notes) {
    this.context.row = row;
    this.context.columns = columns;
    this.context.notes = notes;
    return vm.runInContext(
      "mapSalaryEvolutionRow(row, notes, columns)",
      this.context
    );
  }

  mapSheet(rows, notes) {
    this.context.sheet = {
      getName: () => "Evolución salario",
      getDataRange: () => ({
        getValues: () => rows,
        getNotes: () => notes
      })
    };
    return vm.runInContext("mapSalaryEvolution(sheet)", this.context);
  }
}

const mapperTests = new SalaryEvolutionMapperTests();

test("SalaryEvolutionMapperTests - maps a DTO from a single row", () => {
  const date = new Date(Date.UTC(2024, 9, 20));
  const dto = mapperTests.mapRow(
    [date, 48000, 0.25, 2873.64, 0.0175, "Subida anual"],
    {
      date: 0,
      grossAnnualSalary: 1,
      grossAnnualIncrease: 2,
      netMonthlySalary: 3,
      netMonthlyIncrease: 4,
      comments: 5
    },
    ["", "Nota del salario bruto", "", "", "", ""]
  );

  assert.equal(dto.date.toISOString(), "2024-10-20T00:00:00.000Z");
  assert.deepEqual(
    JSON.parse(JSON.stringify(dto)),
    {
      date: date.toISOString(),
      grossAnnualSalary: 48000,
      grossAnnualSalaryNote: "Nota del salario bruto",
      grossAnnualIncrease: 0.25 * 100,
      netMonthlySalary: 2873.64,
      netMonthlyIncrease: 1.75,
      comments: "Subida anual"
    }
  );
});

test("SalaryEvolutionMapperTests - skips rows containing only spaces", () => {
  const rows = [
    [
      "Fecha",
      "Salario bruto anual",
      "Incremento bruto anual",
      "Salario neto mensual",
      "Incremento neto mensual",
      "Comentarios"
    ],
    [" ", "   ", " ", "  ", " ", "   "]
  ];

  assert.equal(mapperTests.mapSheet(rows, rows.map(() => Array(6).fill(""))).length, 0);
});
