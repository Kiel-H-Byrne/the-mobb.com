import React from 'react'
import { Avatar } from '@material-ui/core'
import {useAuth0} from "@auth0/auth0-react"
interface Props {
  
}

const Mavatar = (props: Props) => {
  const { loginWithRedirect, isAuthenticated, user, logout, error, isLoading  } = useAuth0();
  if (error) {
    console.error(error);
  }
  if (isLoading) {
    console.log("laoding");
  }
  if (isAuthenticated) {
    console.log(user);
  }
  return (
    <div>
      {
        /* {if logged in, profile foto else avatar } */
        !isLoading && isAuthenticated ? (
          <Avatar
            src={user.picture}
            alt={user.name}
          />
        ) : (
          <Avatar
            alt={"LOGIN"}
            onClick={() => loginWithRedirect()}
          />
        )
      }
    </div>
  );
}

export default Mavatar
