import { Test, TestingModule } from "@nestjs/testing";
import { videosFormacion365Class } from "./videos-formacion.class";
import { videosFormacion365Mongo } from "./videos-formacion.mongodb";
import {
  videosFormacion365Interface,
  videosVistosFormacion365Interface,
} from "./videos-formacion.interface";

describe("videosFormacion365Class", () => {
  let service: videosFormacion365Class;
  let videosDB: any;

  beforeEach(async () => {
    const mockVideosDB = {
      nuevoVideo: jest.fn(),
      nuevoVistoVideo: jest.fn(),
      getVideos: jest.fn(),
      getVideosVistos: jest.fn(),
      updatevideo: jest.fn(),
      deleteVideo: jest.fn(),
      incrementarContadorViews: jest.fn(),
      views: jest.fn(),
      findVideoByIdVideo: jest.fn(),
      getVideosByCategoria: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        videosFormacion365Class,
        {
          provide: videosFormacion365Mongo,
          useValue: mockVideosDB,
        },
      ],
    }).compile();

    service = module.get<videosFormacion365Class>(videosFormacion365Class);
    videosDB = module.get(videosFormacion365Mongo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("nuevoVideo", () => {
    it("debe crear un nuevo video correctamente", async () => {
      const mockVideo: videosFormacion365Interface = {
        titulo: "Video de prueba",
        categoria: "Ventas",
        urlVideo: "https://example.com/video",
      } as videosFormacion365Interface;

      videosDB.nuevoVideo.mockResolvedValue(true);

      const result = await service.nuevoVideo(mockVideo);

      expect(videosDB.nuevoVideo).toHaveBeenCalledWith(mockVideo);
      expect(result).toBe(true);
    });

    it("debe retornar undefined si la creación falla", async () => {
      const mockVideo: videosFormacion365Interface = {
        titulo: "Video fallido",
      } as videosFormacion365Interface;

      videosDB.nuevoVideo.mockResolvedValue(false);

      const result = await service.nuevoVideo(mockVideo);

      expect(result).toBeUndefined();
    });
  });

  describe("nuevoVistoVideo", () => {
    it("debe registrar un video visto correctamente", async () => {
      const mockVideoVisto: any = {
        idVideo: "video123",
        idUsuario: "user123",
        fechaVisto: new Date(),
      };

      videosDB.nuevoVistoVideo.mockResolvedValue(true);

      const result = await service.nuevoVistoVideo(mockVideoVisto);

      expect(videosDB.nuevoVistoVideo).toHaveBeenCalledWith(mockVideoVisto);
      expect(result).toBe(true);
    });

    it("debe retornar undefined si el registro falla", async () => {
      const mockVideoVisto: any = {
        idVideo: "video456",
        idUsuario: "user456",
      };

      videosDB.nuevoVistoVideo.mockResolvedValue(false);

      const result = await service.nuevoVistoVideo(mockVideoVisto);

      expect(result).toBeUndefined();
    });
  });

  describe("getVideos", () => {
    it("debe obtener todos los videos", async () => {
      const mockVideos = [
        { id: "1", titulo: "Video 1" },
        { id: "2", titulo: "Video 2" },
      ];

      videosDB.getVideos.mockResolvedValue(mockVideos);

      const result = await service.getVideos();

      expect(videosDB.getVideos).toHaveBeenCalled();
      expect(result).toEqual(mockVideos);
    });

    it("debe retornar array vacío si no hay videos", async () => {
      videosDB.getVideos.mockResolvedValue([]);

      const result = await service.getVideos();

      expect(result).toEqual([]);
    });
  });

  describe("getVideosVistos", () => {
    it("debe obtener todos los videos vistos", async () => {
      const mockVideosVistos = [
        { idVideo: "1", idUsuario: "user1" },
        { idVideo: "2", idUsuario: "user2" },
      ];

      videosDB.getVideosVistos.mockResolvedValue(mockVideosVistos);

      const result = await service.getVideosVistos();

      expect(videosDB.getVideosVistos).toHaveBeenCalled();
      expect(result).toEqual(mockVideosVistos);
    });
  });

  describe("updateVideo", () => {
    it("debe actualizar un video correctamente", async () => {
      const mockVideo: any = {
        _id: "video123",
        titulo: "Video actualizado",
      };

      videosDB.updatevideo.mockResolvedValue({ modifiedCount: 1 } as any);

      const result = await service.updateVideo(mockVideo);

      expect(videosDB.updatevideo).toHaveBeenCalledWith(mockVideo);
      expect(result).toEqual({ modifiedCount: 1 });
    });
  });

  describe("deleteVideo", () => {
    it("debe eliminar un video correctamente", async () => {
      const videoId = "video123";

      videosDB.deleteVideo.mockResolvedValue({ deletedCount: 1 } as any);

      const result = await service.deleteVideo(videoId);

      expect(videosDB.deleteVideo).toHaveBeenCalledWith(videoId);
      expect(result).toEqual({ deletedCount: 1 });
    });

    it("debe manejar la eliminación de video inexistente", async () => {
      const videoId = "videoInexistente";

      videosDB.deleteVideo.mockResolvedValue({ deletedCount: 0 } as any);

      const result = await service.deleteVideo(videoId);

      expect(result).toEqual({ deletedCount: 0 });
    });
  });

  describe("incrementarContadorViews", () => {
    it("debe incrementar el contador de vistas", async () => {
      const videoId = "video123";

      videosDB.incrementarContadorViews.mockResolvedValue({ modifiedCount: 1 } as any);

      const result = await service.incrementarContadorViews(videoId);

      expect(videosDB.incrementarContadorViews).toHaveBeenCalledWith(videoId);
      expect(result).toEqual({ modifiedCount: 1 });
    });
  });

  describe("views", () => {
    it("debe obtener las estadísticas de vistas", async () => {
      const mockViews = { totalViews: 1000, uniqueUsers: 50 };

      videosDB.views.mockResolvedValue(mockViews as any);

      const result = await service.views();

      expect(videosDB.views).toHaveBeenCalled();
      expect(result).toEqual(mockViews);
    });
  });

  describe("findVideoByIdVideo", () => {
    it("debe buscar un video por nombre e ID", async () => {
      const nombre = "Video Tutorial";
      const idVideo = "video123";
      const mockVideo = { _id: "video123", titulo: "Video Tutorial" };

      videosDB.findVideoByIdVideo.mockResolvedValue(mockVideo as any);

      const result = await service.findVideoByIdVideo(nombre, idVideo);

      expect(videosDB.findVideoByIdVideo).toHaveBeenCalledWith(nombre, idVideo);
      expect(result).toEqual(mockVideo);
    });

    it("debe retornar null si no se encuentra el video", async () => {
      videosDB.findVideoByIdVideo.mockResolvedValue(null);

      const result = await service.findVideoByIdVideo("NoExiste", "id999");

      expect(result).toBeNull();
    });
  });

  describe("getVideosByCategoria", () => {
    it("debe obtener videos por categoría y tienda", async () => {
      const categoria = "Ventas";
      const idTienda = 1;
      const mockVideos = [
        { id: "1", titulo: "Video Ventas 1", categoria: "Ventas" },
        { id: "2", titulo: "Video Ventas 2", categoria: "Ventas" },
      ];

      videosDB.getVideosByCategoria.mockResolvedValue(mockVideos as any);

      const result = await service.getVideosByCategoria(categoria, idTienda);

      expect(videosDB.getVideosByCategoria).toHaveBeenCalledWith(
        categoria,
        idTienda,
      );
      expect(result).toEqual(mockVideos);
    });

    it("debe retornar array vacío si no hay videos en la categoría", async () => {
      videosDB.getVideosByCategoria.mockResolvedValue([]);

      const result = await service.getVideosByCategoria("CategoriaVacia", 1);

      expect(result).toEqual([]);
    });
  });
});
