# Finance data service

[Versión en español](README.md)

A Google Apps Script service that reads a financial spreadsheet and exposes its data as JSON. TypeScript code organizes the transformation through DTOs and mappers.

## Data source

`assets/Hoja.xlsx` is the reference for the data model. The running service opens the Google spreadsheet identified by the `SPREADSHEET_ID` script property.

The response includes data from the implemented tabs. See the [service contract](docs/service-contract.md) for the complete response format, units, and error handling.

## Requirements and configuration

- Node.js and npm.
- The `clasp` CLI, authenticated with an account that can access the Apps Script project.
- A local `.clasp.json` containing the project configuration and `deploymentId`. This file is excluded from the repository.
- The `SPREADSHEET_ID` script property, configured in the Apps Script project with the spreadsheet ID.

## Development

```sh
npm install
npm run build
npm test
```

`npm run build` compiles TypeScript and copies the Apps Script manifest to `dist/`. `npm test` builds the project and runs the tests with Node.js.

## Deployment

```sh
npm run deploy
```

This command builds and pushes the code with `clasp`, then updates the deployment identified by `deploymentId` in `.clasp.json`. The development endpoint has the form `https://script.google.com/macros/s/{deploymentId}/dev`.

## Project structure

- `src/Main.ts`: HTTP GET entry point and response composition.
- `src/dtos/`: response data types.
- `src/mappers/`: transformation from sheets to DTOs.
- `src/utils/`: shared utilities for reading and normalizing spreadsheet data.
- `src/tests/`: mapper and utility tests.
- `assets/response.json`: example service response.
- `docs/service-contract.md`: contract consumed by clients.
