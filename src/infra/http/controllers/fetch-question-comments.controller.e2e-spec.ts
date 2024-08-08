import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { hash } from 'bcryptjs'
import request from 'supertest'
import { QuestionFactory } from 'test/factories/make-question'
import { QuestionCommentFactory } from 'test/factories/make-question-comment'

describe('Fetch Question Comments (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService
  let questionFactory: QuestionFactory
  let questionCommentFactory: QuestionCommentFactory
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      providers: [QuestionFactory, PrismaService, QuestionCommentFactory],
    }).compile()

    questionFactory = moduleRef.get(QuestionFactory)
    questionCommentFactory = moduleRef.get(QuestionCommentFactory)
    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })
  test('[GET] /questions/:questionId/answer', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: await hash('12345678', 8),
      },
    })

    const accessToken = jwt.sign({ sub: user.id })

    const question = await questionFactory.makePrismaQuestion({
      authorId: new UniqueEntityId(user.id),
    })

    const questionId = question.id.toString()

    await Promise.all([
      questionCommentFactory.makePrismaQuestionComment({
        authorId: new UniqueEntityId(user.id),
        questionId: question.id,
        content: 'Content Comment one',
      }),
      questionCommentFactory.makePrismaQuestionComment({
        authorId: new UniqueEntityId(user.id),
        questionId: question.id,
        content: 'Content Comment two',
      }),
    ])

    const response = await request(app.getHttpServer())
      .get(`/questions/${questionId}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.status).toBe(200)
    expect(response.body.comments).toHaveLength(2)
    expect(response.body).toEqual({
      comments: expect.arrayContaining([
        expect.objectContaining({
          content: 'Content Comment one',
          authorName: user.name,
        }),
        expect.objectContaining({
          content: 'Content Comment two',
          authorName: user.name,
        }),
      ]),
    })
  })
})
