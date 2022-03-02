import {showlog} from "@liparistudios/js-utils";
import {getCookieData} from "../services/index.js";


export const checkAuthorizedRequest = request => {
	
	try {
		
		// controllo cookie
		showlog("cookies");
		showlog(request.headers.cookie);
		
		let cookieData = getCookieData( request );
		
		let isToAuthize = false;
		if( !!cookieData && JSON.stringify( cookieData ) !== "{}" ) {
			// cookie presente
			isToAuthize = true;
		}
		
		showlog("is to auth? "+ isToAuthize );
		
		if( !!isToAuthize ) {
			// response.cookie( "sessionid", result.session.id );
			showlog("Autorizzato");
			return Promise.resolve( true );
		}
		else {
			showlog("NON autorizzato");
			return Promise.resolve( false );
		}
		
		
	
	}
	catch (e) {
		return Promise.reject( e );
	}
}

