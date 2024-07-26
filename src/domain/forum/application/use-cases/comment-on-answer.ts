import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { AnswerCommentRepository } from '../repositories/answer-comments-repository '
import { AnswerComment } from '../../enterprise/entities/answer-comment'
import { AnswersRepository } from '../repositories/answer-repository'
import { Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

interface CommentOnAnswerUseCaseRequest {
  authorId: string
  answerId: string
  content: string
}
type CommentOnAnswerUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    answerComment: AnswerComment
  }
>

export class CommentOnAnswerUseCase {
  constructor(
    private answerCommentRepository: AnswerCommentRepository,
    private answerRepository: AnswersRepository,
  ) {
    this.answerRepository = answerRepository
    this.answerCommentRepository = answerCommentRepository
  }

  async execute({
    authorId,
    content,
    answerId,
  }: CommentOnAnswerUseCaseRequest): Promise<CommentOnAnswerUseCaseResponse> {
    const answer = await this.answerRepository.findById(answerId)

    if (!answer) {
      return left(new ResourceNotFoundError())
    }

    const answerComment = AnswerComment.create({
      content,
      authorId: new UniqueEntityId(authorId),
      answerId: new UniqueEntityId(answerId),
    })

    this.answerCommentRepository.create(answerComment)

    return right({ answerComment })
  }
}
