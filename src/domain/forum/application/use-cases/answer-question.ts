import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Answer } from '@/domain/forum/enterprise/entities/answer'
import { AnswersRepository } from '@/domain/forum/application/repositories/answer-repository'
import { Either, right } from '@/core/either'
import { AnswerAttachment } from '../../enterprise/entities/answer-attachment'
import { AnswerAttachmentList } from '../../enterprise/entities/answer-attachment-list'

interface AnswerAnswerUseCaseRequest {
  questionId: string
  instrutorId: string
  content: string
  attachmentsIds: string[]
}
type AnswerAnswerUseCaseResponse = Either<null, { answer: Answer }>

export class AnswerAnswerUseCase {
  constructor(private answerRepository: AnswersRepository) {
    this.answerRepository = answerRepository
  }

  async execute({
    instrutorId,
    questionId,
    content,
    attachmentsIds,
  }: AnswerAnswerUseCaseRequest): Promise<AnswerAnswerUseCaseResponse> {
    const answer = Answer.create({
      authorId: new UniqueEntityId(instrutorId),
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
