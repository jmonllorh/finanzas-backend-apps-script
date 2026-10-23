const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

class EvolucionSalarioMapperTests {
  constructor() {
    this.context = vm.createContext({});
    const compiledFiles = [
      "../../../dist/dtos/comun/UnidadValue.js",
      "../../../dist/dtos/EvolucionSalarioDTO.js",
      "../../../dist/utils/Utils.js",
      "../../../dist/mappers/EvolucionSalarioMapper.js"
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
      "crearEvolucionSalarioDTODesdeFila(row, notes, columns)",
      this.context
    );
  }
}

const mapperTests = new EvolucionSalarioMapperTests();

test("EvolucionSalarioMapperTests - rellena un DTO desde una fila aislada", () => {
  const fecha = new Date(Date.UTC(2024, 9, 20));
  const dto = mapperTests.mapRow(
    [fecha, 48000, 0.25, 2873.64, 0.0175, "Subida anual"],
    {
      fecha: 0,
      salarioBrutoAnual: 1,
      incrementoBrutoAnual: 2,
      salarioNetoMensual: 3,
      incrementoNetoMensual: 4,
      comentarios: 5
    },
    ["", "Nota del salario bruto", "", "", "", ""]
  );

  assert.equal(dto.fecha.toISOString(), "2024-10-20T00:00:00.000Z");
  assert.deepEqual(
    JSON.parse(JSON.stringify(dto.salarioBrutoAnual)),
    { valor: 48000, unidad: "€", nota: "Nota del salario bruto" }
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(dto.incrementoBrutoAnual)),
    { valor: 0.25 * 100, unidad: "%" }
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(dto.salarioNetoMensual)),
    { valor: 2873.64, unidad: "€" }
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(dto.incrementoNetoMensual)),
    { valor: 0.0175 * 100, unidad: "%" }
  );
  assert.equal(dto.comentarios, "Subida anual");
});
