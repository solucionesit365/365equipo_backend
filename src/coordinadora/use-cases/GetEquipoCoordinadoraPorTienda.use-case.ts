import { Injectable, PreconditionFailedException } from "@nestjs/common";
import { IGetEquipoCoordinadoraPorTienda } from "./interfaces/IGetEquipoCoordinadoraPorTienda.use-case";
import { ICoordinadoraRepository } from "../repository/interfaces/ICoordinadora.repository";

@Injectable()
export class GetEquipoCoordinadoraPorTiendaUseCase
  implements IGetEquipoCoordinadoraPorTienda
{
  constructor(
    private readonly coordinadoraRepository: ICoordinadoraRepository,
  ) {}

  // async execute(idTienda: number) {
  //   // Obtengo primero el id de la coordinadora de la tienda
  //   const coordinadora =
  //     await this.coordinadoraRepository.getCoordinadoraPorTienda(idTienda);

  //   if (!coordinadora)
  //     throw new PreconditionFailedException({
  //       message: "Es necesario tener una coordinadora en la tienda",
  //       code: "SIN_COORDINADORA",
  //     });

  //   return [
  //     ...(await this.coordinadoraRepository.getSubordinadosCoordinadora(
  //       coordinadora.id,
  //     )),
  //     coordinadora,
  //   ];
  // }

  async execute(idTienda: number) {
    // Obtener la coordinadora de la tienda
    const coordinadora =
      await this.coordinadoraRepository.getCoordinadoraPorTienda(idTienda);

    if (!coordinadora || !coordinadora.principal) {
      throw new PreconditionFailedException({
        message: "Es necesario tener una coordinadora en la tienda",
        code: "SIN_COORDINADORA",
      });
    }

    // Obtener los subordinados de la coordinadora principal
    const subordinadosPrincipal =
      await this.coordinadoraRepository.getSubordinadosCoordinadora(
        coordinadora.principal.id,
      );

    // Obtener los subordinados de las coordinadoras adicionales
    const subordinadosAdicionales = await Promise.all(
      coordinadora.adicionales.map(async (coordinadora) =>
        this.coordinadoraRepository.getSubordinadosCoordinadora(
          coordinadora.id,
        ),
      ),
    );

    // Unir todos los subordinados (principal + adicionales)
    const todosSubordinados = [
      ...subordinadosPrincipal,
      ...subordinadosAdicionales.flat(), // `flat()` aplana el arreglo de subordinados de las coordinadoras adicionales
    ];

    // Filtrar duplicados basados en el ID del trabajador
    const uniqueSubordinados = Array.from(
      new Map(todosSubordinados.map((item) => [item.id, item])).values(),
    );

    // Asegurarnos de que la coordinadora principal y adicionales solo aparezcan una vez
    const coordinadorasUnicas = Array.from(
      new Map(
        [coordinadora.principal, ...coordinadora.adicionales].map(
          (coordinadora) => [coordinadora.id, coordinadora],
        ),
      ).values(),
    );

    // Asegurarse de que no agregamos coordinadoras a los subordinados
    const subordinadosFinales = uniqueSubordinados.filter(
      (subordinado) =>
        !coordinadorasUnicas.some(
          (coordinadora) => coordinadora.id === subordinado.id,
        ),
    );

    // Retornar los subordinados y las coordinadoras
    return {
      subordinados: subordinadosFinales,
      coordinadoras: coordinadorasUnicas,
    };
  }
}
