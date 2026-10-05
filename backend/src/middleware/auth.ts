import {Request,Response,NextFunction} from 'express';import jwt from 'jsonwebtoken';import {config} from '../config';import {HttpError} from './errors';
declare global {namespace Express {interface Request {userId?:number}}}
export function signToken(userId:number){return jwt.sign({userId},config.jwtSecret,{expiresIn:config.jwtExpiresIn as any})}
export function requireAuth(req:Request,_res:Response,next:NextFunction){const h=req.header('authorization');if(!h?.startsWith('Bearer ')) return next(new HttpError(401,'Authentication required'));try{const p=jwt.verify(h.slice(7),config.jwtSecret) as any;if(!p.userId) throw new Error();req.userId=Number(p.userId);next()}catch{next(new HttpError(401,'Invalid or expired token'))}}
