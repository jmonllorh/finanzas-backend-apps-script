const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

class ExpenseCategoryMapperTests {
  constructor() {
    this.context = vm.createContext({});
    const compiledFiles = [
      "../../../dist/dtos/common/Month.js",
      "../../../dist/dtos/categories/ExpenseCategoryDTO.js",
      "../../../dist/utils/SpreadsheetUtils.js",
      "../../../dist/mappers/ExpenseCategoryMapper.js"
    ];
    for (const file of compiledFiles) {
      const script = fs.readFileSync(path.join(__dirname, file), "utf8");
      vm.runInContext(script, this.context, { filename: file });
    }
  }

  mapSheet(rows, formulas, notes) {
    this.context.sheet = {
      getName: () => "Ocio",
      getDataRange: () => ({
        getValues: () => rows,
        getFormulas: () => formulas,
        getNotes: () => notes
      })
    };
    return vm.runInContext("mapExpenseCategories(sheet)", this.context);
  }
}

const mapperTests = new ExpenseCategoryMapperTests();
const months = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

test("ExpenseCategoryMapperTests - creates DTOs by year with monthly amounts", () => {
  const emptyRow = () => Array(12).fill("");
  const rows = [
    [2026, ...Array(11).fill("")],
    months,
    [10, 20, ...Array(10).fill("")],
    [5, ...Array(11).fill("")],
    [15, 20, ...Array(10).fill("")],
    emptyRow(),
    [2025, ...Array(11).fill("")],
    months,
    [7, ...Array(11).fill("")],
    [7, ...Array(11).fill("")]
  ];
  const formulas = rows.map(() => Array(12).fill(""));
  formulas[4][0] = "=SUM(A3:A4)";
  formulas[9][0] = "=SUM(A8:A8)";
  const notes = rows.map(() => Array(12).fill(""));
  notes[2][0] = "Nota del primer importe";
  notes[4][0] = "Nota del total";

  const dto = mapperTests.mapSheet(rows, formulas, notes);

  assert.equal(dto.length, 2);
  assert.equal(dto[0].year, 2026);
  assert.deepEqual(
    JSON.parse(JSON.stringify(dto[0].months[0])),
    {
      month: "Enero",
      amounts: [
        { value: 10, note: "Nota del primer importe" },
        { value: 5 }
      ],
      total: 15,
      totalNote: "Nota del total"
    }
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(dto[0].months[1])),
    {
      month: "Febrero",
      amounts: [{ value: 20 }],
      total: 20
    }
  );
  assert.equal(dto[1].year, 2025);
  assert.equal(dto[1].months[0].total, 7);
});
