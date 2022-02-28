import {STATUS_FAIL} from "./models/constants.js";

export const universalErrorHandler = (err, request, response, nextAction) => {

	console.log("universalErrorHandler");
	console.log( err );

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

	console.log("incomingRequestErrorHandler");
	console.log(err);

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
