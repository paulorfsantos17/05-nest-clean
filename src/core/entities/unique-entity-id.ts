import { randomUUID } from 'crypto'

export class UniqueEntityId {
  private value: string

  constructor(value?: string) {
    this.value = value ?? randomUUID()
  }

  toString(): string {
    return this.value
  }

  toValue(): string {
    return this.value
  }

  equals(id: UniqueEntityId) {
    return id.toValue() === this.value
  }
}
