import { Test, TestingModule } from '@nestjs/testing';
import { ClientesService } from './clientes.service';
import { SolicitudNuevoClienteBbdd } from './clientes.mongodb';
import { EmailService } from '../email/email.class';
import { TarjetaClienteService } from '../tarjeta-cliente/tarjeta-cliente.class';

describe('ClientesService', () => {
  let service: ClientesService;
  let mockDatabase: any;
  let mockEmailService: any;
  let mockTarjetaClienteService: any;

  beforeEach(async () => {
    mockDatabase = {
      nuevaSolicitud: jest.fn(),
      nuevoCodigoFlayer: jest.fn(),
      getSolicitud: jest.fn(),
      borrarSolicitud: jest.fn(),
      getAllFlayers: jest.fn(),
      validarFlayer: jest.fn(),
      caducarFlayer: jest.fn(),
      deleteAllClientes: jest.fn(),
    };

    mockEmailService = {
      enviarEmail: jest.fn(),
    };

    mockTarjetaClienteService = {
      sendQrCodeEmail: jest.fn(),
      sendQRInvitation: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientesService,
        {
          provide: SolicitudNuevoClienteBbdd,
          useValue: mockDatabase,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: TarjetaClienteService,
          useValue: mockTarjetaClienteService,
        },
      ],
    }).compile();

    service = module.get<ClientesService>(ClientesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleForm', () => {
    it('debe crear solicitud de nuevo cliente y enviar email', async () => {
      mockDatabase.nuevaSolicitud.mockResolvedValue({ insertedId: '123' });
      mockEmailService.enviarEmail.mockResolvedValue({ accepted: ['test@example.com'] });

      const result = await service.handleForm(
        true,
        true,
        'test@example.com',
        'Juan',
        'Pérez',
        '600000000',
        '28001',
      );

      expect(result).toBe(true);
      expect(mockDatabase.nuevaSolicitud).toHaveBeenCalled();
      expect(mockEmailService.enviarEmail).toHaveBeenCalled();
    });

    it('debe crear solicitud sin ser nuevo cliente y enviar QR invitación', async () => {
      mockDatabase.nuevaSolicitud.mockResolvedValue({ insertedId: '123' });
      mockDatabase.nuevoCodigoFlayer.mockResolvedValue({ insertedId: '456' });
      mockTarjetaClienteService.sendQRInvitation.mockResolvedValue(undefined);

      await service.handleForm(false, true, 'test@example.com');

      expect(mockDatabase.nuevaSolicitud).toHaveBeenCalled();
      expect(mockDatabase.nuevoCodigoFlayer).toHaveBeenCalled();
      expect(mockTarjetaClienteService.sendQRInvitation).toHaveBeenCalled();
    });
  });

  describe('enviarStringIdentificacion', () => {
    it('debe enviar email con código QR', async () => {
      const idExterna = 'QRCLIENT123';
      const toEmail = 'cliente@example.com';
      const walletUrl = 'https://pay.google.com/wallet/add';

      mockTarjetaClienteService.sendQrCodeEmail.mockResolvedValue(undefined);

      await service.enviarStringIdentificacion(idExterna, toEmail, walletUrl);

      expect(mockTarjetaClienteService.sendQrCodeEmail).toHaveBeenCalledWith(
        idExterna,
        toEmail,
        walletUrl,
      );
    });
  });

  describe('getAllFlayers', () => {
    it('debe retornar todos los flayers', async () => {
      const mockFlayers = [
        { _id: '1', codigo: 'FLAYER1' },
        { _id: '2', codigo: 'FLAYER2' },
      ];

      mockDatabase.getAllFlayers.mockResolvedValue(mockFlayers);

      const result = await service.getAllFlayers();

      expect(result).toEqual(mockFlayers);
    });

    it('debe manejar error y retornar undefined', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      mockDatabase.getAllFlayers.mockRejectedValue(new Error('DB Error'));

      const result = await service.getAllFlayers();

      expect(result).toBeUndefined();
      consoleSpy.mockRestore();
    });
  });

  describe('validarFlayer', () => {
    it('debe validar un flayer por código', async () => {
      const codigo = 'FLAYER123';

      mockDatabase.validarFlayer.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.validarFlayer(codigo);

      expect(result).toEqual({ modifiedCount: 1 });
      expect(mockDatabase.validarFlayer).toHaveBeenCalledWith(codigo);
    });
  });

  describe('caducarFlayer', () => {
    it('debe caducar un flayer por código', async () => {
      const codigo = 'FLAYER123';

      mockDatabase.caducarFlayer.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.caducarFlayer(codigo);

      expect(result).toEqual({ modifiedCount: 1 });
      expect(mockDatabase.caducarFlayer).toHaveBeenCalledWith(codigo);
    });
  });

  describe('deleteAllClientes', () => {
    it('debe eliminar todos los clientes', async () => {
      mockDatabase.deleteAllClientes.mockResolvedValue({ deletedCount: 10 });

      const result = await service.deleteAllClientes();

      expect(result).toEqual({ deletedCount: 10 });
      expect(mockDatabase.deleteAllClientes).toHaveBeenCalled();
    });
  });
});
