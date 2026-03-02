import { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'

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

  // Prépare l'activation du MFA (Génère le QR Code)
  async setupMfa({ auth, view }: HttpContext) {
    const user = auth.user!
    
    const secret = speakeasy.generateSecret({
      name: `QR-Pro:${user.email}`,
    })

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!)

    return view.render('pages/mfa_setup', { 
      qrCodeUrl, 
      secret: secret.base32 
    })
  }

  // Valide le premier code et active définitivement le MFA
  async confirmMfa({ request, response, auth, session }: HttpContext) {
    const { code, secret } = request.only(['code', 'secret'])
    
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: code,
    })

    if (verified) {
      const user = auth.user!
      user.merge({
        mfaSecret: secret,
        isMfaEnabled: true,
      })
      await user.save()
      console.log(user)
      console.log('MFA activé avec succès !')
      session.flash('success', 'MFA activé avec succès !')
      return response.redirect().toRoute('profile.show')
    }

    session.flash('error', 'Code invalide. Réessayez le scan.')
    return response.redirect().back()
  }



 // Désactiver le MFA
async deactivateMfa({ request, response, auth, session }: HttpContext) {
    const user = auth.user!
    const { code } = request.only(['code'])
  
    // Vérification du code avant désactivation
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret!,
      encoding: 'base32',
      token: code,
    })
  
    if (verified) {
      user.merge({
        mfaSecret: null,
        isMfaEnabled: false,
      })
      await user.save()
      return response.redirect().toRoute('profile.show')
    }
    return response.redirect().back()
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