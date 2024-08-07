import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AnswerFactory } from 'test/factories/make-answer'
import { AnswerAttachmentFactory } from 'test/factories/make-answer-attachments'
import { AttachmentFactory } from 'test/factories/make-attachment'
import { QuestionFactory } from 'test/factories/make-question'
import { StudentFactory } from 'test/factories/make-student'

describe('Edit Answer(e2e)', () => {
  let app: INestApplication
  let jwt: JwtService
  let attachmentFactory: AttachmentFactory
  let answerAttachmentFactory: AnswerAttachmentFactory

  let studentFactory: StudentFactory
  let answerFactory: AnswerFactory
  let questionFactory: QuestionFactory
  let prisma: PrismaService
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        StudentFactory,
        QuestionFactory,
        AnswerFactory,
        AttachmentFactory,
        AnswerAttachmentFactory,
      ],
    }).compile()

    app = moduleRef.createNestApplication()
    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    answerFactory = moduleRef.get(AnswerFactory)
    attachmentFactory = moduleRef.get(AttachmentFactory)
    answerAttachmentFactory = moduleRef.get(AnswerAttachmentFactory)

    jwt = moduleRef.get(JwtService)
    prisma = moduleRef.get(PrismaService)

    await app.init()
  })
  test('[PUT] /answer/:answerId', async () => {
    const user = await studentFactory.makePrismaStudent()

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    const questionId = question.id.toString()

    const answer = await answerFactory.makePrismaAnswer({
      authorId: user.id,
      questionId: new UniqueEntityId(questionId),
    })

    const attachmentOne = await attachmentFactory.makePrismaAttachment()
    const attachmentTwo = await attachmentFactory.makePrismaAttachment()

    const answerId = answer.id

    await answerAttachmentFactory.makePrismaAnswerAttachment({
      attachmentId: attachmentTwo.id,
      answerId,
    })
    await answerAttachmentFactory.makePrismaAnswerAttachment({
      attachmentId: attachmentOne.id,
      answerId,
    })

    const attachmentThree = await attachmentFactory.makePrismaAttachment()

    const response = await request(app.getHttpServer())
      .put(`/answers/${answer.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: 'Update answer content.',
        attachments: [
          attachmentOne.id.toString(),
          attachmentThree.id.toString(),
        ],
      })

    expect(response.status).toBe(204)

    const answerOnDatabase = await prisma.answer.findUnique({
      where: { id: answer.id.toString() },
    })

    expect(answerOnDatabase).toBeTruthy()
    expect(answerOnDatabase?.content).toBe('Update answer content.')

    const AttachmentOnDatabase = await prisma.attachment.findMany({
      where: { answerId: answerId.toString() },
    })

    expect(AttachmentOnDatabase).toHaveLength(2)
    expect(AttachmentOnDatabase).toEqual([
      expect.objectContaining({ id: attachmentOne.id.toString() }),
      expect.objectContaining({ id: attachmentThree.id.toString() }),
    ])
  })
})
