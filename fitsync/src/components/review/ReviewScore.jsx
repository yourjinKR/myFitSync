import React from 'react';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import styled from 'styled-components';

const StarScore = styled.div`
  svg {
    width: 20px;
    height: 20px;
  }
  path {
    color: gold;
  }
`;

const ReviewScore = ({score}) => {

  return (
    <StarScore>
      {
        Array.from({ length: 5 }, (_, i) => {
          if((i + 1) <= score){
            return <StarIcon key={i} fontSize='large'/>;
          }else if((i + 1) - score === 0.5){
            return <StarHalfIcon key={i} fontSize='large'/>;
          }else{
            return <StarBorderIcon key={i} fontSize='large'/>;
          }
        })
      }
    </StarScore>
  );
};

export default ReviewScore;