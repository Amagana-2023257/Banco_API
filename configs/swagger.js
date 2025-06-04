import { version } from "mongoose";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express"
const swaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "Banca Kinal API",
            version: "1.0.0",
            description: "API para gestion de bancos.",
            contact: {
                name: "Angel Magaña",
                email: "amagana_2023257@kinal.org.gt"
            }
        },
        servers: [
            {
                url: "http://127.0.0.1:3001/banca-Kinal/v1"
            }
        ]
    },
    apis: [
        "./src/auth/*.js",
        "./src/user/*.js"
    ]
}
const swaggerDocs = swaggerJSDoc(swaggerOptions)
export { swaggerDocs, swaggerUi }