import React, { Component } from 'react';

class App extends Component {
  render() {
    const containerStyle = {
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    };

    return (
      <div style={containerStyle}>
        <h1>Microservices Platform</h1>
        <p>Welcome to the Microservices Dashboard!</p>
      </div>
    );
  }
}

export default App;
