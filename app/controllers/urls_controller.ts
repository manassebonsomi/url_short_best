import type { HttpContext } from '@adonisjs/core/http'
// import { nanoid } from 'nanoid'
import Url from '#models/url'
import QRCode from 'qrcode'
import { urlValidator } from '#validators/url'


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


export default class UrlController {
  // Affiche la page d'accueil (Formulaire de création)
  
 public async showForm({ view, auth }: HttpContext) {
    const user = auth.user!
    await user.load('role')
    return view.render('pages/form-create')
  }

  // Création d'une URL (POST /shorten)
 public async store({ request, response, auth, view }: HttpContext) {
   // const original_url = request.input('url')
   // const slug = request.input('short_slug') // URL courte personnalisée
   // let payload: { url: string; short_slug: string }

   try {
    const payload = await request.validateUsing(urlValidator)
    const user = auth.user!
    const original_url = payload.url
    const slug = payload.short_slug
    // Génération du QR Code
    const shortFullUrl = `${request.protocol()}://${request.host()}/${slug}`
    const qr_image_url = await QRCode.toDataURL(shortFullUrl)

   // await Url.create({ original_url, slug, qr_image_url })
   await user.related('urls').create({
    original_url: original_url,
    slug: slug,
    qr_image_url: qr_image_url,
  })

    return response.redirect().toRoute('UrlController.goToUrl')
  } catch (error) {
      const errors = normalizeErrors(error)
      return response.status(422).send(
        await view.render('pages/form-create', {
          errors,
          errorMap: mapErrors(errors),
          values: request.only(['url', 'short_slug']),
        })
      )
    }

    /*
    const existingSlug = await Url.findBy('slug', payload.short_slug)

      if (existingSlug) {
        const message = 'Cet slug est deja utilise'
        return response.status(422).send(
          await view.render('pages/form-create', {
            errors: [{ field: 'short_slug', message }],
            errorMap: { short_slug: message },
            values: request.only(['short_slug']),
          })
        )
      }
      */
  }

  // Page goToUrl (Listing + Recherche/Redirection)
 public async goToUrl({ view, auth }: HttpContext) {
    // CRUD : Read (Liste toutes les URLs)
   // const urls = await Url.query().orderBy('created_at', 'desc')
   const user = auth.user!
   await user.load('role')
   const urls = await auth.user!.related('urls').query().orderBy('createdAt', 'desc')
    return view.render('pages/goToUrl', { urls })
  }

  public async urls({ view }: HttpContext) {
    const urls = await Url.query().orderBy('created_at', 'desc')
    return view.render('pages/list-urls', { urls })
  }


  // Redirection via le champ "phrase à encoder"
 public async handleSearch({ request, response, session, auth }: HttpContext) {
    const slug = request.input('phrase')
    let urlEntry
    // const urlEntry = await Url.findBy('slug', slug)
   // const urlEntry = await auth.user!.related('urls').query().where('slug', slug).first()
   const user = auth.user!
   await user.load('role')

    if (user.role?.name === 'ADMIN') {
      urlEntry = await Url.query().where('slug', slug).first()
    } 
    else {
      urlEntry = await user.related('urls').query().where('slug', slug).first()
    }

      if (urlEntry) {
        return response.redirect(urlEntry.original_url)
      }
    
      session.flash('error', 'Slug courte non trouvée')
      return response.redirect().back()
  }

  public async edit({ params, view  }: HttpContext) {
  
    const url = await Url.findOrFail(params.id)
    return view.render('pages/edit', { url })
  }

  public async showForbidden({ view }: HttpContext) {
      return view.render('pages/forbidden', { message: 'Accès réservé aux administrateurs' })
    }

  public async update({ params, request, response, session }: HttpContext) {
    const url = await Url.findOrFail(params.id)
    
    // Récupérer les nouvelles données
    const newOriginalUrl = request.input('url')
    const newSlug = request.input('short_slug')

    //  QR Code régénéré uniquement si slug a été modifié
    if (newSlug !== url.slug) {
      const shortFullUrl = `${request.protocol()}://${request.host()}/${newSlug}`
      url.qr_image_url = await QRCode.toDataURL(shortFullUrl)
    }

    // Mise à jour des champs
    url.original_url = newOriginalUrl
    url.slug = newSlug

    await url.save() 

    session.flash('success', 'URL mise à jour avec succès')
    return response.redirect().toRoute('UrlController.goToUrl')
  }

  // Suppression (Delete)
 public async destroy({ params, response }: HttpContext) {
    const url = await Url.findOrFail(params.id)
    await url.delete()
    return response.redirect().back()
  }

  // Redirection directe (pour le scan QR ou lien direct)
 public async redirect({ params, response }: HttpContext) {
    const url = await Url.findByOrFail('slug', params.slug)
    return response.redirect(url.original_url)
  }
}