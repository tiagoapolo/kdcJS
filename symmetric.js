'use strict'

const config = require('./config')
var crypto = require('crypto');

var algorithm = 'aes256';
var inputEncoding = 'utf8';
var outputEncoding = 'hex';

// var key = config.alice.key;
// var text = 'Sou a alice';

var exports = module.exports = {}

exports.encrypt = (data, key) => {

    // console.log('Ciphering "%s" with key "%s" using %s', data, key, algorithm);

    var cipher = crypto.createCipher(algorithm, key);
    var ciphered = cipher.update(data, inputEncoding, outputEncoding);
    ciphered += cipher.final(outputEncoding);

    // console.log('Result in %s is "%s"', outputEncoding, ciphered);

    return ciphered
}

exports.decrypt = (encoded, key) => {

    var decipher = crypto.createDecipher(algorithm, key);
    var deciphered = decipher.update(encoded, outputEncoding, inputEncoding);
    deciphered += decipher.final(inputEncoding);

    // console.log(deciphered);

    return deciphered
}

exports.nonce = () => crypto.randomBytes(6).toString('hex')



