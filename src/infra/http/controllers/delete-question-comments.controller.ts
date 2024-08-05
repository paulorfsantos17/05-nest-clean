import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { DeleteQuestionCommentUseCase } from '@/domain/forum/application/use-cases/delete-question-comment'

@Controller('/questions/comments/:id')
export class DeleteQuestionCommentController {
  constructor(private deleteQuestionComment: DeleteQuestionCommentUseCase) {}

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async handle(
    @CurrentUser() user: UserPayload,
    @Param('id') commentId: string,
  ) {
    const userId = user.sub
    const result = await this.deleteQuestionComment.execute({
      authorId: userId,
      questionCommentId: commentId,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }
  }
}
