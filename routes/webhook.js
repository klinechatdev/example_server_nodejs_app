var express = require('express');
var router = express.Router();
var path = require('path');
var { AccessToken, RoomServiceClient, Room, WebhookReceiver } = require('livekit-server-sdk');

const receiver = new WebhookReceiver("apikey", "apisecret");
    
/**
 * webhook endpoint
 */
router.post('/room_events', (req, res) => {

    // event is a WebhookEvent object
    const event = receiver.receive(req.body, req.get('Authorization'));

// the following events are triggered

// Room Started
// interface WebhookEvent {
//   event: 'room_started'
//   room: Room
// }

// Room Finished
// interface WebhookEvent {
//   event: 'room_finished'
//   room: Room
// }

// Participant Joined
// interface WebhookEvent {
//   event: 'participant_joined'
//   room: Room
//   participant: ParticipantInfo
// }

// Participant Left
// interface WebhookEvent {
//   event: 'participant_left'
//   room: Room
//   participant: ParticipantInfo
// }

//Track Published

// interface WebhookEvent {
//   event: 'track_published'
//   room: Room
//   participant: ParticipantInfo
//   track: TrackInfo
// }


//Track Unpublished

// interface WebhookEvent {
//   event: 'track_unpublished'
//   room: Room
//   participant: ParticipantInfo
//   track: TrackInfo
// }

  return res.status(200).json({message:"Successfully received!"});
});
