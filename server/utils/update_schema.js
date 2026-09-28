const { query } = require('../config/db');

const updateDatabaseSchema = async () => {
  try {
    console.log('🔄 Checking and updating database schema safely...');

    // 1. Chapters Table
    await query(`
      CREATE TABLE IF NOT EXISTS chapters (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subject_id INT NOT NULL,
        class_id INT NOT NULL,
        chapter_number INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Helper function to check if column exists in a table
    const columnExists = async (table, column) => {
      const rows = await query(
        `SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [table, column]
      );
      return rows[0].cnt > 0;
    };

    // 2. Add columns to exams table
    if (!(await columnExists('exams', 'chapter_id'))) {
      await query(`ALTER TABLE exams ADD COLUMN chapter_id INT DEFAULT NULL`);
      try {
        await query(`ALTER TABLE exams ADD CONSTRAINT fk_exams_chapter FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE SET NULL`);
      } catch (e) {
        // Ignore if constraint already exists
      }
    }
    if (!(await columnExists('exams', 'max_attempts'))) {
      await query(`ALTER TABLE exams ADD COLUMN max_attempts INT DEFAULT 3`);
    }
    if (!(await columnExists('exams', 'description'))) {
      await query(`ALTER TABLE exams ADD COLUMN description TEXT DEFAULT NULL`);
    }

    // 3. Add columns & update nullability in questions table
    if (!(await columnExists('questions', 'question_type'))) {
      await query(`ALTER TABLE questions ADD COLUMN question_type ENUM('mcq', 'match') NOT NULL DEFAULT 'mcq'`);
    }
    if (!(await columnExists('questions', 'match_data'))) {
      await query(`ALTER TABLE questions ADD COLUMN match_data JSON DEFAULT NULL`);
    }

    // Make MCQ options nullable in questions table so Match-the-Following questions can exist
    try {
      await query(`ALTER TABLE questions MODIFY option_a TEXT NULL`);
      await query(`ALTER TABLE questions MODIFY option_b TEXT NULL`);
      await query(`ALTER TABLE questions MODIFY option_c TEXT NULL`);
      await query(`ALTER TABLE questions MODIFY option_d TEXT NULL`);
      await query(`ALTER TABLE questions MODIFY correct_option ENUM('A', 'B', 'C', 'D') NULL`);
    } catch (e) {
      console.warn('Notice when modifying questions columns nullability:', e.message);
    }

    // 4. Add columns to answers table
    if (!(await columnExists('answers', 'selected_answer_json'))) {
      await query(`ALTER TABLE answers ADD COLUMN selected_answer_json JSON DEFAULT NULL`);
    }

    // 5. Badges Table
    await query(`
      CREATE TABLE IF NOT EXISTS badges (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        title VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        icon VARCHAR(50) NOT NULL,
        requirement TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 6. Student Badges Table
    await query(`
      CREATE TABLE IF NOT EXISTS student_badges (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        badge_id INT NOT NULL,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
        UNIQUE KEY unique_student_badge (student_id, badge_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 7. Courses Table
    await query(`
      CREATE TABLE IF NOT EXISTS courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_name VARCHAR(150) NOT NULL,
        subject_id INT NOT NULL,
        class_id INT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 8. Certificates Table
    await query(`
      CREATE TABLE IF NOT EXISTS certificates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        certificate_number VARCHAR(100) NOT NULL UNIQUE,
        student_id INT NOT NULL,
        course_id INT NOT NULL,
        final_percentage DECIMAL(5,2) NOT NULL,
        issue_date DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 9. Study Materials Table
    await query(`
      CREATE TABLE IF NOT EXISTS study_materials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        class_id INT NOT NULL,
        subject_id INT NOT NULL,
        chapter_id INT DEFAULT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        material_type ENUM('pdf', 'video', 'notes', 'link') NOT NULL DEFAULT 'notes',
        file_url VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 10. Notifications Table
    await query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        title VARCHAR(150) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('✅ Database schema migration complete and verified!');
  } catch (err) {
    console.error('❌ Error updating database schema:', err);
    throw err;
  }
};

module.exports = updateDatabaseSchema;
