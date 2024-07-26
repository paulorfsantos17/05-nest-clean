import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { DeleteQuestionCommentUseCase } from './delete-question-comment'
import { InMemoryQuestionCommentsRepository } from 'test/repositories/in-memory-question-comments-repository'
import { makeQuestionComment } from 'test/factories/make-question-comment'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

let inMemoryQuestionsCommentRepository: InMemoryQuestionCommentsRepository
let sut: DeleteQuestionCommentUseCase

describe('Delete Question Comment', () => {
  beforeEach(() => {
    inMemoryQuestionsCommentRepository =
      new InMemoryQuestionCommentsRepository()
    sut = new DeleteQuestionCommentUseCase(inMemoryQuestionsCommentRepository)
  })

  it('should be able to delete a question comment', async () => {
    const createQuestion = makeQuestionComment(
      {
        authorId: new UniqueEntityId('author-1'),
      },
      new UniqueEntityId('question-comment-1'),
    )
    const createQuestionTwo = makeQuestionComment(
      {},
      new UniqueEntityId('question-comment-2'),
    )

    await inMemoryQuestionsCommentRepository.create(createQuestion)
    await inMemoryQuestionsCommentRepository.create(createQuestionTwo)

    await sut.execute({
      questionCommentId: 'question-comment-1',
      authorId: 'author-1',
    })

    expect(inMemoryQuestionsCommentRepository.items).toHaveLength(1)
    expect(inMemoryQuestionsCommentRepository.items[0].id.toString()).toBe(
      createQuestionTwo.id.toString(),
    )
  })

  it('should not be able to delete a question comment from another user', async () => {
    const createQuestion = makeQuestionComment(
      {
        authorId: new UniqueEntityId('author-1'),
      },
      new UniqueEntityId('question-comment-1'),
    )

    const createQuestionTwo = makeQuestionComment(
      {},
      new UniqueEntityId('question-comment-2'),
    )

    await inMemoryQuestionsCommentRepository.create(createQuestion)
    await inMemoryQuestionsCommentRepository.create(createQuestionTwo)

    const result = await sut.execute({
      questionCommentId: 'question-comment-1',
      authorId: 'author-2',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(NotAllowedError)

    expect(inMemoryQuestionsCommentRepository.items).toHaveLength(2)
  })

  it('should not be able to delete a question not exist', async () => {
    const result = await sut.execute({
      questionCommentId: 'question-comment-1',
      authorId: 'author-2',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
