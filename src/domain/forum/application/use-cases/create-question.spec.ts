import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repositories'
import { CreateQuestionUseCase } from './create-question'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { InMemoryQuestionAttachmentsRepository } from 'test/repositories/in-memory-question-attachments-repository'

let inMemoryQuestionsRepository: InMemoryQuestionsRepository
let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentsRepository
let sut: CreateQuestionUseCase

describe('create a question', () => {
  beforeEach(() => {
    inMemoryQuestionAttachmentsRepository =
      new InMemoryQuestionAttachmentsRepository()

    inMemoryQuestionsRepository = new InMemoryQuestionsRepository(
      inMemoryQuestionAttachmentsRepository,
    )
    sut = new CreateQuestionUseCase(inMemoryQuestionsRepository)
  })

  it('should create an question', async () => {
    const { value } = await sut.execute({
      content: 'test content',
      authorId: '1',
      title: 'test title',
      attachmentsIds: ['1', '2'],
    })

    expect(value?.question.id).toBeTruthy()

    expect(inMemoryQuestionsRepository.items[0].id).toEqual(value?.question.id)

    expect(
      inMemoryQuestionsRepository.items[0].attachments.currentItems,
    ).toHaveLength(2)

    expect(
      inMemoryQuestionsRepository.items[0].attachments.currentItems,
    ).toEqual([
      expect.objectContaining({
        attachmentId: new UniqueEntityId('1'),
        questionId: value?.question.id,
      }),
      expect.objectContaining({
        attachmentId: new UniqueEntityId('2'),
        questionId: value?.question.id,
      }),
    ])
  })
})
