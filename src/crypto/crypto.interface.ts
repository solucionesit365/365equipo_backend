export abstract class ICryptoService {
  abstract hashFile512(file: Buffer): string;

  abstract hashFile256(file: Buffer): string;

  // Generar código serguro de verificación.
  abstract createCsv(): string;
}
