import { InMemoryAnswerRepository } from 'test/repositories/in-memory-answer-repositories'
import { makeAnswer } from 'test/factories/make-answer'
import { DeleteAnswerUseCase } from './delete-answer'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachments-repository'
import { makeAnswerAttachments } from 'test/factories/make-answer-attachments'

let inMemoryAnswerRepository: InMemoryAnswerRepository
let inMemoryAnswerAttachmentsRepository: InMemoryAnswerAttachmentsRepository
let sut: DeleteAnswerUseCase

describe('Delete Answer', () => {
  beforeEach(() => {
    inMemoryAnswerAttachmentsRepository =
      new InMemoryAnswerAttachmentsRepository()

    inMemoryAnswerRepository = new InMemoryAnswerRepository(
      inMemoryAnswerAttachmentsRepository,
    )
    sut = new DeleteAnswerUseCase(inMemoryAnswerRepository)
  })

  it('should be able to delete a answer', async () => {
    const createAnswer = makeAnswer(
      {
        authorId: new UniqueEntityId('author-1'),
      },
      new UniqueEntityId('answer-1'),
    )
    const createAnswerTwo = makeAnswer({}, new UniqueEntityId('answer-2'))

    await inMemoryAnswerRepository.create(createAnswer)
    await inMemoryAnswerRepository.create(createAnswerTwo)

    inMemoryAnswerAttachmentsRepository.items.push(
      makeAnswerAttachments({
        attachmentId: new UniqueEntityId('1'),
        answerId: createAnswer.id,
      }),
      makeAnswerAttachments({
        attachmentId: new UniqueEntityId('2'),
        answerId: createAnswer.id,
      }),
    )

    await sut.execute({
      answerId: 'answer-1',
      authorId: 'author-1',
    })

    expect(inMemoryAnswerRepository.items).toHaveLength(1)
    expect(inMemoryAnswerRepository.items[0].id.toString()).toBe(
      createAnswerTwo.id.toString(),
    )
    expect(await inMemoryAnswerRepository.findById('answer-1')).toBe(null)

    expect(inMemoryAnswerAttachmentsRepository.items).toHaveLength(0)
  })

  it('should not be able to delete a answer from another user', async () => {
    const createAnswer = makeAnswer(
      {
        authorId: new UniqueEntityId('author-1'),
      },
      new UniqueEntityId('answer-1'),
    )

    const createAnswerTwo = makeAnswer({}, new UniqueEntityId('answer-2'))

    await inMemoryAnswerRepository.create(createAnswer)
    await inMemoryAnswerRepository.create(createAnswerTwo)

    const result = await sut.execute({
      answerId: 'answer-1',
      authorId: 'author-2',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotAllowedError)

    expect(inMemoryAnswerRepository.items).toHaveLength(2)
  })

  it('should not be able to delete a answer not exist', async () => {
    const result = await sut.execute({
      answerId: 'answer-1',
      authorId: 'author-2',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
