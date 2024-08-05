import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'

import { z } from 'zod'

import { FetchQuestionCommentsUseCase } from '@/domain/forum/application/use-cases/fetch-question-comment'
import { QuestionCommentPresenter } from '../presenters/question-comment-presenter'

const pageQueryParamSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1))

const questionIdParam = z.string().uuid()

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>
type QuestionIdParamSchema = z.infer<typeof questionIdParam>

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema)

@Controller('/questions/:questionId/comments')
export class FetchQuestionCommentsController {
  constructor(
    private fetchQuestionCommentsUseCase: FetchQuestionCommentsUseCase,
  ) {}

  @Get()
  async handle(
    @Query('page', queryValidationPipe) page: PageQueryParamSchema,
    @Param('questionId') questionId: QuestionIdParamSchema,
  ) {
    const result = await this.fetchQuestionCommentsUseCase.execute({
      page,
      questionId,
    })

    if (result.isLeft()) {
      throw new Error()
    }

    const comments = result.value.questionComments

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    return {
      comments: comments.map(QuestionCommentPresenter.toHTTP),
    }
  }
}
