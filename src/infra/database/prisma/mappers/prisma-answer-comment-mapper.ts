import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { AnswerComment } from '@/domain/forum/enterprise/entities/answer-comment'
import type { Prisma, Comment as PrismaAnswerComment } from '@prisma/client'

export class PrismaAnswerCommentMapper {
  static toDomain(raw: PrismaAnswerComment): AnswerComment {
    if (!raw.answerId) {
      throw new Error('Missing answerId in PrismaAnswerComment')
    }

    return AnswerComment.create(
      {
        content: raw.content,
        authorId: new UniqueEntityId(raw.authorId),
        createdAt: raw.createdAt,
        updatedAt: raw.updateAt,
        answerId: new UniqueEntityId(raw.answerId),
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(
    answerComment: AnswerComment,
  ): Prisma.CommentUncheckedCreateInput {
    return {
      id: answerComment.id.toString(),
      content: answerComment.content,
      authorId: answerComment.authorId.toString(),
      answerId: answerComment.answerId.toString(),
      createdAt: answerComment.createdAt,
      updateAt: answerComment.updatedAt,
    }
  }
}
