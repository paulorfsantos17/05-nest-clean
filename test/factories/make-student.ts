import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  Student,
  StudentProps,
} from '@/domain/forum/enterprise/entities/student'

import { faker } from '@faker-js/faker'

export function makeStudent(
  override: Partial<StudentProps> = {},
  id?: UniqueEntityId,
) {
  const student = Student.create(
    {
      email: faker.internet.email(),
      name: faker.person.firstName(),
      password: faker.internet.password(),
      ...override,
    },
    id,
  )

  return student
}
