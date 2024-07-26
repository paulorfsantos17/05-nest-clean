import { InMemoryAnswerRepository } from 'test/repositories/in-memory-answer-repositories'
import { AnswerAnswerUseCase } from './answer-question'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachments-repository'

let inMemoryAnswerRepository: InMemoryAnswerRepository
let inMemoryAnswerAttachmentsRepository: InMemoryAnswerAttachmentsRepository
let sut: AnswerAnswerUseCase
describe('create an answer', () => {
  beforeEach(() => {
    inMemoryAnswerAttachmentsRepository =
      new InMemoryAnswerAttachmentsRepository()
    inMemoryAnswerRepository = new InMemoryAnswerRepository(
      inMemoryAnswerAttachmentsRepository,
    )
    sut = new AnswerAnswerUseCase(inMemoryAnswerRepository)
  })

  it('should create an answer', async () => {
    const { value } = await sut.execute({
      content: 'test content',
      instrutorId: '1',
      questionId: '1',
      attachmentsIds: ['1', '2'],
    })

    expect(value?.answer.id).toBeTruthy()
    expect(inMemoryAnswerRepository.items[0].id).toEqual(value?.answer.id)
    expect(
      inMemoryAnswerRepository.items[0].attachments.currentItems,
    ).toHaveLength(2)

    expect(inMemoryAnswerRepository.items[0].attachments.currentItems).toEqual([
      expect.objectContaining({
        attachmentId: new UniqueEntityId('1'),
      }),
      expect.objectContaining({
        attachmentId: new UniqueEntityId('2'),
      }),
    ])
  })
})
