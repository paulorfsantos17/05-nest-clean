import { QuestionRepository } from '@/domain/forum/application/repositories/question-repository'
import { AppModule } from '@/infra/app.module'
import { CacheRepository } from '@/infra/cache/cache-repository'
import { CacheModule } from '@/infra/cache/cache.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'

import { AttachmentFactory } from 'test/factories/make-attachment'
import { QuestionFactory } from 'test/factories/make-question'
import { QuestionAttachmentFactory } from 'test/factories/make-question-attachments'
import { StudentFactory } from 'test/factories/make-student'

describe('Prisma Question Repository(e2e)', () => {
  let app: INestApplication

  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory
  let attachmentFactory: AttachmentFactory
  let questionAttachmentFactory: QuestionAttachmentFactory
  let questionRepository: QuestionRepository

  let cacheRepository: CacheRepository
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule, CacheModule],
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
    questionRepository = moduleRef.get(QuestionRepository)

    cacheRepository = moduleRef.get(CacheRepository)

    await app.init()
  })

  it('should cache question details', async () => {
    const user = await studentFactory.makePrismaStudent({})

    const attachmentOne = await attachmentFactory.makePrismaAttachment({})

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    await questionAttachmentFactory.makePrismaQuestionAttachment({
      attachmentId: attachmentOne.id,
      questionId: question.id,
    })

    const slug = question.slug.value

    const questionDetails = await questionRepository.findDetailsBySlug(slug)

    const cached = await cacheRepository.get(`question:${slug}:details`)

    if (!cached) {
      throw new Error()
    }

    expect(JSON.parse(cached)).toEqual(
      expect.objectContaining({
        id: questionDetails?.questionId.toString(),
      }),
    )
  })

  it.only('should return cached question details on subsequentAlls', async () => {
    const user = await studentFactory.makePrismaStudent({})

    const attachmentOne = await attachmentFactory.makePrismaAttachment({})

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    await questionAttachmentFactory.makePrismaQuestionAttachment({
      attachmentId: attachmentOne.id,
      questionId: question.id,
    })

    const slug = question.slug.value

    // await cacheRepository.set(
    //   `question:${slug}:details`,
    //   JSON.stringify({
    //     empty: true,
    //   }),
    // )

    let cached = await cacheRepository.get(`question:${slug}:details`)

    expect(cached).toBeNull()

    await questionRepository.findDetailsBySlug(slug)

    cached = await cacheRepository.get(`question:${slug}:details`)

    expect(cached).not.toBeNull()

    if (!cached) {
      throw new Error()
    }

    const questionDetails = await questionRepository.findDetailsBySlug(slug)

    expect(JSON.parse(cached)).toEqual(
      expect.objectContaining({
        id: questionDetails?.questionId.toString(),
      }),
    )
  })

  it('should reset question details cached when saving  the question', async () => {
    const user = await studentFactory.makePrismaStudent({})

    const attachmentOne = await attachmentFactory.makePrismaAttachment({})

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    await questionAttachmentFactory.makePrismaQuestionAttachment({
      attachmentId: attachmentOne.id,
      questionId: question.id,
    })

    const slug = question.slug.value

    await cacheRepository.set(
      `question:${slug}:details`,
      JSON.stringify({
        empty: true,
      }),
    )

    await questionRepository.save(question)

    const cached = await cacheRepository.get(`question:${slug}:details`)

    expect(cached).toBeNull()
  })
})
