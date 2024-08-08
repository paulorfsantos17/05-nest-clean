import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { FetchAnswerCommentsUseCase } from './fetch-answer-comment'
import { InMemoryAnswerCommentsRepository } from 'test/repositories/in-memory-answer-comments-repository'
import { makeAnswerComment } from 'test/factories/make-answer-comment'
import { InMemoryStudentRepository } from 'test/repositories/in-memory-student-repositories.'
import { makeStudent } from 'test/factories/make-student'

let inMemoryAnswerCommentsRepository: InMemoryAnswerCommentsRepository
let inMemoryStudentsRepository: InMemoryStudentRepository
let sut: FetchAnswerCommentsUseCase

describe('Fetch Answer Comments', () => {
  beforeEach(() => {
    inMemoryStudentsRepository = new InMemoryStudentRepository()
    inMemoryAnswerCommentsRepository = new InMemoryAnswerCommentsRepository(
      inMemoryStudentsRepository,
    )
    sut = new FetchAnswerCommentsUseCase(inMemoryAnswerCommentsRepository)
  })

  it('should be able to fetch answer comments', async () => {
    const student = makeStudent()
    inMemoryStudentsRepository.items.push(student)
    const authorId = student.id

    const commentOne = makeAnswerComment({
      answerId: new UniqueEntityId('answer-comment-1'),
      authorId,
    })
    const commentTwo = makeAnswerComment({
      answerId: new UniqueEntityId('answer-comment-1'),
      authorId,
    })

    const commentThree = makeAnswerComment({
      answerId: new UniqueEntityId('answer-comment-2'),
      authorId: new UniqueEntityId('author-2'),
    })

    inMemoryAnswerCommentsRepository.create(commentOne)
    inMemoryAnswerCommentsRepository.create(commentTwo)
    inMemoryAnswerCommentsRepository.create(commentThree)

    const { value } = await sut.execute({
      answerId: 'answer-comment-1',
      page: 1,
    })

    expect(value?.comments).toHaveLength(2)
    expect(value?.comments).toEqual([
      expect.objectContaining({
        commentId: commentOne.id,
        author: student.name,
      }),
      expect.objectContaining({
        commentId: commentTwo.id,
        author: student.name,
      }),
    ])
  })

  it('should be able to fetch paginated answer answer', async () => {
    const student = makeStudent()
    inMemoryStudentsRepository.items.push(student)
    const authorId = student.id
    for (let i = 1; i <= 22; i++) {
      await inMemoryAnswerCommentsRepository.create(
        makeAnswerComment({
          answerId: new UniqueEntityId('answer-1'),
          authorId,
        }),
      )
    }

    const { value } = await sut.execute({
      answerId: 'answer-1',
      page: 2,
    })

    expect(value?.comments).toHaveLength(2)
  })
})
