import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { InMemoryAnswerCommentsRepository } from 'test/repositories/in-memory-answer-comments-repository'
import { makeAnswerComment } from 'test/factories/make-answer-comment'
import { DeleteAnswerCommentUseCase } from './delete-answer-comment'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { NotAllowedError } from '@/core/errors/not-allowed-error'

let inMemoryAnswersCommentRepository: InMemoryAnswerCommentsRepository
let sut: DeleteAnswerCommentUseCase

describe('Delete Answer Comment', () => {
  beforeEach(() => {
    inMemoryAnswersCommentRepository = new InMemoryAnswerCommentsRepository()
    sut = new DeleteAnswerCommentUseCase(inMemoryAnswersCommentRepository)
  })

  it('should be able to delete a answer comment', async () => {
    const createAnswer = makeAnswerComment(
      {
        authorId: new UniqueEntityId('author-1'),
      },
      new UniqueEntityId('answer-comment-1'),
    )
    const createAnswerTwo = makeAnswerComment(
      {},
      new UniqueEntityId('answer-comment-2'),
    )

    await inMemoryAnswersCommentRepository.create(createAnswer)
    await inMemoryAnswersCommentRepository.create(createAnswerTwo)

    await sut.execute({
      answerCommentId: 'answer-comment-1',
      authorId: 'author-1',
    })

    expect(inMemoryAnswersCommentRepository.items).toHaveLength(1)
    expect(inMemoryAnswersCommentRepository.items[0].id.toString()).toBe(
      createAnswerTwo.id.toString(),
    )
  })

  it('should not be able to delete a answer comment from another user', async () => {
    const createAnswer = makeAnswerComment(
      {
        authorId: new UniqueEntityId('author-1'),
      },
      new UniqueEntityId('answer-comment-1'),
    )

    const createAnswerTwo = makeAnswerComment(
      {},
      new UniqueEntityId('answer-comment-2'),
    )

    await inMemoryAnswersCommentRepository.create(createAnswer)
    await inMemoryAnswersCommentRepository.create(createAnswerTwo)

    const result = await sut.execute({
      answerCommentId: 'answer-comment-1',
      authorId: 'author-2',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotAllowedError)

    expect(inMemoryAnswersCommentRepository.items).toHaveLength(2)
  })

  it('should not be able to delete a answer not exist', async () => {
    const result = await sut.execute({
      answerCommentId: 'answer-comment-1',
      authorId: 'author-2',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
