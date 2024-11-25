import { diaPersonal } from "./dia-personal.interface";
import { DateTime } from "luxon"; // Asegúrate de importar Luxon si aún no lo has hecho

export function constructEmailContent(diaPersonal: diaPersonal): string {
  diaPersonal.fechaInicio = new Date(diaPersonal.fechaInicio);
  diaPersonal.fechaFinal = new Date(diaPersonal.fechaFinal);
  diaPersonal.fechaIncorporacion = new Date(diaPersonal.fechaIncorporacion);

  const fechaInicio = DateTime.fromJSDate(diaPersonal.fechaInicio).toFormat(
    "dd/MM/yyyy",
  );
  const fechaFinal = DateTime.fromJSDate(diaPersonal.fechaFinal).toFormat(
    "dd/MM/yyyy",
  );
  const fechaIncorporacion = DateTime.fromJSDate(
    diaPersonal.fechaIncorporacion,
  ).toFormat("dd/MM/yyyy");

  return `<!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>Solicitud de Día Personal</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #eef1f4;
            }
            .container {
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                background: #ffffff;
                padding: 20px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
            }
            h1 {
                color: #0056b3;
                text-align: center;
                font-size: 20px;
                margin-bottom: 10px;
            }
            .section {
                background-color: #f8f9fa;
                padding: 10px;
                margin-top: 10px;
                border-radius: 5px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            }
            .item {
                margin: 5px 0;
                color: #333;
            }
            .label {
                font-weight: bold;
            }
            .value {
                float: right;
            }
            .highlight {
                background-color: #d1ecf1;
                border-color: #bee5eb;
                color: #0c5460;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Solicitud de Día Personal</h1>
            <div class="section">
                <div class="item">
                    <span class="label">Fecha de Inicio:</span>
                    <span class="value">${fechaInicio}</span>
                </div>
                <div class="item">
                    <span class="label">Fecha Final:</span>
                    <span class="value">${fechaFinal}</span>
                </div>
                <div class="item">
                    <span class="label">Fecha de Incorporación:</span>
                    <span class="value">${fechaIncorporacion}</span>
                </div>
                <div class="item">
                    <span class="label">Total de Días:</span>
                    <span class="value">${diaPersonal.totalDias}</span>
                </div>
            </div>
            <div class="section highlight">
                <div class="item">
                    <span class="label">Observaciones:</span>
                    <span class="value">${diaPersonal.observaciones}</span>
                </div>
            </div>
        </div>
    </body>
    </html>`;
}
