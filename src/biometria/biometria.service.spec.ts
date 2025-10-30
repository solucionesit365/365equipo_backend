import { Test, TestingModule } from "@nestjs/testing";
import { BiometriaService } from "./biometria.service";
import { BiometriaDatabase } from "./biometria.mongodb";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";

jest.mock("@simplewebauthn/server");

describe("BiometriaService", () => {
  let service: BiometriaService;
  let biometriaDatabase: jest.Mocked<BiometriaDatabase>;

  beforeEach(async () => {
    const mockBiometriaDatabase = {
      saveChallenge: jest.fn(),
      getChallenge: jest.fn(),
      saveCredential: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BiometriaService,
        {
          provide: BiometriaDatabase,
          useValue: mockBiometriaDatabase,
        },
      ],
    }).compile();

    service = module.get<BiometriaService>(BiometriaService);
    biometriaDatabase = module.get(BiometriaDatabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("generateRegistrationOptions", () => {
    it("debe generar opciones de registro correctamente", async () => {
      const mockUser = {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
      };

      const mockOptions = {
        challenge: "mockChallenge123",
        rp: { name: "Ejemplo PWA", id: "365equipo.com" },
        user: {
          id: mockUser.id,
          name: mockUser.email,
          displayName: mockUser.name,
        },
      };

      (generateRegistrationOptions as jest.Mock).mockResolvedValue(mockOptions);
      biometriaDatabase.saveChallenge.mockResolvedValue(undefined);

      const result = await service.generateRegistrationOptions(mockUser);

      expect(generateRegistrationOptions).toHaveBeenCalledWith({
        rpName: "Ejemplo PWA",
        rpID: "365equipo.com",
        userID: mockUser.id,
        userName: mockUser.email,
        userDisplayName: mockUser.name,
        timeout: 60000,
        attestationType: "direct",
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
        },
      });

      expect(biometriaDatabase.saveChallenge).toHaveBeenCalledWith(
        mockUser.id,
        "mockChallenge123",
      );

      expect(result).toEqual(mockOptions);
    });

    it("debe manejar diferentes usuarios", async () => {
      const mockUser = {
        id: "user456",
        email: "another@example.com",
        name: "Another User",
      };

      const mockOptions = {
        challenge: "anotherChallenge456",
        rp: { name: "Ejemplo PWA" },
      };

      (generateRegistrationOptions as jest.Mock).mockResolvedValue(mockOptions);
      biometriaDatabase.saveChallenge.mockResolvedValue(undefined);

      await service.generateRegistrationOptions(mockUser);

      expect(biometriaDatabase.saveChallenge).toHaveBeenCalledWith(
        "user456",
        "anotherChallenge456",
      );
    });

    it("debe configurar authenticatorSelection correctamente", async () => {
      const mockUser = {
        id: "user789",
        email: "test@example.com",
        name: "Test User",
      };

      const mockOptions = { challenge: "challenge789" };
      (generateRegistrationOptions as jest.Mock).mockResolvedValue(mockOptions);
      biometriaDatabase.saveChallenge.mockResolvedValue(undefined);

      await service.generateRegistrationOptions(mockUser);

      expect(generateRegistrationOptions).toHaveBeenCalledWith(
        expect.objectContaining({
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
        }),
      );
    });
  });

  describe("verifyRegistrationResponse", () => {
    it("debe verificar respuesta de registro exitosamente", async () => {
      const mockResponse = {
        id: "credentialId123",
        rawId: "rawId123",
        response: {
          attestationObject: "attestationObject",
          clientDataJSON: "clientDataJSON",
        },
        type: "public-key",
      };

      const mockUser = {
        id: "user123",
        email: "test@example.com",
        name: "Test User",
      };

      const mockAuthData: any = {
        challenge: "storedChallenge123",
        userUID: "user123",
      };

      const mockVerification = {
        verified: true,
        registrationInfo: {
          credentialID: "credId123",
          credentialPublicKey: "publicKey",
        },
      };

      biometriaDatabase.getChallenge.mockResolvedValue(mockAuthData);
      (verifyRegistrationResponse as jest.Mock).mockResolvedValue(
        mockVerification,
      );
      biometriaDatabase.saveCredential.mockResolvedValue(undefined);

      const result = await service.verifyRegistrationResponse(
        mockResponse,
        mockUser,
      );

      expect(biometriaDatabase.getChallenge).toHaveBeenCalledWith(mockUser.id);
      expect(verifyRegistrationResponse).toHaveBeenCalledWith({
        response: mockResponse,
        expectedChallenge: "storedChallenge123",
        expectedOrigin: "https://tu-dominio.com",
        expectedRPID: "tu-dominio.com",
      });
      expect(biometriaDatabase.saveCredential).toHaveBeenCalledWith(
        mockUser.id,
        mockVerification.registrationInfo,
      );
      expect(result).toEqual(mockVerification);
    });

    it("debe manejar verificación fallida", async () => {
      const mockResponse = {
        id: "credentialId456",
        rawId: "rawId456",
      };

      const mockUser = {
        id: "user456",
        email: "test@example.com",
        name: "Test User",
      };

      const mockAuthData: any = {
        challenge: "storedChallenge456",
        userUID: "user456",
      };

      const mockVerification = {
        verified: false,
        registrationInfo: null,
      };

      biometriaDatabase.getChallenge.mockResolvedValue(mockAuthData);
      (verifyRegistrationResponse as jest.Mock).mockResolvedValue(
        mockVerification,
      );
      biometriaDatabase.saveCredential.mockResolvedValue(undefined);

      const result = await service.verifyRegistrationResponse(
        mockResponse,
        mockUser,
      );

      expect(result.verified).toBe(false);
      expect(biometriaDatabase.saveCredential).not.toHaveBeenCalled();
    });

    it("debe usar el challenge correcto del usuario", async () => {
      const mockResponse = { id: "cred789" };
      const mockUser = { id: "user789", email: "test@example.com", name: "Test" };

      const mockAuthData: any = { challenge: "uniqueChallenge789", userUID: "user789" };
      const mockVerification = {
        verified: true,
        registrationInfo: { credentialID: "cred789" },
      };

      biometriaDatabase.getChallenge.mockResolvedValue(mockAuthData);
      (verifyRegistrationResponse as jest.Mock).mockResolvedValue(
        mockVerification,
      );
      biometriaDatabase.saveCredential.mockResolvedValue(undefined);

      await service.verifyRegistrationResponse(mockResponse, mockUser);

      expect(verifyRegistrationResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          expectedChallenge: "uniqueChallenge789",
        }),
      );
    });
  });
});
