// DTO for public form submission.
import { ApiProperty } from '@nestjs/swagger';
import { Equals, IsBoolean, IsObject, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSubmissionDto {
  @ApiProperty({ example: 'Maria Silva', minLength: 2, maxLength: 100 })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: '(11) 99999-1234', minLength: 10, maxLength: 25 })
  @IsString()
  @MinLength(10)
  @MaxLength(25)
  phone!: string;

  @ApiProperty({
    type: 'object',
    additionalProperties: {
      oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    },
    example: { interesse: 'Ofertas', comentario: 'Quero saber mais.' },
  })
  @IsObject()
  answers!: Record<string, string | string[]>;

  @ApiProperty({ example: true, description: 'O envio só é aceito quando o consentimento é verdadeiro.' })
  @IsBoolean()
  @Equals(true)
  consent!: boolean;
}
