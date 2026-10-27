const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

class TravelMapperTests {
  constructor() {
    this.context = vm.createContext({});
    const compiledFiles = [
      "../../../dist/dtos/categories/TravelDTO.js",
      "../../../dist/utils/SpreadsheetUtils.js",
      "../../../dist/mappers/TravelMapper.js"
    ];
    for (const file of compiledFiles) {
      const script = fs.readFileSync(path.join(__dirname, file), "utf8");
      vm.runInContext(script, this.context, { filename: file });
    }
  }

  mapSheet(rows, formulas, notes) {
    this.context.sheet = {
      getName: () => "Viajes",
      getDataRange: () => ({
        getValues: () => rows,
        getFormulas: () => formulas,
        getNotes: () => notes
      })
    };
    return vm.runInContext("mapTravelData(sheet)", this.context);
  }
}

const mapperTests = new TravelMapperTests();

test("TravelMapperTests - maps years, trips, expenses, and totals", () => {
  const rows = [
    [2021, "", "", "", 2022, "", "", ""],
    [
      "Viaje", "Importes", "Comentario", "Total",
      "Viaje", "Importes", "Comentario", "Total"
    ],
    ["Málaga y Granada", 161.6, "Alojamiento", 324.4, "Córdoba", 123, "Alojamiento", 319.3],
    ["", 132.8, "Gastos varios", "", "", 10, "Palacio Viana", ""],
    ["", 30, "Gasolina", "", "", 10, "Mezquita", ""],
    ["", "", "", 324.4, "", 126.3, "Gastos varios", ""],
    ["", "", "", "", "", 50, "Gasolina", ""],
    ["", "", "", "", "", "", "", 319.3]
  ];
  rows[5][1] = " ";
  const formulas = rows.map(() => Array(8).fill(""));
  formulas[5][3] = "=SUM(B3:B5)";
  formulas[7][7] = "=SUM(F3:F7)";
  const notes = rows.map(() => Array(8).fill(""));
  notes[2][1] = "Importe original";

  const dtos = mapperTests.mapSheet(rows, formulas, notes);

  assert.equal(dtos.length, 2);
  assert.equal(dtos[0].year, 2021);
  assert.deepEqual(
    JSON.parse(JSON.stringify(dtos[0])),
    {
      year: 2021,
      trips: [
        {
          name: "Málaga y Granada",
          expenses: [
            {
              amount: 161.6,
              amountNote: "Importe original",
              comment: "Alojamiento"
            },
            {
              amount: 132.8,
              comment: "Gastos varios"
            },
            {
              amount: 30,
              comment: "Gasolina"
            }
          ],
          total: 324.4
        }
      ],
      total: 324.4
    }
  );
  assert.equal(dtos[1].year, 2022);
  assert.equal(dtos[1].trips[0].name, "Córdoba");
  assert.equal(dtos[1].trips[0].expenses.length, 5);
  assert.equal(dtos[1].trips[0].expenses[3].amount, 126.3);
  assert.equal(dtos[1].trips[0].total, 319.3);
  assert.equal(dtos[1].total, 319.3);
});
