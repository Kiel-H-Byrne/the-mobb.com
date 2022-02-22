import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import ListingImage from '../ListingImage';
import { Listing } from '../../db/Types';

interface Props {
  activeListing: Listing
}
const useStyles = makeStyles({
  root: {
    maxWidth: '14rem',
  },
  image: {
    maxHeight: '14rem',
    maxWidth: '3rem',
  }
});

const CondensedCard = ({activeListing}:Props) => {
  const classes = useStyles();
  const {name, image, url, description} = activeListing;
  return (
    <Card className={classes.root}>
      <CardActionArea>
        {image && (
          <div className={classes.image}>
            <ListingImage image={image} name={name} url={url} />
          </div>
        )}
        <CardContent>
          <Typography gutterBottom variant="h6" component="h3">
            {name}
          </Typography>
          {description && (
            <Typography variant="body2" color="textSecondary" component="p">
              {description}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
export default CondensedCard
