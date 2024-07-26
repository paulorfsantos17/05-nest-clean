import { QuestionAttachmentsRepository } from '@/domain/forum/application/repositories/question-attachments-repository'
import { QuestionAttachment } from '@/domain/forum/enterprise/entities/question-attachment'

export class InMemoryQuestionAttachmentsRepository
  // eslint-disable-next-line prettier/prettier
  implements QuestionAttachmentsRepository {
  public items: QuestionAttachment[] = []

  async deleteManyByQuestionId(questionId: string): Promise<void> {
    const questionAttachment = this.items.filter(
      (item) => item.id.toString() === questionId,
    )

    this.items = questionAttachment
  }

  async findManyByQuestionId(
    questionId: string,
  ): Promise<QuestionAttachment[]> {
    const questionAttachments = this.items.filter((item) => {
      return item.questionId.toString() === questionId
    })

    return questionAttachments
  }
}
