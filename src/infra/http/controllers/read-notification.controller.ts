import {
  BadRequestException,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
} from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'

import { z } from 'zod'

import { ReadNotificationUseCase } from '@/domain/notification/application/use-cases/read-notification'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'

const notificationIdParamSchema = z.string().uuid()

type NotificationIdParamSchema = z.infer<typeof notificationIdParamSchema>

const paramsValidationPipe = new ZodValidationPipe(notificationIdParamSchema)

@Controller('/notifications/:notificationId/read')
export class ReadNotificationController {
  constructor(private ReadNotificationUseCase: ReadNotificationUseCase) {}

  @Patch()
  @HttpCode(HttpStatus.NO_CONTENT)
  async handle(
    @CurrentUser() user: UserPayload,
    @Param('notificationId', paramsValidationPipe)
    notificationId: NotificationIdParamSchema,
  ) {
    const result = await this.ReadNotificationUseCase.execute({
      notificationId,
      recipientId: user.sub,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }
  }
}
