import { Test, TestingModule } from '@nestjs/testing';
import { ColorSemanalService } from './color-semanal.service';
import { PrismaService } from '../prisma/prisma.service';
import { Color } from './color-semanal.dto';

describe('ColorSemanalService', () => {
  let service: ColorSemanalService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrismaService = {
      color: {
        update: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColorSemanalService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ColorSemanalService>(ColorSemanalService);
    prisma = module.get(PrismaService) as any;
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('saveColorIn', () => {
    it('debe guardar el color correctamente', async () => {
      const mockColor = Color.Green;
      const mockResult = {
        id: 'ENTRA_COLOR',
        value: Color.Green,
        updatedAt: new Date(),
      };

      (prisma.color.update as jest.Mock).mockResolvedValue(mockResult);

      const result = await service.saveColorIn(mockColor);

      expect(result).toEqual(mockResult);
      expect(prisma.color.update).toHaveBeenCalledWith({
        where: { id: 'ENTRA_COLOR' },
        data: {
          value: mockColor,
          updatedAt: expect.any(Date),
        },
      });
    });
  });

  describe('getColors', () => {
    it('debe retornar colorIn y colorOut correctamente', async () => {
      const mockColorData = {
        id: 'ENTRA_COLOR',
        value: Color.Green,
        updatedAt: new Date('2024-01-01'),
      };

      (prisma.color.findUnique as jest.Mock).mockResolvedValue(mockColorData);

      const result = await service.getColors();

      expect(result.colorIn).toBe(Color.Green);
      expect(result.colorOut).toBe('orange');
      expect(result.updatedAt).toBeDefined();
    });
  });

  describe('getColorIn', () => {
    it('debe retornar brown cuando colorOut es Green', () => {
      const result = service.getColorIn(Color.Green);
      expect(result).toBe('brown');
    });

    it('debe retornar green cuando colorOut es Orange', () => {
      const result = service.getColorIn(Color.Orange);
      expect(result).toBe('green');
    });

    it('debe retornar orange cuando colorOut es Blue', () => {
      const result = service.getColorIn(Color.Blue);
      expect(result).toBe('orange');
    });

    it('debe retornar blue cuando colorOut es Brown', () => {
      const result = service.getColorIn(Color.Brown);
      expect(result).toBe('blue');
    });
  });

  describe('getColorOut', () => {
    it('debe retornar green cuando colorIn es Brown', () => {
      const result = service.getColorOut(Color.Brown);
      expect(result).toBe('green');
    });

    it('debe retornar orange cuando colorIn es Green', () => {
      const result = service.getColorOut(Color.Green);
      expect(result).toBe('orange');
    });

    it('debe retornar blue cuando colorIn es Orange', () => {
      const result = service.getColorOut(Color.Orange);
      expect(result).toBe('blue');
    });

    it('debe retornar brown cuando colorIn es Blue', () => {
      const result = service.getColorOut(Color.Blue);
      expect(result).toBe('brown');
    });
  });
});
