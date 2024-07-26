import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repositories'
import { makeQuestion } from 'test/factories/make-question'
import { DeleteQuestionUseCase } from './delete-question'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { InMemoryQuestionAttachmentsRepository } from 'test/repositories/in-memory-question-attachments-repository'
import { makeQuestionAttachments } from 'test/factories/make-question-attachments'

let inMemoryQuestionsRepository: InMemoryQuestionsRepository
let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentsRepository
let sut: DeleteQuestionUseCase

describe('Delete Question', () => {
  beforeEach(() => {
    inMemoryQuestionAttachmentsRepository =
      new InMemoryQuestionAttachmentsRepository()

    inMemoryQuestionsRepository = new InMemoryQuestionsRepository(
      inMemoryQuestionAttachmentsRepository,
    )
    sut = new DeleteQuestionUseCase(inMemoryQuestionsRepository)
  })

  it('should be able to delete a question', async () => {
    const createQuestion = makeQuestion(
      {
        authorId: new UniqueEntityId('author-1'),
      },
      new UniqueEntityId('question-1'),
    )
    const createQuestionTwo = makeQuestion({}, new UniqueEntityId('question-2'))

    await inMemoryQuestionsRepository.create(createQuestion)
    await inMemoryQuestionsRepository.create(createQuestionTwo)

    inMemoryQuestionAttachmentsRepository.items.push(
      makeQuestionAttachments({
        attachmentId: new UniqueEntityId('1'),
        questionId: createQuestion.id,
      }),
      makeQuestionAttachments({
        attachmentId: new UniqueEntityId('2'),
        questionId: createQuestion.id,
      }),
    )

    await sut.execute({
      questionId: 'question-1',
      authorId: 'author-1',
    })

    expect(inMemoryQuestionsRepository.items).toHaveLength(1)
    expect(inMemoryQuestionsRepository.items[0].id.toString()).toBe(
      createQuestionTwo.id.toString(),
    )
    expect(await inMemoryQuestionsRepository.findById('question-1')).toBe(null)

    expect(inMemoryQuestionAttachmentsRepository.items).toHaveLength(0)
  })

  it('should not be able to delete a question from another user', async () => {
    const createQuestion = makeQuestion(
      {
        authorId: new UniqueEntityId('author-1'),
      },
      new UniqueEntityId('question-1'),
    )

    const createQuestionTwo = makeQuestion({}, new UniqueEntityId('question-2'))

    await inMemoryQuestionsRepository.create(createQuestion)
    await inMemoryQuestionsRepository.create(createQuestionTwo)

    const result = await sut.execute({
      questionId: 'question-1',
      authorId: 'author-2',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotAllowedError)

    expect(inMemoryQuestionsRepository.items).toHaveLength(2)
  })

  it('should not be able to delete a question not exist', async () => {
    const result = await sut.execute({
      questionId: 'question-1',
      authorId: 'author-2',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
