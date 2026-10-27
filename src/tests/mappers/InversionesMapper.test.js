const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

class InversionesMapperTests {
  constructor() {
    this.context = vm.createContext({});
    const compiledFiles = [
      "../../../dist/dtos/comun/TipoActivoValue.js",
      "../../../dist/dtos/inversiones/InversionesDTO.js",
      "../../../dist/utils/Utils.js",
      "../../../dist/mappers/InversionesMapper.js"
    ];
    for (const file of compiledFiles) {
      const script = fs.readFileSync(path.join(__dirname, file), "utf8");
      vm.runInContext(script, this.context, { filename: file });
    }
  }

  mapSheet(rows, notes) {
    this.context.sheet = {
      getName: () => "Inversiones",
      getDataRange: () => ({
        getValues: () => rows,
        getNotes: () => notes
      })
    };
    return vm.runInContext("crearInversionesDTO(sheet)", this.context);
  }
}

const mapperTests = new InversionesMapperTests();

function createInvestmentRow(date) {
  const row = Array(27).fill("");
  row[0] = date;
  row[1] = 1000;
  row[3] = 200;
  row[4] = 500;
  row[6] = 5000;
  row[7] = 100;
  row[8] = 10;
  row[9] = 0.01;
  row[11] = 6000;
  row[12] = 120;
  row[13] = 0.02;
  row[15] = 80000;
  return row;
}

function createInvestmentRows() {
  const rows = Array.from({ length: 9 }, () => Array(27).fill(""));
  rows[0][1] = "Bancos";
  rows[0][3] = "Renta fija";
  rows[0][6] = "Renta variable";
  rows[0][11] = "Agregado";
  rows[0][19] = "Depósitos";
  rows[1][0] = "Fecha";
  rows[1][1] = "Valor";
  rows[1][2] = "Valor actual";
  rows[1][3] = "Fondo monetario";
  rows[1][4] = "Neuberger";
  rows[1][5] = "Valor monetario";
  rows[1][6] = "Valor";
  rows[1][7] = "Aportado";
  rows[1][8] = "Beneficio mensual";
  rows[1][9] = "Ganancia";
  rows[1][10] = "Valor renta variable";
  rows[1][11] = "Valor";
  rows[1][12] = "Beneficio mensual";
  rows[1][13] = "Ganancia";
  rows[1][14] = "Valor total";
  rows[1][15] = "Máxima vivienda";
  rows[1][16] = "Colchón seguridad vivienda";
  rows[1][19] = "Entidad";
  rows[1][20] = "Importe";
  rows[1][21] = "Fecha de inicio";
  rows[1][22] = "Fecha de vencimiento";
  rows[1][23] = "T.I.N.";
  rows[1][24] = "Intereses brutos";
  rows[1][25] = "Intereses netos";
  rows[1][26] = "Activo";

  for (let rowIndex = 2; rowIndex <= 6; rowIndex++) {
    rows[rowIndex] = createInvestmentRow(
      new Date(Date.UTC(2025, rowIndex - 2, 15))
    );
  }

  rows[2][2] = 1000;
  rows[2][5] = 200;
  rows[2][10] = 5000;
  rows[2][14] = 6700;
  rows[2][16] = 15000;
  rows[3][5] = "Valor renta fija";
  rows[3][10] = "Beneficio total";
  rows[4][5] = 800;
  rows[4][10] = 250;
  rows[5][10] = "Ganancia total";
  rows[5][19] = "Total activos:";
  rows[5][20] = 0;
  rows[5][25] = "Intereses totales:";
  rows[5][26] = 679.752;
  rows[6][10] = 0.5;
  rows[7][0] = " ";

  const startDate = new Date(Date.UTC(2025, 0, 1));
  const endDate = new Date(Date.UTC(2025, 3, 1));
  rows[2][19] = "Depósito A";
  rows[2][20] = 10000;
  rows[2][21] = startDate;
  rows[2][22] = endDate;
  rows[2][23] = 0.04;
  rows[2][24] = 100;
  rows[2][25] = 81;
  rows[2][26] = "No";
  rows[8][19] = "Deuda antigua San Juan";
  rows[8][20] = 13710;

  return rows;
}

