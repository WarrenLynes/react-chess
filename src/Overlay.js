import React from 'react';


const overlayColor = ({ status }) => {
  if (status === 'illegalMove') {
    return '#ff0044';
  } else if (status === 'legalMove') {
    return '#00c4ff';
  } else if (status === 'possibleMove') {
    return '#4cbd43';
  }
}

export default function Overlay(status) {

  return (
    <div className="overlay"
      style={{
        position: 'absolute',
        left: '0',
        right: '0',
        top: '0',
        bottom: '0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <div className="bubble"
        style={{
          width: '25%',
          height: '25%',
          backgroundColor: overlayColor(status),
          borderRadius: '50%'
        }}
      />
    </div>
  )

}