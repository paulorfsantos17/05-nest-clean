import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { hash } from 'bcryptjs'
import request from 'supertest'
import { AttachmentFactory } from 'test/factories/make-attachment'

describe('Create Question(e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let attachmentFactory: AttachmentFactory
  let jwt: JwtService
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      providers: [AttachmentFactory, PrismaService],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)
    attachmentFactory = moduleRef.get(AttachmentFactory)

    await app.init()
  })
  test('[POST] /questions', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: await hash('12345678', 8),
      },
    })

    const accessToken = jwt.sign({ sub: user.id })

    const attachmentOne = await attachmentFactory.makePrismaAttachment()
    const attachmentTwo = await attachmentFactory.makePrismaAttachment()

    const response = await request(app.getHttpServer())
      .post('/questions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Question title.',
        content: 'Question content.',
        attachments: [attachmentOne.id.toString(), attachmentTwo.id.toString()],
      })

    expect(response.status).toBe(201)

    const questionOnDatabase = await prisma.question.findFirstOrThrow({
      where: {
        title: 'Question title.',
      },
    })

    expect(questionOnDatabase).toBeTruthy()

    const attachmentOnDatabase = await prisma.attachment.findMany({
      where: {
        questionId: questionOnDatabase.id,
      },
    })

    expect(attachmentOnDatabase).toHaveLength(2)
  })
})

// const userAuthenticated = await request(app.getHttpServer())
//   .post('/sessions')
//   .send({
//     email: 'john.doe@example.com',
//     password: '12345678',
//   })

// const accessToken = userAuthenticated.body.access_token
