import { QuestionRepository } from '@/domain/forum/application/repositories/question-repository'
import { AnswerCreatedEvent } from '@/domain/forum/enterprise/events/answer-created-event'
import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'
import { SendNotificationUseCase } from '../use-cases/send-notification'

export class OnAnswerCreated implements EventHandler {
  constructor(
    private questionRepository: QuestionRepository,
    private sendNotificationUseCase: SendNotificationUseCase,
  ) {
    this.questionRepository = questionRepository
    this.sendNotificationUseCase = sendNotificationUseCase
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendNewAnswerNotification.bind(this),
      AnswerCreatedEvent.name,
    )
  }

  private async sendNewAnswerNotification({ answer }: AnswerCreatedEvent) {
    const question = await this.questionRepository.findById(
      answer.questionId.toString(),
    )

    if (question) {
      await this.sendNotificationUseCase.execute({
        recipientId: question.id.toString(),
        content: answer.excerpt,
        title: `Nova resposta em "${question.title.substring(0, 40).concat('...')}"`,
      })
    }

    // Send notification to question's followers
  }
}
