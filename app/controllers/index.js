import {getSessionKey, loadPlatformData, loadPlatforms, setAuthSession} from "../services/index.js";
import {getLastElementOr, showlog} from "@liparistudios/js-utils";
import jwt from "jsonwebtoken";

const isAuthorizedRequest = request => {
	
	
	try {
		
		return (
			
			getSessionKey( request )
				.then( key => {
				
					let token = request.headers.Authorization.split("Bearer ")[1]
					let tokenPayload = jwt.verify(token, 'shhhhh')
				
				})
				.catch( e => {
					return Promise.reject( e );
				})
			
		);
		
		
	
	}
	catch (e) {
		return Promise.reject( e );
	}
}


export const getPlatforms = (request, response, next) => {
	
	showlog("get platforms");
	
	
	
	
	getSessionKey( request )
		.then( key => {
			
			showlog("ritorno da getSessionKey");
			showlog(key);
			
			request.key = key;
			request.platformKey = process.env.PLATFORM_API_KEY;
			
			loadPlatforms()
				.then( list => {
					
					showlog("response");
					showlog(list);
					
					request.data = list;
					next();
				})
				.catch( e => {
					showlog("errore al loadplatforms");
					showlog(e);
					next( e )
				})
			;
		})
		.catch( e => {
			next( e );
		})
	
};


export const setAuthPlatform = (request, response, next) => {
	setAuthSession(request.body)
		.then( () => {
			next();
		})
		.catch(e => {
			next( e );
		})
	;
}



export const getPlatformData = (request, response, next) => {
	
	let pid = request.path.split("/").reduce( getLastElementOr, 0 );
	showlog("controller get platform data per id: "+ pid);
	
	
	getSessionKey( request )
		.then( key => {
			
			showlog("ritorno da getSessionKey");
			showlog(key);
			
			request.key = key;
			request.platformKey = process.env.PLATFORM_API_KEY;
			
			loadPlatformData( pid )
				.then( list => {
					
					showlog("response");
					showlog(list);
					
					request.data = list;
					next();
				})
				.catch( e => {
					showlog("errore al loadplatforms");
					showlog(e);
					next( e )
				})
			;
		})
		.catch( e => {
			next( e );
		})
	
	
}
