import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { FetchQuestionCommentsUseCase } from './fetch-question-comment'
import { InMemoryQuestionCommentsRepository } from 'test/repositories/in-memory-question-comments-repository'
import { makeQuestionComment } from 'test/factories/make-question-comment'
import { InMemoryStudentRepository } from 'test/repositories/in-memory-student-repositories.'
import { makeStudent } from 'test/factories/make-student'

let inMemoryQuestionCommentsRepository: InMemoryQuestionCommentsRepository
let inMemoryStudentsRepository: InMemoryStudentRepository
let sut: FetchQuestionCommentsUseCase

describe('Fetch Question Comments', () => {
  beforeEach(() => {
    inMemoryStudentsRepository = new InMemoryStudentRepository()
    inMemoryQuestionCommentsRepository = new InMemoryQuestionCommentsRepository(
      inMemoryStudentsRepository,
    )
    sut = new FetchQuestionCommentsUseCase(inMemoryQuestionCommentsRepository)
  })

  it('should be able to fetch question comments', async () => {
    await inMemoryStudentsRepository.create(
      makeStudent({
        name: 'John  Doe',
      }),
    )
    const authorId = inMemoryStudentsRepository.items[0].id

    const commentOne = makeQuestionComment({
      questionId: new UniqueEntityId('question-comment-1'),
      authorId,
    })
    const commentTwo = makeQuestionComment({
      questionId: new UniqueEntityId('question-comment-1'),
      authorId,
    })

    const commentThree = makeQuestionComment({
      questionId: new UniqueEntityId('question-comment-2'),
      authorId: new UniqueEntityId('author-comment-2'),
    })

    inMemoryQuestionCommentsRepository.create(commentOne)
    inMemoryQuestionCommentsRepository.create(commentTwo)
    inMemoryQuestionCommentsRepository.create(commentThree)

    const { value } = await sut.execute({
      questionId: 'question-comment-1',
      page: 1,
    })

    expect(value?.comments).toHaveLength(2)
    expect(value?.comments).toEqual([
      expect.objectContaining({
        author: 'John  Doe',
        commentId: commentOne.id,
      }),
      expect.objectContaining({
        author: 'John  Doe',
        commentId: commentTwo.id,
      }),
    ])
  })

  it('should be able to fetch paginated question answer', async () => {
    await inMemoryStudentsRepository.create(makeStudent({}))
    const authorId = inMemoryStudentsRepository.items[0].id

    for (let i = 1; i <= 22; i++) {
      await inMemoryQuestionCommentsRepository.create(
        makeQuestionComment({
          questionId: new UniqueEntityId('question-1'),
          authorId,
        }),
      )
    }

    const { value } = await sut.execute({
      questionId: 'question-1',
      page: 2,
    })

    expect(value?.comments).toHaveLength(2)
  })
})
