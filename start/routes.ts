import router from '@adonisjs/core/services/router'
const UrlController = () => import('#controllers/urls_controller')

router.get('/', [UrlController, 'showForm'])
router.post('/shorten', [UrlController, 'store'])

router.get('/goToUrl', [UrlController, 'goToUrl']).as('UrlController.goToUrl')
router.post('/search', [UrlController, 'handleSearch']).as('go.search')

router.get('/urls/:id/edit', [UrlController, 'edit']).as('UrlController.edit') // Page de formulaire
router.put('/urls/:id', [UrlController, 'update']).as('UrlController.update')    // Action de mise à jour

router.delete('/urls/:id', [UrlController, 'destroy']).as('UrlController.destroy')

// Route pour le scan QR / Redirection directe
router.get('/:slug', [UrlController, 'redirect'])