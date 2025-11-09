const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/hooks/usePrompts.js',
  'src/lib/api.js',
  'src/components/PromptLibrary.jsx',
  'src/components/PromptDetail.jsx',
  'src/components/EditPrompt.jsx',
  'src/components/ExecutionLogger.jsx',
  'src/components/ExecutionHistory.jsx',
  'src/components/CategoryManager.jsx'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add import at the top if not already present
    if (!content.includes('import { getApiUrl }')) {
      // Find the last import statement
      const lastImportIndex = content.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
        const endOfLine = content.indexOf('\n', lastImportIndex);
        content = content.slice(0, endOfLine + 1) + 
                  "import { getApiUrl } from '../config/api';\n" +
                  content.slice(endOfLine + 1);
      }
    }
    
    // Replace fetch calls with getApiUrl
    content = content.replace(/fetch\(`(\/api\/[^`]+)`/g, 'fetch(getApiUrl(`$1`)');
    content = content.replace(/fetch\('(\/api\/[^']+)'/g, "fetch(getApiUrl('$1')");
    content = content.replace(/fetch\(`(\/api\/[^}]+\$\{[^}]+\}[^`]*)`/g, 'fetch(getApiUrl(`$1`)');
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});

console.log('All files updated!');
