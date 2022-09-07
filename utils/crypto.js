const crypto = require("crypto")

exports.hash_password = (value) => {
   const algo = crypto.createHash("sha256")
   const hashed_password = algo.update(value).digest('base64')
   return hashed_password;
}

exports.generate16BypteHexRandom = () => {
   return crypto.randomBytes(16).toString("hex");
}