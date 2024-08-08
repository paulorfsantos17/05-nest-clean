import { BadRequestException, Controller, Get, Param } from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'

import { z } from 'zod'
import { GetQuestionBySlugUseCase } from '@/domain/forum/application/use-cases/get-question-by-slug'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { QuestionDetailsPresenter } from '../presenters/question-details-presenter'

const slugParamSchema = z.string()

type SlugParamSchema = z.infer<typeof slugParamSchema>

const paramsValidationPipe = new ZodValidationPipe(slugParamSchema)

@Controller('/questions/:slug')
export class GetQuestionBySlugController {
  constructor(private getQuestionBySlugUseCase: GetQuestionBySlugUseCase) {}

  @Get()
  async handle(@Param('slug', paramsValidationPipe) slug: SlugParamSchema) {
    const result = await this.getQuestionBySlugUseCase.execute({ slug })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new BadRequestException(error.message)
        default:
          throw new BadRequestException()
      }
    }

    const question = result.value.question

    return {
      question: QuestionDetailsPresenter.toHTTP(question),
    }
  }
}
