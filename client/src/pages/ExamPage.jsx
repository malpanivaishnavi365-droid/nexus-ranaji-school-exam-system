import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import Modal from '../components/Modal';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  RotateCcw,
  Send,
  AlertTriangle
} from 'lucide-react';

const ExamPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});

  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const timerRef = useRef(null);

  useEffect(() => {
    const initExam = async () => {
      try {
        const [examRes, questRes, startRes] = await Promise.all([
          API.get(`/exams/${id}`),
          API.get(`/exams/${id}/questions`),
          API.post(`/exams/${id}/start`)
        ]);

        if (examRes.data.success) {
          setExam(examRes.data.exam);
        }

        if (questRes.data.success) {
          setQuestions(questRes.data.questions);
        }

        if (startRes.data.success && startRes.data.attempt) {
          const attempt = startRes.data.attempt;
          const durationMinutes = examRes.data.exam.duration;

          const startTimeMs = new Date(
            attempt.start_time
          ).getTime();

          const elapsedSeconds = Math.floor(
            (Date.now() - startTimeMs) / 1000
          );

          const totalSeconds = durationMinutes * 60;

          const leftSeconds = Math.max(
            0,
            totalSeconds - elapsedSeconds
          );

          setRemainingSeconds(leftSeconds);
        }
      } catch (err) {
        console.error(
          'Failed to initialize exam engine:',
          err
        );

        alert(
          err.response?.data?.message ||
          'Error loading examination.'
        );

        navigate('/student/exams');
      } finally {
        setLoading(false);
      }
    };

    initExam();
  }, [id, navigate]);

  useEffect(() => {
    if (remainingSeconds === null || submitting) {
      return;
    }

    if (remainingSeconds <= 0) {
      handleFinalSubmit(true);
      return;
    }

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleFinalSubmit(true);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [remainingSeconds, submitting]);

  const handleSelectOption = (optionKey) => {
    const qId = questions[currentIndex].id;

    setAnswers((prev) => ({
      ...prev,
      [qId]: optionKey
    }));
  };

  const handleClearAnswer = () => {
    const qId = questions[currentIndex].id;

    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[qId];
      return copy;
    });
  };

  const handleToggleMarkForReview = () => {
    const qId = questions[currentIndex].id;

    setMarkedForReview((prev) => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  const handleFinalSubmit = async (autoSubmit = false) => {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setShowSubmitModal(false);

    try {
      const answerPayload = questions.map((q) => ({
        question_id: q.id,
        selected_option: answers[q.id] || null
      }));

      const res = await API.post(
        `/exams/${id}/submit`,
        {
          answers: answerPayload
        }
      );

      if (res.data.success) {
        if (autoSubmit) {
          alert(
            'Time limit reached! Your examination has been automatically submitted.'
          );
        }

        navigate(
          `/student/result/${res.data.result.attemptId}`
        );
      }
    } catch (err) {
      console.error(
        'Error submitting exam:',
        err
      );

      alert(
        'Failed to submit examination. Please try again.'
      );

      setSubmitting(false);
    }
  };

  const formatTimer = (totalSec) => {
    if (
      totalSec === null ||
      totalSec === undefined
    ) {
      return '00:00';
    }

    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;

    return `${m.toString().padStart(2, '0')}:${s
      .toString()
      .padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div
        style={{
          padding: '3rem',
          textAlign: 'center',
          fontSize: '1.2rem'
        }}
      >
        Launching Examination Engine...
      </div>
    );
  }

  if (!exam || questions.length === 0) {
    return (
      <div
        style={{
          padding: '3rem',
          textAlign: 'center'
        }}
      >
        No questions available for this exam.
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const isMarked = !!markedForReview[currentQ.id];
  const selectedAns = answers[currentQ.id];

  const totalCount = questions.length;
  const answeredCount = Object.keys(answers).length;

  const markedCount = Object.values(
    markedForReview
  ).filter(Boolean).length;

  const unansweredCount =
    totalCount - answeredCount;

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}
    >
      <div
        className="card"
        style={{
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff',
          position: 'sticky',
          top: '64px',
          zIndex: 90,
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div>
          <span
            className="badge badge-published"
            style={{ fontSize: '0.7rem' }}
          >
            {exam.subject_name}
          </span>

          <h2
            style={{
              fontSize: '1.25rem',
              marginTop: '0.2rem'
            }}
          >
            {exam.title}
          </h2>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background:
              remainingSeconds < 300
                ? 'var(--accent-danger-bg)'
                : 'var(--primary-light)',
            color:
              remainingSeconds < 300
                ? 'var(--accent-danger)'
                : 'var(--primary)',
            padding: '0.6rem 1.25rem',
            borderRadius: '10px',
            fontWeight: '800',
            fontSize: '1.25rem',
            fontFamily: 'var(--font-heading)',
            border: `1px solid ${
              remainingSeconds < 300
                ? 'var(--accent-danger)'
                : 'var(--primary)'
            }`
          }}
        >
          <Clock
            size={22}
            className={
              remainingSeconds < 300
                ? 'animate-pulse'
                : ''
            }
          />

          <span>
            {formatTimer(remainingSeconds)}
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: '1.5rem'
        }}
      >
        <div
          className="card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '1rem',
                marginBottom: '1.25rem',
                borderBottom:
                  '1px solid var(--border-light)'
              }}
            >
              <span
                style={{
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  color: 'var(--text-muted)'
                }}
              >
                Question {currentIndex + 1} of{' '}
                {totalCount}
              </span>

              <span
                className="badge badge-warning"
                style={{ fontSize: '0.8rem' }}
              >
                Marks: {currentQ.marks || 1}
              </span>
            </div>

            <h3
              style={{
                fontSize: '1.15rem',
                lineHeight: '1.6',
                marginBottom: '1.5rem',
                color: 'var(--text-main)'
              }}
            >
              {currentQ.question_text}
            </h3>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.875rem'
              }}
            >
              {['A', 'B', 'C', 'D'].map(
                (optKey) => {
                  const optText =
                    currentQ[
                      `option_${optKey.toLowerCase()}`
                    ];

                  const isSelected =
                    selectedAns === optKey;

                  return (
                    <div
                      key={optKey}
                      onClick={() =>
                        handleSelectOption(optKey)
                      }
                      style={{
                        padding: '1rem 1.25rem',
                        borderRadius: '10px',
                        border: `2px solid ${
                          isSelected
                            ? 'var(--primary)'
                            : 'var(--border-light)'
                        }`,
                        background: isSelected
                          ? 'var(--primary-light)'
                          : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        transition:
                          'all 0.15s ease'
                      }}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: isSelected
                            ? 'var(--primary)'
                            : '#f1f5f9',
                          color: isSelected
                            ? '#ffffff'
                            : 'var(--text-main)',
                          fontWeight: '800',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.9rem'
                        }}
                      >
                        {optKey}
                      </div>

                      <span
                        style={{
                          fontSize: '0.95rem',
                          fontWeight: isSelected
                            ? '700'
                            : '500',
                          color:
                            'var(--text-main)'
                        }}
                      >
                        {optText}
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </div>
          {/* Question Controls */}
          <div
            style={{
              marginTop: '2rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '0.5rem'
              }}
            >
              <button
                onClick={handleToggleMarkForReview}
                className={`btn ${
                  isMarked ? 'btn-warning' : 'btn-outline'
                } btn-sm`}
                style={{
                  background: isMarked
                    ? 'var(--accent-warning)'
                    : 'transparent',
                  color: isMarked
                    ? '#fff'
                    : 'var(--accent-warning)',
                  borderColor: 'var(--accent-warning)'
                }}
              >
                <Bookmark size={16} />
                {isMarked ? 'Marked' : 'Mark for Review'}
              </button>

              <button
                onClick={handleClearAnswer}
                disabled={!selectedAns}
                className="btn btn-secondary btn-sm"
              >
                <RotateCcw size={16} />
                Clear Answer
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '0.5rem'
              }}
            >
              <button
                onClick={() =>
                  setCurrentIndex((prev) =>
                    Math.max(0, prev - 1)
                  )
                }
                disabled={currentIndex === 0}
                className="btn btn-secondary"
              >
                <ChevronLeft size={18} />
                Previous
              </button>

              {currentIndex < totalCount - 1 ? (
                <button
                  onClick={() =>
                    setCurrentIndex((prev) =>
                      Math.min(totalCount - 1, prev + 1)
                    )
                  }
                  className="btn btn-primary"
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="btn btn-success"
                >
                  <Send size={18} />
                  Submit Exam
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div
          className="card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <h4
              style={{
                fontSize: '1rem',
                marginBottom: '1rem',
                borderBottom: '1px solid var(--border-light)',
                paddingBottom: '0.5rem'
              }}
            >
              Question Navigation
            </h4>

            {/* Question Chips */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '0.6rem',
                marginBottom: '1.5rem'
              }}
            >
              {questions.map((q, idx) => {
                const qId = q.id;
                const isCurrent = idx === currentIndex;
                const hasAnswered = !!answers[qId];
                const isReview = !!markedForReview[qId];

                let chipClass = 'unanswered';

                if (hasAnswered) {
                  chipClass = 'answered';
                } else if (isReview) {
                  chipClass = 'marked';
                }

                if (isCurrent) {
                  chipClass += ' current';
                }

                return (
                  <div
                    key={qId}
                    onClick={() => setCurrentIndex(idx)}
                    className={`question-chip ${chipClass}`}
                    title={`Question ${idx + 1}`}
                  >
                    {idx + 1}
                  </div>
                );
              })}
            </div>

            {/* Status Legend */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                fontSize: '0.8rem',
                borderTop: '1px solid var(--border-light)',
                paddingTop: '1rem'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <div
                  className="question-chip answered"
                  style={{
                    width: '20px',
                    height: '20px',
                    fontSize: '0.65rem'
                  }}
                >
                  ✓
                </div>

                <span>Answered</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <div
                  className="question-chip marked"
                  style={{
                    width: '20px',
                    height: '20px',
                    fontSize: '0.65rem'
                  }}
                >
                  ★
                </div>

                <span>Marked for Review</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <div
                  className="question-chip unanswered"
                  style={{
                    width: '20px',
                    height: '20px',
                    fontSize: '0.65rem'
                  }}
                >
                  •
                </div>

                <span>Not Answered</span>
              </div>
            </div>
          </div>

          {/* Finish Button */}
          <div
            style={{
              marginTop: '1.5rem'
            }}
          >
            <button
              onClick={() => setShowSubmitModal(true)}
              className="btn btn-success"
              style={{
                width: '100%',
                padding: '0.8rem'
              }}
            >
              <Send size={18} />
              Finish & Submit
            </button>
          </div>
        </div>
      </div>
      {/* Submission Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Examination Confirmation"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowSubmitModal(false)}
              className="btn btn-secondary"
            >
              Continue Examination
            </button>

            <button
              type="button"
              onClick={() => handleFinalSubmit(false)}
              disabled={submitting}
              className="btn btn-success"
            >
              {submitting
                ? 'Submitting...'
                : 'Confirm Submission'}
            </button>
          </>
        }
      >
        <div
          style={{
            textAlign: 'center',
            padding: '1rem 0'
          }}
        >
          <AlertTriangle
            size={48}
            color="var(--accent-warning)"
            style={{
              marginBottom: '1rem'
            }}
          />

          <h3>
            Are you sure you want to submit your
            examination?
          </h3>

          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              margin: '0.5rem 0 1.5rem 0'
            }}
          >
            Once submitted, your answers will be
            automatically evaluated and recorded.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(3, 1fr)',
              gap: '1rem',
              background: '#f8fafc',
              padding: '1rem',
              borderRadius: '10px'
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '800',
                  color: 'var(--accent-success)'
                }}
              >
                {answeredCount}
              </div>

              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)'
                }}
              >
                Answered
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '800',
                  color: 'var(--accent-warning)'
                }}
              >
                {markedCount}
              </div>

              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)'
                }}
              >
                Marked
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '800',
                  color: 'var(--accent-danger)'
                }}
              >
                {unansweredCount}
              </div>

              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)'
                }}
              >
                Unanswered
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ExamPage;