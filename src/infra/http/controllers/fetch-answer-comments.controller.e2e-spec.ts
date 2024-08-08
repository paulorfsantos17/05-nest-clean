import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { hash } from 'bcryptjs'
import request from 'supertest'
import { AnswerFactory } from 'test/factories/make-answer'
import { AnswerCommentFactory } from 'test/factories/make-answer-comment'
import { QuestionFactory } from 'test/factories/make-question'

describe('Fetch Answer Comments (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService
  let questionFactory: QuestionFactory
  let answerFactory: AnswerFactory
  let answerCommentFactory: AnswerCommentFactory
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        QuestionFactory,
        PrismaService,
        AnswerCommentFactory,
        AnswerFactory,
      ],
    }).compile()

    questionFactory = moduleRef.get(QuestionFactory)
    answerCommentFactory = moduleRef.get(AnswerCommentFactory)
    answerFactory = moduleRef.get(AnswerFactory)
    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })
  test('[GET] /answers/:questionId/comments', async () => {
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

    const answer = await answerFactory.makePrismaAnswer({
      authorId: new UniqueEntityId(user.id),
      questionId: question.id,
      content: 'Content Answer',
    })

    const answerId = answer.id.toString()

    await Promise.all([
      answerCommentFactory.makePrismaAnswerComment({
        authorId: new UniqueEntityId(user.id),
        answerId: answer.id,
        content: 'Content Comment one',
      }),
      answerCommentFactory.makePrismaAnswerComment({
        authorId: new UniqueEntityId(user.id),
        answerId: answer.id,
        content: 'Content Comment two',
      }),
    ])

    const response = await request(app.getHttpServer())
      .get(`/answers/${answerId}/comments`)
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
