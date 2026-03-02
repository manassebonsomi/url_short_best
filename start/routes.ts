import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AuthController = () => import('#controllers/auth_controller')
const UrlController = () => import('#controllers/urls_controller')
const ProfilesController = () => import('#controllers/profiles_controller')

// Routes Publiques
router.get('/', [AuthController, 'Accueil'])
router.get('/login', [AuthController, 'showLogin']).as('auth.login')
router.post('/login', [AuthController, 'login'])
router.get('/register', [AuthController, 'showRegister'])
router.post('/register', [AuthController, 'register'])
router.post('/logout', [AuthController, 'logout']).use(middleware.auth())


router.get('/form', [UrlController, 'showForm']).use(middleware.auth())
router.post('/shorten', [UrlController, 'store']).use(middleware.auth())

router.get('/goToUrl', [UrlController, 'goToUrl']).as('UrlController.goToUrl').use(middleware.auth())
router.get('/list-urls', [UrlController, 'urls']).as('UrlController.urls').use(middleware.auth()).use(middleware.admin())
router.post('/search', [UrlController, 'handleSearch']).as('go.search').use(middleware.auth())

router.get('/urls/:id/edit', [UrlController, 'edit']).as('UrlController.edit').use(middleware.auth()) 
router.put('/links/:id', [UrlController, 'update']).as('UrlController.update')   
router.post('/links/:id', [UrlController, 'update'])

router.delete('/urls/:id', [UrlController, 'destroy']).as('UrlController.destroy')
router.post('/urls/:id', [UrlController, 'destroy'])

router.group(() => {
    router.get('/profile', [ProfilesController, 'show']).as('profile.show')
   // router.put('/profile', [ProfilesController, 'update']).as('profile.update')
  }).use(middleware.auth())


// Groupe protégé
router.group(() => {
    router.get('/profile/mfa/setup', [ProfilesController, 'setupMfa']).as('profile.mfa.setup')
    router.post('/profile/mfa/confirm', [ProfilesController, 'confirmMfa']).as('profile.mfa.confirm')
    router.delete('/profile/mfa', [ProfilesController, 'deactivateMfa'])
    router.post('/profile/mfa/toggle', [ProfilesController, 'toggleMfa']).as('profile.mfa.toggle')
  }).use(middleware.auth()).use(middleware.admin())
  
// Routes MFA Login (Accessibles seulement si session mfa_user_id présente)
router.get('/login/mfa', [AuthController, 'showMfaVerify']).as('auth.mfa.show')
router.post('/login/mfa', [AuthController, 'verifyMfa']).as('auth.mfa.verify')

//router.get('/:slug', [UrlController, 'redirect']).use(middleware.auth())
