import {STATUS_FAIL} from "./models/constants.js";
import {showlog} from "@liparistudios/js-utils";

export const universalErrorHandler = (err, request, response, nextAction) => {
	
	showlog("universalErrorHandler");
	// showlog("request");
	// showlog(request);
	
	showlog("method");
	showlog(request.method);
	
	showlog( err );
	
	if( request.method === "GET" ) {
		showlog("not found");
		nextAction();
	}
	else {
		response
			.status( err.code || 500 )
			.send(
				Object.assign(
				{
							status: "fail"
					},
					err
				)
			)
		;
	}


};



export const notFound = (request, response) => {
	response
		.status(404)
		.send({
			status: STATUS_FAIL,
			error: "Not Found",
			messaggio: "Richiesta non gestita"
		})
	;
}

export const incomingRequestErrorHandler = (err, request, response, nextAction) => {

	showlog("incomingRequestErrorHandler");
	showlog("request");
	showlog(request);
	
	showlog("method");
	showlog(request.method);
	
	showlog("headers");
	showlog(request.headers);
	
	showlog(err);

	let errObjDTO = {
		status: STATUS_FAIL,
		message: JSON.stringify( err.toString() )
	};

	response
		.status( 500 )
		.send( errObjDTO )
	;


	// nextAction( errObjDTO );
};
