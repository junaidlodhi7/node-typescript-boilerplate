import {verifyJWTToken} from './auth'
import db from '../models/'
import {environment} from './'
export function verifyJWT_MW(req, res, next) {
  req.env = environment
  console.log('Headers: ' + JSON.stringify(req.headers, null, 2))
  if (req.headers && req.headers['x-access-token']) {
    verifyJWTToken(req.headers['x-access-token']).then(decode => {
      db['User'].findOne({where: {email: decode['email'], id: decode['id']}}).then(function (user) {
          if (!user) {
            req.user = undefined
            next()
          } else {
            req.user = user
            next()
          }
        }).catch(function (err) {
          req.user = undefined
          next()
        })
    }).catch((err) => {
      res.status(400).json({message: 'Invalid auth token provided.'})
    })
  }else {
    req.user = undefined
    return res.status(401).json({ success: false , message: 'Unauthorized user!' })
  }

}
