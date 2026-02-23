import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'urls'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('original_url').notNullable()
      table.string('slug').unique().notNullable() // L'URL courte personnalisée
      table.text('qr_image_url').nullable() // Stockage du Base64 du QR
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}