import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repositories'
import { GetQuestionBySlugUseCase } from './get-question-by-slug'
import { makeQuestion } from 'test/factories/make-question'
import { Slug } from '../../enterprise/entities/value-objects/slug'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { InMemoryQuestionAttachmentsRepository } from 'test/repositories/in-memory-question-attachments-repository'
import { InMemoryAttachmentRepository } from 'test/repositories/in-memory-attachment-repostiory'
import { InMemoryStudentRepository } from 'test/repositories/in-memory-student-repositories.'
import { makeStudent } from 'test/factories/make-student'
import { makeAttachment } from 'test/factories/make-attachment'
import { makeQuestionAttachments } from 'test/factories/make-question-attachments'

let inMemoryQuestionsRepository: InMemoryQuestionsRepository
let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentsRepository
let inMemoryAttachments: InMemoryAttachmentRepository
let inMemoryStudentRepository: InMemoryStudentRepository

let sut: GetQuestionBySlugUseCase

describe('Get Question By Slug', () => {
  beforeEach(() => {
    inMemoryQuestionAttachmentsRepository =
      new InMemoryQuestionAttachmentsRepository()

    inMemoryAttachments = new InMemoryAttachmentRepository()
    inMemoryStudentRepository = new InMemoryStudentRepository()
    inMemoryQuestionsRepository = new InMemoryQuestionsRepository(
      inMemoryQuestionAttachmentsRepository,
      inMemoryAttachments,
      inMemoryStudentRepository,
    )
    sut = new GetQuestionBySlugUseCase(inMemoryQuestionsRepository)
  })

  it('should be able to find an question', async () => {
    const author = makeStudent({
      name: 'John Doe',
    })

    inMemoryStudentRepository.items.push(author)

    const attachmentOne = makeAttachment({ title: 'attachment One' })
    const attachmentTwo = makeAttachment({ title: 'attachment Two' })

    inMemoryAttachments.items.push(attachmentOne)
    inMemoryAttachments.items.push(attachmentTwo)

    const createQuestion = makeQuestion({
      slug: Slug.create('question-title'),

      authorId: author.id,
    })

    inMemoryQuestionAttachmentsRepository.items.push(
      makeQuestionAttachments({
        attachmentId: attachmentOne.id,
        questionId: createQuestion.id,
      }),
      makeQuestionAttachments({
        attachmentId: attachmentTwo.id,
        questionId: createQuestion.id,
      }),
    )

    await inMemoryQuestionsRepository.create(createQuestion)

    const result = await sut.execute({
      slug: 'question-title',
    })
    expect(result.isRight()).toBe(true)
    expect(result.value).toMatchObject({
      question: expect.objectContaining({
        title: createQuestion.title,
        author: author.name,
        attachments: [
          expect.objectContaining({
            title: attachmentOne.title,
          }),
          expect.objectContaining({
            title: attachmentTwo.title,
          }),
        ],
      }),
    })
  })

  it('should not be able to find a question that not exist', async () => {
    const result = await sut.execute({
      slug: 'question-not-exist',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
