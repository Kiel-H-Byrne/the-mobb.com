import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import ListingImage from '../ListingImage';

interface Props {
  activeListing: any
}
const useStyles = makeStyles({
  root: {
    maxWidth: 245,
  },
});

const CondensedCard = ({activeListing}:Props) => {
  const classes = useStyles();
  const {name, image, url, description} = activeListing;
  return (
    <Card className={classes.root}>
      <CardActionArea>
        <ListingImage image={image} name={name} url={url}/>
        <CardContent>
          <Typography gutterBottom variant="h6" component="h3">
            {name}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
export default CondensedCard
