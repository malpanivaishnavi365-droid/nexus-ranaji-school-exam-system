import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, ChevronRight, Play, CheckCircle2, Clock, Layers, ArrowLeft } from 'lucide-react';

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await API.get('/subjects');
      if (res.data.success) {
        setSubjects(res.data.subjects);
        const subIdFromUrl = searchParams.get('subjectId');
        if (subIdFromUrl) {
          const sub = res.data.subjects.find(s => s.id === parseInt(subIdFromUrl));
          if (sub) openSubjectDetails(sub);
        }
      }
    } catch (err) {
      console.error('Error fetching subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  const openSubjectDetails = async (subject) => {
    setSelectedSubject(subject);
    setLoadingChapters(true);
    try {
      const res = await API.get(`/chapters/subject/${subject.id}`);
      if (res.data.success) {
        setChapters(res.data.chapters);
      }
    } catch (err) {
      console.error('Error fetching chapters:', err);
    } finally {
      setLoadingChapters(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading class subjects...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', color: '#1e1b4b', fontWeight: '800' }}>
            {selectedSubject ? selectedSubject.subject_name : 'Class Subjects & Chapters'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            {selectedSubject ? `Explore chapters & available quizzes for ${selectedSubject.subject_name}` : 'Select a subject to view its syllabus and online quizzes.'}
          </p>
        </div>

        {selectedSubject && (
          <button onClick={() => setSelectedSubject(null)} className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }}>
            <ArrowLeft size={16} /> Back to All Subjects
          </button>
        )}
      </div>

      {!selectedSubject ? (
        /* Grid of All Subjects */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {subjects.map((sub) => (
            <div key={sub.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.25s ease' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f5f3ff', color: '#5b21b6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={24} />
                  </div>
                  <span className="badge badge-published">{sub.code || 'SCI101'}</span>
                </div>

                <h3 style={{ fontSize: '1.2rem', color: '#1e1b4b', fontWeight: '800', marginBottom: '0.4rem' }}>
                  {sub.subject_name}
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  Standard curriculum syllabus with chapter quizzes & revision guides.
                </p>
              </div>

              <button onClick={() => openSubjectDetails(sub)} className="btn btn-primary" style={{ width: '100%', justifyContent: 'space-between' }}>
                <span>View Chapters & Quizzes</span>
                <ChevronRight size={18} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* Detailed Chapter View */
        <div>
          {loadingChapters ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading chapters...</div>
          ) : chapters.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
              <Layers size={40} style={{ color: '#cbd5e1', marginBottom: '0.75rem' }} />
              <h3>No Chapters Available</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Chapters for {selectedSubject.subject_name} will be added soon.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {chapters.map((ch) => (
                <div key={ch.id} className="card">
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#5b21b6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Chapter {ch.chapter_number}
                      </span>
                      <h3 style={{ fontSize: '1.15rem', color: '#1e1b4b', fontWeight: '800', marginTop: '0.2rem' }}>
                        {ch.title}
                      </h3>
                      {ch.description && (
                        <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '0.3rem' }}>
                          {ch.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Chapter Quizzes List */}
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Quizzes ({ch.quizzes.length})
                    </h4>

                    {ch.quizzes.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>No quizzes published for this chapter yet.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {ch.quizzes.map((quiz) => (
                          <div key={quiz.id} style={{
                            padding: '0.85rem 1rem',
                            borderRadius: '10px',
                            border: '1px solid #e2e8f0',
                            background: '#f8fafc',
                            display: 'flex',
                            alignItems: 'center',
                            justify-content: 'space-between'
                          }}>
                            <div>
                              <h5 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#1e293b' }}>{quiz.title}</h5>
                              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
                                Duration: {quiz.duration} mins • Marks: {quiz.total_marks}
                              </div>
                            </div>

                            {quiz.attempt && quiz.attempt.status === 'completed' ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <span className="badge badge-completed">
                                  Score: {quiz.attempt.score} ({quiz.attempt.percentage}%)
                                </span>
                                <button onClick={() => navigate('/student/exams')} className="btn btn-secondary btn-sm">
                                  View
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => navigate(`/student/instructions/${quiz.id}`)} className="btn btn-primary btn-sm">
                                <Play size={14} /> Start Quiz
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubjectsPage;
