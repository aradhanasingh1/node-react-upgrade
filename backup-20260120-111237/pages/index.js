import React, { Component } from 'react';
import {
  Button,
  Paper,
  Grid,
  Typography
} from '@material-ui/core';

class Home extends Component {
  render() {
    return (
      <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <Typography variant="headline" style={{ fontSize: '48px', marginBottom: '20px' }}>
            Microservices Platform
          </Typography>
          <Typography variant="body1" style={{ color: '#666', marginBottom: '40px' }}>
            Complete integration of SOAP, Salesforce, Stripe, Twilio, and AWS services
          </Typography>
          <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
            <h3>Quick Links:</h3>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button 
                variant="contained"
                style={{ 
                  fontSize: '18px', 
                  padding: '16px 32px', 
                  marginRight: '10px',
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  color: 'white',
                  fontWeight: 'bold'
                }}
                onClick={() => window.location.href = '/dashboard'}
              >
                Launch Dashboard
              </Button>
              <Button 
                variant="outlined"
                style={{ 
                  fontSize: '18px', 
                  padding: '16px 32px',
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  color: 'white',
                  fontWeight: 'bold'
                }}
                onClick={() => window.location.href = '/ui-components'}
              >
                UI Components
              </Button>
              <Button 
                variant="outlined"
                style={{ 
                  fontSize: '18px', 
                  padding: '16px 32px',
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  color: 'white',
                  fontWeight: 'bold'
                }}
                onClick={() => window.location.href = '/enhanced'}
              >
                Enhanced UI
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
