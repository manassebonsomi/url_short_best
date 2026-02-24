import type { HttpContext } from '@adonisjs/core/http'
// import { nanoid } from 'nanoid'
import generateSlug from '#helpers/generateSlug'
import Url from '#models/url'
import QRCode from 'qrcode'


export default class UrlController {
  // Affiche la page d'accueil (Formulaire de création)
 public async showForm({ view }: HttpContext) {
    return view.render('pages/index')
  }

  // Création d'une URL (POST /shorten)
 public async store({ request, response }: HttpContext) {
    const original_url = request.input('url')
    const slug = request.input('short_slug') // URL courte personnalisée

    // Génération du QR Code
    const shortFullUrl = `${request.protocol()}://${request.host()}/${slug}`
    const qr_image_url = await QRCode.toDataURL(shortFullUrl)

    // Persistance CRUD : Create
    await Url.create({ original_url, slug, qr_image_url })

    return response.redirect().toRoute('UrlController.goToUrl')
  }

  // Page goToUrl (Listing + Recherche/Redirection)
 public async goToUrl({ view }: HttpContext) {
    // CRUD : Read (Liste toutes les URLs)
    const urls = await Url.query().orderBy('created_at', 'desc')
    return view.render('pages/goToUrl', { urls })
  }


  // Redirection via le champ "phrase à encoder"
 public async handleSearch({ request, response, session }: HttpContext) {
    const slug = request.input('phrase')
    const urlEntry = await Url.findBy('slug', slug)

    if (urlEntry) {
      return response.redirect(urlEntry.original_url)
    }
    
    session.flash('error', 'URL courte non trouvée')
    return response.redirect().back()
  }

  /**
   * Afficher le formulaire de modification
   */
  public async edit({ params, view }: HttpContext) {
    const url = await Url.findOrFail(params.id)
    return view.render('pages/edit', { url })
  }

  /**
   * Traiter la mise à jour (Action du formulaire)
   */
  public async update({ params, request, response, session }: HttpContext) {
    const url = await Url.findOrFail(params.id)
    
    // Récupérer les nouvelles données
    const newOriginalUrl = request.input('url')
    const newSlug = request.input('short_slug')

    // Si le slug a été modifié, on doit régénérer le QR Code
    if (newSlug !== url.slug) {
      const shortFullUrl = `${request.protocol()}://${request.host()}/${newSlug}`
      url.qr_image_url = await QRCode.toDataURL(shortFullUrl)
    }

    // Mise à jour des champs
    url.original_url = newOriginalUrl
    url.slug = newSlug

    await url.save() // CRUD : Update dans Postgres

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