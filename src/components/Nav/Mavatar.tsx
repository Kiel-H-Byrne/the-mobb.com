import React from 'react'
import { Avatar } from '@material-ui/core'
import {useAuth0} from "@auth0/auth0-react"
interface Props {
  
}

const Mavatar = (props: Props) => {
  const { loginWithRedirect, isAuthenticated, user, logout, error  } = useAuth0();
  if (error)  console.error(error);
  return (
    <div>
      {
        /* {if logged in, profile foto else avatar } */
        isAuthenticated ? (
          <Avatar
            src={`https://robohash.org/plase${user.name}`}
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
