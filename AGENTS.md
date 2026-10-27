# Instrucciones del proyecto

El objetivo de este proyecto es devolver un modelo de datos basado en el contenido de `assets/Hoja.xlsx`, leyéndolo mediante Google Apps Scripts.

- Puedes simular una ejecución del script usando el `deploymentId` local de `.clasp.json` en `https://script.google.com/macros/s/{deploymentId}/dev`.
- Cada vez que quieras probar algo, ejecuta npm run deploy y cuando termine, lanza la llamada al servicio para verificar los resultados.
- Siempre que lances el servicio, actualiza el `assets/response.json` incluyendo la respuesta recibida, formateando el contenido json.

Para cualquier solicitud sobre datos o modelos de este proyecto:

- Usa `assets/Hoja.xlsx` como única fuente de verdad.
- `assets/response.json` representa un ejemplo de respuesta del servicio.
- Modela todas las pestañas del fichero excepto `Estimacion ahorro`, `Alquiler conjunto`, `Estimación agua`, `Cálculo nóminas` y `Previsión inicial`. De cada pestaña restante, incluye todos sus campos.
- Todo el código se creará dentro de la carpeta src
- Consulta el contenido del fichero antes de responder o implementar cambios relacionados con los datos.
- No inventes ni completes información que no esté respaldada por el fichero. Si falta información o hay ambigüedades, indícalo claramente.
- No modifiques el fichero fuente salvo que el usuario lo solicite explícitamente.
- Añade comentarios descriptivos en español a los nuevos métodos que crees.
