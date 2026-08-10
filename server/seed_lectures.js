require('dotenv').config();
const { sequelize } = require('./config/db');
const { Lecture, Course, Subject } = require('./models');

async function seedLectures() {
  try {
    await sequelize.authenticate();
    console.log('Database connected...');
    await Lecture.drop();
    console.log('Dropped Lectures table...');
    await Lecture.sync();
    console.log('Synced clean Lectures table...');

    // Find class 12 course
    const c12 = await Course.findOne({ where: { code: 'C12' } });
    const c12Id = c12 ? c12.id : null;

    // Find subjects
    const accSubject = await Subject.findOne({ where: { code: 'ACC12' } });
    const ecoSubject = await Subject.findOne({ where: { code: 'ECO12' } });

    const accId = accSubject ? accSubject.id : null;
    const ecoId = ecoSubject ? ecoSubject.id : null;

    const dummyLectures = [
      {
        title: 'Partnership Accounts | Interest on Capital & Drawings',
        description: 'Understand the basic calculation methods of Interest on Capital and Interest on Drawings for class 12 Board Exams. We discuss average period method, product method and journal entries.',
        videoUrl: 'https://www.youtube.com/watch?v=d1mXn4L_WvU',
        isFree: true,
        order: 1,
        courseId: c12Id,
        subjectId: accId
      },
      {
        title: 'Circular Flow of Income | Class 12 Macroeconomics',
        description: 'A comprehensive visual explanation of the two-sector economy flow, real flow vs money flow, leakages and injections, and national income fundamentals.',
        videoUrl: 'https://www.youtube.com/watch?v=6h88zD0XW1g',
        isFree: true,
        order: 2,
        courseId: c12Id,
        subjectId: ecoId
      },
      {
        title: 'Admission of a Partner | Revaluation Account Concepts',
        description: 'Premium intermediate session explaining the treatment of goodwill, preparation of Revaluation Account, Partners Capital Accounts and the Balance Sheet adjustment.',
        videoUrl: 'https://www.youtube.com/watch?v=zD1UvC9H_jA',
        isFree: false,
        order: 3,
        courseId: c12Id,
        subjectId: accId
      },
      {
        title: 'National Income Calculation | Expenditure & Income Methods',
        description: 'A rigorous deep dive into double counting, intermediate vs final goods, GDP deflator, and step-by-step formula calculations for board exam questions.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        isFree: false,
        order: 4,
        courseId: c12Id,
        subjectId: ecoId
      }
    ];

    for (const item of dummyLectures) {
      const exists = await Lecture.findOne({ where: { title: item.title } });
      if (!exists) {
        await Lecture.create(item);
        console.log(`✅ Seeded lecture: ${item.title}`);
      } else {
        console.log(`ℹ️ Lecture already exists: ${item.title}`);
      }
    }

    console.log('🌱 Video lectures seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding lectures:', err.message);
    if (err.errors) {
      err.errors.forEach(e => console.error(`  - ${e.path}: ${e.message}`));
    }
    process.exit(1);
  }
}

seedLectures();
