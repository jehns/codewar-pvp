module.exports = io => {
  io.on('connection', socket => {
    console.log(`A socket connection to the server has been made: ${socket.id}`)

    socket.on('disconnect', () => {
      // emit leave event for all friend rooms:
      if (socket.handshake.session.user) {
        const {name, friends} = socket.handshake.session.user
        friends.forEach(friend => {
          io.to(friend.name).emit('friendLeave', name)
          socket.leave(friend.name)
        })
      }
    })

    socket.on('challenge', user => {
      // friends to replace
      socket.join(user.challenger.name)

      // game room
      socket.join(user.name + user.challenger.name)
      socket.to(user.challenger.name).emit('challenge', user)
    })

    socket.on('acceptChallenge', user => {
      // socket.join(user.challenger.name)
      socket.join(user.challenger.name + user.name)
      socket.to(user.challenger.name + user.name).emit('gameStarted')
      socket.to(user.challenger.name + user.name).emit('readyToPlay', user)
    })

    socket.on('game status', status => {
      socket
        .to(status.user.challenger.name + status.user.name)
        .emit('game status', status.status)
      socket
        .to(status.user.name + status.user.challenger.name)
        .emit('game status', status.status)
    })

    socket.on('newMessage', message => {
      if (message.user && message.user.challenger) {
        socket
          .to(message.user.challenger.name + message.user.name)
          .emit('newMessage', message)
        socket
          .to(message.user.name + message.user.challenger.name)
          .emit('newMessage', message)
      }
    })

    socket.on('challengerCodeUpload', args => {
      const [user, newValue] = args
      if (user && user.challenger) {
        socket
          .to(user.challenger.name + user.name)
          .emit('challengerCodeDownload', newValue)
        socket
          .to(user.name + user.challenger.name)
          .emit('challengerCodeDownload', newValue)
      }
    })

    socket.on('login', function(user) {
      // friends to replace
      socket.join(user.name)

      //session info
      socket.handshake.session.user = user
      socket.handshake.session.save()
      const {name, friends} = socket.handshake.session.user
      // join user to logged in room and emit join event for all friend rooms:
      socket.join(name)
      friends.forEach(friend => {
        socket.join(friend.name)
        io.to(friend.name).emit('friendJoin', name)
      })
      // fetch all friends in user's room
      io.in(name).clients((error, clientIds) => {
        if (error) throw error
        const names = new Set()
        clientIds.forEach(clientId => {
          const friendName =
            io.sockets.connected[clientId].handshake.session.user.name
          if (friendName !== name) names.add(friendName)
        })
        socket.emit('gotAllFriends', Array.from(names))
      })
    })

    socket.on('challenge', user => {
      socket.broadcast.emit('challenge', user)
    })

    socket.on('logout', function() {
      if (socket.handshake.session.user) {
        const {name, friends} = socket.handshake.session.user
        friends.forEach(friend => {
          io.to(friend.name).emit('friendLeave', name)
          socket.leave(friend.name)
        })
      }
    })
  })
}
