import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AttachmentFactory } from 'test/factories/make-attachment'
import { QuestionFactory } from 'test/factories/make-question'
import { QuestionAttachmentFactory } from 'test/factories/make-question-attachments'
import { StudentFactory } from 'test/factories/make-student'

describe('Edit Question(e2e)', () => {
  let app: INestApplication
  let jwt: JwtService

  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory
  let attachmentFactory: AttachmentFactory
  let questionAttachmentFactory: QuestionAttachmentFactory
  let prisma: PrismaService
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        StudentFactory,
        QuestionFactory,
        AttachmentFactory,
        QuestionAttachmentFactory,
      ],
    }).compile()

    app = moduleRef.createNestApplication()
    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    attachmentFactory = moduleRef.get(AttachmentFactory)
    questionAttachmentFactory = moduleRef.get(QuestionAttachmentFactory)

    jwt = moduleRef.get(JwtService)
    prisma = moduleRef.get(PrismaService)

    await app.init()
  })
  test('[PUT] /questions/:id', async () => {
    const user = await studentFactory.makePrismaStudent()

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const attachmentOne = await attachmentFactory.makePrismaAttachment()
    const attachmentTwo = await attachmentFactory.makePrismaAttachment()

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })
    const questionId = question.id

    await questionAttachmentFactory.makePrismaQuestionAttachment({
      attachmentId: attachmentTwo.id,
      questionId,
    })
    await questionAttachmentFactory.makePrismaQuestionAttachment({
      attachmentId: attachmentOne.id,
      questionId,
    })

    const attachmentThree = await attachmentFactory.makePrismaAttachment()

    const response = await request(app.getHttpServer())
      .put(`/questions/${questionId.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'New Title',
        content: 'Updated question content.',
        attachments: [
          attachmentOne.id.toString(),
          attachmentThree.id.toString(),
        ],
      })

    expect(response.status).toBe(204)

    const questionOnDatabase = await prisma.question.findFirstOrThrow({
      where: { id: questionId.toString() },
    })

    expect(questionOnDatabase).toBeTruthy()
    expect(questionOnDatabase.title).toBe('New Title')

    const AttachmentOnDatabase = await prisma.attachment.findMany({
      where: { questionId: questionId.toString() },
    })

    expect(AttachmentOnDatabase).toHaveLength(2)
    expect(AttachmentOnDatabase).toEqual([
      expect.objectContaining({ id: attachmentOne.id.toString() }),
      expect.objectContaining({ id: attachmentThree.id.toString() }),
    ])
  })
})
