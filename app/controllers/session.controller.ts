import { ApplicationController } from './'
const passport = require('passport')
let self
export class SessionController extends ApplicationController {
  constructor() {
    self = super('User')
  }
  login(req, res) {
    req.checkBody('email', 'Enter a valid email address.').isEmail().isLength({ min: 3, max: 100 })
    req.checkBody('password', 'Password should be at least 6 chars long.').isLength({ min: 6 })
    req.condition = { where: { email: req.body.email } }
    return self._findOne(req, res, data => {
      if (data && data.authenticate(req.body.password)) {
        const token = data.generateToken()
        res.setHeader('x-access-token', token)
        return res.status(200).send({
          success: true,
          data: data,
          token: token,
          message: 'Congratulations! You have Successfully login.'
        })
      }
      else
        return res.status(401).send({
          success: false,
          errors: [{ message: 'Authentication failed. Wrong Password or email.' }]
        })
    })
  }
  facebook(req, res) {
    req.checkBody('email', 'Enter a valid email address.').isEmail().isLength({ min: 3, max: 100 })
    passport.authenticate('facebook-token',  (err, auth, info) => {
      if (err) {
        if (err.oauthError) {
          const oauthError = JSON.parse(err.oauthError.data)
          res.status(422).send({success: false, errors: [{message: oauthError.error.message}]})
        } else
          res.status(422).send({success: false, errors: [{message: 'Unprocessable entity'}]})
      } else {
        req.condition = {
          where: {email: req.body.email},
          defaults: {
            fullName: auth.name.displayName,
            password: '1234zxcv',
            status: 'active'
          }
        }
        self._findOrCreate(req, res, {}, (data, isCreated) => {
          const token = data.generateToken()
          res.setHeader('x-access-token', token)
          return res.status(200).send({
            success: true,
            data: data,
            token: token,
            message: 'Congratulations! Your account has been successfully authorized with facebook.'
          })
        })
      }
    })(req, res)
  }
}
