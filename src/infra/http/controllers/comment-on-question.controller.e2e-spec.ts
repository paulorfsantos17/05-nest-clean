import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { QuestionFactory } from 'test/factories/make-question'
import { StudentFactory } from 'test/factories/make-student'

describe('Comment On Question(e2e)', () => {
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
  test('[POST] /questions/:questionId/comments', async () => {
    const user = await studentFactory.makePrismaStudent()

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    const questionId = question.id.toString()

    const response = await request(app.getHttpServer())
      .post(`/questions/${questionId}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: 'Create Comment On Question.',
      })

    expect(response.status).toBe(201)

    const commentOnDatabase = await prisma.comment.findFirstOrThrow({
      where: { content: 'Create Comment On Question.' },
    })

    expect(commentOnDatabase).toBeTruthy()
    expect(commentOnDatabase.content).toBe('Create Comment On Question.')
  })
})
