import { PaginationParams } from '@/core/repositories/pagination-params'
import { Question } from '../../enterprise/entities/question'
import type { QuestionDetails } from '../../enterprise/entities/value-objects/question-details'

export abstract class QuestionRepository {
  abstract create(question: Question): Promise<void>
  abstract save(question: Question): Promise<void>
  abstract delete(question: Question): Promise<void>
  abstract findBySlug(slug: string): Promise<Question | null>
  abstract findDetailsBySlug(slug: string): Promise<QuestionDetails | null>

  abstract findById(id: string): Promise<Question | null>
  abstract findManyRecent(params: PaginationParams): Promise<Question[]>
}
