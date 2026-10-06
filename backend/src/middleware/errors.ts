import {Request,Response,NextFunction} from 'express';
export class HttpError extends Error{constructor(public status:number,message:string){super(message)}}
export function asyncHandler(fn:(req:Request,res:Response,next:NextFunction)=>Promise<unknown>){return (req:Request,res:Response,next:NextFunction)=>Promise.resolve(fn(req,res,next)).catch(next)}
export function errorHandler(err:any,_req:Request,res:Response,_next:NextFunction){console.error(err);res.status(err?.status||500).json({error:err?.message||'Internal server error'})}
