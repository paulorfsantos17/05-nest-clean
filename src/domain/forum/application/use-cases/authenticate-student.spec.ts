import { InMemoryStudentRepository } from 'test/repositories/in-memory-student-repositories.'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { AuthenticateStudentUseCase } from './authenticate-student'
import { FakeEncrypter } from 'test/cryptography/fake-encrypter'
import { makeStudent } from 'test/factories/make-student'
import { WrongCredentialsError } from './errors/wrong-credentials-error'

let inMemoryStudentRepository: InMemoryStudentRepository
let fakeHasher: FakeHasher
let fakeEncrypter: FakeEncrypter
let sut: AuthenticateStudentUseCase

describe('Authenticate Student', () => {
  beforeEach(() => {
    inMemoryStudentRepository = new InMemoryStudentRepository()
    fakeHasher = new FakeHasher()
    fakeEncrypter = new FakeEncrypter()
    sut = new AuthenticateStudentUseCase(
      inMemoryStudentRepository,
      fakeHasher,
      fakeEncrypter,
    )
  })

  it('should be able to  authenticate a  student', async () => {
    const student = makeStudent({
      email: 'johndoe@email.com',
      password: await fakeHasher.hash('test123'),
    })

    inMemoryStudentRepository.create(student)

    const result = await sut.execute({
      email: 'johndoe@email.com',
      password: 'test123',
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      accessToken: expect.any(String),
    })
  })
  it('should be not able to  authenticate a student when password incorrect', async () => {
    const student = makeStudent({
      email: 'johndoe@email.com',
      password: await fakeHasher.hash('test123'),
    })

    inMemoryStudentRepository.create(student)

    const result = await sut.execute({
      email: 'johndoe@email.com',
      password: 'password-invalid',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).instanceOf(WrongCredentialsError)
  })
})
