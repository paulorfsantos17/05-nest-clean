import { PaginationParams } from '@/core/repositories/pagination-params'
import { QuestionRepository } from '@/domain/forum/application/repositories/question-repository'
import { Question } from '@/domain/forum/enterprise/entities/question'
import { DomainEvents } from '@/core/events/domain-events'
import { QuestionDetails } from '@/domain/forum/enterprise/entities/value-objects/question-details'
import type { InMemoryAttachmentRepository } from './in-memory-attachment-repostiory'
import type { InMemoryQuestionAttachmentsRepository } from './in-memory-question-attachments-repository'
import type { InMemoryStudentRepository } from './in-memory-student-repositories.'

export class InMemoryQuestionsRepository implements QuestionRepository {
  public items: Question[] = []

  constructor(
    private questionAttachmentsRepository: InMemoryQuestionAttachmentsRepository,
    private attachmentRepository: InMemoryAttachmentRepository,
    private studentRepository: InMemoryStudentRepository,
  ) {}

  async findManyRecent({ page }: PaginationParams): Promise<Question[]> {
    const questions: Question[] = this.items
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice((page - 1) * 20, page * 20)

    return questions
  }

  async save(question: Question): Promise<void> {
    const questionItem = this.items.findIndex(
      (item) => item.id.toString() === question.id.toString(),
    )

    this.items[questionItem] = question

    this.questionAttachmentsRepository.createMany(
      question.attachments.getNewItems(),
    )
    this.questionAttachmentsRepository.deleteMany(
      question.attachments.getRemovedItems(),
    )
    DomainEvents.dispatchEventsForAggregate(question.id)
  }

  async findById(id: string): Promise<Question | null> {
    const question = this.items.find((item) => item.id.toString() === id)

    if (!question) {
      return null
    }

    return question
  }

  async create(question: Question): Promise<void> {
    this.questionAttachmentsRepository.createMany(
      question.attachments.getItems(),
    )
    this.items.push(question)
  }

  async findBySlug(slug: string): Promise<Question | null> {
    const question = this.items.find((item) => item.slug.value === slug)

    if (!question) {
      return null
    }

    return question
  }

  async findDetailsBySlug(slug: string): Promise<QuestionDetails | null> {
    const question = this.items.find((item) => item.slug.value === slug)

    if (!question) {
      return null
    }

    const author = this.studentRepository.items.find((student) =>
      student.id.equals(question.authorId),
    )

    if (!author) {
      throw new Error(
        `Author with ID  "${question.authorId.toString()}" does not exist.`,
      )
    }

    const questionAttachments = this.questionAttachmentsRepository.items.filter(
      (questionAttachment) => {
        return questionAttachment.questionId.equals(question.id)
      },
    )

    const attachments = questionAttachments.map((questionAttachment) => {
      const attachment = this.attachmentRepository.items.find((attachment) => {
        return attachment.id.equals(questionAttachment.attachmentId)
      })

      if (!attachment) {
        throw new Error(
          `Attachment with ID  "${questionAttachment.attachmentId.toString()}" does not exist.`,
        )
      }

      return attachment
    })
    const questionDetails = QuestionDetails.create({
      questionId: question.id,
      authorId: question.authorId,
      author: author.name,
      title: question.title,
      content: question.content,
      slug: question.slug,
      attachments,
      bestAnswerId: question.bestAnswerId,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    })

    return questionDetails
  }

  async delete(question: Question): Promise<void> {
    this.items = this.items.filter(
      (item) => item.id.toString() !== question.id.toString(),
    )

    this.questionAttachmentsRepository.deleteManyByQuestionId(
      question.id.toString(),
    )
  }
}
