import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { QuestionFactory } from 'test/factories/make-question'
import { StudentFactory } from 'test/factories/make-student'

describe('Create Answer(e2e)', () => {
  let app: INestApplication
  let jwt: JwtService

  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory
  let prisma: PrismaService
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
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

    const response = await request(app.getHttpServer())
      .post(`/questions/${questionId}/answer`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: 'Create answer content.',
      })

    expect(response.status).toBe(201)

    const questionOnDatabase = await prisma.answer.findFirstOrThrow({
      where: { content: 'Create answer content.' },
    })

    expect(questionOnDatabase).toBeTruthy()
    expect(questionOnDatabase.content).toBe('Create answer content.')
  })
})
