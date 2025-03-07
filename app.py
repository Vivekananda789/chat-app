from flask import Flask, render_template, request
from flask_socketio import SocketIO, send, join_room, leave_room
from datetime import datetime

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('join')
def handle_join(data):
    username = data['username']
    room = data['room']
    join_room(room)
    socketio.emit('message', {
        'msg': f"{username} has joined the chat!",
        'timestamp': datetime.now().strftime('%H:%M:%S'),
        'username': 'System'
    }, room=room)

@socketio.on('leave')
def handle_leave(data):
    username = data['username']
    room = data['room']
    leave_room(room)
    socketio.emit('message', {
        'msg': f"{username} has left the chat.",
        'timestamp': datetime.now().strftime('%H:%M:%S'),
        'username': 'System'
    }, room=room)

@socketio.on('message')
def handle_message(data):
    msg = data['msg']
    username = data['username']
    room = data['room']
    socketio.emit('message', {
        'msg': msg,
        'timestamp': datetime.now().strftime('%H:%M:%S'),
        'username': username
    }, room=room)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)
