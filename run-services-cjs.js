import { spawn } from 'child_process';
const path = require('path');

console.log('🚀 Starting Microservices...\n');

// Start the orchestrator directly with ts-node
async function startServices() {
  try {
    console.log('🔧 Starting orchestrator with ts-node...\n');
    const orchestrator = spawn('npx', ['ts-node', 'src/services/orchestrator.ts'], {
      cwd: path.join(__dirname),
      stdio: 'inherit',
      shell: true
    });
    
    orchestrator.on('error', (error) => {
      console.error('❌ Failed to start orchestrator:', error.message);
    });
    
    orchestrator.on('close', (code) => {
      console.log(`\n🛑 Orchestrator stopped with code ${code}`);
    });
    
    console.log('\n✨ Services should now be running!');
    console.log('\n📋 Available Endpoints:');
    console.log('• Orchestrator: http://localhost:3006/api/status');
    console.log('• Data Summary: http://localhost:3006/api/data/summary');
    console.log('• Demo Workflow: POST http://localhost:3006/api/demo/workflow');
    console.log('\n🔧 Individual Services:');
    console.log('• SOAP Service: http://localhost:3001');
    console.log('• Salesforce Service: http://localhost:3002');
    console.log('• Stripe Service: http://localhost:3003');
    console.log('• Twilio Service: http://localhost:3004');
    console.log('• AWS Service: http://localhost:3005');
    console.log('\n🌐 Access your UI at: http://localhost:3000');
    
  } catch (error) {
    console.error('\n❌ Failed to start services:', error.message);
    console.log('\n💡 Try running these commands manually:');
    console.log('1. npm run dev:next (in one terminal)');
    console.log('2. npx ts-node src/services/orchestrator.ts (in another terminal)');
  }
}

startServices();
