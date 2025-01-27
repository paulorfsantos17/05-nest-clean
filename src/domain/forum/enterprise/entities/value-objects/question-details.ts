import { ValueObject } from '@/core/entities/object-value'
import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import type { Slug } from './slug'
import type { Attachment } from '../attachment'

interface QuestionDetailsProps {
  questionId: UniqueEntityId
  authorId: UniqueEntityId
  author: string
  title: string
  content: string
  slug: Slug
  attachments: Attachment[]
  bestAnswerId?: UniqueEntityId | null
  createdAt: Date
  updatedAt?: Date | null
}

export class QuestionDetails extends ValueObject<QuestionDetailsProps> {
  get questionId() {
    return this.props.questionId
  }

  get authorId() {
    return this.props.authorId
  }

  get author() {
    return this.props.author
  }

  get title() {
    return this.props.title
  }

  get content() {
    return this.props.content
  }

  get slug() {
    return this.props.slug
  }

  get attachments() {
    return this.props.attachments
  }

  get bestAnswerId() {
    return this.props.bestAnswerId
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  static create(props: QuestionDetailsProps) {
    return new QuestionDetails(props)
  }
}
