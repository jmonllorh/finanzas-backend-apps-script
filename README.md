# Finanzas — servicio de datos

[English version](README.en.md)

Servicio de Google Apps Script que lee una hoja de cálculo financiera y expone sus datos como JSON. El código TypeScript organiza la transformación mediante DTO y mappers.

## Fuente de datos

`assets/Hoja.xlsx` es la referencia para el modelo de datos. El servicio en ejecución abre la hoja de cálculo de Google indicada por la propiedad de script `SPREADSHEET_ID`.

La respuesta incluye datos de las pestañas implementadas. Consulta el [contrato del servicio](docs/service-contract.md) para conocer el formato completo, las unidades y el tratamiento de errores.

## Requisitos y configuración

- Node.js y npm.
- La CLI de `clasp`, autenticada con una cuenta que pueda acceder al proyecto de Apps Script.
- Un fichero local `.clasp.json` con la configuración del proyecto y `deploymentId`. Este fichero está excluido del repositorio.
- La propiedad de script `SPREADSHEET_ID`, configurada en el proyecto de Apps Script con el ID de la hoja de cálculo.

## Desarrollo

```sh
npm install
npm run build
npm test
```

`npm run build` compila TypeScript y copia el manifiesto de Apps Script a `dist/`. `npm test` compila el proyecto y ejecuta las pruebas con Node.js.

## Despliegue

```sh
npm run deploy
```

El comando compila y publica el código con `clasp`, y actualiza el despliegue identificado por `deploymentId` en `.clasp.json`. El endpoint de desarrollo tiene la forma `https://script.google.com/macros/s/{deploymentId}/dev`.

## Estructura

- `src/Main.ts`: entrada HTTP GET y composición de la respuesta.
- `src/dtos/`: tipos de los datos de respuesta.
- `src/mappers/`: transformación de hojas a DTO.
- `src/utils/`: utilidades compartidas para leer y normalizar datos de hojas.
- `src/tests/`: pruebas de mappers y utilidades.
- `assets/response.json`: ejemplo de respuesta del servicio.
- `docs/service-contract.md`: contrato consumido por los clientes.
