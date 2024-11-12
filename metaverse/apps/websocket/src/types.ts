export interface JoinMessage {
  type: "join";
  payload: {
    spaceId: string;
    token: string;
  };
}

export interface Movement {
    "type": "move",
    "payload": {
	    "x": Number,
	    "y": Number
    }
}

export interface SpaceJoined {
    type: "space-joined";
    payload: {
        spawn: {
            x: number;
            y: number;
        };
        users: Array<{
            userId: string;
            position: {
                x: number;
                y: number;
            }
        }>;
    }
}

export interface MovementRejected {
    "type": "movement-rejected",
   "payload": {
	   x: Number,
	   y: Number
   }
}

// export interface Movement {
//     "type": "movement",
// 	"payload": {
// 	  "x": Number,
// 	  "y": Number,
// 	  "userId": string
//     }
// }

export interface Leave {
    "type": "user-left",
	"payload": {
		"userId": Number
	}
}


export interface JoinEvent {
    "type": "user-join",
	"payload": {
		"userId": Number,
		"x": Number,
		"y": Number
	}
}