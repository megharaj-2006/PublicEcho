const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend', 'src', 'App.jsx');
if (!fs.existsSync(filePath)) {
  console.error("App.jsx not found");
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log("Searching for official onboarding references...");
lines.forEach((line, i) => {
  const lineNum = i + 1;
  if (line.includes('registerOfficial') || line.includes('handleOfficialRegister') || (line.includes('register') && line.includes('official') && line.includes('submit')) || line.includes('officialRole') || line.includes('onSubmit') || line.includes('offDesignation')) {
    if (line.length < 160) {
      console.log(`Line ${lineNum}: ${line.trim()}`);
    }
  }
});
