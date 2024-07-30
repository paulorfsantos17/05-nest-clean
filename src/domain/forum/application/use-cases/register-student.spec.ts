import { RegisterStudentUseCase } from './register-student'
import { InMemoryStudentRepository } from 'test/repositories/in-memory-student-repositories.'
import { FakeHasher } from 'test/cryptography/fake-hasher'

let inMemoryStudentRepository: InMemoryStudentRepository
let fakeHasher: FakeHasher
let sut: RegisterStudentUseCase

describe('Register Student', () => {
  beforeEach(() => {
    inMemoryStudentRepository = new InMemoryStudentRepository()
    fakeHasher = new FakeHasher()
    sut = new RegisterStudentUseCase(inMemoryStudentRepository, fakeHasher)
  })

  it('should be able register a new student', async () => {
    const result = await sut.execute({
      email: 'johndoe@email.com',
      name: 'John Doe',
      password: 'test123',
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      student: inMemoryStudentRepository.items[0],
    })
    expect(inMemoryStudentRepository.items).toHaveLength(1)
  })

  it('should  hash student password upon registration', async () => {
    const result = await sut.execute({
      email: 'johndoe@email.com',
      name: 'John Doe',
      password: 'test123',
    })

    const hashedPassword = await fakeHasher.hash('test123')

    expect(result.isRight()).toBe(true)

    expect(inMemoryStudentRepository.items[0].password).toEqual(hashedPassword)
  })
})
