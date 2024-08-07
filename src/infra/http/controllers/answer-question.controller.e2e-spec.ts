import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AttachmentFactory } from 'test/factories/make-attachment'
import { QuestionFactory } from 'test/factories/make-question'
import { StudentFactory } from 'test/factories/make-student'

describe('Create Answer(e2e)', () => {
  let app: INestApplication
  let jwt: JwtService
  let attachmentFactory: AttachmentFactory
  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory
  let prisma: PrismaService
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory, AttachmentFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    attachmentFactory = moduleRef.get(AttachmentFactory)
    jwt = moduleRef.get(JwtService)
    prisma = moduleRef.get(PrismaService)

    await app.init()
  })
  test('[POST] /questions/:questionId/answer', async () => {
    const user = await studentFactory.makePrismaStudent()

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    const questionId = question.id.toString()

    const attachmentOne = await attachmentFactory.makePrismaAttachment()
    const attachmentTwo = await attachmentFactory.makePrismaAttachment()

    const response = await request(app.getHttpServer())
      .post(`/questions/${questionId}/answer`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: 'Create answer content.',
        attachments: [attachmentOne.id.toString(), attachmentTwo.id.toString()],
      })

    expect(response.status).toBe(201)

    const questionOnDatabase = await prisma.answer.findFirstOrThrow({
      where: { content: 'Create answer content.' },
    })

    expect(questionOnDatabase).toBeTruthy()
    expect(questionOnDatabase.content).toBe('Create answer content.')

    const attachmentOnDatabase = await prisma.attachment.findMany({
      where: {
        answerId: questionOnDatabase.id,
      },
    })

    expect(attachmentOnDatabase).toHaveLength(2)
  })
})
