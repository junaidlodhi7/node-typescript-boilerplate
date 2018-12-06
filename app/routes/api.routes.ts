import * as winston from 'winston'
import {UsersController, RegistrationController, SessionController, PasswordController} from '../controllers'
import { verifyJWT_MW } from '../config/middlewares'
const passportConf = require('../config/passport')
import {swagger, swaggerDocs} from '../config/swagger'

export function initRoutes(app, router) {
  winston.log('info', '--> Initialisations des routes')
  let apiRoute = router
  const users = new UsersController()
  const registration = new RegistrationController()
  const session = new SessionController()
  const password = new PasswordController()
  // apiRoute.get('/', (req, res) => res.status(200).send({message: 'Api Server is running!'}))
  apiRoute.use('/docs', swagger, swaggerDocs)
  apiRoute.post('/v1/login', session.login)
  apiRoute.post('/v1/signup/', registration.signup)
  apiRoute.post('/v1/password/reset', password.create)
  apiRoute.route('/v1/auth/facebook').post(session.facebook)
  apiRoute.route('*').all(verifyJWT_MW)
  apiRoute.get('/v1/users/',  users.list)
  return apiRoute
}
