import { InMemoryAnswerRepository } from 'test/repositories/in-memory-answer-repositories'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { EditAnswerUseCase } from './edit-answer'
import { makeAnswer } from 'test/factories/make-answer'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachments-repository'
import { makeAnswerAttachments } from 'test/factories/make-answer-attachments'
import { AnswerAttachmentList } from '../../enterprise/entities/answer-attachment-list'

let inMemoryAnswerRepository: InMemoryAnswerRepository
let inMemoryAnswerAttachmentsRepository: InMemoryAnswerAttachmentsRepository
let sut: EditAnswerUseCase

describe('Edit Answer', () => {
  beforeEach(() => {
    inMemoryAnswerAttachmentsRepository =
      new InMemoryAnswerAttachmentsRepository()
    inMemoryAnswerRepository = new InMemoryAnswerRepository(
      inMemoryAnswerAttachmentsRepository,
    )
    sut = new EditAnswerUseCase(
      inMemoryAnswerRepository,
      inMemoryAnswerAttachmentsRepository,
    )
  })

  it('should be able to Edit a answer', async () => {
    const createAnswer = makeAnswer(
      {
        authorId: new UniqueEntityId('author-1'),
        attachments: new AnswerAttachmentList(),
      },
      new UniqueEntityId('answer-1'),
    )

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

    await inMemoryAnswerRepository.create(createAnswer)

    await sut.execute({
      authorId: 'author-1',
      content: 'new content',
      answerId: 'answer-1',
      attachmentsIds: ['1', '3'],
    })

    expect(inMemoryAnswerRepository.items[0]).toMatchObject({
      content: 'new content',
    })

    expect(
      inMemoryAnswerRepository.items[0].attachments.currentItems,
    ).toHaveLength(2)

    expect(inMemoryAnswerRepository.items[0].attachments.currentItems).toEqual([
      expect.objectContaining({ attachmentId: new UniqueEntityId('1') }),
      expect.objectContaining({ attachmentId: new UniqueEntityId('3') }),
    ])
  })

  it('should not be able to edit a answer from another user', async () => {
    const createAnswer = makeAnswer(
      {
        authorId: new UniqueEntityId('author-1'),
      },
      new UniqueEntityId('answer-1'),
    )
    await inMemoryAnswerRepository.create(createAnswer)

    const result = await sut.execute({
      authorId: 'author-2',
      content: 'new content',
      answerId: 'answer-1',
      attachmentsIds: [],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })

  it('should not be able to edit a answer not exist', async () => {
    const result = await sut.execute({
      authorId: 'author-2',
      content: 'new content',
      answerId: 'answer-1',
      attachmentsIds: [],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
