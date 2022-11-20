const jwt = require('jsonwebtoken');

module.exports = {
    verificarToken(headers, res) {
        try {
            const token = headers.authorization.split(' ')[1];
            const decodedToken = jwt.verify(token,"secret");
            return decodedToken;
        } catch {
            res.status(200).send("Error! Token was not provided or is incorrectly.");
        }
    }
};