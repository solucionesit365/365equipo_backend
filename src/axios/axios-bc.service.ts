import { Injectable } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class AxiosBcService {
  getAxios() {
    const axiosBCInstance = axios.create({
      baseURL:
        "https://api.businesscentral.dynamics.com/v2.0/" +
        process.env.MBC_TOKEN_TENANT,
      timeout: 30000,
      headers: { Authorization: "Bearer " },
    });

    axiosBCInstance.interceptors.request.use(
      async (config) => {
        const params = new URLSearchParams();

        params.append("tenant", process.env.MBC_TOKEN_TENANT);
        params.append("token_type", "Bearer");
        params.append("grant_type", "client_credentials");
        params.append("client_id", process.env.MBC_TOKEN_APPHITBC);
        params.append(
          "client_secret",
          process.env.MBC_TOKEN_APPHITBC_CLIENT_SECRET,
        );
        params.append(
          "scope",
          "https://api.businesscentral.dynamics.com/.default",
        );

        const response = await axios.post(
          `https://login.microsoftonline.com/${process.env.MBC_TOKEN_TENANT}/oauth2/v2.0/token`,
          params,
        );

        if (!response) {
          throw new Error("Failed to obtain access token");
        }

        config.headers[
          "Authorization"
        ] = `Bearer ${response.data.access_token}`;

        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    return axiosBCInstance;
  }
}
