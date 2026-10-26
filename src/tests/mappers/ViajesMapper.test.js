const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

class ViajesMapperTests {
  constructor() {
    this.context = vm.createContext({});
    const compiledFiles = [
      "../../../dist/dtos/comun/UnidadValue.js",
      "../../../dist/dtos/comun/RegistroWrapperDTO.js",
      "../../../dist/dtos/categorias/ViajesDTO.js",
      "../../../dist/utils/Utils.js",
      "../../../dist/mappers/ViajesMapper.js"
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
    return vm.runInContext("crearViajesDTO(sheet)", this.context);
  }
}

const mapperTests = new ViajesMapperTests();

test("ViajesMapperTests - mapea años, viajes, gastos y totales", () => {
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
  const formulas = rows.map(() => Array(8).fill(""));
  formulas[5][3] = "=SUM(B3:B5)";
  formulas[7][7] = "=SUM(F3:F7)";
  const notes = rows.map(() => Array(8).fill(""));
  notes[2][1] = "Importe original";

  const dtos = mapperTests.mapSheet(rows, formulas, notes);

  assert.equal(dtos.length, 2);
  assert.equal(dtos[0].año, 2021);
  assert.deepEqual(
    JSON.parse(JSON.stringify(dtos[0])),
    {
      año: 2021,
      viajes: [
        {
          nombre: "Málaga y Granada",
          gastos: [
            {
              importe: { valor: 161.6, unidad: "€", nota: "Importe original" },
              comentario: "Alojamiento"
            },
            {
              importe: { valor: 132.8, unidad: "€" },
              comentario: "Gastos varios"
            },
            {
              importe: { valor: 30, unidad: "€" },
              comentario: "Gasolina"
            }
          ],
          total: { valor: 324.4, unidad: "€" }
        }
      ],
      total: { valor: 324.4, unidad: "€" }
    }
  );
  assert.equal(dtos[1].año, 2022);
  assert.equal(dtos[1].viajes[0].nombre, "Córdoba");
  assert.equal(dtos[1].viajes[0].gastos.length, 5);
  assert.equal(dtos[1].viajes[0].gastos[3].importe.valor, 126.3);
  assert.equal(dtos[1].viajes[0].total.valor, 319.3);
  assert.equal(dtos[1].total.valor, 319.3);
});
