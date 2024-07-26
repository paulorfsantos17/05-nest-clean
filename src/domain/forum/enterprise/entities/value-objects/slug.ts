export class Slug {
  public value: string

  private constructor(value: string) {
    this.value = value
  }

  static create(value: string) {
    return new Slug(value)
  }

  /**
   * Receives a string and returns normalized it  as a slug
   *
   * Example: "An example title" => an-example-title
   *
   * @param text {string}
   */
  static createFromText(text: string) {
    const slugText = text
      .normalize('NFKD')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^\w-]+/g, '')
      .replace(/_/g, '-')
      .replace(/__+/g, '-')
      .replace(/_$/g, '')

    return new Slug(slugText)
  }
}
