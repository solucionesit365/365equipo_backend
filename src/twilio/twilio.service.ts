import { Injectable } from "@nestjs/common";
import axios from "axios";
axios;
@Injectable()
export class TwilioService {
  async sendSms() {
    const accountSid = process.env.TWILIO_SID; // Tu Account SID de Twilio
    const authToken = process.env.TWILIO_SECRET; // Tu Auth Token de Twilio

    const data = new URLSearchParams({
      From: "+3197010208079", // Número de Twilio desde el cual envías
      To: "+34722495410", // Número del trabajador al que envías el SMS
      Body: "No te olvides de poner el where en el delete from", // Contenido del mensaje
    });

    const config = {
      method: "post",
      url: `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      auth: {
        username: accountSid,
        password: authToken,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: data.toString(),
    };

    try {
      const response = await axios(config);
      console.log("Mensaje enviado correctamente:", response.data);
      return true;
    } catch (error) {
      console.error(
        "Error al enviar SMS:",
        error.response ? error.response.data : error.message,
      );
      return false;
    }
  }
}
