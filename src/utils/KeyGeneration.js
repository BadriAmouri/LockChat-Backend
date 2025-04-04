const crypto = require('crypto');
const { promisify } = require('util');

const generateECCKeyPair = async () => {
    const { publicKey, privateKey } = await promisify(crypto.generateKeyPair)('ec', {
        namedCurve: 'prime256v1', // Change if needed (e.g., secp256k1, ed25519)
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });

    return { publicKey, privateKey };
};

module.exports = { generateECCKeyPair };
