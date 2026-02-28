import React from 'react';
import ListingImage from '../ListingImage';
import { Listing } from '../../db/Types';
import { css } from '../../../styled-system/css';

interface Props {
  activeListing: Listing
}

const CondensedCard = ({activeListing}:Props) => {
  const {name, image, url, description} = activeListing;
  return (
    <div className={css({
      maxWidth: '14rem',
      backgroundColor: 'white',
      borderRadius: 'md',
      boxShadow: 'sm',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'box-shadow 0.2s',
      _hover: {
        boxShadow: 'md',
      }
    })}>
      {image && (
        <div className={css({
          maxHeight: '14rem',
          width: '100%',
          overflow: 'hidden',
        })}>
          <ListingImage image={image} name={name} url={url} />
        </div>
      )}
      <div className={css({ padding: '3' })}>
        <h3 className={css({
          fontSize: 'md',
          fontWeight: 'bold',
          marginBottom: '1',
          color: 'black',
        })}>
          {name}
        </h3>
        {description && (
          <p className={css({
            fontSize: 'xs',
            color: 'gray.600',
            lineHeight: 'tight',
          })}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
export default CondensedCard;
