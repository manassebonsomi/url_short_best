// database/migrations/xxxx_urls.ts
import { BaseSchema } from '@adonisjs/lucide/schema'

export default class extends BaseSchema {
  protected tableName = 'urls'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('original_url').notNullable()
      table.string('slug').notNullable().unique() // Ex: "aB3x9"
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}