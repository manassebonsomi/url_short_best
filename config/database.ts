import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const dbConfig = defineConfig({
  connection: 'postgres',
  connections: {
    postgres: {
      client: 'pg',
      connection: {
        host: env.get('DB_HOST'),
        port: env.get('DB_PORT'),
        user: env.get('DB_USER'), 
        password: env.get('DB_PASSWORD'),
        database: env.get('DB_DATABASE'),
        
        ssl:  { 
          rejectUnauthorized: false,
          // ca: env.get('DB_SSL_CA'), // Optionnel, si votre fournisseur de base de données fournit un certificat CA
        },
        //env.get('DB_SSL', true),
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
  },
})

export default dbConfig