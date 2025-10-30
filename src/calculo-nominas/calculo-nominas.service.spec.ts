import { Test, TestingModule } from '@nestjs/testing';
import { CalculoNominasService } from './calculo-nominas.service';
import { NotificacionHorasExtrasClass } from '../notificacion-horas-extras/notificacion-horas-extras.class';
import { Fichajes } from '../fichajes-bc/fichajes.class';
import { TrabajadorService } from '../trabajadores/trabajadores.class';
import { CalendarioFestivoService } from '../calendario-festivos/calendario-festivos.class';

describe('CalculoNominasService', () => {
  let service: CalculoNominasService;
  let horasExtrasService: jest.Mocked<NotificacionHorasExtrasClass>;
  let fichajesService: jest.Mocked<Fichajes>;
  let trabajadorService: jest.Mocked<TrabajadorService>;
  let calendarioService: jest.Mocked<CalendarioFestivoService>;

  beforeEach(async () => {
    const mockHorasExtrasService = {
      create: jest.fn(),
      getAll: jest.fn(),
    };

    const mockFichajesService = {
      getFichajesByUid: jest.fn(),
      ordenarPorHora: jest.fn(),
    };

    const mockTrabajadorService = {
      getTrabajadores: jest.fn(),
    };

    const mockCalendarioService = {
      getfestivos: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalculoNominasService,
        { provide: NotificacionHorasExtrasClass, useValue: mockHorasExtrasService },
        { provide: Fichajes, useValue: mockFichajesService },
        { provide: TrabajadorService, useValue: mockTrabajadorService },
        { provide: CalendarioFestivoService, useValue: mockCalendarioService },
      ],
    }).compile();

    service = module.get<CalculoNominasService>(CalculoNominasService);
    horasExtrasService = module.get(NotificacionHorasExtrasClass);
    fichajesService = module.get(Fichajes);
    trabajadorService = module.get(TrabajadorService);
    calendarioService = module.get(CalendarioFestivoService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('calcularPDIS', () => {
    it('debe llamar a los servicios necesarios', async () => {
      trabajadorService.getTrabajadores.mockResolvedValue([]);
      calendarioService.getfestivos.mockResolvedValue([
        {
          tienda: [1],
          fechaInicio: '01/01/2024',
          fechaFinal: '01/01/2024',
          tipo: 'FESTIVOPLUS',
        },
      ] as any);

      try {
        await service.calcularPDIS();
      } catch (error) {
        // Es esperado que falle sin datos completos del periodo anterior
        expect(error.message).toContain('periodo anterior');
      }

      expect(trabajadorService.getTrabajadores).toHaveBeenCalled();
      expect(calendarioService.getfestivos).toHaveBeenCalled();
    });
  });
});
