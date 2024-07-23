import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common'
import { CurrentUser } from '@/auth/current-user-decorator'
import { JwtAuthGuard } from '@/auth/jwt-auth.guard'
import { UserPayload } from '@/auth/jwt.strategy'
import { ZodValidationPipe } from '@/pipes/zod-validation-pipe'
import { PrismaService } from '@/prisma/prisma.service'
import { z } from 'zod'

const createQuestionBodySchema = z.object({
  title: z.string(),
  content: z.string(),
})

type CreateQuestionBodySchema = z.infer<typeof createQuestionBodySchema>

const bodyValidationPipe = new ZodValidationPipe(createQuestionBodySchema)

@Controller('/questions')
export class CreateQuestionController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  async handle(
    @CurrentUser() user: UserPayload,
    @Body(bodyValidationPipe) body: CreateQuestionBodySchema,
  ) {
    const { content, title } = body
    const userId = user.sub

    await this.prisma.question.create({
      data: {
        title,
        content,
        slug: createSlug(title),
        authorId: userId,
      },
    })
  }
}

function createSlug(value: string) {
  return value
    .normalize('NFD') // Normalize the string to decompose combined letters into their base letters and diacritics
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritic marks
    .toLowerCase() // Convert to lowercase
    .trim() // Trim leading and trailing whitespace
    .replace(/[^a-z0-9 -]/g, '') // Remove invalid characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
}
