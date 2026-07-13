const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\Ryoya\\.gemini\\antigravity-ide\\brain\\ecaa484b-c85b-402c-8b93-cb0fbc8ff4e7\\.system_generated\\steps\\342\\content.md', 'utf8');
const jsonStr = content.split('\n').find(line => line.startsWith('{'));
if (!jsonStr) { console.log('no json'); process.exit(1); }
const data = JSON.parse(jsonStr);
const member = data.members.find(m => m.squadNumber === '3451');
console.log(JSON.stringify(member, null, 2));
