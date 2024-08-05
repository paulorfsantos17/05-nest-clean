import { UploadAndCreateAttachmentUseCase } from './upload-and-create-attachment'
import { InMemoryAttachmentRepository } from 'test/repositories/in-memory-attachment-repostiory'
import { FakeUploader } from 'test/storage/fake-uploader'
import { InvalidAttachmentType } from './errors/invalid-attachment-file'

let inMemoryAttachmentRepository: InMemoryAttachmentRepository
let fakeUploader: FakeUploader
let sut: UploadAndCreateAttachmentUseCase

describe('Upload and create attachment', () => {
  beforeEach(() => {
    inMemoryAttachmentRepository = new InMemoryAttachmentRepository()
    fakeUploader = new FakeUploader()
    sut = new UploadAndCreateAttachmentUseCase(
      inMemoryAttachmentRepository,
      fakeUploader,
    )
  })

  it('should be able to  upload and create an attachment ', async () => {
    const result = await sut.execute({
      body: Buffer.from(''),
      fileName: 'test.txt',
      fileType: 'image/png',
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.value).toEqual({
      attachment: inMemoryAttachmentRepository.items[0],
    })

    expect(fakeUploader.uploads).toHaveLength(1)
    expect(fakeUploader.uploads[0]).toEqual({
      fileName: 'test.txt',
      url: expect.any(String),
    })
  })

  it('should not be able to upload an attachment with invalid file type', async () => {
    const result = await sut.execute({
      body: Buffer.from(''),
      fileName: 'test.mp3',
      fileType: 'audio/mpeg',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(InvalidAttachmentType)
  })
})
