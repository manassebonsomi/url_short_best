import vine from '@vinejs/vine'

export const urlValidator = vine.compile(
  vine.object({
    url: vine.string().url(),
    short_slug: vine.string().minLength(3).unique({ table: 'urls', column: 'slug' }),
  })
)