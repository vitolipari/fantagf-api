import mysql from "mysql";
import {showlog} from "@liparistudios/js-utils";

let con;


const connectToDB = () => {
	
	return (
		new Promise((success, fail) => {
			
            con = mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_DATABASE
            });
			
			con.connect( err => {
				if (!!err)  fail(err);
				else        success( con );
			});
			
		})
	);
	
}


export const dbQuery = sql => {
	
	showlog("dbQuery");
	
	return (
		new Promise((success, fail) => {
			
			if( !con ) {
				connectToDB()
					.then( connection => {
						success( connection );
					})
					.catch( e => {
						showlog("connection fail");
						showlog( e );
						fail( e );
					})
				;
			}
			else {
				success( con );
			}

		})

		.then(() => {
			
			showlog("db connection");
			
			return (
				new Promise((success, fail) => {
					
					showlog("query");
					showlog(sql);
					con.query( sql, (error, results) => {
						if( !!error ) fail(error);
						else {
							showlog( JSON.parse(JSON.stringify(results)) );
							success( JSON.parse(JSON.stringify(results)) );
						}
					})
					
				})
			);
			
			
		})
		
		.catch(e => {
			showlog("errore alla connessione al db");
			showlog( e );
			return Promise.reject( e );
		})
	);
	
}
