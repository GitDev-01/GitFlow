
import { InfoIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

const size = 22

export function InfoSpinner({handleOpenDialog}: {handleOpenDialog: ()=>void}) {
    const [isSpinOn, setSpin] = useState(false)

    useEffect(()=>{
        if (!(localStorage.getItem("hasVisited") === "true")){
            localStorage.setItem("hasVisited", "true")
            setSpin(true)
        }
    }, [])
    
  return (
    <StyledWrapper onClick={()=>{setSpin(false);handleOpenDialog()}}>
        <InfoIcon size={size} className="absolute" style={{top: "0%", left:"0%"}}  />
        <div className={`${(isSpinOn)?"spinner": ""}`} />
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .spinner {
    width: ${size - 0.5}px;
    height: ${size - 0.5}px;
    animation: spinning82341 1.7s linear infinite;
    text-align: center;
    border-radius: 50px;
    filter: blur(1px);
    box-shadow: 0px -2px 5px 0px rgb(186, 66, 255), 0px 2px 5px 0px rgb(0, 225, 255);
  }

  .spinner1 {
    background-color: rgb(36, 36, 36);
    width: 100px;
    height: 100px;
    border-radius: 50px;
    filter: blur(10px);
  }

  @keyframes spinning82341 {
    to {
      transform: rotate(360deg);
    }
  }`;

export default InfoSpinner;
