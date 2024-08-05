import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AnswerFactory } from 'test/factories/make-answer'
import { QuestionFactory } from 'test/factories/make-question'
import { StudentFactory } from 'test/factories/make-student'

describe('Comment On Question(e2e)', () => {
  let app: INestApplication
  let jwt: JwtService

  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory
  let answerFactory: AnswerFactory
  let prisma: PrismaService
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory, AnswerFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    answerFactory = moduleRef.get(AnswerFactory)
    jwt = moduleRef.get(JwtService)
    prisma = moduleRef.get(PrismaService)

    await app.init()
  })
  test('[POST] /answers/:answerId/comments', async () => {
    const user = await studentFactory.makePrismaStudent()

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    const questionId = question.id

    const answer = await answerFactory.makePrismaAnswer({
      authorId: user.id,
      questionId,
    })

    const answerCommentId = answer.id.toString()

    const response = await request(app.getHttpServer())
      .post(`/answers/${answerCommentId}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: 'Create Comment On Answer.',
      })

    expect(response.status).toBe(201)

    const commentOnDatabase = await prisma.comment.findFirstOrThrow({
      where: { content: 'Create Comment On Answer.' },
    })

    expect(commentOnDatabase).toBeTruthy()
    expect(commentOnDatabase.content).toBe('Create Comment On Answer.')
  })
})
