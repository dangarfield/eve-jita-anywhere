const PASSWORD = process.env.ADMIN_PASSWORD
export const verifyAdmin = (req, res, next) => {
  if (req.query && req.query.token === PASSWORD) {
    next()
  } else {
    const bearerHeader = req.headers.authorization.replace('Bearer ', '')
    // console.log('bearerHeader', bearerHeader)
    if (typeof bearerHeader === 'undefined') {
      res.status(403).json({ error: 'bad-password' })
      return
    }
    //   console.log('bearerHeader', req.headers, bearerHeader, process.env.ADMIN_PASSWORD)
    if (bearerHeader === PASSWORD) {
      next()
    } else {
      res.status(403).json({ error: 'bad-password' })
    }
  }
}

export const verifyToken = async (req, res, next) => {
  const bearerHeader = req.headers.authorization
  // console.log('verifyToken', 'bearerHeader', bearerHeader)
  if (typeof bearerHeader === 'undefined') {
    res.status(403).json({ error: 'missing-token' })
    return
  }

  // TODO - Potentially allow verifyAdmin to work here too so that the API routes can be the same, just with different auth

  const token = bearerHeader.split(' ')[1]
  // console.log('verifyToken', token)
  try {
    const vReq = await fetch(`https://esi.evetech.net/verify/?token=${token}`)
    const vRes = await vReq.json()
    if (vRes.error) {
      console.log('verifyToken error')
      res.status(403).json(vRes)
    } else if (vRes.ExpiresOn && new Date(`${vRes.ExpiresOn}Z`) - new Date() < 0) {
      console.log('verifyToken expired')

      // res.error(401, 'Not Modified')
      res.status(403).json({ expired: 'token-expired' })
    } else {
      req.auth = {
        characterID: vRes.CharacterID,
        characterName: vRes.CharacterName
      }
      console.log('verifyToken ok')
      next()
    }
  } catch (error) {
    res.status(500).json(error)
  }
}
