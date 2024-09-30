import React, { useState, useEffect } from 'react';
import * as constants from './Constants';
import './Quiz.css';

function Quiz({ sheetData, setQuizStarted, setCategory, setSelectedSheet, setSheetData, currentRowIndex }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  const currentQuestionIndex = currentRowIndex;

  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0) {
      setIsAnswerCorrect(false);
      setIsTimerRunning(false); // Stop the timer
    }
  }, [timeLeft, isTimerRunning]);

  useEffect(() => {
    // Reset timer and other state when currentRowIndex changes
    setTimeLeft(constants.timerToAnswer);
    setIsAnswerCorrect(null);
    setSelectedAnswer(null);
    setIsTimerRunning(true);
  }, [currentRowIndex]);

  const handleAnswerSelect = (answer) => {
    const correctAnswer = sheetData[currentQuestionIndex][5];
    setSelectedAnswer(answer);
    setIsAnswerCorrect(answer === correctAnswer);
    setIsTimerRunning(false); // Stop the timer
  };

  const handleBackToCategories = () => {
    setQuizStarted(false);
    setCategory('');
    setSelectedSheet(null); // Clear the selected sheet
    setSheetData([]); // Clear the sheet data
    window.location.reload(true);
  };

  if (!sheetData || !sheetData[currentQuestionIndex]) {
    return (
      <div>
        <div className="question_error">{constants.noMoreQuestions}</div>
        <div className="back-to-categories-error">
          <div className="back-to-categories-container" onClick={handleBackToCategories}>
            <img src={constants.BackImg} alt="Back to Categories" className="back-to-categories-img" />
            <span className="back-to-categories-text">{constants.backToCategories}</span>
          </div>
        </div>
      </div>
    );
  }

  const questionContent = sheetData[currentQuestionIndex][0];
  const isImage = /\.(jpg|jpeg|png|gif)$/i.test(questionContent);
  const imagePath = isImage ? require(`./img/${questionContent}`) : null;
  const additionalText = sheetData[currentQuestionIndex][6];

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div className="quiz-title">
          <img src={constants.QuizTitleImg} alt="Quiz Title" className="quiz-title-img" />
          <div className="quiz-title-text">
          {isImage ? (
            <>
              <div className="additional-text">{additionalText}</div>
              <img src={imagePath} alt="Question" className="question-image" />
            </>
          ) : (
            questionContent
          )}
          </div>
        </div>
        <div className={`timer ${timeLeft <= 10 ? 'warning' : ''}`}>
          {constants.timeLeftText} {timeLeft} {constants.secondsText}
        </div>
      </div>
      {isAnswerCorrect === false && (
        <div className="correct-answer_Wrong">
          {constants.CorrectAnswer_Wrong} {sheetData[currentQuestionIndex][5]}
        </div>
      )}
      {isAnswerCorrect === true && (
        <div className="correct-answer_Right">
          {constants.CorrectAnswer_Right} {sheetData[currentQuestionIndex][5]}
        </div>
      )}      
      <br />
      <div className="answers-container">
        {['B', 'C', 'D', 'E'].map((col, index) => {
          const answer = sheetData[currentQuestionIndex][index + 1];
          const isSelected = selectedAnswer === answer;
          const isCorrect = isSelected && isAnswerCorrect;
          const imgSrc = isSelected && !isCorrect ? constants.WrongAnswerImg : constants.AnswerImg;
          
          return (
            <button
              key={col}
              onClick={() => handleAnswerSelect(answer)}
              className={`answer-button ${isSelected ? (isCorrect ? 'correct' : 'incorrect') : ''}`}
              disabled={selectedAnswer !== null || timeLeft === 0}
            >
              <div className="answer-container">
                <img src={imgSrc} alt={`Answer ${col}`} />
                <span className="answer-text">{answer}</span>
              </div>
            </button>
          );
        })}
      </div>
      <br />
      <br />
      <div className="back-to-categories-container" onClick={handleBackToCategories}>
        <img src={constants.BackImg} alt="Back to Categories" className="back-to-categories-img" />
        <span className="back-to-categories-text">{constants.backToCategories}</span>
      </div>
    </div>
  );
}

export default Quiz;
