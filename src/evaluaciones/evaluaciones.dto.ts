import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

import { Type } from "class-transformer";

class Configuracion {
  @IsBoolean()
  preguntasExtras: boolean;

  @IsBoolean()
  objetivos: boolean;

  @IsBoolean()
  formacion: boolean;

  @IsBoolean()
  compromisos: boolean;

  @IsBoolean()
  destallesExtras: boolean;

  @IsBoolean()
  evolucionCorporativa: boolean;

  @IsBoolean()
  compartirEvaluacion: boolean;

  @IsBoolean()
  subirFoto: boolean;

  @IsBoolean()
  firmaResponsable: boolean;
}

class Encuestado {
  @IsOptional()
  @IsString()
  nombre: string;

  @IsOptional()
  @IsNumber()
  idSql: number;

  @IsOptional()
  @IsString()
  Fecha: string;
  @IsOptional()
  @IsNumber()
  year: number;

  @IsOptional()
  @IsString()
  departamento: string;

  @IsOptional()
  @IsNumber()
  tienda: number;
}

class PreguntaEvaluadaILUO {
  @IsOptional()
  @IsString()
  descripcion: string;

  @IsOptional()
  @IsString()
  estandar: string;

  @IsString()
  objetivoIluo: string;

  @IsString()
  pregunta: string;

  @IsOptional()
  @IsString()
  respuesta: string;
}

class PreguntaEvaluadaEvaluacion {
  @IsOptional()
  @IsString()
  descripcion: string;

  @IsString()
  pregunta: string;

  @IsOptional()
  @IsString()
  respuesta: string;
}

class Objetivos {
  añoAnterior: AñoAnterior;
  añoActual: AñoActual;
}

class AñoAnterior {
  @IsString()
  titulo: string;
  @IsString()
  consecución: string;
}

class AñoActual {
  @IsString()
  titulo: string;
  @IsString()
  indicador: string;
  @IsString()
  fechaFin: string;
}

class DestallesExtras {
  @IsOptional()
  @IsString()
  habilidades: string;

  @IsOptional()
  @IsString()
  hobbies: string;

  @IsOptional()
  @IsString()
  formaciones: string;

  @IsOptional()
  @IsString()
  experienciaPrevia: string;
}

class EvolucionCorporativa {
  promocion: boolean;
  aprenderFuncionesPuestoActual: boolean;
  interesOtroPuesto: boolean;
}

class Formacion {
  @IsOptional()
  @IsString()
  Propuesta: string;

  @IsOptional()
  @IsString()
  necesidad: string;

  @IsOptional()
  @IsString()
  origenNecesidad: string;
}

export class CreateEvaluacionesInterfaceDto {
  @IsNotEmpty()
  @IsString()
  titulo: string;

  @IsNotEmpty()
  @IsString()
  tipo: string;

  @IsOptional()
  @IsString()
  foto: string;

  @IsOptional()
  @IsString()
  opinionEvaluado: string;

  @IsOptional()
  @IsString()
  opinionResponsable: string;

  @ValidateNested()
  @Type(() => Configuracion)
  configuracion: Configuracion;

  @ValidateNested()
  @Type(() => Encuestado)
  @IsOptional()
  encuestado: Encuestado;

  @ValidateNested({ each: true })
  @Type(() => PreguntaEvaluadaEvaluacion)
  PreguntasEvaluadas: PreguntaEvaluadaEvaluacion[];

  @IsNumber()
  puntuacion: number;

  @ValidateNested()
  @Type(() => Objetivos)
  @IsOptional()
  objetivos: Objetivos;

  @IsOptional()
  @ValidateNested()
  @Type(() => DestallesExtras)
  destallesExtras: DestallesExtras;

  @ValidateNested()
  @Type(() => EvolucionCorporativa)
  evolucionCorporativa: EvolucionCorporativa;

  @ValidateNested()
  @Type(() => Formacion)
  formacion: Formacion;

  @IsOptional()
  @IsString({ each: true })
  preguntasExtras: string[];

  @IsString({ each: true })
  compromisos: string[];

  @IsOptional()
  @IsString()
  firmarResponsable: string;
  @IsOptional()
  @IsString()
  firmaEvaluado: string;
}

export class MostrarEvaluacionDto {
  @IsNotEmpty()
  @IsString()
  titulo: string;

