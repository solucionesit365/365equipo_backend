import { Injectable, Logger } from "@nestjs/common";
import axios, { AxiosError } from "axios";
import { DateTime } from "luxon"; // Importamos Luxon para manejo de fechas

@Injectable()
export class GraphService {
  private readonly logger = new Logger(GraphService.name);
  private readonly tokenUrl = `https://login.microsoftonline.com/${process.env.MBC_TOKEN_TENANT}/oauth2/v2.0/token`;
  private readonly graphBaseUrl = "https://graph.microsoft.com/v1.0";
  private readonly defaultTimeZone = "Europe/Madrid";

  async getAccessToken(): Promise<string> {
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", process.env.CLIENT_ID_EZEMIGUEL);
    params.append("client_secret", process.env.VALOR_SECRET_EZEMIGUEL);
    params.append("scope", "https://graph.microsoft.com/.default");

    try {
      const response = await axios.post(this.tokenUrl, params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      this.logger.debug("Access token obtained successfully.");
      return response.data.access_token;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(`Error fetching access token: ${axiosError.message}`);
      if (axiosError.response) {
        this.logger.error(
          `Response data: ${JSON.stringify(axiosError.response.data)}`,
        );
        this.logger.error(`Response status: ${axiosError.response.status}`);
      }
      throw axiosError;
    }
  }

  async getUsers(): Promise<any> {
    try {
      const token = await this.getAccessToken();

      this.logger.debug(`Fetching users from: ${this.graphBaseUrl}/users`);
      const response = await axios.get(`${this.graphBaseUrl}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      this.logger.debug("Users fetched successfully.");
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(`Error fetching users: ${axiosError.message}`);
      if (axiosError.response) {
        this.logger.error(
          `Response data: ${JSON.stringify(axiosError.response.data)}`,
        );
        this.logger.error(`Response status: ${axiosError.response.status}`);
      }
      throw axiosError;
    }
  }

  async getRooms(): Promise<any> {
    try {
      const token = await this.getAccessToken();

      this.logger.debug(
        `Fetching rooms from: ${this.graphBaseUrl}/places/microsoft.graph.room`,
      );
      const response = await axios.get(
        `${this.graphBaseUrl}/places/microsoft.graph.room`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      this.logger.debug("Rooms fetched successfully.");
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(`Error fetching rooms: ${axiosError.message}`);
      if (axiosError.response) {
        this.logger.error(
          `Response data: ${JSON.stringify(axiosError.response.data)}`,
        );
        this.logger.error(`Response status: ${axiosError.response.status}`);
      }
      throw axiosError;
    }
  }

  async getRoomAvailability(
    roomEmail: string,
    startDate: DateTime,
    endDate: DateTime,
    timeZone: string = this.defaultTimeZone,
  ) {
    try {
      const token = await this.getAccessToken();

      // Convertir fechas a DateTime de Luxon si no lo son ya
      const startDateTime = this.ensureDateTime(startDate, timeZone);
      const endDateTime = this.ensureDateTime(endDate, timeZone);

      // Validar que las fechas sean correctas
      if (!startDateTime.isValid) {
        throw new Error(
          `Fecha de inicio inválida: ${startDateTime.invalidReason}`,
        );
      }
      if (!endDateTime.isValid) {
        throw new Error(`Fecha de fin inválida: ${endDateTime.invalidReason}`);
      }

      // Validar que la fecha de fin sea posterior a la de inicio
      if (endDateTime <= startDateTime) {
        throw new Error(
          "La fecha de fin debe ser posterior a la fecha de inicio",
        );
      }

      // Endpoint para verificar disponibilidad
      const url = `${this.graphBaseUrl}/users/${roomEmail}/calendar/getSchedule`;

      // Datos para la solicitud con formato ISO para Graph API
      const requestData = {
        schedules: [roomEmail],
        startTime: {
          dateTime: startDateTime.toISO(),
          timeZone: timeZone,
        },
        endTime: {
          dateTime: endDateTime.toISO(),
          timeZone: timeZone,
        },
        availabilityViewInterval: 30, // Intervalos de 30 minutos
      };

      this.logger.debug(`Checking availability for room: ${roomEmail}`);
      this.logger.debug(
        `From: ${startDateTime.toISO()} to: ${endDateTime.toISO()} (${timeZone})`,
      );

      const response = await axios.post(url, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      this.logger.debug("Room availability fetched successfully.");
      return response.data.value[0].scheduleItems[0].status != "busy";
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(
        `Error fetching room availability: ${axiosError.message}`,
      );
      if (axiosError.response) {
        this.logger.error(
          `Response data: ${JSON.stringify(axiosError.response.data)}`,
        );
        this.logger.error(`Response status: ${axiosError.response.status}`);
      }
      throw axiosError;
    }
  }

  async getRoomEvents(
    roomEmail: string,
    startDate: string | Date | DateTime,
    endDate: string | Date | DateTime,
    timeZone: string = this.defaultTimeZone,
  ): Promise<any> {
    try {
      const token = await this.getAccessToken();

      // Convertir fechas a DateTime de Luxon si no lo son ya
      const startDateTime = this.ensureDateTime(startDate, timeZone);
      const endDateTime = this.ensureDateTime(endDate, timeZone);

      // Validar que las fechas sean correctas
      if (!startDateTime.isValid) {
        throw new Error(
          `Fecha de inicio inválida: ${startDateTime.invalidReason}`,
        );
      }
      if (!endDateTime.isValid) {
        throw new Error(`Fecha de fin inválida: ${endDateTime.invalidReason}`);
      }

      // Validar que la fecha de fin sea posterior a la de inicio
      if (endDateTime <= startDateTime) {
        throw new Error(
          "La fecha de fin debe ser posterior a la fecha de inicio",
        );
      }

      // Formatear fechas para el filtro de Graph API
      const startIso = startDateTime.toISO();
      const endIso = endDateTime.toISO();

      // Construir la URL con filtro de fechas
      const url = `${this.graphBaseUrl}/users/${roomEmail}/calendar/events?$filter=start/dateTime ge '${startIso}' and end/dateTime le '${endIso}'`;

      this.logger.debug(`Fetching events for room: ${roomEmail}`);
      this.logger.debug(`From: ${startIso} to: ${endIso} (${timeZone})`);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Prefer: `outlook.timezone="${timeZone}"`, // Solicitar respuesta en la zona horaria especificada
        },
      });

      this.logger.debug("Room events fetched successfully.");
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(`Error fetching room events: ${axiosError.message}`);
      if (axiosError.response) {
        this.logger.error(
          `Response data: ${JSON.stringify(axiosError.response.data)}`,
        );
        this.logger.error(`Response status: ${axiosError.response.status}`);
      }
      throw axiosError;
    }
  }

  private ensureDateTime(
    date: string | Date | DateTime,
    timeZone: string = this.defaultTimeZone,
  ): DateTime {
    if (date instanceof DateTime) {
      // Si ya es un DateTime, asegurarse de que tenga la zona horaria correcta
      return date.setZone(timeZone);
    } else if (date instanceof Date) {
      // Convertir Date a DateTime con la zona horaria especificada
      return DateTime.fromJSDate(date).setZone(timeZone);
    } else if (typeof date === "string") {
      // Intentar parsear el string como ISO primero
      let dt = DateTime.fromISO(date, { zone: timeZone });

      // Si no es válido, intentar otros formatos comunes
      if (!dt.isValid) {
        // Intentar formato SQL (YYYY-MM-DD HH:MM:SS)
        dt = DateTime.fromSQL(date, { zone: timeZone });
      }

      if (!dt.isValid) {
        // Intentar formato HTTP (RFC 2822)
        dt = DateTime.fromHTTP(date, { zone: timeZone });
      }

      if (!dt.isValid) {
        // Intentar formato RFC 2822
        dt = DateTime.fromRFC2822(date, { zone: timeZone });
      }

      return dt;
    }

    // Si llegamos aquí, el formato no es reconocido
    return DateTime.invalid("Formato de fecha no reconocido");
  }

  async getMultipleRoomsAvailability(
    roomEmails: string[],
    startDate: string | Date | DateTime,
    endDate: string | Date | DateTime,
    timeZone: string = this.defaultTimeZone,
  ): Promise<any> {
    try {
      const token = await this.getAccessToken();

      // Convertir fechas a DateTime de Luxon
      const startDateTime = this.ensureDateTime(startDate, timeZone);
      const endDateTime = this.ensureDateTime(endDate, timeZone);

      // Validaciones
      if (
        !startDateTime.isValid ||
        !endDateTime.isValid ||
        endDateTime <= startDateTime
      ) {
        throw new Error("Fechas inválidas o rango incorrecto");
      }

      // Endpoint para verificar disponibilidad
      const url = `${this.graphBaseUrl}/users/${roomEmails[0]}/calendar/getSchedule`;

      // Datos para la solicitud
      const requestData = {
        schedules: roomEmails,
        startTime: {
          dateTime: startDateTime.toISO(),
          timeZone: timeZone,
        },
        endTime: {
          dateTime: endDateTime.toISO(),
          timeZone: timeZone,
        },
        availabilityViewInterval: 30, // Intervalos de 30 minutos
      };

      this.logger.debug(`Checking availability for ${roomEmails.length} rooms`);
      const response = await axios.post(url, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      this.logger.debug("Multiple rooms availability fetched successfully.");
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(
        `Error fetching multiple rooms availability: ${axiosError.message}`,
      );
      if (axiosError.response) {
        this.logger.error(
          `Response data: ${JSON.stringify(axiosError.response.data)}`,
        );
      }
      throw axiosError;
    }
  }
}
