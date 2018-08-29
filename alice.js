'use strict'

const net = require('net')
var exports = module.exports = {}
const config = require('./config.json')
const symmetric = require('./symmetric')
var client = new net.Socket();
var server
var kdcResponse
var kdcSession

exports.init = (address, port, key) => {

    client.on('data', function(data) {


        console.log('Received: ' + data + '\nFROM: ' + client.remotePort)

        client.destroy()

        if(client.remotePort === 8082){

            kdcResponse = symmetric.decrypt(data.toString(), key).split('|')
            kdcSession = kdcResponse[0]
            console.log('RECEIVED FROM KDC', kdcSession, '\n', kdcResponse)

            let destination = kdcResponse[1]
            sendMessage(destination.split(':')[0], destination.split(':')[1], kdcResponse[kdcResponse.length-1])

        } else {
            console.log('Received from an idiot: ', data.toString())
        }


    })

    // client.on('close', function() {
    //
    // });

    net.createServer((socket) => {

        // socket.pipe(socket);

        server = socket

        socket.on('data', (data, from) => {
            console.log('RECEBIL ', symmetric.decrypt(data.toString(), key) )

            let splittedRequest = request.split('|');
            let command = splittedRequest[0].toLowerCase()

            switch (command) {

                case 'talk':

                    let src = splittedRequest[1].toString()
                    let dst = splittedRequest[2].toString()


            }

        })

    }).listen(port, () => {
        console.log('\nStarted Alice!', address+':'+port)
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