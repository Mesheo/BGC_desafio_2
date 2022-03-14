const express = require("express");
const { google } = require("googleapis")
const sls = require("serverless-http")
const nodemailer = require("nodemailer");
const config = require('./config.js')
const AWS = require("aws-sdk")
const cors = require("cors")

const dynamodb = new AWS.DynamoDB.DocumentClient();

const tableName = 'formularios';
AWS.config.update({
    endpoint: "https://dynamodb.sa-east-1.amazonaws.com"
});

const OAuth2 = google.auth.OAuth2
const app = express(), port = 3000;
app.use(express.json(), (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", 'GET,PUT,POST,DELETE');
    app.use(cors());
    next();
});

//Mandar uma nova mensagaem
app.post("/send_message", (request, response) => {
    response.header("Access-Control-Allow-Origin", "*");

    console.log('Route "/send_message" being used!');
    const body = request.body;

    var params ={
        TableName: tableName,
        Item : {
            email_id : body.crush_email,
            name: body.name
        }
    }

    dynamodb.put(params).promise()
        .then(function(data) {
            console.log(data)
        })
        .catch(function(error) {
            console.log(error)
        });

    acessToken = async () => {
        try {
            const OAuth2_client = new OAuth2(
                config.client_id, 
                config.client_secret,
                "https://developers.google.com/oauthplayground"
            );  
            OAuth2_client.setCredentials({ 
                refresh_token: config.refresh_token
            });
            const acessToken = await OAuth2_client.getAccessToken() 
            return acessToken

        } catch (error) {
            console.log(error)
        }
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: config.user,
            clientId: config.client_id,
            clientSecret: config.client_secret,
            refreshToken: config.refresh_token,
            accessToken: acessToken
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    
    let mailOptions = {
        from: config.user,
        to: body.crush_email,
        subject: "Cupido Digital",
        text: `Olá, ${body.crush_name}!. Alguém decidiu usar os serviços <h1> do Cupido Digital </h1> pra te enviar esta mensagem: \n${body.message}`
    };
    
    transporter.sendMail(mailOptions, function ( error, sucess ) {
        //Retorno da API
        if (error) {
            console.log("Error: ", error);
            transporter.close()

            return response.send({
                status: 500,
                emailer_message: error,
                // database_status: database_status
            });
        
        }else {
            console.log("Sucess: ", sucess);
            transporter.close()

            return response.send({
                status: 200,
                emailer_message: sucess,
                // database_status: database_status
            });
        };
    });  

});

app.get("/", (request, response) => {
    return response.send("<h1>BEM VINDO</h1>")
})

//Pegar as mensagens enviadas
app.get("/messages_count", (request, response) => {
    
    var params = {
        TableName: tableName
    };

    dynamodb.scan(params, (error, data) => {
        if (error) {
            return response.send(error)
        } else {
            return response.send({
                "items_count": data.Count
            })
        };
    });
});


app.listen(port, () => {
    console.log(`Server running at ${port}`)
});

module.exports.server = sls(app)



