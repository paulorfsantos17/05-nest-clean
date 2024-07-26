import { DomainEvents } from '@/core/events/domain-events'
import { EventHandler } from '@/core/events/event-handler'
import { SendNotificationUseCase } from '../use-cases/send-notification'
import { AnswersRepository } from '@/domain/forum/application/repositories/answer-repository'
import { QuestionBestAnswerChosenEvent } from '@/domain/forum/enterprise/events/question-best-answer-chosen-event'

export class OnQuestionBestAnswerChosen implements EventHandler {
  constructor(
    private answerRepository: AnswersRepository,
    private sendNotificationUseCase: SendNotificationUseCase,
  ) {
    this.answerRepository = answerRepository
    this.sendNotificationUseCase = sendNotificationUseCase
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendQuestionBestAnswerNotification.bind(this),
      QuestionBestAnswerChosenEvent.name,
    )
  }

  private async sendQuestionBestAnswerNotification({
    bestAnswerId,
    question,
  }: QuestionBestAnswerChosenEvent) {
    const answer = await this.answerRepository.findById(bestAnswerId.toString())

    if (answer)
      await this.sendNotificationUseCase.execute({
        recipientId: answer.id.toString(),
        content: `Há Resposta que você enviou em "${question.title.substring(0, 20).concat('...')} foi escolhida pelo author`,
        title: `Sua Resposta escolhida como há melhor.`,
      })
  }
  // Send notification to question's followers
}
