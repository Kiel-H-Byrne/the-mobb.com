import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
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
