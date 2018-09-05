'use strict'

const net = require('net')
var exports = module.exports = {}
var client = new net.Socket();
var kdcResponse
var kdcSession
var myAddress
var myPort
var myKey

const symmetric = require('./symmetric')


exports.init = (address, port, key) => {

    myKey = key
    myAddress = address
    myPort = port

    client.on('data', function(data) {

        console.log('Received: ' + data + '\nFROM: ' + client.remotePort)

        client.destroy()


    })

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

    return new Promise((resolve, reject) => {

        sendMessage(kdcAddress, kdcPort, `SESSION|${myAddress}:${myPort}|${dstAddress}:${dstPort}`)
        client.once('data', (data) => {

            client.destroy();

            if(client.remotePort.toString() === kdcPort){

                kdcResponse = symmetric.decrypt(data.toString(), myKey).split('|')
                kdcSession = kdcResponse[0]

                console.log('RECEIVED FROM KDC', kdcSession, '\n', kdcResponse)

                // let destination = kdcResponse[1]

                resolve(kdcSession)

            } else {
                reject({ error:"Response was not from KDC", address: `${client.remoteAddress}:${client.remotePort}`, data: data.toString() })
            }


        })

    })

}

exports.getSessionKey = () => kdcSession

function sendMessage(addr, port, data) {

    console.log('Sending Message =>', addr,':',port)

    try {
        client.write(data)
    } catch (e) {
        client.connect(port, addr, () => {
            client.write(data)
        })
    }
}

function processMessage(data) {


    try {
        let splittedRequest = symmetric.decrypt(data.toString(), myKey).split('|');

    } catch (e) {
        throw "DECRYPTION FAILED"
    }

    let command = splittedRequest[0].toLowerCase()

    switch (command) {

        case 'talk':

            let src = splittedRequest[1].toString()
            let dst = splittedRequest[2].toString()
            let msg = splittedRequest[3].toString()

            console.log(src, dst, command, msg)

        default:
            throw "COMMAND NOT FOUND: USE SESSION|SRC|DST|PARAMS"

    }


}