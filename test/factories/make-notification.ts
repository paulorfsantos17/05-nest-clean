import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  Notification,
  NotificationProps,
} from '@/domain/notification/enterprise/entities/notification'

import { faker } from '@faker-js/faker'

export function makeNotification(
  override: Partial<NotificationProps> = {},
  id?: UniqueEntityId,
) {
  const notification = Notification.create(
    {
      content: faker.lorem.text(),
      recipientId: new UniqueEntityId(),
      title: faker.lorem.sentence(),
      createdAt: new Date(),
      ...override,
    },
    id,
  )

  return notification
}
