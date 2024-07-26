import { AnswerAttachmentsRepository } from '@/domain/forum/application/repositories/answer-attachments-repository'
import { AnswerAttachment } from '@/domain/forum/enterprise/entities/answer-attachment'

export class InMemoryAnswerAttachmentsRepository
  // eslint-disable-next-line prettier/prettier
  implements AnswerAttachmentsRepository {
  public items: AnswerAttachment[] = []

  async deleteManyByAnswerId(answerId: string): Promise<void> {
    const answerAttachment = this.items.filter(
      (item) => item.id.toString() === answerId,
    )

    this.items = answerAttachment
  }

  async findManyByAnswerId(answerId: string): Promise<AnswerAttachment[]> {
    const answerAttachments = this.items.filter((item) => {
      return item.answerId.toString() === answerId
    })

    return answerAttachments
  }
}
