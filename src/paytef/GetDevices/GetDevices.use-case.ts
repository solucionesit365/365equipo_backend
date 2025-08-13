import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { DeviceResponse, IGetDevicesUseCase } from "./IGetDevices.use-case";
import axios, { AxiosResponse } from "axios";

@Injectable()
export class GetDevicesUseCase implements IGetDevicesUseCase {
  async execute(): Promise<DeviceResponse> {
    try {
      const endpoint =
        "https://api.paytef.es/json/api/configurationConsultation";

      const response: AxiosResponse<DeviceResponse> = await axios.post(
        endpoint,
        {
          authentication: {
            company: "4066",
            username: process.env.PAYTEF_USERNAME,
            password: process.env.PAYTEF_PASSWORD,
          },
        },
      );

      // reducimos cada branch a addressLine1, name y terminals
      const reduced = response.data.branches.map((b) => ({
        addressLine1: b.addressLine1,
        name: b.name,
        terminals: b.terminals,
        devices: b.devices,
      }));

      // devolvemos SOLO branches en el root
      return { branches: reduced } as unknown as DeviceResponse;
    } catch (error: any) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
