Schema = {};


//========================================================================================================================================
//========================================================================================================================================
//========================================================================================================================================
//========================================================================================================================================
//==============================================  DON'T TOUCH ME!!!!!!!!! ==============================================
//========================================================================================================================================
//========================================================================================================================================
//========================================================================================================================================
//========================================================================================================================================
Schema.User = new SimpleSchema({
    username: {
        type: string,
        // For accounts-password, either emails or username is required, but not both. It is OK to make this
        // optional here because the accounts-password package does its own validation.
        // Third-party login packages may not require either. Adjust this schema as necessary for your usage.
        optional: true
    },
    emails: {
        type: Array,
        // For accounts-password, either emails or username is required, but not both. It is OK to make this
        // optional here because the accounts-password package does its own validation.
        // Third-party login packages may not require either. Adjust this schema as necessary for your usage.
        optional: true
    },
    "emails.$": {
        type: Object
    },
    "emails.$.address": {
        type: string,
        regEx: SimpleSchema.RegEx.Email
    },
    "emails.$.verified": {
        type: Boolean
    },
    // Use this registered_emails field if you are using splendido:meteor-accounts-emails-field / splendido:meteor-accounts-meld
    registered_emails: {
        type: Array,
        optional: true
    },
    'registered_emails.$': {
        type: Object,
        blackbox: true
    },
    createdAt: {
        type: Date
    },
    profile: {
        type: Schema.Profile,
        optional: true
    },
    // Make sure this services field is in your schema if you're using any of the accounts packages
    services: {
        type: Object,
        optional: true,
        blackbox: true
    },
    // Add `roles` to your schema if you use the meteor-roles package.
    // Option 1: Object type
    // If you specify that type as Object, you must also specify the
    // `Roles.GLOBAL_GROUP` group whenever you add a user to a role.
    // Example:
    // Roles.addUsersToRoles(userId, ["admin"], Roles.GLOBAL_GROUP);
    // You can't mix and match adding with and without a group since
    // you will fail validation in some cases.
    // roles: {
    //     type: Object,
    //     optional: true,
    //     blackbox: true
    // },
    // Option 2: [String] type
    // If you are sure you will never need to use role groups, then
    // you can specify [String] as the type
    roles: {
        type: Array,
        optional: true
    },
    'roles.$': {
        type: string
    },
    // In order to avoid an 'Exception in setInterval callback' from Meteor
    heartbeat: {
        type: Date,
        optional: true
    }
});
//========================================================================================================================================
//========================================================================================================================================
//========================================================================================================================================
//========================================================================================================================================

Schema.Profile = new SimpleSchema({
  firstName: {
      type: string,
      label: 'First Name',
      optional: true
  },
  lastName: {
      type: string,
      label: 'Last Name',
      optional: true
  },
  email: {
    type: string,
    regEx: SimpleSchema.RegEx.Email,
    optional: true
  },
  social: {
    type: Object,
    optional: true,
    label: 'Social Media'
  },
  'social.facebook': {
    type: string,
    optional: true,
    label: 'Facebook Handle'
  },
  'social.instagram': {
    type: string,
    optional: true,
    label: 'Instagram Handle'
  },
  'social.twitter': {
    type: string,
    optional: true,
    label: 'Twitter Handle'
  },
  ownedListings: {
    type: [String],
    optional: true
  },
  verifiedListings: {
    type: [String],
    optional: true
  },
  deverifiedListings: {
    type: [String],
    optional: true
  },
  favorites: {
    type: [String],
    optional: true
  }
});

Schema.Owner = new SimpleSchema({
  "owner.id": {
    type: string,
    optional: true,
    autoValue: function() {
      if (Meteor.userId()) {
        return Meteor.userId();
      }
    }
  },
  "owner.name": {
    type: string,
    label: "Owner's Name",
    optional: true
  },
  "owner.phone": {
    type: string,
    label: "Owner's Phone",
    optional: true
  },
  "owner.email": {
    type: string,
    label: "Owner's E-mail",
    optional: true
  }
});

