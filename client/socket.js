import io from 'socket.io-client'
import {gotChallenge, changeStatus} from './store/warReducer'
import {gotMessage} from './store/chatReducer'
import store from './store'
import history from './history';


const socket = io(window.location.origin)

socket.on('connect', () => {
  console.log('Connected!')
})

socket.on('challenge', challenger => {
  store.dispatch(gotChallenge(challenger, true))
})

socket.on('gameStarted', () => {
  store.dispatch(changeStatus(false, true, null, null))
})

socket.on('readyToPlay', user => {
  store.dispatch(gotChallenge(user, false))
  history.push(`/challenges/${user.challenger.question}`)
})

socket.on('game status', status => {
  store.dispatch(changeStatus(status.challengeStatus,
    status.fightStatus,
    status.lose,
    status.win))
})

socket.on('newMessage', (message) => {
  store.dispatch(gotMessage(message))
})

export default socket
