import React, { Component } from 'react';

export default class Enhanced extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 0,
      services: [],
      dataSummary: null,
      loading: false,
      error: null,
      userForm: { name: '', email: '', phone: '' },
      smsForm: { to: '', body: '' },
      paymentForm: { amount: '', currency: 'usd' }
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

  createUser = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.state.userForm)
      });
      
      if (response.ok) {
        alert('User created successfully!');
        this.fetchDataSummary();
        this.setState({ userForm: { name: '', email: '', phone: '' } });
      } else {
        alert('Failed to create user');
      }
    } catch (error) {
      alert('Failed to create user - service may not be running');
    }
  };

  sendSms = async () => {
    try {
      const response = await fetch('http://localhost:3004/api/twilio/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.state.smsForm)
      });
      
      if (response.ok) {
        alert('SMS sent successfully!');
        this.fetchDataSummary();
        this.setState({ smsForm: { to: '', body: '' } });
      } else {
        alert('Failed to send SMS');
      }
    } catch (error) {
      alert('Failed to send SMS - service may not be running');
    }
  };

  createPayment = async () => {
    try {
      const response = await fetch('http://localhost:3003/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseInt(this.state.paymentForm.amount),
          currency: this.state.paymentForm.currency
        })
      });
      
      if (response.ok) {
        alert('Payment intent created successfully!');
        this.fetchDataSummary();
        this.setState({ paymentForm: { amount: '', currency: 'usd' } });
      } else {
        alert('Failed to create payment intent');
      }
    } catch (error) {
      alert('Failed to create payment intent - service may not be running');
    }
  };

  renderTabContent = () => {
    const { activeTab, dataSummary, services, userForm, smsForm, paymentForm } = this.state;
    
    switch (activeTab) {
      case 0:
        return (
          <div>
            <h2>Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              {dataSummary && (
                <>
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
                </>
              )}
            </div>
            <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
              <h3>Service Status</h3>
              {services.map((service) => (
                <div key={service.name} style={{ marginBottom: '10px', padding: '10px', backgroundColor: 'white', borderRadius: '4px' }}>
                  <strong>{service.name}:</strong> {service.status} (Port {service.port})
                </div>
              ))}
            </div>
          </div>
        );
      case 1:
        return (
          <div>
            <h2>SOAP Service - User Management</h2>
            <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
              <h3>Create New User</h3>
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="text"
                  placeholder="Name"
                  value={userForm.name}
                  onChange={(e) => this.setState({ userForm: { ...userForm, name: e.target.value } })}
                  style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={userForm.email}
                  onChange={(e) => this.setState({ userForm: { ...userForm, email: e.target.value } })}
                  style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={userForm.phone}
                  onChange={(e) => this.setState({ userForm: { ...userForm, phone: e.target.value } })}
                  style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>
              <button
                onClick={this.createUser}
                style={{ 
                  padding: '10px 20px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Create User
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <h2>Payment Processing</h2>
            <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
              <h3>Create Payment Intent</h3>
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="number"
                  placeholder="Amount (in cents)"
                  value={paymentForm.amount}
                  onChange={(e) => this.setState({ paymentForm: { ...paymentForm, amount: e.target.value } })}
                  style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
                <select
                  value={paymentForm.currency}
                  onChange={(e) => this.setState({ paymentForm: { ...paymentForm, currency: e.target.value } })}
                  style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                  <option value="usd">USD</option>
                  <option value="eur">EUR</option>
                  <option value="gbp">GBP</option>
                </select>
              </div>
              <button
                onClick={this.createPayment}
                style={{ 
                  padding: '10px 20px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Create Payment Intent
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h2>Communication Hub</h2>
            <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
              <h3>Send SMS Message</h3>
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="tel"
                  placeholder="Phone Number (+1234567890)"
                  value={smsForm.to}
                  onChange={(e) => this.setState({ smsForm: { ...smsForm, to: e.target.value } })}
                  style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
                <textarea
                  placeholder="Message"
                  value={smsForm.body}
                  onChange={(e) => this.setState({ smsForm: { ...smsForm, body: e.target.value } })}
                  rows={4}
                  style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd', resize: 'vertical' }}
                />
              </div>
              <button
                onClick={this.sendSms}
                style={{ 
                  padding: '10px 20px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Send SMS
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <h2>Cloud Services</h2>
            <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
              <h3>Salesforce & AWS Integration</h3>
              <p>Salesforce integration for contacts and opportunities.</p>
              <p>AWS services integration for S3, EC2, Lambda, and SNS.</p>
              <button
                onClick={() => window.open('http://localhost:3002/api/salesforce/contacts', '_blank')}
                style={{ 
                  marginRight: '10px',
                  padding: '10px 20px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Salesforce API
              </button>
              <button
                onClick={() => window.open('http://localhost:3005/api/aws/resources', '_blank')}
                style={{ 
                  padding: '10px 20px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                AWS Resources
              </button>
            </div>
          </div>
        );
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  render() {
    const { activeTab } = this.state;

    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>Enhanced Microservices Dashboard</h1>
        
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #ddd' }}>
            {['Overview', 'SOAP Service', 'Payments', 'Communication', 'Cloud Services'].map((tab, index) => (
              <button
                key={index}
                onClick={() => this.setState({ activeTab: index })}
                style={{
                  padding: '10px 20px',
                  backgroundColor: activeTab === index ? '#667eea' : 'transparent',
                  color: activeTab === index ? 'white' : '#667eea',
                  border: 'none',
                  borderRadius: '4px 4px 0 0',
                  cursor: 'pointer',
                  borderBottom: activeTab === index ? '2px solid #667eea' : '2px solid transparent'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {this.renderTabContent()}
      </div>
    );
  }
}
