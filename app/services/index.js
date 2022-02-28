import {getLastElementOr, showlog} from "@liparistudios/js-utils";
import { dbQuery } from "./database.js";
import fetch from "node-fetch";
import jwt from "jsonwebtoken";

export const loadPlatforms = () => {
	
	showlog("chiamata");
	showlog("GET "+ process.env.AUTHSERVER_ADDRESS + process.env.ALL_PLATFORMS_ENDPIONT + "?token="+ getPlatformToken());
	
	return (
		fetch(
			process.env.AUTHSERVER_ADDRESS + process.env.ALL_PLATFORMS_ENDPIONT +
			"?token="+ getPlatformToken()
		)
		.then( remoteResponse => remoteResponse.json() )
		.then( remoteResponse => {
			showlog("response");
			showlog(remoteResponse);
			return remoteResponse;
		})
		.catch( e => {
			showlog("errore chiamata");
			showlog( e );
			return Promise.reject( e );
		})
	);
	
}


export const loadPlatformData = id => {
	
	showlog("chiamata");
	showlog("GET "+ process.env.AUTHSERVER_ADDRESS + process.env.PLATFORM_DATA_ENDPIONT + "?pid="+ id);
	
	return (
		fetch(
			process.env.AUTHSERVER_ADDRESS + process.env.PLATFORM_DATA_ENDPIONT +
			"?pid="+ id +"&token="+ getPlatformToken()
		)
			.then( remoteResponse => remoteResponse.json() )
			.then( remoteResponse => {
				showlog("response");
				showlog(remoteResponse);
				return remoteResponse;
			})
			.catch( e => {
				showlog("errore chiamata");
				showlog( e );
				return Promise.reject( e );
			})
	);
	
}



/**
 * testo
 *
 *
 * esempio

 var sql = "INSERT INTO customers (name, address) VALUES ?";
  var values = [
    ['John', 'Highway 71'],
    ['Peter', 'Lowstreet 4'],
    ['Amy', 'Apple st 652'],
    ['Hannah', 'Mountain 21'],
    ['Michael', 'Valley 345'],
    ['Sandy', 'Ocean blvd 2'],
    ['Betty', 'Green Grass 1'],
    ['Richard', 'Sky st 331'],
    ['Susan', 'One way 98'],
    ['Vicky', 'Yellow Garden 2'],
    ['Ben', 'Park Lane 38'],
    ['William', 'Central st 954'],
    ['Chuck', 'Main Road 989'],
    ['Viola', 'Sideway 1633']
  ];
  con.query(sql, [values], function (err, result) {
    if (err) throw err;
    console.log("Number of records inserted: " + result.affectedRows);
  });
 
 *
 * @param data
 * @returns {Promise<unknown>}
 */
export const setAuthSession = data => {
	if( !!data && !!data.key ) {
		let query = `INSERT INTO sessions( session_id, session_key ) VALUES( '${data.id}', '${data.key}' );`;
		return dbQuery( query );
	}
	return Promise.resolve();
}

export const getSessionKey = request => {
	let cookieData = getCookieData( request );
	
	showlog("ritorno dalla presa dei cookies");
	showlog(cookieData);
	
	
	if( !!cookieData ) {
		if( !!cookieData.deviceSession && !!cookieData.deviceSession.session && !!cookieData.deviceSession.session.id ) {
			let sid = cookieData.deviceSession.session.id;
			let query = `SELECT session_key FROM sessions WHERE session_id = '${ sid }';`;
			return (
				dbQuery( query )
					
					// retrieve encripted sessione key
					.then( results => {
						return results.reduce( getLastElementOr, {session_key: null} ).session_key;
					})
					
					.catch( e => {
						showlog("errore uscito da dbQuery");
						showlog( e );
						return Promise.reject( e );
					})
			);
		}
		else {
			// cookies malformed
			return Promise.reject({status: "error", error: "malformed cookie"});
		}
	}
	else {
		// mancano i cookies
		return Promise.reject({status: "error", error: "missing cookie"});
	}
	
}


export const getCookieData = request => {
	let cookieData = null;
	
	showlog("controllo cookie alla request");
	// showlog(request);
	showlog(request.headers);
	showlog(request.headers.cookie);

	if( !!request.headers.cookie ) {
		cookieData =
			JSON.parse(

				Buffer.from(
					request.headers.cookie
						.split(";")
						.map( cookie => {
							if( cookie.split("=")[0].trim() === process.env.AUTH_COOKIE_NAME ) {
								return cookie.split("=")[1];
							}
							return null;
						})
						.filter( cookie => !!cookie )
						.reduce( (final, current) => current, "e30=" )
					, 'base64').toString('ascii')
			)
		;

		showlog( cookieData );
	}

	return cookieData;
}



export const getPlatformToken = () => {
	return jwt.sign({platform: process.env.PLATFORM_NAME}, process.env.PLATFORM_API_KEY);
}

