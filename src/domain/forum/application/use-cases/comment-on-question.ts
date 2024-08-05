import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { QuestionRepository } from '../repositories/question-repository'
import { QuestionCommentRepository } from '../repositories/question-comments-repository'
import { QuestionComment } from '../../enterprise/entities/question-comment'
import { Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Injectable } from '@nestjs/common'

interface CommentOnQuestionUseCaseRequest {
  authorId: string
  questionId: string
  content: string
}
type CommentOnQuestionUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    questionComment: QuestionComment
  }
>

@Injectable()
export class CommentOnQuestionUseCase {
  constructor(
    private questionCommentRepository: QuestionCommentRepository,
    private questionRepository: QuestionRepository,
  ) {
    this.questionRepository = questionRepository
    this.questionCommentRepository = questionCommentRepository
  }

  async execute({
    authorId,
    content,
    questionId,
  }: CommentOnQuestionUseCaseRequest): Promise<CommentOnQuestionUseCaseResponse> {
    const question = await this.questionRepository.findById(questionId)

    if (!question) {
      return left(new ResourceNotFoundError())
    }

    const questionComment = QuestionComment.create({
      content,
      authorId: new UniqueEntityId(authorId),
      questionId: new UniqueEntityId(questionId),
    })

    this.questionCommentRepository.create(questionComment)

    return right({ questionComment })
  }
}
