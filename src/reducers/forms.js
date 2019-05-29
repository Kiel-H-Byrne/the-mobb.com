//Actions
import * as ACTIONS from "../actions/actionConstants";
import Schemas from "../firebase/schemas";
// eslint-disable-next-line
import uuidv4 from "uuid/v4";

// eslint-disable-next-line
const INITIAL_STATE_DEV = {
  eventId: uuidv4(),

  //Step 1:
  eventName: "Waffles' Great Adventure",
  eventDescription: "This is the event description for a sample private event",
  eventIsPrivate: true,

  //Step 2:
  locationName: "Waffles' Penthouse",
  locationId: uuidv4(),
  locationImageURL: "https://i.ytimg.com/vi/1igdGq8PtoE/hqdefault.jpg",
  locationState: "Washington",
  locationCity: "D.C.",
  locationStreet: "532 Fire Hydrant Ln.",
  locationZip: "20001",
  locationHideAddress: true,

  //Step 3:
  eventDate: new Date(),
  eventDateString: "",
  eventTimeEnd: new Date(),
  eventTimeEndString: "",
  eventTimeStart: new Date(),
  eventTimeStartString: "",

  //Step 4:
  ticketCategories: ["Chill", "Late Nite", "Food"],
  ticketPrice: "25",
  ticketCount: "50",
  user: {
    ...Schemas.User, ...{
      savedLocations: []
    }
  },
  venue: {...Schemas.Venue}
};

// eslint-disable-next-line
const INITIAL_STATE = {
  eventId: "",

  //Step 1:
  eventName: "",
  eventDescription: "",
  eventIsPrivate: false,

  //Step 2:
  locationName: "",
  locationId: "",
  locationImageURL: "",
  locationState: "",
  locationCity: "",
  locationStreet: "",
  locationZip: "",
  locationHideAddress: false,

  //Step 3:
  eventDate: null,
  eventDateString: "",
  eventTimeEnd: new Date(),
  eventTimeEndString: "",
  eventTimeStart: new Date(),
  eventTimeStartString: "",

  //Step 4:
  ticketCategories: [],
  ticketPrice: "",
  ticketCount: ""
};

function formsReducer(state = INITIAL_STATE_DEV, action) {
  switch (action.type) {
    //Generic Updates
    case ACTIONS.UPDATE_FORMS_ASPECT: {
      return { ...state, [`${action.aspect}`]: action.payload };
    }

    case ACTIONS.UPDATE_FORMS_REDUCER: {
      return { ...state, ...action.payload };
    }

    case ACTIONS.RESET_FORMS: {
      return { ...state, ...INITIAL_STATE };
    }

    default:
      return state;
  }
}

export default formsReducer;
