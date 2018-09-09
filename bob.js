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

    // client.on('data', function(data) {
    //
    //     console.log('Received: ' + data + '\nFROM: ' + client.remotePort)
    //
    //     client.destroy()
    //
    //
    // })

    net.createServer((socket) => {

        // socket.pipe(socket);

        socket.on('data', (data, from) => {

            console.log('DATA BOB!', data.toString());
            // socket.write('MORRE DIABO! BOB')
            processMessage(data.toString())

        })

    }).listen(port, () => {
        console.log('\nStarted Bob!', address+':'+port)
    })
}

exports.sendMessage = sendMessage

exports.startSession = (kdcAddress, kdcPort, dstAddress, dstPort) => {

    return new Promise((resolve) => {

        sendMessage(kdcAddress, kdcPort, `SESSION|${myAddress}:${myPort}|${dstAddress}:${dstPort}|${symmetric.nonce()}`)
        .then(data => {

            kdcResponse = symmetric.decrypt(data.toString(), myKey).split('|')
            kdcSession = kdcResponse[0]

            console.log('BOB RECEIVED FROM KDC', kdcSession, '\n', kdcResponse)

            // let destination = kdcResponse[1]

            resolve({session: kdcSession, destination: kdcResponse[1]})

        })


    })

}

exports.getSessionKey = () => kdcSession

exports.generateNonce = generateNonce

function sendMessage(addr, port, data) {

    console.log('Sending Message =>', addr,':',port)

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

            console.log(src, dst, command, msg)
            console.log(`Checking...${verifyNonce(msg)}`)

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