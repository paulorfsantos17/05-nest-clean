import { StudentsRepository } from '../repositories/students-repository'
import { Either, left, right } from '@/core/either'

import { Injectable } from '@nestjs/common'
import type { HashComparer } from '../cryptography/hash-comparer'
import type { Encrypter } from '../cryptography/encrypter'
import { WrongCredentialsError } from './errors/wrong-credentials-error'

interface AuthenticateStudentUseCaseRequest {
  email: string
  password: string
}

type AuthenticateStudentUseCaseResponse = Either<
  WrongCredentialsError,
  {
    accessToken: string
  }
>

@Injectable()
export class AuthenticateStudentUseCase {
  constructor(
    private studentsRepository: StudentsRepository,
    private hashCompare: HashComparer,
    private encrypter: Encrypter,
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateStudentUseCaseRequest): Promise<AuthenticateStudentUseCaseResponse> {
    const student = await this.studentsRepository.findByEmail(email)

    if (!student) {
      return left(new WrongCredentialsError())
    }

    const isPasswordHashValid = await this.hashCompare.compare(
      password,
      student.password,
    )

    if (!isPasswordHashValid) {
      return left(new WrongCredentialsError())
    }
    const accessToken = await this.encrypter.encrypt({
      sub: student.id.toString(),
    })

    return right({ accessToken })
  }
}
