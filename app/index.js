import dotenv from 'dotenv'
dotenv.config({ path: './.env' });

import fs from "fs";

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import url from "url";

import { incomingRequestErrorHandler, notFound, universalErrorHandler } from "./errors.js";
import { showlog } from "@liparistudios/js-utils";
import { checkAuthRequest, safeData } from "@liparistudios/node-safe-connection";

// import { createServer } from 'http';
import { createServer } from 'https';
import path from "path";
import {getCookieData, setAuthSession} from './services/index.js';
import {checkAuthorizedRequest} from "./controllers/index.js";
// import {getPlatformData, getPlatforms, setAuthPlatform} from "./controllers/index.js";

const whitelist = [
	"http://localhost"
	, "http://localhost:9200"
	, "https://fantagf.com:9200"
	, "http://fantagf.com:9200"
	, "http://localhost:3000"
	, "http://localhost:3001"
	, "http://localhost:3200"
	, "http://localhost:3201"
	, "undefined"	// <----------------- per postman
];


const key = fs.readFileSync('./keys-and-certs/key.pem');
const cert = fs.readFileSync('./keys-and-certs/cert.pem');



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


	// inline middleware
	.use( (request, response, nextAction) => {
		if(
			request.path.indexOf("static") === -1
			&& request.path.indexOf("manifest") === -1
			&& request.path.indexOf("favicon") === -1
			&& request.path.indexOf(".png") === -1
			&& request.path.indexOf(".jpg") === -1
			&& request.path.indexOf(".css") === -1
			&& request.path.indexOf(".js") === -1
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
const server = createServer({key: key, cert: cert }, app);


app.get('/**', (request, response, next) => {
	checkAuthorizedRequest( request )
		.then( isAuthorizedRequest => {
			
			if( !!isAuthorizedRequest ) {
				// response.cookie( "sessionid", result.session.id );
				showlog("pagina web del portale");
				response.sendFile( request.path, { root: "pages/portal" } );
			}
			else {
				showlog("static resource in access "+ request.path);
				response.sendFile( request.path, { root: "pages/access" } );
			}

		})
		.catch( e => {
			showlog("errore");
			showlog(e);
		})
	
});


app.post("/user-fingerprint", (request, response, next) => {
	showlog("post user fingerprint");
	showlog( request.body );
	
	// TODO controllare presenza utenza
	
	response.send({status: "success"});
})


app.use( universalErrorHandler );

app.all('*', notFound);

server.listen( process.env.PORT, () => {
	console.clear();
	showlog("server partito alla porta "+ process.env.PORT);
	showlog("ready");
});


