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
		//
	}
	else {
		// cookie presente
		isToAuthize = true;
	}

	showlog("is to auth? "+ isToAuthize );

	if( !!isToAuthize ) {
		//
	}
	else {

		// .catch(e => {
		// 	showlog("errore al set session");
		// 	showlog( e );
		// 	response.sendFile(path.join( path.resolve(path.dirname('.') ) ) +"/pages/error.html");
		// })



	}


});
app.use( express.static( path.join( path.resolve(path.dirname('')), '/pages/portal') ) );

app.get('/logo.png', (request, response) => {
	response.sendFile( 'canino-srl-logo@350.png', { root: "pages/imgs" } );
});


app.all('*', notFound);


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


