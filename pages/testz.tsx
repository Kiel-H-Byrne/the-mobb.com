import { Container, Typography, Form } from '@material-ui/core'
import * as React from 'react'

const testz = () => {
  return (
    <Container>
      <Typography variant={"h2"}> Forms tests</Typography>
      <div>
        <Form id="search-mobb"></Form>
        <Form id="create-listing"></Form>
        <Form id="update-listing"></Form>
        <Form id="delete-listing"></Form>
        <Form id=""></Form>
      </div>
    </Container>
  );
}

export default testz
