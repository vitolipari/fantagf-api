import dotenv from 'dotenv'
dotenv.config({ path: './.env' })

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import url from "url";

import { incomingRequestErrorHandler, notFound, universalErrorHandler } from "./errors.js";
import { showlog } from "@liparistudios/js-utils";
import { checkAuthRequest, safeData } from "@liparistudios/node-safe-connection";

import { createServer } from 'http';
import path from "path";
import {getCookieData, setAuthSession} from './services/index.js';
import {getPlatformData, getPlatforms, setAuthPlatform} from "./controllers/index.js";

const whitelist = [
	"http://localhost"
	, "http://localhost:3000"
	, "http://localhost:3001"
	, "http://localhost:3200"
	, "http://localhost:3201"
	, "undefined"	// <----------------- per postman
];



const app = express();
app

	// CORS
	.use(cors({
		credentials: true,
		origin: function (origin, callback) {

			if( !origin || origin === undefined || typeof origin === "undefined" ) callback(null, true);
			else {
				if (whitelist.indexOf(origin) !== -1) {
					// console.log('cors success');
					callback(null, true)
				} else {
					console.log('cors failed for '+ origin);
					callback(new Error('Not allowed by CORS'))
				}
			}

		},
		optionsSuccessStatus: 200
	}))


	.use( bodyParser.json() )


	// secure incoming connection
	// .use( checkAuthRequest )


	// shimmer
	// .use( shimRequest )


	// universalErrorHandler
	// .use( universalErrorHandler )

	// inline middleware
	.use( (request, response, nextAction) => {
		if(
			request.path.indexOf("static") === -1
			&& request.path.indexOf("manifest") === -1
			&& request.path.indexOf("favicon") === -1
		) {
			showlog("\nprocesso le request "+ request.method +" "+ request.path);
			showlog( "headers" );
			showlog( request.headers );
			showlog( "body" );
			showlog( request.body );
			showlog( "query" );
			showlog( request.query );
			showlog("-------------------------------------------------------------");
			showlog("");
		}
		nextAction();
	})

;


app.set('strict routing', true);
const server = createServer(app);


// access frontend
app.get('/', (request, response, next) => {

	// controllo cookie
	showlog("portal webapi-server");

	showlog("cookies");
	showlog(request.headers.cookie);

	let cookieData = getCookieData( request );

	let isToAuthize = false;


	if( !cookieData || JSON.stringify( cookieData ) === "{}" ) {

		if( !!request.query.key && !!request.query.cc ) {

			showlog("manca il cookie ma ci sono i parametri");

			cookieData = JSON.parse( Buffer.from(request.query.cc, 'base64').toString('ascii') );
			showlog(cookieData);

			if( parseInt( cookieData.deviceSession.session.expires, 10 ) < parseInt(((new Date()).getTime()) / 1000, 10) ) {
				// scaduta
				isToAuthize = false;
			}

			if( /[0-9a-fA-F]{64}/.test( cookieData.deviceSession.session.id ) ) {
				// non valida
				isToAuthize = false;
			}
			else {
				// ok
				isToAuthize = true;
			}

		}
		else {
			isToAuthize = true;
		}

	}
	else {
		// cookie presente


		// controllo sessione
		showlog("controllo scadenza sessione");
		showlog( parseInt( cookieData.deviceSession.session.expires, 10 ) );
		showlog( parseInt(((new Date()).getTime()) / 1000, 10) );
		showlog( parseInt( cookieData.deviceSession.session.expires, 10 ) < parseInt(((new Date()).getTime()) / 1000, 10) );
		if( parseInt( cookieData.deviceSession.session.expires, 10 ) < parseInt(((new Date()).getTime()) / 1000, 10) ) {
			// scaduta
			isToAuthize = false;
		}

		showlog("controllo sessione");
		showlog( cookieData.deviceSession.session.id );
		showlog( /[0-9a-fA-F]{64}/.test( cookieData.deviceSession.session.id ) );
		if( /[0-9a-fA-F]{64}/.test( cookieData.deviceSession.session.id ) ) {
			// non valida
			isToAuthize = false;
		}
		else {
			// ok
			isToAuthize = true;
		}


	}

	showlog("is to auth? "+ isToAuthize );

	if( !!isToAuthize ) {
		let currentUrl = request.protocol +"://"+ request.hostname +":"+ process.env.PORT + request.originalUrl;
		let maskedRedirect = Buffer.from( currentUrl ).toString('base64');

		let maskedUA = Buffer.from( request.headers['user-agent'] ).toString('base64');

		// open session
		response.cookie( process.env.AUTH_COOKIE_NAME, "" );

		// redirect
		showlog("redirect to "+ process.env.ACCESS_SERVER_ADDRESS +"?r=" + maskedRedirect + "&platform="+ process.env.PLATFORM_ID + "&ua="+ maskedUA);
		response.redirect(
			process.env.ACCESS_SERVER_ADDRESS +
			"?r=" + maskedRedirect +
			"&platform="+ process.env.PLATFORM_ID +
			"&ua="+ maskedUA
		);
	}
	else {


		showlog("imposto auth session");

		// store encriptedSessionKey
		setAuthSession({
			id: cookieData.deviceSession.session.id,
			key: request.query.key
		})
		.then( result => {
			if(
				!!request.query
				&& JSON.stringify(request.query) !== "{}"
			) {

				showlog("result of setAuthSession");
				showlog(result);

				let obj = url.parse(request.url);

				// remove the querystring
				obj.search = obj.query = "";

				// reassemble the url
				let newUrl = url.format(obj);


				showlog("imposto url");
				showlog( url.parse(newUrl).pathname );

				response.cookie( process.env.AUTH_COOKIE_NAME, request.query.cc );
				response.redirect( url.parse(newUrl).pathname );
			}
			else {
				showlog("result of setAuthSession no-query");
				next();
			}


			// next();
		})
		.catch(e => {
			showlog("errore al set session");
			showlog( e );
			response.sendFile(path.join( path.resolve(path.dirname('.') ) ) +"/pages/error.html");
		})



	}


});
app.use( express.static( path.join( path.resolve(path.dirname('')), '/pages/access') ) );

app.get('/logo.png', (request, response) => {
	response.sendFile( 'canino-srl-logo@350.png', { root: "pages/imgs" } );
});



/**
 * Ricezione chiave di sessione
 */
app.post(
	"/set-auth-session", 		// endpoint path
	checkAuthRequest, // (secure-connection) check authorized request
	setAuthPlatform 			// set data
)






/**
 * get all platforms
 */
app.get(
	"/api/v1/platforms", 	// endpoint
	getPlatforms, 			// controller
	safeData			// (secure-connection)
);


app.get(
	"/api/v1/platform/:pid",
	getPlatformData,
	safeData
)



/**
 * Error handler
 * response in json format
 */
app.use( universalErrorHandler );

server.listen( process.env.PORT, () => {
	console.clear();
	showlog("server portal access webserver partito alla porta "+ process.env.PORT);
	showlog("ready");
});


