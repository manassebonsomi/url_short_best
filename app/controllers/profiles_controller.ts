import { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'

export default class ProfilesController {
  /**
   * Afficher le profil
   */
  async show({ view, auth }: HttpContext) {
    const user = auth.user!
    // On charge le rôle et on compte les URLs pour les statistiques
    await user.load('role')
    const urlsCount = await user.related('urls').query().count('* as total')
    
    return view.render('pages/profile', { 
      user, 
      stats: { urlsTotal: urlsCount[0].$extras.total } 
    })
  }

  /*
  async update({ request, response, auth, session }: HttpContext) {
    const user = auth.user!

    
    const profileSchema = vine.compile(
      vine.object({
        fullName: vine.string().minLength(3),
        email: vine.string().email().unique({ 
          table: 'users', 
          column: 'email', 
          filter: (db) => db.whereNot('id', user.id) // Permet de garder son propre email
        }),
      })
    )
    

    try {
      const data = await request.validateUsing(profileSchema)
      user.merge(data)
      await user.save()

      session.flash('success', 'Profil mis à jour avec succès.')
      return response.redirect().back()
    } catch (error) {
      session.flash('errors', error.messages)
      return response.redirect().back()
    }
    
  }
  */
}