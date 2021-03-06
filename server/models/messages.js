const   db = require('./db'),
        UserMod = require('./user');

function get_room_messages(req, res) {
    const roomId = req.params.roomId;
    const query = {
        text: `SELECT user_from_id, user_for_id, content, room_id, date, read FROM messages WHERE room_id = $1 ORDER BY id ASC`,
        values: [roomId]
    }
    return db.get_database(query).then((result) => {
        return res.json(result)
    })
}

function count_unread_room_messages(req, res) {
    const { userId } = res.locals.user;
    const query = {
        text: `SELECT room_id, read as count FROM notifications_messages WHERE read != 0 AND user_id = $1 `,       
        values: [userId]
    }
    return db.get_database(query).then((result) => {
        return res.json(result)
    })
}

function send_message(req, res) {
    const { room_id, user_from_id, user_for_id, content } = req.body;

    const query1 = [{
        text: `UPDATE notifications_messages SET last_msg = $1, date = $2, read = read+1  WHERE user_id = $3 AND user_from_id = $4`,
        values: [content, Date.now(),  user_for_id, user_from_id]
    },{
        text: `UPDATE notifications_messages SET last_msg = $1, date = $2  WHERE user_id = $3 AND user_from_id = $4`,
        values: [content, Date.now(), user_from_id, user_for_id]
    }]
    for (var i = 0; i < query1.length; i++){
        db.set_database(query1[i])
    }

    const query = {
        text: `INSERT INTO messages (user_from_id, user_for_id, content, room_id, date) VALUES ($1, $2, $3, $4, $5)
        RETURNING user_from_id, user_for_id, content, room_id, date`,
        values: [user_from_id, user_for_id, content, room_id, Date.now()]
    }

    let promise1 = Promise.resolve(db.get_database(query))
    let promise2 = Promise.resolve(UserMod.user_select('id', user_from_id))
    return Promise.all([promise1, promise2])
    .then((result) => {
            let final = result[0].concat(result[1])
            return res.json([Object.assign(final[0], final[1])])
        })
}

function set_message_to_read(req, res) {
    const { roomId } = req.params;
    const { readerUserId } = req.body;
    const query = [{
        text: `UPDATE messages SET read = 1 WHERE read = 0 AND user_for_id = $1 AND room_id = $2`,
        values: [readerUserId, roomId]
    },{
        text: `UPDATE notifications_messages SET read = 0 WHERE user_id = $1 AND room_id = $2`,
        values: [readerUserId, roomId]
    }]
    for (var i = 0; i < query.length; i++){
        db.set_database(query[i])
    }

    return res.status(200).send({ success: [{ title: 'Read', detail: 'Message read' }] });

}

function delete_all_messages_match(user1, user2) {
    const query = [{
        text: `DELETE from messages WHERE (user_from_id = $1 AND user_for_id = $2) OR (user_from_id = $2 AND user_for_id = $1)`,
        values: [user1, user2]
    },{
        text: `DELETE from notifications_messages WHERE (user_from_id = $1 AND user_id = $2) OR (user_from_id = $2 AND user_id = $1)`,
        values: [user1, user2]
    }]
    for (var i = 0; i < query.length; i++){
        db.set_database(query[i])
    }
}

function get_all_conversations(req, res) {
    const { userId } = res.locals.user;

    const query = {
        text: ` SELECT user_from_id, room_id as match_id, read, notifications_messages.date, last_msg, profile_img, username, connexion, online
                FROM notifications_messages 
                JOIN profiles ON profiles.user_id = notifications_messages.user_from_id
                JOIN users ON users.id = notifications_messages.user_from_id
                WHERE notifications_messages.user_id = $1
                ORDER by notifications_messages.date DESC`,
        values:[userId]
    }
    return db.get_database(query)
        .then((result) => res.json(result))
}
module.exports = {
    get_room_messages,
    send_message,
    delete_all_messages_match,
    count_unread_room_messages,
    get_all_conversations,
    set_message_to_read
}