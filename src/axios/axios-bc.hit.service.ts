import { Injectable } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class AxiosBcHitService {
  getAxios() {
    const axiosBCHitInstance = axios.create({
      baseURL:
        "https://api.businesscentral.dynamics.com/v2.0/" +
        process.env.TENANT_TOKEN_HIT,
      timeout: 30000,
      headers: { Authorization: "Bearer " },
    });

    axiosBCHitInstance.interceptors.request.use(
      async (config) => {
        const params = new URLSearchParams();

        params.append("tenant", process.env.TENANT_TOKEN_HIT);
        params.append("token_type", "Bearer");
        params.append("grant_type", "client_credentials");
        params.append("client_id", process.env.CLIENT_ID_HIT);
        params.append("client_secret", process.env.CLIENT_SECRET_HIT);
        params.append(
          "scope",
          "https://api.businesscentral.dynamics.com/.default",
        );

        const response = await axios.post(
          `https://login.microsoftonline.com/${process.env.TENANT_TOKEN_HIT}/oauth2/v2.0/token`,
          params,
        );

        if (!response) {
          throw new Error("Failed to obtain access token");
        }

        config.headers["Authorization"] =
          `Bearer ${response.data.access_token}`;

        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    return axiosBCHitInstance;
  }
}
