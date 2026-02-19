import router from '@adonisjs/core/services/router'
const UrlsController = () => import('#controllers/urls_controller')

// Page d'accueil (Formulaire)
router.get('/', [UrlsController, 'index'])

// Route d'administration / listing
router.get('/list', [UrlsController, 'listing'])

// Traitement du formulaire
router.post('/shorten', [UrlsController, 'store'])

// Redirection (ex: /r/aB3x9)
router.get('/r/:slug', [UrlsController, 'redirect'])

// Route de suppression
router.delete('/urls/:slug', [UrlsController, 'destroy'])
