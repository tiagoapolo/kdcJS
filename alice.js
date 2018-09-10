'use strict'

const net = require('net')
var exports = module.exports = {}
const config = require('./config.json')
const symmetric = require('./symmetric')
var client = new net.Socket();
var server
var kdcResponse
var kdcSession
var myAddress
var myPort
var myKey

exports.init = (address, port, key) => {

    myKey = key


    net.createServer((socket) => {

        server = socket

        socket.on('data', (data, from) => {

            // console.log('RECEBIL ', data.toString(), socket.localPort)

            processMessage(data)

        })

    }).listen(port, () => {

        myAddress = address
        myPort = port

        console.log('Started Alice!', address+':'+port,  '\n')
    })

}

exports.startSession = (kdcAddress, kdcPort, dstAddress, dstPort) => {

    return new Promise((resolve, reject) => {

        sendMessage(kdcAddress, kdcPort, `SESSION|${myAddress}:${myPort}|${dstAddress}:${dstPort}|${symmetric.nonce()}`)
        .then(data => {

            kdcResponse = symmetric.decrypt(data.toString(), myKey).split('|')
            kdcSession = kdcResponse[0]

            console.log('ALICE RECEIVED KDC SESSION', kdcSession, '\n')

            resolve({session: kdcSession, destination: kdcResponse[1]})

        })

    })

}

exports.sendMessage = sendMessage

exports.getSessionKey = () => kdcSession

function sendMessage(addr, port, data) {

    console.log(`ALICE SENDING MESSAGE => ${addr}:${port}\nDATA: ${data}\n`)

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
        throw `DECRYPTION FAILED \nmessage: ${e}\ndata: ${data.toString()}`
    }


    let command = splittedRequest[0].toLowerCase()

    switch (command) {

        case 'nonce':

            let src = splittedRequest[1].toString()
            let dst = splittedRequest[2].toString()
            let msg = splittedRequest[3].toString()

            console.log(`ALICE RECEIVED NONCE ${msg}\n`)

            // console.log('HANDLER: ',handleNonce(msg))
            sendMessage(src.split(':')[0], src.split(':')[1], symmetric.encrypt(`VERIFY|${dst.split(':')[0]}:${dst.split(':')[1]}|${src.split(':')[0]}:${src.split(':')[1]}|${handleNonce(msg)}`, kdcSession))
                .then(x => console.log('SENDING X', x))

            return;

        default:
            throw "COMMAND NOT FOUND: USE SESSION|SRC|DST|PARAMS"

    }


}

function handleNonce(hex){

    console.log('NONCE HAS BEEN MODIFIED\n')

    return (parseInt(hex, 16)+32).toString(16)
}