import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import { errors } from '@vinejs/vine'
import { registerValidator } from '#validators/register'
import { loginValidator } from '#validators/login'
import speakeasy from 'speakeasy'
import mail from '@adonisjs/mail/services/main'

type ValidationErrorItem = {
  field: string
  message: string
}

function normalizeErrors(error: unknown): ValidationErrorItem[] {
  const maybeMessages = (error as { messages?: unknown })?.messages
  if (Array.isArray(maybeMessages)) {
    return maybeMessages as ValidationErrorItem[]
  }
  const nested = (maybeMessages as { errors?: unknown })?.errors
  if (Array.isArray(nested)) {
    return nested as ValidationErrorItem[]
  }
  return []
}

function mapErrors(errors: ValidationErrorItem[]) {
  return errors.reduce<Record<string, string>>((acc, item) => {
    acc[item.field] = item.message
    return acc
  }, {})
}


export default class AuthController {

  async Accueil({ view }: HttpContext) {
    return view.render('pages/home')
  }

  async showRegister({ view }: HttpContext) {
    return view.render('pages/register')
  }

  async showLogin({ view }: HttpContext) {
    return view.render('pages/login')
  }

  async register({ request, response, view }: HttpContext) {
    let payload: { name: string; email: string; password: string }
    try {
      payload = await request.validateUsing(registerValidator)
    } catch (error) {
      const errors = normalizeErrors(error)
      return response.status(422).send(
        await view.render('pages/register', {
          errors,
          errorMap: mapErrors(errors),
          values: request.only(['name', 'email']),
        })
      )
    }
    const existingUser = await User.findBy('email', payload.email)

    if (existingUser) {
      const message = 'Cet email est deja utilise'
      return response.status(422).send(
        await view.render('pages/register', {
          errors: [{ field: 'email', message }],
          errorMap: { email: message },
          values: request.only(['name', 'email']),
        })
      )
    }
    const user = await User.create({
      name: payload.name,
      email: payload.email,
      password: payload.password,
     // password: await hash.make(payload.password),
    })

    await user.related('role').create({
      name: 'USER',
    })

    /*
    return response.json({
      message: 'Utilisateur enregistre',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
    */
    return response.redirect('/login')
  }

  async login({ request, response, view, auth, session }: HttpContext) {
    let payload: { email: string; password: string }
    try {
      payload = await request.validateUsing(loginValidator)
    } catch (error) {
      const errors = normalizeErrors(error)
      return response.status(422).send(
        await view.render('pages/login', {
          errors,
          errorMap: mapErrors(errors),
          values: request.only(['email']),
        })
      )
    }
    // const user = await User.findBy('email', payload.email)
    // const isValidPassword = user ? await hash.verify(user.password, payload.password) : false
    try {
    const user = await User.verifyCredentials(payload.email, payload.password)
    
    if (!user) {
      const message = 'Email ou mot de passe incorrect'
      return response.status(422).send(
        await view.render('pages/login', {
          errors: [{ field: 'email', message }],
          errorMap: { email: message, password: message },
          values: request.only(['email']),
        })
      )
    }
    else if (user.isMfaEnabled) {
      // Stockage temporaire de l'ID en session, SANS connecter l'utilisateur
      session.put('mfa_user_id', user.id)
      return response.redirect().toRoute('auth.mfa.show')
    }

    await auth.use('web').login(user)
    return response.redirect('/form')
    } catch {
      session.flash('error', 'Identifiants invalides')
      return response.redirect().back()
    }
  }

  // Affiche la vue pour entrer le code à 6 chiffres
  async showMfaVerify({ view, session, response }: HttpContext) {
    if (!session.has('mfa_user_id')) return response.redirect().toRoute('auth.login')
    return view.render('pages/mfa_verify')
  }

  // Étape 3 : Validation du code OTP
  async verifyMfa({ request, response, auth, session }: HttpContext) {
    const userId = session.get('mfa_user_id')
    const code = request.input('code')

    const user = await User.findOrFail(userId)

    const isValid = user.otpCode === code && 
                    user.otpExpiresAt && 
                    user.otpExpiresAt > DateTime.now()

    if (isValid) {
      user.otpCode = null
      user.otpExpiresAt = null
      await user.save()

      session.forget('mfa_user_id')
      await auth.use('web').login(user)
      return response.redirect().toPath('/goToUrl')
    }

    session.flash('error', 'Code invalide ou expiré.')
    return response.redirect().back()
  }
  
  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect('/login')
  }
}