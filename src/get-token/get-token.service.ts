import { Injectable } from "@nestjs/common";

@Injectable()
export class TokenService {
  extract(authHeader: string): string | null {
    if (!authHeader) {
      return null;
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer") {
      return null;
    }

    if (!token) {
      return null;
    }

    return token;
  }
}
