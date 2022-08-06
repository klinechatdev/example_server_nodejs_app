const { AccessToken } = require('livekit-server-sdk');

const roomName = 'chitchat';
const participantName = 'AsiaChan';
const API_KEY = "API2QKS5SwAiVd2";
const SECRET_KEY = "A9trqawKvZTH6OQleTjEjUkWkBilst4UAbleAicsLRq";

const at = new AccessToken(API_KEY, SECRET_KEY, {
  identity: participantName,
});
at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });

const token = at.toJwt();
console.log('access token for', participantName,'  ', token); 