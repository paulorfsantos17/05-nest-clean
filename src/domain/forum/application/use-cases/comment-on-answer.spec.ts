import { CommentOnAnswerUseCase } from './comment-on-answer'
import { InMemoryAnswerRepository } from 'test/repositories/in-memory-answer-repositories'
import { InMemoryAnswerCommentsRepository } from 'test/repositories/in-memory-answer-comments-repository'
import { makeAnswer } from 'test/factories/make-answer'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachments-repository'

let inMemoryAnswerRepository: InMemoryAnswerRepository
let inMemoryAnswerCommentsRepository: InMemoryAnswerCommentsRepository
let inMemoryAnswerAttachmentsRepository: InMemoryAnswerAttachmentsRepository
let sut: CommentOnAnswerUseCase

describe('Answer on Question', () => {
  beforeEach(() => {
    inMemoryAnswerAttachmentsRepository =
      new InMemoryAnswerAttachmentsRepository()
    inMemoryAnswerRepository = new InMemoryAnswerRepository(
      inMemoryAnswerAttachmentsRepository,
    )
    inMemoryAnswerCommentsRepository = new InMemoryAnswerCommentsRepository()
    sut = new CommentOnAnswerUseCase(
      inMemoryAnswerCommentsRepository,
      inMemoryAnswerRepository,
    )
  })

  it('should be able to create comment on Answer', async () => {
    const createAnswer = makeAnswer()

    await inMemoryAnswerRepository.create(createAnswer)

    await sut.execute({
      authorId: 'author-1',
      content: 'content test',
      answerId: createAnswer.id.toString(),
    })

    expect(inMemoryAnswerCommentsRepository.items).toHaveLength(1)
    expect(inMemoryAnswerCommentsRepository.items[0].content).toBe(
      'content test',
    )
    expect(inMemoryAnswerCommentsRepository.items[0].authorId.toString()).toBe(
      'author-1',
    )
    expect(inMemoryAnswerCommentsRepository.items[0].id).toBeTruthy()
  })

  it('should not be able to create comment with answer not exist', async () => {
    const result = await sut.execute({
      answerId: 'answer-comment-1',
      authorId: 'author-2',
      content: 'content test',
    })
    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