Schema.Verifier = new SimpleSchema({
  "verifier.id": {
    type: string,
    optional: true,
    autoValue: function() {
      if (Meteor.userId()) {
        return Meteor.userId();
      }
    }
  },
  "verifier.name": {
    type: string,
    optional: true
  },
  "verifier.date": {
    type: Date,
    optional: true,
    autoValue: function() {
      return new Date();
    }
  }
});

Schema.Social = new SimpleSchema({
  facebook: {
    type: string,
    optional: true,
    label: 'Facebook Handle'
  },
    instagram: {
    type: string,
    optional: true,
    label: 'Instagram Handle'
  },
    twitter: {
    type: string,
    optional: true,
    label: 'Twitter Handle'
  }
});

Schema.Listings = new SimpleSchema({

  // We use `label` to put a custom label for this form field
  // Otherwise it would default to `Title`
  // 'optional: false' means that this field is required
  // If it's blank, the form won't submit and you'll get a red error message
  // 'type' is where you can set the expected data type for the 'title' key's value
  name: {
    type: string
  },
  address: {
    type: string,
    // unique: true,
    optional: true,
    custom: function() {
      //if street has no value and isSet(), and this has no value, throw error 
      const hasStreet = this.field('street').isSet ;
      if (!hasStreet) {
        // inserts
        if (!this.operator) {
          if (!this.isSet || this.value === null || this.value === "") return "required";
        }

        // updates
        else if (this.isSet) {
          if (this.operator === "$set" && this.value === null || this.value === "") return "required";
          if (this.operator === "$unset") return "required";
          if (this.operator === "$rename") return "required";
        }
      } else {
        let addressString =  `${this.field('street').value} ${this.field('city').value}, ${this.field('state').value} ${this.field('zip').value}`;
        
        // let el = $('input[name="address")')[0];
        this.value = addressString;
        return {$set: addressString};
      }
      return;
    },
    autoValue: function() {
      if ( (this.isInsert || this.isUpdate) && this.field('street').isSet) {
        let addressString =  `${this.field('street').value} ${this.field('city').value}, ${this.field('state').value} ${this.field('zip').value}`;
        return addressString;
      }
    }
  },
  street: {
    type: string,
    max: 80,
    optional: true,
    // unique: true,
    custom: function() {
      //if street has no value and isSet(), and this has no value, throw error 
      let hasAddress = this.field('address').value;
      // console.log(this.field('address'));

      if (!hasAddress) {
        // inserts
        if (!this.operator) {
          if (!this.isSet || this.value === null || this.value === "") return "required";
        }

        // updates
        else if (this.isSet) {
          if (this.operator === "$set" && this.value === null || this.value === "") return "required";
          if (this.operator === "$unset") return "required";
          if (this.operator === "$rename") return "required";
        }
      }
    }
  },
  city: {
    type: string,
    optional: true,
    max: 50
  },
  state: {
    type: string,
    allowedValues: ["AL","AK","AZ","AR","CA","CO","CT","DC","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"],
    autoform: {
      afQuickField: {
        firstOption: "--"
      }
    },
    optional: true
  },
  zip: {
    type: string,
    regEx: SimpleSchema.RegEx.ZipCode,
    optional: true
  },
  country: {
    type: string,
    min: 2,
    max: 3,
    optional: true,
    defaultValue: 'US'
  },
  phone: {
    type: string,
    label: 'Phone Number',
    optional: true,
  },
  url: {
    type: string,
    label: 'Website',
    regEx: SimpleSchema.RegEx.Url,
    optional: true,
    // autoValue: function () {
    //   //if string starts with "http//" or https://", Ok, else prepend with "http://"
    //   let url = this.value;
    //   if (url && (url.includes("http://") || url.includes("https://"))) {
    //     return url;
    //   } else {
    //     url = "http://" + url;
    //     return url;
    //   };
    // }
  },
  //IMPLICIT ARRAY (Claims should be new collection)
  "claims.$.ownerId": {
    type: string,
    optional: true
  },
  "claims.$.ownerName": {
    type: string,
    label: 'Name',
    optional: true
  },
  "claims.$.ownerPhone": {
    type: string,
    label: 'Phone Number',
    optional: true
  },
  "claims.$.ownerProof": orion.attribute('file', {
    label: 'Upload any Proof of Ownership with Address. (i.e. C/O, Utility Bill, etc.)',
    optional: true
  }),  
  claimsCount: {
    type: Number,
    optional: true,
    autoValue: function() {
      if (this.field("claims").value) {
        return this.field("claims").value.length;
      }
    }
  },
  location: {
    type: string,
    optional: true,
    autoValue: function () {
      if (this.field("address").value || this.field("street").value) {
        let address = this.field("address").value;
        let street = this.field("street").value;
        // let name = this.field("name").value;
        let addressString;
        if (address) {
          addressString = address;
        } else if (street) {
          
          // console.log(this.docId);
          // console.log(this);
          // params.place_id = this.field("google_id").value;

          let city = this.field("city").value;
          let zip = this.field("zip").value;
          let state = this.field("state").value ;
          addressString = `${street} ${city} ${state}, ${zip}`;
        } 
        // console.log(addressString);
        const response = Meteor.call('geoCode', addressString);

        if (response && response.results.length) {
          // console.log(response.results[0].address_components);
          const loc = response.results[0].geometry.location;
          // console.log("GOOGLE TYPES:") ;
          // console.log(response.results[0].types);
          // this.field("google_id").value = place_id;

          //====== RETURN LAT/LONG OBJECT LITERAL ======
          // return loc;
          //====== RETURN STRINGIFIED LAT/LONG NUMBERS ======
          const arr =  _.values(loc);
          // console.log(arr.toLocaleString());
          const locationString = arr.toLocaleString();
          // console.log(name, locationString);
          //NOW THAT I HAVE LOCATION, DO A GOOGLE PLACES SEARCH TO DETERMINE PLACES_ID
          // Meteor.call('placesSearch', name, locationString);

          return locationString;
        } 
      }
    }
  },
  //Verifiers should be another collection? Verifiers (userid, listingId,  )
  verifiers: {
    type: [String],
    optional: true
  },
  verifierCount: {
    type: Number,
    optional: true,
    autoValue: function() {
      if (this.field("verifiers").length > 0) {
        return this.field("verifiers").length;
      }
    }
  },
  deverifiers: {
    type: [String],
    optional: true
  },
  deverifierCount: {
    type: Number,
    optional: true,
    autoValue: function() {
      if (this.field("deverifiers").length > 0) {
        return this.field("deverifiers").length;
      }
    }
  },  
  description: {
    type: string,
    label: 'Description',
    optional: true,
    max: 2000,
    autoform: {
      afFieldInput: {
        type: "textarea",
        rows: 7
      }
    }, 
    autoValue: function() {
      if (this.value && this.value.length > 2000) {
        return this.value.substring(0,2000);
      }
    }
  },
  image: orion.attribute('file', {
    label: 'Upload an Image',
    optional: true
  }),
  google_id: {
    label: 'Google ID',
    type: string,
    optional: true,
    autoValue: function () {
      if (this.field("location").value) {
        let location = this.field("location").value;
        let name = this.field("name").value;
        let response = Meteor.call('placesSearch', name, location);  
        if (response) {
          return response;
        }
      }
    }
  },
  // places_details: {
  //   type: Object,
  //   optional: true
  // },
  yelp_id: {
    label: 'Yelp ID',
    type: string,
    optional: true,
    // autoValue: function () {
      
    // }
  },
  email: {
    type: string,
    label: 'E-Mail',
    optional: true
  },
  categories: {
    type: [String],
    label: 'Categories',
    optional: true,
    // autoform: {
      // options: function () {
      //   return Categories.find().map(function(c) {
      //     return {label: c.name, value: c.name};
      //   });
      // },
    //   afFieldInput: {
    //     type: "select-checkbox",
    //     class: "category-option"
    //   }
    // }
  },
  social: {
    type: Schema.Social,
    optional: true,
    label: 'Social Media'
  },
  creator: orion.attribute('createdBy'),
  submitted: orion.attribute('createdAt'),
});

