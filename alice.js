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

    // client.on('data', function(data) {
    //
    //
    //     console.log('Received: ' + data + '\nFROM: ' + client.remotePort)
    //
    //     client.destroy()

        // KDC
        // if(client.remotePort === 8082){
        //
        //     kdcResponse = symmetric.decrypt(data.toString(), key).split('|')
        //     kdcSession = kdcResponse[0]
        //
        //     console.log('RECEIVED FROM KDC', kdcSession, '\n', kdcResponse)
        //
        //     let destination = kdcResponse[1]
        //     // sendMessage(destination.split(':')[0], destination.split(':')[1], kdcResponse[kdcResponse.length-1])
        //
        // // } else {
        //     console.log('Received from an idiot: ', data.toString())
        // // }


    // })

    // client.on('close', function() {
    //
    // });

    net.createServer((socket) => {

        // socket.pipe(socket);

        server = socket

        socket.on('data', (data, from) => {

            console.log('RECEBIL ', data.toString(), socket.localPort)

            processMessage(data)

        })

    }).listen(port, () => {

        myAddress = address
        myPort = port

        console.log('\nStarted Alice!', address+':'+port)
    })

}

exports.startSession = (kdcAddress, kdcPort, dstAddress, dstPort) => {

    return new Promise((resolve, reject) => {

        sendMessage(kdcAddress, kdcPort, `SESSION|${myAddress}:${myPort}|${dstAddress}:${dstPort}|${symmetric.nonce()}`)
        .then(data => {

            kdcResponse = symmetric.decrypt(data.toString(), myKey).split('|')
            kdcSession = kdcResponse[0]

            console.log('ALICE RECEIVED FROM KDC', kdcSession, '\n', kdcResponse)

            // let destination = kdcResponse[1]

            resolve({session: kdcSession, destination: kdcResponse[1]})

        })
        // client.once('data', (data) => {
        //
        //     client.destroy()
        //
        //     if(client.remotePort.toString() === kdcPort){
        //
        //         kdcResponse = symmetric.decrypt(data.toString(), myKey).split('|')
        //         kdcSession = kdcResponse[0]
        //
        //         console.log('ALICE RECEIVED FROM KDC', kdcSession, '\n', kdcResponse)
        //
        //         // let destination = kdcResponse[1]
        //
        //         resolve({ session: kdcSession, destination: kdcResponse[1] })
        //
        //     } else {
        //         reject({ error:"Response was not from KDC", address: `${client.remoteAddress}:${client.remotePort}`, data: data.toString() })
        //     }
        //
        //
        // })

    })

}

exports.sendMessage = sendMessage

exports.getSessionKey = () => kdcSession

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
        throw `DECRYPTION FAILED \nmessage: ${e}\ndata: ${data.toString()}`
    }


    let command = splittedRequest[0].toLowerCase()

    switch (command) {

        case 'nonce':

            let src = splittedRequest[1].toString()
            let dst = splittedRequest[2].toString()
            let msg = splittedRequest[3].toString()

            console.log(src, dst, command, msg)

            console.log('HANDLER: ',handleNonce(msg))
            sendMessage(src.split(':')[0], src.split(':')[1], symmetric.encrypt(`VERIFY|${dst.split(':')[0]}:${dst.split(':')[1]}|${src.split(':')[0]}:${src.split(':')[1]}|${handleNonce(msg)}`, kdcSession))
                .then(x => console.log('SENDING X', x))

            return;

        default:
            throw "COMMAND NOT FOUND: USE SESSION|SRC|DST|PARAMS"

    }


}

function handleNonce(hex){
    return (parseInt(hex, 16)+32).toString(16)
}