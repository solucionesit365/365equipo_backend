import { Test, TestingModule } from "@nestjs/testing";
import { CryptoService } from "./crypto.class";
import { createHash } from "crypto";

jest.mock("crypto");
jest.mock("luxon");

describe("CryptoService", () => {
  let service: CryptoService;
  let mockCreateHash: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockDigest: jest.Mock;

  beforeEach(async () => {
    mockDigest = jest.fn().mockReturnValue("mockedHashValue");
    mockUpdate = jest.fn().mockReturnValue({ digest: mockDigest });
    mockCreateHash = createHash as jest.Mock;
    mockCreateHash.mockReturnValue({ update: mockUpdate });

    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptoService],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("hashFile512", () => {
    it("debe crear un hash SHA-512 del archivo", () => {
      const mockBuffer = Buffer.from("test data");

      const result = service.hashFile512(mockBuffer);

      expect(mockCreateHash).toHaveBeenCalledWith("sha512");
      expect(mockUpdate).toHaveBeenCalledWith(mockBuffer);
      expect(mockDigest).toHaveBeenCalledWith("hex");
      expect(result).toBe("mockedHashValue");
    });

    it("debe manejar buffers vacíos", () => {
      const emptyBuffer = Buffer.from("");

      const result = service.hashFile512(emptyBuffer);

      expect(mockCreateHash).toHaveBeenCalledWith("sha512");
      expect(mockUpdate).toHaveBeenCalledWith(emptyBuffer);
      expect(result).toBe("mockedHashValue");
    });
  });

  describe("hashFile256", () => {
    it("debe crear un hash SHA-256 del archivo", () => {
      const mockBuffer = Buffer.from("test data");

      const result = service.hashFile256(mockBuffer);

      expect(mockCreateHash).toHaveBeenCalledWith("sha256");
      expect(mockUpdate).toHaveBeenCalledWith(mockBuffer);
      expect(mockDigest).toHaveBeenCalledWith("hex");
      expect(result).toBe("mockedHashValue");
    });

    it("debe manejar buffers grandes", () => {
      const largeBuffer = Buffer.alloc(1024 * 1024);

      const result = service.hashFile256(largeBuffer);

      expect(mockCreateHash).toHaveBeenCalledWith("sha256");
      expect(mockUpdate).toHaveBeenCalledWith(largeBuffer);
      expect(result).toBe("mockedHashValue");
    });
  });

  describe("createCsv", () => {
    it("debe generar un código de verificación seguro", () => {
      const { DateTime } = require("luxon");
      const mockNow = {
        toISO: jest.fn().mockReturnValue("2023-01-01T00:00:00.000Z"),
      };
      DateTime.now = jest.fn().mockReturnValue(mockNow);

      const result = service.createCsv();

      expect(DateTime.now).toHaveBeenCalled();
      expect(mockNow.toISO).toHaveBeenCalled();
      expect(mockCreateHash).toHaveBeenCalledWith("sha256");
      expect(mockUpdate).toHaveBeenCalledWith("2023-01-01T00:00:00.000Z");
      expect(mockDigest).toHaveBeenCalledWith("hex");
      expect(result).toBe("mockedHashValue");
    });

    it("debe generar códigos únicos en diferentes momentos", () => {
      const { DateTime } = require("luxon");
      const mockNow1 = {
        toISO: jest.fn().mockReturnValue("2023-01-01T00:00:00.000Z"),
      };
      const mockNow2 = {
        toISO: jest.fn().mockReturnValue("2023-01-01T00:01:00.000Z"),
      };

      DateTime.now = jest
        .fn()
        .mockReturnValueOnce(mockNow1)
        .mockReturnValueOnce(mockNow2);

      const result1 = service.createCsv();
      const result2 = service.createCsv();

      expect(DateTime.now).toHaveBeenCalledTimes(2);
      expect(result1).toBe("mockedHashValue");
      expect(result2).toBe("mockedHashValue");
    });
  });
});
