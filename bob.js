'use strict'

const net = require('net')
var exports = module.exports = {}
var client = new net.Socket();
var kdcResponse
var kdcSession

const symmetric = require('./symmetric')


exports.init = (address, port, key) => {


    client.on('data', function(data) {

        console.log('Received: ' + data + '\nFROM: ' + client.remotePort)

        client.destroy()

        if(client.remotePort === 8082){

            let kdcResponse = symmetric.decrypt(data.toString(), key).split('|')
            let kdcSession = kdcResponse[0]

            console.log('RECEIVED FROM KDC','\n', kdcResponse, kdcResponse[0])

            let destination = kdcResponse[1]

            sendMessage(destination.split(':')[0], destination.split(':')[1], kdcResponse[kdcResponse.length-1])

        } else {

            console.log('Received from an idiot: ', data.toString())
        }

    })

    net.createServer((socket) => {

        // socket.pipe(socket);


        socket.on('data', (data, from) => {

            console.log('DATA BOB!', data.toString());
            socket.write('MORRE DIABO! BOB')

        })

    }).listen(port, () => {
        console.log('\nStarted Bob!', address+':'+port)
    })
}

exports.sendMessage = sendMessage

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