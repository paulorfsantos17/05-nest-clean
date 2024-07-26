import { SendNotificationUseCase } from './send-notification'
import { InMemoryNotificationsRepository } from 'test/repositories/in-memory-notifications-repository'

let inMemoryNotificationsRepository: InMemoryNotificationsRepository
let sut: SendNotificationUseCase

describe('Send  Notification', () => {
  beforeEach(() => {
    inMemoryNotificationsRepository = new InMemoryNotificationsRepository()
    sut = new SendNotificationUseCase(inMemoryNotificationsRepository)
  })

  it('should be able create an notification', async () => {
    const { value } = await sut.execute({
      content: 'Content Notification',
      recipientId: '1',
      title: 'Title Notification',
    })

    expect(value?.notification.id).toBeTruthy()

    expect(inMemoryNotificationsRepository.items[0].id).toEqual(
      value?.notification.id,
    )
  })
})
