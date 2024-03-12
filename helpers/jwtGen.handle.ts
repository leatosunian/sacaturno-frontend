import { sign, verify } from 'jsonwebtoken'
const jwt_secret = process.env.JWT_SECRET || 'A'


const jwtGen = (userId: string) => {
    
    const jwt = sign({ userId }, jwt_secret, {
        expiresIn: "99999999d"
    })
    return jwt;
}

const verifyToken = (token: string) => {
    const isValid = verify( token, jwt_secret ) 
    return isValid    
}

export {
    jwtGen,
    verifyToken
}