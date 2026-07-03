const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const PORT = 8080;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Error: CLIENT_ID and CLIENT_SECRET must be set in your .env file.");
  process.exit(1);
}

// Scope for Gmail access
const SCOPE = 'https://mail.google.com/';

const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(SCOPE)}&access_type=offline&prompt=consent`;

console.log("\n==================================================");
console.log("GOOGLE OAUTH2 REFRESH TOKEN GENERATOR");
console.log("==================================================\n");
console.log("This script helps regenerate your Google OAuth2 Refresh Token.");
console.log("1. Make sure 'http://localhost:8080/oauth2callback' is registered as an Authorized Redirect URI in your Google Cloud Console for this Client ID.");
console.log("2. Open the following URL in your browser to authorize access:\n");
console.log(authUrl);
console.log("\n--------------------------------------------------");
console.log("Listening for authorization callback on port 8080...");
console.log("If you get a 'redirect_uri_mismatch', add the callback URL to your Cloud Console or use OAuth2 Playground.");

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  if (parsedUrl.pathname === '/oauth2callback') {
    const code = parsedUrl.query.code;
    if (code) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<h1>Authorization successful!</h1><p>You can close this tab and return to the terminal.</p>');
      server.close();
      exchangeCodeForToken(code);
    } else {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end('<h1>Error: No authorization code found in request</h1>');
    }
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT);

function exchangeCodeForToken(code) {
  console.log("\nExchanging authorization code for tokens...");
  
  const postData = JSON.stringify({
    code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code'
  });

  const reqOpts = {
    hostname: 'oauth2.googleapis.com',
    path: '/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = https.request(reqOpts, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        if (response.refresh_token) {
          console.log("\n✅ Success! New Refresh Token generated successfully.");
          console.log(`\nNew Refresh Token:\n${response.refresh_token}\n`);
          
          updateEnvFile(response.refresh_token);
        } else {
          console.error("❌ Error: Response did not contain a refresh token. Make sure you consented and allowed offline access.");
          console.error("Full response:", response);
        }
      } catch (e) {
        console.error("❌ Failed to parse response:", e);
      }
    });
  });

  req.on('error', (e) => {
    console.error("❌ Network error exchanging code:", e);
  });

  req.write(postData);
  req.end();
}

function updateEnvFile(newToken) {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('REFRESH_TOKEN=')) {
      envContent = envContent.replace(/REFRESH_TOKEN=.*/, `REFRESH_TOKEN=${newToken}`);
      fs.writeFileSync(envPath, envContent, 'utf8');
      console.log("📝 Automatically updated REFRESH_TOKEN in .env file!");
    } else {
      fs.appendFileSync(envPath, `\nREFRESH_TOKEN=${newToken}\n`, 'utf8');
      console.log("📝 Appended REFRESH_TOKEN to .env file!");
    }
    console.log("Please restart your backend server to load the new credentials.");
  } else {
    console.log(`Could not find .env file at ${envPath}. Please manually set:`);
    console.log(`REFRESH_TOKEN=${newToken}`);
  }
}
