import { Either, left, right } from '@/core/either'

import { Injectable } from '@nestjs/common'
import { InvalidAttachmentType } from './errors/invalid-attachment-file'
import { Attachment } from '../../enterprise/entities/attachment'
import { AttachmentRepository } from '../repositories/attachment-repository'
import { Uploader } from '../storage/uploader'

interface UploadAndCreateAttachmentUseCaseRequest {
  fileName: string
  fileType: string
  body: Buffer
}

type UploadAndCreateAttachmentUseCaseResponse = Either<
  InvalidAttachmentType,
  {
    attachment: Attachment
  }
>

@Injectable()
export class UploadAndCreateAttachmentUseCase {
  constructor(
    private attachmentRepository: AttachmentRepository,
    private uploader: Uploader,
  ) {}

  async execute({
    body,
    fileName,
    fileType,
  }: UploadAndCreateAttachmentUseCaseRequest): Promise<UploadAndCreateAttachmentUseCaseResponse> {
    if (!/^image\/(jpeg|png)$|^application\/pdf$/.test(fileType)) {
      return left(new InvalidAttachmentType(fileType))
    }

    const { url } = await this.uploader.upload({ body, fileName, fileType })

    const attachment = Attachment.create({
      title: fileName,
      url, // replace with actual attachment link
    })

    await this.attachmentRepository.create(attachment)
    return right({ attachment })
  }
}
