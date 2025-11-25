import { Test, TestingModule } from '@nestjs/testing';
import { TarjetaClienteService } from './tarjeta-cliente.class';
import { EmailService } from '../email/email.class';

describe('TarjetaClienteService', () => {
  let service: TarjetaClienteService;
  let mockEmailService: any;

  beforeEach(async () => {
    mockEmailService = {
      enviarEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TarjetaClienteService,
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<TarjetaClienteService>(TarjetaClienteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendQrCodeEmail', () => {
    it('debe enviar email con código QR', async () => {
      const codigo = 'CLIENT-123456';
      const toEmail = 'cliente@example.com';
      const walletUrl = 'https://wallet.example.com/add';

      mockEmailService.enviarEmail.mockResolvedValue({ accepted: [toEmail] });

      await service.sendQrCodeEmail(codigo, toEmail, walletUrl);

      expect(mockEmailService.enviarEmail).toHaveBeenCalled();
      const callArgs = mockEmailService.enviarEmail.mock.calls[0];
      expect(callArgs[0]).toBe(toEmail);
      expect(callArgs[2]).toBe('¡Ja formes part del #Club365!');
      // El tercer argumento es el HTML y el cuarto es la URL del QR
      expect(callArgs[3]).toBeDefined(); // URL del QR generado
    });

    it('debe incluir walletUrl en el email', async () => {
      const codigo = 'CLIENT-789';
      const toEmail = 'test@example.com';
      const walletUrl = 'https://pay.google.com/wallet/add';

      mockEmailService.enviarEmail.mockResolvedValue({ accepted: [toEmail] });

      await service.sendQrCodeEmail(codigo, toEmail, walletUrl);

      const htmlContent = mockEmailService.enviarEmail.mock.calls[0][1];
      expect(htmlContent).toContain(walletUrl);
    });
  });

  describe('sendQRInvitation', () => {
    it('debe enviar invitación con código QR', async () => {
      const codigo = 'INVITATION-123';
      const toEmail = 'invitado@example.com';

      mockEmailService.enviarEmail.mockResolvedValue({ accepted: [toEmail] });

      await service.sendQRInvitation(codigo, toEmail);

      expect(mockEmailService.enviarEmail).toHaveBeenCalled();
      const callArgs = mockEmailService.enviarEmail.mock.calls[0];
      expect(callArgs[0]).toBe(toEmail);
      expect(callArgs[2]).toBe('¡NOU CUPO 365!');
    });

    it('debe incluir mensaje de invitación en el HTML', async () => {
      const codigo = 'INVITATION-456';
      const toEmail = 'test@example.com';

      mockEmailService.enviarEmail.mockResolvedValue({ accepted: [toEmail] });

      await service.sendQRInvitation(codigo, toEmail);

      const htmlContent = mockEmailService.enviarEmail.mock.calls[0][1];
      expect(htmlContent).toContain('INVITACIÓ CLIENT');
    });
  });
});