  @IsNotEmpty()
  @IsString()
  tipo: string;

  @IsOptional()
  @IsString()
  foto: string;

  @IsOptional()
  @IsString()
  opinionEvaluado: string;

  @IsOptional()
  @IsString()
  opinionResponsable: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => Configuracion)
  configuracion: Configuracion;

  @ValidateNested()
  @Type(() => Encuestado)
  encuestado: Encuestado;

  @ValidateNested({ each: true })
  @Type(() => PreguntaEvaluadaEvaluacion)
  PreguntasEvaluadas: PreguntaEvaluadaEvaluacion[];

  @IsNumber()
  puntuacion: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => Objetivos)
  objetivos: Objetivos;

  @IsOptional()
  @ValidateNested()
  @Type(() => DestallesExtras)
  destallesExtras: DestallesExtras;

  @ValidateNested()
  @Type(() => EvolucionCorporativa)
  evolucionCorporativa: EvolucionCorporativa;

  @ValidateNested()
  @Type(() => Formacion)
  formacion: Formacion;

  @IsOptional()
  @IsString({ each: true })
  preguntasExtras: string[];

  @IsString({ each: true })
  compromisos: string[];

  @IsOptional()
  @IsString()
  firmarResponsable: string;
  @IsOptional()
  @IsString()
  firmaEvaluado: string;
}

export class CrearIluoInterfaceDto {
  @IsNotEmpty()
  @IsString()
  titulo: string;

  @IsNotEmpty()
  @IsString()
  plantillaAsociada: string;

  @IsOptional()
  @IsString()
  opinionEvaluado: string;

  @IsOptional()
  @IsString()
  opinionResponsable: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => Configuracion)
  configuracion: Configuracion;

  @IsOptional()
  @ValidateNested()
  @Type(() => Encuestado)
  encuestado: Encuestado;

  @ValidateNested({ each: true })
  @Type(() => PreguntaEvaluadaILUO)
  PreguntasEvaluadas: PreguntaEvaluadaILUO[];

  @IsNumber()
  puntuacion: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => Objetivos)
  objetivos: Objetivos;

  @IsOptional()
  @ValidateNested()
  @Type(() => DestallesExtras)
  destallesExtras: DestallesExtras;

  @IsOptional()
  @ValidateNested()
  @Type(() => EvolucionCorporativa)
  evolucionCorporativa: EvolucionCorporativa;

  @IsOptional()
  @ValidateNested()
  @Type(() => Formacion)
  formacion: Formacion;

  @IsOptional()
  @IsString({ each: true })
  preguntasExtras: string[];

  @IsOptional()
  @IsString({ each: true })
  compromisos: string[];

  @IsOptional()
  @IsString()
  firmarResponsable: string;

  @IsOptional()
  @IsString()
  firmaEvaluado: string;
}

export class MostrarIluoInterfaceDto {
  @IsNotEmpty()
  @IsString()
  titulo: string;

  @IsNotEmpty()
  @IsString()
  plantillaAsociada: string;

  @IsOptional()
  @IsString()
  opinionEvaluado: string;

  @IsOptional()
  @IsString()
  opinionResponsable: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => Configuracion)
  configuracion: Configuracion;

  @IsOptional()
  @ValidateNested()
  @Type(() => Encuestado)
  encuestado: Encuestado;

  @ValidateNested({ each: true })
  @Type(() => PreguntaEvaluadaILUO)
  PreguntasEvaluadas: PreguntaEvaluadaILUO[];

  @IsNumber()
  puntuacion: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => Objetivos)
  objetivos: Objetivos;

  @IsOptional()
  @ValidateNested()
  @Type(() => DestallesExtras)
  destallesExtras: DestallesExtras;

  @IsOptional()
  @ValidateNested()
  @Type(() => EvolucionCorporativa)
  evolucionCorporativa: EvolucionCorporativa;

  @IsOptional()
  @ValidateNested()
  @Type(() => Formacion)
  formacion: Formacion;

  @IsOptional()
  @IsString({ each: true })
  preguntasExtras: string[];

  @IsOptional()
  @IsString({ each: true })
  compromisos: string[];

  @IsOptional()
  @IsString()
  firmarResponsable: string;

  @IsOptional()
  @IsString()
  firmaEvaluado: string;
}
