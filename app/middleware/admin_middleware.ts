import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AdminMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const user = ctx.auth.user

    if (!user) {
      return ctx.response.redirect('/login')
     // return ctx.response.unauthorized('Veuillez vous connecter')
    }

    // Charger le rôle lié à cet utilisateur
    
    // await user.load('role')
    if (!user.role) {
      await user.load('role')
    }

    // On vérifie si le rôle existe et si son nom est 'admin'
    if (!user.role || user.role.name !== 'ADMIN') {
      //return ctx.view.render('pages/forbidden', { message: 'Accès réservé aux administrateurs' })
     // return ctx.response.status(403).send('Accès réservé aux administrateurs')
      return ctx.response.redirect('/forbidden')
    }

    /*
    if (user.role?.name !== 'ADMIN') {
      return ctx.response.forbidden('Acces reserve aux administrateurs')
    }
      */

    return next()
  }
}