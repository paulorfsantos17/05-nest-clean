import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Answer } from '@/domain/forum/enterprise/entities/answer'
import { AnswersRepository } from '@/domain/forum/application/repositories/answer-repository'
import { Either, right } from '@/core/either'
import { AnswerAttachment } from '../../enterprise/entities/answer-attachment'
import { AnswerAttachmentList } from '../../enterprise/entities/answer-attachment-list'
import { Injectable } from '@nestjs/common'

interface AnswerQuestionUseCaseRequest {
  questionId: string
  authorId: string
  content: string
  attachmentsIds: string[]
}
type AnswerUseCaseResponse = Either<null, { answer: Answer }>

@Injectable()
export class AnswerQuestionUseCase {
  constructor(private answerRepository: AnswersRepository) {
    this.answerRepository = answerRepository
  }

  async execute({
    authorId,
    questionId,
    content,
    attachmentsIds,
  }: AnswerQuestionUseCaseRequest): Promise<AnswerUseCaseResponse> {
    const answer = Answer.create({
      authorId: new UniqueEntityId(authorId),
      content,
      questionId: new UniqueEntityId(questionId),
    })

    const answerAttachments = attachmentsIds.map((attachmentsId) =>
      AnswerAttachment.create({
        answerId: answer.id,
        attachmentId: new UniqueEntityId(attachmentsId),
      }),
    )

    answer.attachments = new AnswerAttachmentList(answerAttachments)

    await this.answerRepository.create(answer)

    return right({ answer })
  }
}
