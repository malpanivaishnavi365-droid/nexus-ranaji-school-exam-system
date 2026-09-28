const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const updateDatabaseSchema = require('./update_schema');

const seedInitialData = async () => {
  try {
    // Run schema updates first
    await updateDatabaseSchema();

    // 1. Seed Classes 4th to 10th
    const defaultClasses = [
      '4th Standard',
      '5th Standard',
      '6th Standard',
      '7th Standard',
      '8th Standard',
      '9th Standard',
      '10th Standard'
    ];

    for (const className of defaultClasses) {
      const existing = await query('SELECT id FROM classes WHERE class_name = ?', [className]);
      if (existing.length === 0) {
        await query('INSERT INTO classes (class_name) VALUES (?)', [className]);
      }
    }

    const allClasses = await query('SELECT id, class_name FROM classes');
    const class10 = allClasses.find(c => c.class_name === '10th Standard') || allClasses[0];
    const class9 = allClasses.find(c => c.class_name === '9th Standard') || allClasses[0];

    // 2. Seed Subjects
    const defaultSubjects = [
      { name: 'General Science', code: 'SCI101' },
      { name: 'Mathematics', code: 'MATH101' },
      { name: 'English Literature', code: 'ENG101' },
      { name: 'Social Science', code: 'SOC101' },
      { name: 'Computer Science', code: 'CS101' }
    ];

    for (const sub of defaultSubjects) {
      const existing = await query('SELECT id FROM subjects WHERE subject_name = ?', [sub.name]);
      if (existing.length === 0) {
        await query('INSERT INTO subjects (subject_name, code) VALUES (?, ?)', [sub.name, sub.code]);
      }
    }

    const allSubjects = await query('SELECT id, subject_name FROM subjects');
    const scienceSub = allSubjects.find(s => s.subject_name === 'General Science');
    const mathSub = allSubjects.find(s => s.subject_name === 'Mathematics');
    const csSub = allSubjects.find(s => s.subject_name === 'Computer Science');

    // 3. Update / Seed Student Users with class_id if missing
    const johnUser = await query("SELECT id, class_id FROM users WHERE email = 'john@student.com'");
    if (johnUser.length > 0 && !johnUser[0].class_id && class10) {
      await query('UPDATE users SET class_id = ? WHERE id = ?', [class10.id, johnUser[0].id]);
    }

    const sarahUser = await query("SELECT id, class_id FROM users WHERE email = 'sarah@student.com'");
    if (sarahUser.length > 0 && !sarahUser[0].class_id && class10) {
      await query('UPDATE users SET class_id = ? WHERE id = ?', [class10.id, sarahUser[0].id]);
    }

    // 4. Seed Chapters for Science & Math
    const scienceChaptersData = [
      { num: 1, title: 'Physics: Light, Reflection & Refraction', desc: 'Laws of reflection, lenses, and optical phenomena' },
      { num: 2, title: 'Chemistry: Chemical Reactions & Equations', desc: 'Chemical equations, combination, and oxidation-reduction' },
      { num: 3, title: 'Biology: Life Processes & Nutrition', desc: 'Photosynthesis, human digestion, and respiration' },
      { num: 4, title: 'Environment: Natural Resources & Ecology', desc: 'Ecosystems, food chains, and sustainable development' }
    ];

    if (scienceSub && class10) {
      for (const ch of scienceChaptersData) {
        const existing = await query(
          'SELECT id FROM chapters WHERE subject_id = ? AND class_id = ? AND chapter_number = ?',
          [scienceSub.id, class10.id, ch.num]
        );
        if (existing.length === 0) {
          await query(
            'INSERT INTO chapters (subject_id, class_id, chapter_number, title, description) VALUES (?, ?, ?, ?, ?)',
            [scienceSub.id, class10.id, ch.num, ch.title, ch.desc]
          );
        }
      }
    }

    const allScienceChapters = scienceSub && class10 ? await query('SELECT id, chapter_number, title FROM chapters WHERE subject_id = ? AND class_id = ?', [scienceSub.id, class10.id]) : [];
    const ch1 = allScienceChapters.find(c => c.chapter_number === 1);
    const ch2 = allScienceChapters.find(c => c.chapter_number === 2);
    const ch3 = allScienceChapters.find(c => c.chapter_number === 3);
    const ch4 = allScienceChapters.find(c => c.chapter_number === 4);

    // 5. Seed Courses
    if (scienceSub && class10) {
      const existingCourse = await query('SELECT id FROM courses WHERE subject_id = ? AND class_id = ?', [scienceSub.id, class10.id]);
      if (existingCourse.length === 0) {
        await query(
          'INSERT INTO courses (course_name, subject_id, class_id, description) VALUES (?, ?, ?, ?)',
          ['Class 10 General Science Complete Course', scienceSub.id, class10.id, 'Master Physics, Chemistry, Biology, and Environmental Science']
        );
      }
    }

    // 6. Seed Badges
    const defaultBadges = [
      {
        code: 'first_step',
        title: 'First Step',
        description: 'Completed your first online examination successfully.',
        icon: '🌟',
        requirement: 'Complete 1 quiz'
      },
      {
        code: 'quiz_champion',
        title: 'Quiz Champion',
        description: 'Demonstrated consistency by completing 5 online quizzes.',
        icon: '🏆',
        requirement: 'Complete 5 quizzes'
      },
      {
        code: 'perfect_score',
        title: 'Perfect Score',
        description: 'Achieved a flawless 100% score on a quiz.',
        icon: '💯',
        requirement: 'Score 100% on any quiz'
      },
      {
        code: 'subject_explorer',
        title: 'Subject Explorer',
        description: 'Completed all required quizzes in a subject.',
        icon: '📚',
        requirement: 'Complete all quizzes of a subject'
      },
      {
        code: 'consistent_learner',
        title: 'Consistent Learner',
        description: 'Scored 80% or above across 3 separate quizzes.',
        icon: '🔥',
        requirement: 'Score 80%+ on 3 quizzes'
      },
      {
        code: 'science_master',
        title: 'Science Master',
        description: 'Successfully completed the entire Science course.',
        icon: '🎯',
        requirement: 'Complete all Science course quizzes'
      }
    ];

    for (const b of defaultBadges) {
      const existing = await query('SELECT id FROM badges WHERE code = ?', [b.code]);
      if (existing.length === 0) {
        await query(
          'INSERT INTO badges (code, title, description, icon, requirement) VALUES (?, ?, ?, ?, ?)',
          [b.code, b.title, b.description, b.icon, b.requirement]
        );
      }
    }

    // 7. Seed Science Quizzes (MCQs + Match the Following)
    if (scienceSub && class10) {
      // Quiz 1: Physics
      let q1Check = await query("SELECT id FROM exams WHERE title = 'Class 10 Science: Optics & Light Quiz'");
      if (q1Check.length === 0) {
        const result = await query(
          `INSERT INTO exams (title, subject_id, class_id, chapter_id, duration, total_marks, passing_marks, status, description)
           VALUES ('Class 10 Science: Optics & Light Quiz', ?, ?, ?, 15, 10, 4, 'published', 'Covering reflection, refraction, and convex lenses.')`,
          [scienceSub.id, class10.id, ch1 ? ch1.id : null]
        );
        const quiz1Id = result.insertId;

        // MCQs
        const q1MCQs = [
          { q: 'A convex lens forms a real inverted image when object is placed beyond 2F at:', a: 'At F', b: 'At 2F', c: 'Between F and 2F', d: 'At infinity', ans: 'C', m: 2 },
          { q: 'What is the speed of light in vacuum?', a: '3 × 10^8 m/s', b: '3 × 10^6 m/s', c: '3 × 10^10 m/s', d: '3 × 10^5 m/s', ans: 'A', m: 2 },
          { q: 'The focal length of a plane mirror is:', a: 'Zero', b: 'Negative', c: 'Positive', d: 'Infinity', ans: 'D', m: 2 },
          { q: 'Which color of light bends the most during dispersion through a prism?', a: 'Red', b: 'Yellow', c: 'Violet', d: 'Green', ans: 'C', m: 2 }
        ];
        for (const mcq of q1MCQs) {
          await query(
            `INSERT INTO questions (exam_id, question_type, question_text, option_a, option_b, option_c, option_d, correct_option, marks)
             VALUES (?, 'mcq', ?, ?, ?, ?, ?, ?, ?)`,
            [quiz1Id, mcq.q, mcq.a, mcq.b, mcq.c, mcq.d, mcq.ans, mcq.m]
          );
        }
        // Match the Following
        const matchData1 = {
          left_items: ['Convex Lens', 'Concave Mirror', 'Refraction'],
          right_items: ['Converging rays', 'Shaving mirror', 'Bending of light'],
          correct_pairs: { '0': '0', '1': '1', '2': '2' }
        };
        await query(
          `INSERT INTO questions (exam_id, question_type, question_text, match_data, marks)
           VALUES (?, 'match', 'Match Column A (Optical Element) with Column B (Property/Application).', ?, 2)`,
          [quiz1Id, JSON.stringify(matchData1)]
        );
      }

      // Quiz 2: Chemistry
      let q2Check = await query("SELECT id FROM exams WHERE title = 'Class 10 Science: Chemical Reactions Quiz'");
      if (q2Check.length === 0) {
        const result = await query(
          `INSERT INTO exams (title, subject_id, class_id, chapter_id, duration, total_marks, passing_marks, status, description)
           VALUES ('Class 10 Science: Chemical Reactions Quiz', ?, ?, ?, 15, 10, 4, 'published', 'Testing chemical equations, oxidation, and reduction.')`,
          [scienceSub.id, class10.id, ch2 ? ch2.id : null]
        );
        const quiz2Id = result.insertId;

        const q2MCQs = [
          { q: 'Which gas is evolved when zinc reacts with dilute sulfuric acid?', a: 'Oxygen', b: 'Hydrogen', c: 'Carbon Dioxide', d: 'Nitrogen', ans: 'B', m: 2 },
          { q: 'Rusting of iron is an example of:', a: 'Oxidation reaction', b: 'Reduction reaction', c: 'Decomposition', d: 'Displacement', ans: 'A', m: 2 },
          { q: 'What type of reaction is photosynthesis?', a: 'Exothermic', b: 'Endothermic', c: 'Neutralization', d: 'Displacement', ans: 'B', m: 2 },
          { q: 'The chemical formula of marble is:', a: 'CaO', b: 'Ca(OH)2', c: 'CaCO3', d: 'CaCl2', ans: 'C', m: 2 }
        ];
        for (const mcq of q2MCQs) {
          await query(
            `INSERT INTO questions (exam_id, question_type, question_text, option_a, option_b, option_c, option_d, correct_option, marks)
             VALUES (?, 'mcq', ?, ?, ?, ?, ?, ?, ?)`,
            [quiz2Id, mcq.q, mcq.a, mcq.b, mcq.c, mcq.d, mcq.ans, mcq.m]
          );
        }

        const matchData2 = {
          left_items: ['Photosynthesis', 'Respiration', 'Chlorophyll'],
          right_items: ['Food preparation', 'Energy release', 'Green pigment'],
          correct_pairs: { '0': '0', '1': '1', '2': '2' }
        };
        await query(
          `INSERT INTO questions (exam_id, question_type, question_text, match_data, marks)
           VALUES (?, 'match', 'Match Column A (Biological Process) with Column B (Primary Role).', ?, 2)`,
          [quiz2Id, JSON.stringify(matchData2)]
        );
      }
    }

    // 8. Seed Study Materials
    if (scienceSub && class10) {
      const existingMat = await query('SELECT id FROM study_materials WHERE class_id = ? AND subject_id = ?', [class10.id, scienceSub.id]);
      if (existingMat.length === 0) {
        await query(
          `INSERT INTO study_materials (class_id, subject_id, chapter_id, title, description, material_type, file_url)
           VALUES (?, ?, ?, 'Optics & Light Ray Diagrams Guide', 'Complete chapter notes with formula sheet and diagram references.', 'pdf', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf')`,
          [class10.id, scienceSub.id, ch1 ? ch1.id : null]
        );
        await query(
          `INSERT INTO study_materials (class_id, subject_id, chapter_id, title, description, material_type, file_url)
           VALUES (?, ?, ?, 'Chemical Equations & Balancing Tutorial', 'Video breakdown of chemical equation balancing rules.', 'video', 'https://www.youtube.com/watch?v=2Jufp-Jv430')`,
          [class10.id, scienceSub.id, ch2 ? ch2.id : null]
        );
        await query(
          `INSERT INTO study_materials (class_id, subject_id, chapter_id, title, description, material_type, file_url)
           VALUES (?, ?, ?, 'Life Processes Key Concepts & Mind Map', 'Summary notes for quick revision before exams.', 'notes', 'https://example.com/life-processes-notes')`,
          [class10.id, scienceSub.id, ch3 ? ch3.id : null]
        );
      }
    }

    // 9. Seed Initial Notifications for John & Sarah
    const studentsToNotify = await query("SELECT id FROM users WHERE role = 'student'");
    for (const st of studentsToNotify) {
      const notifCheck = await query('SELECT id FROM notifications WHERE student_id = ?', [st.id]);
      if (notifCheck.length === 0) {
        await query(
          `INSERT INTO notifications (student_id, title, message, type)
           VALUES (?, 'Welcome to Student Portal!', 'Welcome to Nexus Ranaji English School Online Examination & Learning System. Explore your subjects and quizzes to get started.', 'info')`,
          [st.id]
        );
        await query(
          `INSERT INTO notifications (student_id, title, message, type)
           VALUES (?, 'New Science Quiz Published', 'Class 10 Science: Optics & Light Quiz is now active in your dashboard.', 'quiz')`,
          [st.id]
        );
      }
    }

    console.log('🌱 Seed data initialized successfully for Nexus Ranaji English School!');
  } catch (err) {
    console.error('Error seeding initial data:', err);
  }
};

module.exports = seedInitialData;
