import { Injectable } from "@nestjs/common";
import { URLSearchParams } from "url";
import axios from "axios";

@Injectable()
export class MbctokenService {
  async getToken(clientID: string, clientSecret: string) {
    const params = new URLSearchParams();
    //preparando parametros
    params.append("tenant", process.env.MBC_TOKEN_TENANT);
    params.append("token_type", "Bearer");
    params.append("grant_type", "client_credentials");
    params.append("client_id", clientID);
    params.append("client_secret", clientSecret);
    params.append("scope", "https://api.businesscentral.dynamics.com/.default");

    const response = await axios.post(
      `https://login.microsoftonline.com/${process.env.MBC_TOKEN_TENANT}/oauth2/v2.0/token`,
      params,
    );

    if (!response) {
      throw new Error("Failed to obtain access token");
    }

    return response.data.access_token;
  }
}
