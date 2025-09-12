import { Tienda } from "@prisma/client";

export abstract class IGetTiendasUseCase {
  abstract execute(): Promise<Tienda[]>;
}
