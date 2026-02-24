import router from '@adonisjs/core/services/router'
const UrlController = () => import('#controllers/urls_controller')

router.get('/', [UrlController, 'showForm'])
router.post('/shorten', [UrlController, 'store'])

router.get('/goToUrl', [UrlController, 'goToUrl']).as('UrlController.goToUrl')
router.post('/search', [UrlController, 'handleSearch']).as('go.search')

router.get('/urls/:id/edit', [UrlController, 'edit']).as('UrlController.edit') 
router.put('/links/:id', [UrlController, 'update']).as('UrlController.update')   
router.post('/links/:id', [UrlController, 'update'])

router.delete('/urls/:id', [UrlController, 'destroy']).as('UrlController.destroy')
router.post('/urls/:id', [UrlController, 'destroy'])

router.get('/:slug', [UrlController, 'redirect'])
