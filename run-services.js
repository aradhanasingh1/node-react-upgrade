const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Starting Microservices...\n');

// Function to run a command and return a promise
function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`📋 ${description}...`);
    
    const child = exec(command, {
      cwd: path.join(__dirname),
      stdio: 'pipe'
    });
    
    let output = '';
    let errorOutput = '';
    
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${description} completed successfully`);
        resolve(output);
      } else {
        console.log(`❌ ${description} failed with code ${code}`);
        console.log(`Error: ${errorOutput}`);
        reject(new Error(`${description} failed`));
      }
    });
    
    child.on('error', (error) => {
      console.log(`❌ ${description} failed: ${error.message}`);
      reject(error);
    });
  });
}

// Run TypeScript compiler on services only
async function startServices() {
  try {
    console.log('🔧 Building services...\n');
    
    // Compile services only (excluding UI components)
    await runCommand(
      'npx tsc src/services/*.ts src/services/**/*.ts --outDir dist --target es2020 --module commonjs --esModuleInterop true --skipLibCheck true --force',
      'Compiling services'
    );
    
    console.log('\n🚀 Starting orchestrator...\n');
    
    // Start the orchestrator
    
    const orchestrator = spawn('node', ['dist/services/orchestrator.js'], {
      cwd: path.join(__dirname),
      stdio: 'inherit'
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
    console.log('2. node dist/services/orchestrator.js (in another terminal)');
  }
}

startServices();
