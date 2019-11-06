import io from 'socket.io-client'
import {serverHost} from './config'

const nameSpace = '/user';
const socket = io(serverHost+nameSpace);
let isSocketConnect = false;
socket.on('connect', () => {
    //alert('connect!');
    isSocketConnect = true;
    console.log('socket connect to server');
})

export let emitOSC = (address, value)=> {
    socket.emit('osc', {
        address: address,
        args: [value]
    });
}

export {isSocketConnect};