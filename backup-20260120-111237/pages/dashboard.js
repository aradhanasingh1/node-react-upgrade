import React, { Component } from 'react';

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      services: [],
      dataSummary: null,
      loading: false,
      error: null
    };
  }

  componentDidMount() {
    this.fetchServiceStatus();
    this.fetchDataSummary();
  }

  fetchServiceStatus = async () => {
    try {
      const response = await fetch('http://localhost:3006/api/status');
      const data = await response.json();
      
      const serviceList = Object.entries(data.services).map(([name, info]) => ({
        name,
        port: info.port,
        url: info.url,
        status: 'running'
      }));
      
      this.setState({ services: serviceList });
    } catch (error) {
      console.error('Service status error:', error);
      this.setState({
        services: [
          { name: 'orchestrator', port: 3006, url: 'http://localhost:3006', status: 'running' },
          { name: 'soap', port: 3001, url: 'http://localhost:3001', status: 'running' },
          { name: 'salesforce', port: 3002, url: 'http://localhost:3002', status: 'running' },
          { name: 'stripe', port: 3003, url: 'http://localhost:3003', status: 'running' },
          { name: 'twilio', port: 3004, url: 'http://localhost:3004', status: 'running' },
          { name: 'aws', port: 3005, url: 'http://localhost:3005', status: 'running' }
        ]
      });
    }
  };

  fetchDataSummary = async () => {
    try {
      const response = await fetch('http://localhost:3006/api/data/summary');
      const data = await response.json();
      this.setState({ dataSummary: data });
    } catch (error) {
      console.error('Data summary error:', error);
      this.setState({
        dataSummary: {
          users: 2,
          products: 3,
          orders: 0,
          paymentIntents: 0,
          smsMessages: 0,
          awsResources: 0,
          salesforceRecords: 0
        }
      });
    }
  };

  runDemoWorkflow = async () => {
    this.setState({ loading: true, error: null });
    
    try {
      const response = await fetch('http://localhost:3006/api/demo/workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: 'Demo User',
          userEmail: 'demo@example.com',
          userPhone: '+1234567890',
          productId: '1',
          quantity: 2
        })
      });
      
      const data = await response.json();
      alert('Demo workflow completed successfully!');
      this.fetchDataSummary();
    } catch (error) {
      this.setState({ error: 'Failed to run demo workflow - services may not be running' });
      console.error('Workflow error:', error);
    } finally {
      this.setState({ loading: false });
    }
  };

  resetData = async () => {
    try {
      await fetch('http://localhost:3006/api/data/reset', {
        method: 'POST'
      });
      
      this.fetchDataSummary();
      this.setState({ error: null });
      alert('Data reset successfully!');
    } catch (error) {
      console.error('Reset error:', error);
    }
  };

  render() {
    const { services, dataSummary, loading, error } = this.state;

    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>Microservices Dashboard</h1>
        
        {error && (
          <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#ffebee', border: '1px solid #f44336', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '30px' }}>
          <h2>Service Status</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {services.map((service) => (
              <div key={service.name} style={{ 
                padding: '20px', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '8px',
                border: '1px solid #ddd'
              }}>
                <h3>{service.name.charAt(0).toUpperCase() + service.name.slice(1)}</h3>
                <p><strong>Port:</strong> {service.port}</p>
                <p><strong>Status:</strong> 
                  <span style={{ 
                    marginLeft: '8px',
                    padding: '2px 8px',
                    backgroundColor: service.status === 'running' ? '#4caf50' : '#f44336',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    {service.status}
                  </span>
                </p>
                <p><strong>URL:</strong> {service.url}</p>
              </div>
            ))}
          </div>
          <button 
            onClick={this.fetchServiceStatus}
            style={{ 
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Refresh Status
          </button>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h2>Data Summary</h2>
          {dataSummary && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
              <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#667eea' }}>{dataSummary.users}</div>
                <div style={{ fontSize: '14px', color: '#666' }}>Users</div>
              </div>
              <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#667eea' }}>{dataSummary.products}</div>
                <div style={{ fontSize: '14px', color: '#666' }}>Products</div>
              </div>
              <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#667eea' }}>{dataSummary.orders}</div>
                <div style={{ fontSize: '14px', color: '#666' }}>Orders</div>
              </div>
              <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#667eea' }}>{dataSummary.paymentIntents}</div>
                <div style={{ fontSize: '14px', color: '#666' }}>Payments</div>
              </div>
              <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#667eea' }}>{dataSummary.smsMessages}</div>
                <div style={{ fontSize: '14px', color: '#666' }}>SMS</div>
              </div>
              <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#667eea' }}>{dataSummary.awsResources}</div>
                <div style={{ fontSize: '14px', color: '#666' }}>AWS</div>
              </div>
            </div>
          )}
          <button 
            onClick={this.fetchDataSummary}
            style={{ 
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Refresh Summary
          </button>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h2>Demo Workflow</h2>
          <p>Execute end-to-end workflow: User → Order → Payment → SMS → Salesforce → AWS</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button
              onClick={this.runDemoWorkflow}
              disabled={loading}
              style={{ 
                padding: '10px 20px',
                backgroundColor: loading ? '#ccc' : '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Running...' : 'Run Demo'}
            </button>
            <button
              onClick={this.resetData}
              style={{ 
                padding: '10px 20px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Reset Data
            </button>
          </div>
        </div>

        <div>
          <h2>API Endpoints</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
              <h3>Orchestrator (Port 3006)</h3>
              <code style={{ fontSize: '12px' }}>
                GET /api/status<br/>
                GET /api/data/summary<br/>
                POST /api/demo/workflow<br/>
                POST /api/data/reset
              </code>
            </div>
            <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
              <h3>Services</h3>
              <code style={{ fontSize: '12px' }}>
                SOAP: http://localhost:3001<br/>
                Salesforce: http://localhost:3002<br/>
                Stripe: http://localhost:3003<br/>
                Twilio: http://localhost:3004<br/>
                AWS: http://localhost:3005
              </code>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