test("InversionesMapperTests - mapea registros, totales y depósitos", () => {
  const rows = createInvestmentRows();
  const notes = rows.map(() => Array(27).fill(""));
  const dto = mapperTests.mapSheet(rows, notes);

  assert.equal(dto.fondos.items.length, 5);
  assert.equal(dto.fondos.items[0].fecha.toISOString(), "2025-01-15T00:00:00.000Z");
  assert.deepEqual(
    JSON.parse(JSON.stringify(dto.fondos.items[0].activos[0])),
    {
      tipo: "Bancos",
      valor: 1000
    }
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(dto.fondos.items[0].activos[1])),
    {
      tipo: "Fondo monetario",
      valor: 200
    }
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(dto.fondos.items[0].activos[2])),
    {
      tipo: "Renta fija",
      valor: 500
    }
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(dto.fondos.items[0].activos[3])),
    {
      tipo: "Renta variable",
      valor: 5000,
      aportado: 100,
      beneficio: 10,
      ganancia: 1
    }
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(dto.fondos.items[0].activos[4])),
    {
      tipo: "Total",
      valor: 6000,
      beneficio: 120,
      ganancia: 2
    }
  );
  assert.equal(dto.fondos.items[0].valorMaximoVivienda, 80000);
  assert.equal(dto.fondos.totales.length, 5);
  assert.equal(dto.fondos.totales[0].tipo, "Bancos");
  assert.equal(dto.fondos.totales[0].valor, 1000);
  assert.equal(dto.fondos.totales[0].beneficio, null);
  assert.equal(dto.fondos.totales[0].ganancia, null);
  assert.equal(dto.fondos.totales[1].valor, 200);
  assert.equal(dto.fondos.totales[1].beneficio, null);
  assert.equal(dto.fondos.totales[1].ganancia, null);
  assert.equal(dto.fondos.totales[2].valor, 800);
  assert.equal(dto.fondos.totales[2].beneficio, null);
  assert.equal(dto.fondos.totales[2].ganancia, null);
  assert.equal(dto.fondos.totales[3].beneficio, 250);
  assert.equal(dto.fondos.totales[3].ganancia, 50);
  assert.equal(dto.fondos.totales[4].tipo, "Total");
  assert.equal(dto.fondos.totales[4].valor, 6700);
  assert.equal(dto.fondos.totales[4].beneficio, null);
  assert.equal(dto.fondos.totales[4].ganancia, null);
  assert.equal(dto.fondos.colchonSeguridadVivienda, 15000);
  assert.equal(dto.depositos.items.length, 1);
  assert.equal(dto.depositos.items[0].entidad, "Depósito A");
  assert.equal(dto.depositos.items[0].tin, 4);
  assert.equal(dto.depositos.items[0].activo, false);
  assert.equal(dto.depositos.importeTotalActivos, 0);
  assert.equal(dto.depositos.interesesTotales, 679.75);
});

test("InversionesMapperTests - localiza los totales aunque cambien de fila", () => {
  const rows = createInvestmentRows();
  const notes = rows.map(() => Array(27).fill(""));
  rows.splice(4, 0, Array(27).fill(""));
  notes.splice(4, 0, Array(27).fill(""));

  const dto = mapperTests.mapSheet(rows, notes);

  assert.equal(dto.fondos.totales[0].valor, 1000);
  assert.equal(dto.fondos.totales[1].valor, 200);
  assert.equal(dto.fondos.totales[2].valor, 800);
  assert.equal(dto.fondos.totales[3].beneficio, 250);
  assert.equal(dto.fondos.totales[3].ganancia, 50);
  assert.equal(dto.fondos.totales[4].tipo, "Total");
  assert.equal(dto.fondos.totales[4].valor, 6700);
  assert.equal(dto.depositos.importeTotalActivos, 0);
  assert.equal(dto.depositos.interesesTotales, 679.75);
});

test("InversionesMapperTests - informa de encabezados inesperados", () => {
  const rows = createInvestmentRows();
  rows[1][1] = "Valor bancario";
  const notes = rows.map(() => Array(27).fill(""));

  assert.throws(
    () => mapperTests.mapSheet(rows, notes),
    /La columna 2 debería llamarse "Valor"\./
  );
});
