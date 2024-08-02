import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'

import { z } from 'zod'
import { AnswerQuestionUseCase } from '@/domain/forum/application/use-cases/answer-question'

const createAnswerBodySchema = z.object({
  content: z.string(),
})

type CreateAnswerBodySchema = z.infer<typeof createAnswerBodySchema>

const bodyValidationPipe = new ZodValidationPipe(createAnswerBodySchema)

@Controller('/questions/:questionId/answer')
export class CreateAnswerController {
  constructor(private createAnswer: AnswerQuestionUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async handle(
    @CurrentUser() user: UserPayload,
    @Body(bodyValidationPipe) body: CreateAnswerBodySchema,
    @Param('questionId') questionId: string,
  ) {
    const { content } = body
    const userId = user.sub

    const result = await this.createAnswer.execute({
      questionId,
      authorId: userId,
      content,
      attachmentsIds: [],
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }
  }
}
