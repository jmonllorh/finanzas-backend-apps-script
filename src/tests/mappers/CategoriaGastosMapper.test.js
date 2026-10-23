const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

class CategoriaGastosMapperTests {
  constructor() {
    this.context = vm.createContext({});
    const compiledFiles = [
      "../../../dist/dtos/comun/UnidadValue.js",
      "../../../dist/dtos/comun/MesValue.js",
      "../../../dist/dtos/categorias/CategoriaGastosDTO.js",
      "../../../dist/utils/Utils.js",
      "../../../dist/mappers/CategoriaGastosMapper.js"
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
    return vm.runInContext("crearCategoriaGastosDTO(sheet)", this.context);
  }
}

const mapperTests = new CategoriaGastosMapperTests();

test("CategoriaGastosMapperTests - construye DTOs por año con importes mensuales", () => {
  const emptyRow = () => Array(12).fill("");
  const rows = [
    [2026, ...Array(11).fill("")],
    ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    [10, 20, ...Array(10).fill("")],
    [5, ...Array(11).fill("")],
    [15, 20, ...Array(10).fill("")],
    emptyRow(),
    [2025, ...Array(11).fill("")],
    ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
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
  assert.equal(dto[0].año, 2026);
  assert.deepEqual(
    JSON.parse(JSON.stringify(dto[0].meses[0])),
    {
      mes: "Enero",
      importes: [
        { valor: 10, unidad: "€", nota: "Nota del primer importe" },
        { valor: 5, unidad: "€" }
      ],
      total: { valor: 15, unidad: "€", nota: "Nota del total" }
    }
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(dto[0].meses[1])),
    {
      mes: "Febrero",
      importes: [{ valor: 20, unidad: "€" }],
      total: { valor: 20, unidad: "€" }
    }
  );
  assert.equal(dto[1].año, 2025);
  assert.equal(dto[1].meses[0].total.valor, 7);
});
