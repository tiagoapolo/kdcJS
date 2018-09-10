'use strict'

const net = require('net')
var exports = module.exports = {}
var client = new net.Socket();
var kdcResponse
var kdcSession
var myAddress
var myPort
var myKey
var lastNonce = 0

const symmetric = require('./symmetric')


exports.init = (address, port, key) => {

    myKey = key
    myAddress = address
    myPort = port


    net.createServer((socket) => {

        socket.on('data', (data, from) => {

            processMessage(data.toString())

        })

    }).listen(port, () => {
        console.log('Started Bob!', address+':'+port,  '\n')
    })
}

exports.sendMessage = sendMessage

exports.startSession = (kdcAddress, kdcPort, dstAddress, dstPort) => {

    return new Promise((resolve) => {

        sendMessage(kdcAddress, kdcPort, `SESSION|${myAddress}:${myPort}|${dstAddress}:${dstPort}|${symmetric.nonce()}`)
        .then(data => {

            kdcResponse = symmetric.decrypt(data.toString(), myKey).split('|')
            kdcSession = kdcResponse[0]

            console.log('BOB RECEIVED KDC SESSION', kdcSession, '\n')


            resolve({session: kdcSession, destination: kdcResponse[1]})

        })


    })

}

exports.getSessionKey = () => kdcSession

exports.generateNonce = generateNonce

function sendMessage(addr, port, data) {

    console.log(`BOB SENDING MESSAGE => ${addr}:${port}\nDATA: ${data}\n`)

    return new Promise((resolve) => {

        try {

            client.write(data)


            client.once('data', (data) => {

                client.destroy();

                resolve(data.toString())
            })


        } catch (e) {

            client.connect(port, addr, () => {
                client.write(data)


                client.once('data', (data) => {

                    client.destroy();

                    resolve(data.toString())
                })

            })
        }
    })
}

function processMessage(data) {

    let splittedRequest

    try {
        splittedRequest = symmetric.decrypt(data.toString(), kdcSession).split('|');

    } catch (e) {
        throw "DECRYPTION FAILED"
    }

    let command = splittedRequest[0].toLowerCase()

    switch (command) {

        case 'verify':

            let src = splittedRequest[1].toString()
            let dst = splittedRequest[2].toString()
            let msg = splittedRequest[3].toString()

            console.log('...BOB VERIFYING NONCE...')
            console.log(`VERIFICATION RESULT: ${verifyNonce(msg)}`)

            return;

        default:
            throw "COMMAND NOT FOUND: USE SESSION|SRC|DST|PARAMS"

    }


}

function generateNonce() {

    lastNonce = symmetric.nonce()

    return lastNonce
}

function verifyNonce(hex) {
    return (parseInt(hex, 16)-32).toString(16) == lastNonce
}