
# KDC-JS
Key distribuition center implementation for study purposes

## How it works

This implementation assumes that KDC has Alice's and Bob's keys and are stored in a `config.json` file. Also the ports and addresses are configured using the configuration file.

Messages are sent using this protocol `CMD|SRC|DST|PARAMS`
- CMD: NONCE | TALK | VERIFY | SESSION
- SRC: 192.168.0.1:8080
- DST: 210.0.0.21:8081
- PARAMS: Message itself.

1. KDC, Alice and Bob initaliaze its servers, Bob and Alice create its Client Sockets

2. Both alice and Bob request KDC a session passing as argument the address of the other communication agreement party and encrypting with their own keys.
3. Bob generate a nonce encrypting with session key and send to Alice
4. Alice decrypts, apply process the request through a function resulting nonce + 32 and send it back to Bob.
5. Bob verifies if Alice commit to the same agreement by checking if the nonce has been summed by 32.
