const fs = require('fs');
const readline = require('readline');

const logFilePath = "C:\\Users\\dell\\.gemini\\antigravity\\brain\\54b9e1cd-785e-44e3-a203-4301bec41bb2\\.system_generated\\logs\\transcript.jsonl";

console.log("Searching transcript.jsonl with detailed Node.js script...");

const fileStream = fs.createReadStream(logFilePath);
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

rl.on('line', (line) => {
  try {
    const data = JSON.parse(line);
    const step_index = data.step_index;
    const tool_calls = data.tool_calls || [];

    for (const tc of tool_calls) {
      const args = tc.args || {};
      const argsStr = JSON.stringify(args);
      if (argsStr.includes("App.jsx")) {
        console.log(`Step ${step_index} | Tool: ${tc.name} | Args keys: ${Object.keys(args).join(', ')}`);
        
        // Let's print out all string values of args that are long
        for (const [key, val] of Object.entries(args)) {
          if (typeof val === 'string' && val.length > 100) {
            console.log(`  -> Key: ${key}, Length: ${val.length}`);
            if (val.includes("citizen-dash") || val.includes("official-dash")) {
              const outPath = `C:\\Users\\dell\\.gemini\\antigravity\\brain\\54b9e1cd-785e-44e3-a203-4301bec41bb2\\scratch\\step_${step_index}_key_${key}.jsx`;
              fs.writeFileSync(outPath, val, 'utf8');
              console.log(`  -> SAVED to ${outPath}`);
            }
          } else if (Array.isArray(val)) {
            // For multi_replace_file_content, check chunks
            console.log(`  -> Key: ${key} is Array of length ${val.length}`);
            val.forEach((chunk, i) => {
              const chunkStr = JSON.stringify(chunk);
              if (chunkStr.includes("citizen-dash") || chunkStr.includes("official-dash")) {
                const chunkVal = chunk.ReplacementContent || "";
                if (chunkVal.length > 100) {
                  const outPath = `C:\\Users\\dell\\.gemini\\antigravity\\brain\\54b9e1cd-785e-44e3-a203-4301bec41bb2\\scratch\\step_${step_index}_chunk_${i}.jsx`;
                  fs.writeFileSync(outPath, chunkVal, 'utf8');
                  console.log(`  -> SAVED chunk to ${outPath}`);
                }
              }
            });
          }
        }
      }
    }
  } catch (e) {
  }
});

rl.on('close', () => {
  console.log("Finished detailed search.");
});
