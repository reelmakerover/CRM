/**
 * Run this script once to generate a sample Excel template for question import:
 * cd server && node utils/generateTemplate.js
 */
const xlsx = require('xlsx');
const path = require('path');

const sampleData = [
  {
    'Question': 'Which accounting concept requires revenue to be recognized when earned?',
    'Option A': 'Matching Concept',
    'Option B': 'Revenue Recognition Concept',
    'Option C': 'Going Concern Concept',
    'Option D': 'Cost Concept',
    'Correct Answer': 'B',
    'Course': 'CA Foundation',
    'Subject': 'Accounts',
    'Difficulty': 'medium'
  },
  {
    'Question': 'The balance sheet shows financial position as on a:',
    'Option A': 'Particular date',
    'Option B': 'Particular period',
    'Option C': 'Fiscal year',
    'Option D': 'None of these',
    'Correct Answer': 'A',
    'Course': 'CA Foundation',
    'Subject': 'Accounts',
    'Difficulty': 'easy'
  },
  {
    'Question': 'Capital = Assets – ?',
    'Option A': 'Revenue',
    'Option B': 'Liabilities',
    'Option C': 'Expenses',
    'Option D': 'Income',
    'Correct Answer': 'B',
    'Course': 'CA Foundation',
    'Subject': 'Accounts',
    'Difficulty': 'easy'
  },
];

const ws = xlsx.utils.json_to_sheet(sampleData);
const wb = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(wb, ws, 'Questions');

// Auto-size columns
const colWidths = [
  { wch: 60 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 },
  { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 12 }
];
ws['!cols'] = colWidths;

const outPath = path.join(__dirname, '../../question_import_template.xlsx');
xlsx.writeFile(wb, outPath);
console.log(`✅ Template saved: ${outPath}`);
console.log('\nColumn guide:');
console.log('  Question       — The question text');
console.log('  Option A–D     — The four choices');
console.log('  Correct Answer — Must be A, B, C, or D');
console.log('  Course         — Must match existing course name exactly');
console.log('  Subject        — Must match existing subject name exactly');
console.log('  Difficulty     — easy | medium | hard');
