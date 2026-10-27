const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

class InvestmentsMapperTests {
  constructor() {
    this.context = vm.createContext({});
    const compiledFiles = [
      "../../../dist/dtos/common/AssetType.js",
      "../../../dist/dtos/investments/InvestmentsDTO.js",
      "../../../dist/utils/SpreadsheetUtils.js",
      "../../../dist/mappers/InvestmentsMapper.js"
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
    return vm.runInContext("mapInvestments(sheet)", this.context);
  }
}

const mapperTests = new InvestmentsMapperTests();

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

test("InvestmentsMapperTests - maps records, totals, and deposits", () => {
  const rows = createInvestmentRows();
  const notes = rows.map(() => Array(27).fill(""));
  const dto = mapperTests.mapSheet(rows, notes);

  assert.equal(dto.funds.items.length, 5);
  assert.equal(dto.funds.items[0].date.toISOString(), "2025-01-15T00:00:00.000Z");
  assert.deepEqual(
    JSON.parse(JSON.stringify(dto.funds.items[0].assets[0])),
    {
      type: "Bancos",
      value: 1000
    }
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(dto.funds.items[0].assets[1])),
    {
      type: "Fondo monetario",
      value: 200
    }
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(dto.funds.items[0].assets[2])),
    {
      type: "Renta fija",
      value: 500
    }
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(dto.funds.items[0].assets[3])),
    {
      type: "Renta variable",
      value: 5000,
      contributed: 100,
      benefit: 10,
      gain: 1
    }
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(dto.funds.items[0].assets[4])),
    {
      type: "Total",
      value: 6000,
      benefit: 120,
      gain: 2
    }
  );
  assert.equal(dto.funds.items[0].maximumHomePurcharsePrice, 80000);
  assert.equal(dto.funds.totals.length, 5);
  assert.equal(dto.funds.totals[0].type, "Bancos");
  assert.equal(dto.funds.totals[0].value, 1000);
  assert.equal(dto.funds.totals[0].benefit, null);
  assert.equal(dto.funds.totals[0].gain, null);
  assert.equal(dto.funds.totals[1].value, 200);
  assert.equal(dto.funds.totals[1].benefit, null);
  assert.equal(dto.funds.totals[1].gain, null);
  assert.equal(dto.funds.totals[2].value, 800);
  assert.equal(dto.funds.totals[2].benefit, null);
  assert.equal(dto.funds.totals[2].gain, null);
  assert.equal(dto.funds.totals[3].benefit, 250);
  assert.equal(dto.funds.totals[3].gain, 50);
  assert.equal(dto.funds.totals[4].type, "Total");
  assert.equal(dto.funds.totals[4].value, 6700);
  assert.equal(dto.funds.totals[4].benefit, null);
  assert.equal(dto.funds.totals[4].gain, null);
  assert.equal(dto.funds.homeEmergencyFund, 15000);
  assert.equal(dto.deposits.items.length, 1);
  assert.equal(dto.deposits.items[0].institution, "Depósito A");
  assert.equal(dto.deposits.items[0].nominalInterestRate, 4);
  assert.equal(dto.deposits.items[0].isActive, false);
  assert.equal(dto.deposits.totalAssetAmount, 0);
  assert.equal(dto.deposits.totalInterest, 679.75);
});

test("InvestmentsMapperTests - locates totals when their rows change", () => {
  const rows = createInvestmentRows();
  const notes = rows.map(() => Array(27).fill(""));
  rows.splice(4, 0, Array(27).fill(""));
  notes.splice(4, 0, Array(27).fill(""));

  const dto = mapperTests.mapSheet(rows, notes);

  assert.equal(dto.funds.totals[0].value, 1000);
  assert.equal(dto.funds.totals[1].value, 200);
  assert.equal(dto.funds.totals[2].value, 800);
  assert.equal(dto.funds.totals[3].benefit, 250);
  assert.equal(dto.funds.totals[3].gain, 50);
  assert.equal(dto.funds.totals[4].type, "Total");
  assert.equal(dto.funds.totals[4].value, 6700);
  assert.equal(dto.deposits.totalAssetAmount, 0);
  assert.equal(dto.deposits.totalInterest, 679.75);
});

test("InvestmentsMapperTests - reports unexpected headers", () => {
  const rows = createInvestmentRows();
  rows[1][1] = "Valor bancario";
  const notes = rows.map(() => Array(27).fill(""));

  assert.throws(
    () => mapperTests.mapSheet(rows, notes),
    /Column 2 should be named "Valor"\./
  );
});
