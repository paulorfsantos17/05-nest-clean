import { Module } from '@nestjs/common'
import { PrismaService } from './prisma/prisma.service'
import { PrismaAnswerAttachmentsRepository } from './prisma/repositories/prisma-answer-attachments-repository'
import { PrismaAnswerCommentsRepository } from './prisma/repositories/prisma-answer-comments-repository'
import { PrismaAnswerRepository } from './prisma/repositories/prisma-answer-repository'
import { PrismaQuestionCommentsRepository } from './prisma/repositories/prisma-question-comments-repository'
import { PrismaQuestionsAttachmentsRepository } from './prisma/repositories/prisma-question-attachments-repository'
import { PrismaQuestionRepository } from './prisma/repositories/prisma-question-repository'
import { QuestionRepository } from '@/domain/forum/application/repositories/question-repository'
import { StudentsRepository } from '@/domain/forum/application/repositories/students-repository'
import { PrismaStudentsRepository } from './prisma/repositories/prisma-students-repository'
import { AnswerAttachmentsRepository } from '@/domain/forum/application/repositories/answer-attachments-repository'
import { QuestionCommentRepository } from '@/domain/forum/application/repositories/question-comments-repository'
import { AnswersRepository } from '@/domain/forum/application/repositories/answer-repository'
import { AnswerCommentRepository } from '@/domain/forum/application/repositories/answer-comments-repository '
import { QuestionAttachmentsRepository } from '@/domain/forum/application/repositories/question-attachments-repository'
import { AttachmentRepository } from '@/domain/forum/application/repositories/attachment-repository'
import { PrismaAttachmentsRepository } from './prisma/repositories/prisma-attachments-repository'
import { PrismaNotificationRepository } from './prisma/repositories/prisma-notification-repository'

import { NotificationsRepository } from '@/domain/notification/application/repositories/notification-repository'

@Module({
  providers: [
    PrismaService,
    {
      provide: AnswerCommentRepository,
      useClass: PrismaAnswerCommentsRepository,
    },
    { provide: AnswersRepository, useClass: PrismaAnswerRepository },
    {
      provide: QuestionAttachmentsRepository,
      useClass: PrismaQuestionsAttachmentsRepository,
    },
    {
      provide: QuestionCommentRepository,
      useClass: PrismaQuestionCommentsRepository,
    },
    {
      provide: AnswerAttachmentsRepository,
      useClass: PrismaAnswerAttachmentsRepository,
    },
    { provide: QuestionRepository, useClass: PrismaQuestionRepository },
    { provide: StudentsRepository, useClass: PrismaStudentsRepository },
    { provide: AttachmentRepository, useClass: PrismaAttachmentsRepository },
    {
      provide: NotificationsRepository,
      useClass: PrismaNotificationRepository,
    },
  ],

  exports: [
    PrismaService,
    AnswerAttachmentsRepository,
    AnswerCommentRepository,
    AnswersRepository,
    QuestionCommentRepository,
    QuestionAttachmentsRepository,
    QuestionRepository,
    StudentsRepository,
    AttachmentRepository,
    NotificationsRepository,
  ],
})
export class DatabaseModule {}
