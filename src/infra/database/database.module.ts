import { Module } from '@nestjs/common'
import { PrismaService } from './prisma/prisma.service'
import { PrismaAnswerAttachmentsRepository } from './prisma/repositories/prisma-answer-attachments-repository'
import { PrismaAnswerCommentsRepository } from './prisma/repositories/prisma-answer-comments-repository'
import { PrismaAnswerRepository } from './prisma/repositories/prisma-answer-repository'
import { PrismaQuestionCommentsRepository } from './prisma/repositories/prisma-question-comments-repository'
import { PrismaQuestionsAttachmentsRepository } from './prisma/repositories/prisma-question-attachments-repository'
import { PrismaQuestionRepository } from './prisma/repositories/prisma-question-repository'
import { QuestionRepository } from '@/domain/forum/application/repositories/question-repository'

@Module({
  providers: [
    PrismaService,
    PrismaAnswerAttachmentsRepository,
    PrismaAnswerCommentsRepository,
    PrismaAnswerRepository,
    PrismaQuestionCommentsRepository,
    PrismaQuestionsAttachmentsRepository,
    { provide: QuestionRepository, useClass: PrismaQuestionRepository },
  ],

  exports: [
    PrismaService,
    PrismaAnswerAttachmentsRepository,
    PrismaAnswerCommentsRepository,
    PrismaAnswerRepository,
    PrismaQuestionCommentsRepository,
    PrismaQuestionsAttachmentsRepository,
    QuestionRepository,
  ],
})
export class DatabaseModule {}
