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
import { CommentOnQuestionUseCase } from '@/domain/forum/application/use-cases/comment-on-question'

const createAnswerBodySchema = z.object({
  content: z.string(),
})

type CreateAnswerBodySchema = z.infer<typeof createAnswerBodySchema>

const bodyValidationPipe = new ZodValidationPipe(createAnswerBodySchema)

@Controller('/questions/:questionId/comments')
export class CommentOnQuestionController {
  constructor(private createAnswer: CommentOnQuestionUseCase) {}

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
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }
  }
}
