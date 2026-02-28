import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    const email = 'manassebonsomi.bmm@gmail.com'
    const password = '343877BMM'
    const user = await User.findBy('email', email)

    if (user) {
      user.merge({ name: 'MANASSE BONSOMI', password })
      await user.save()
    } else {
      await User.create({
        name: 'MANASSE BONSOMI',
        email,
        password,
      })
    }

    const savedUser = user ?? (await User.findByOrFail('email', email))

    const existingRole = await savedUser.related('role').query().first()
    if (existingRole) {
      existingRole.merge({ name: 'ADMIN' })
      await existingRole.save()
    } else {
      await savedUser.related('role').create({
        name: 'ADMIN',
      })
    }
  }
}