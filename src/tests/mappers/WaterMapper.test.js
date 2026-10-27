const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

class WaterMapperTests {
  constructor() {
    this.context = vm.createContext({});
    const compiledFiles = [
      "../../../dist/dtos/common/Month.js",
      "../../../dist/dtos/categories/WaterDTO.js",
      "../../../dist/utils/SpreadsheetUtils.js",
      "../../../dist/mappers/WaterMapper.js"
    ];
    for (const file of compiledFiles) {
      const script = fs.readFileSync(path.join(__dirname, file), "utf8");
      vm.runInContext(script, this.context, { filename: file });
    }
  }

  mapSheet(rows, notes) {
    this.context.sheet = {
      getName: () => "Agua",
      getDataRange: () => ({
        getValues: () => rows,
        getNotes: () => notes
      })
    };
    return vm.runInContext("mapWaterData(sheet)", this.context);
  }
}

const mapperTests = new WaterMapperTests();
const months = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

test("WaterMapperTests - populates each year with amounts, consumption, and price per liter", () => {
  const rows = [
    [2026, ...Array(12).fill("")],
    ["Concepto", ...months],
    ["Importe", 0, 72.626, ...Array(10).fill("")],
    ["Consumo", 0, 11.126, ...Array(10).fill("")],
    ["€/L", 0, 6.601818182, ...Array(10).fill("")],
    Array(13).fill(""),
    [2025, ...Array(12).fill("")],
    ["Concepto", ...months],
    ["Importe", 0, 70.79, ...Array(10).fill("")],
    ["Consumo", 0, 10, ...Array(10).fill("")],
    ["€/L", 0, 7.079, ...Array(10).fill("")]
  ];
  const notes = rows.map(() => Array(13).fill(""));
  notes[2][2] = "Incluye alcantarillado";

  const dtos = mapperTests.mapSheet(rows, notes);

  assert.equal(dtos.length, 2);
  assert.equal(dtos[0].year, 2026);
  assert.deepEqual(
    JSON.parse(JSON.stringify(dtos[0].months[1])),
    {
      month: "Febrero",
      amount: 72.63,
      amountNote: "Incluye alcantarillado",
      consumption: 11.13,
      pricePerLiter: 6.601818182
    }
  );
  assert.equal(dtos[0].months[0].amount, 0);
  assert.equal(dtos[1].months[1].pricePerLiter, 7.079);
});
