import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { QuestionAttachment } from '@/domain/forum/enterprise/entities/question-attachment'
import { Attachment as PrismaAttachment, type Prisma } from '@prisma/client'

export class PrismaQuestionAttachmentMapper {
  static toDomain(raw: PrismaAttachment): QuestionAttachment {
    if (!raw.questionId) {
      throw new Error('Missing questionId in PrismaQuestionAttachment')
    }

    return QuestionAttachment.create(
      {
        attachmentId: new UniqueEntityId(raw.id),
        questionId: new UniqueEntityId(raw.questionId),
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrismaUpdateMany(
    attachments: QuestionAttachment[],
  ): Prisma.AttachmentUpdateManyArgs {
    const questionId = attachments[0].questionId.toString()

    const attachmentsId = attachments.map((attachment) =>
      attachment.attachmentId.toString(),
    )

    return {
      where: {
        id: {
          in: attachmentsId,
        },
      },
      data: {
        questionId,
      },
    }
  }

  static toPrismaDeleteMany(
    attachments: QuestionAttachment[],
  ): Prisma.AttachmentDeleteManyArgs {
    const attachmentsId = attachments.map((attachment) =>
      attachment.id.toString(),
    )

    return {
      where: {
        id: {
          in: attachmentsId,
        },
      },
    }
  }
}
