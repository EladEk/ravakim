import React, { useState, useEffect } from 'react';

function QuizComponent({ sheetData, currentQuestionIndex, handleAnswerSelect, selectedAnswer, isAnswerCorrect, timeLeft, handleBackToCategories }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <h2>{sheetData[currentQuestionIndex][0]}</h2>
      <div>
        {['B', 'C', 'D', 'E'].map((col, index) => {
          const answer = sheetData[currentQuestionIndex][index + 1];
          return (
            <button
              key={col}
              onClick={() => handleAnswerSelect(answer)}
              style={{
                backgroundColor: selectedAnswer === answer
                  ? isAnswerCorrect
                    ? 'green'
                    : 'red'
                  : 'initial',
                color: selectedAnswer === answer ? 'white' : 'initial'
              }}
            >
              {answer}
            </button>
          );
        })}
      </div>
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <h3 style={{ color: timeLeft <= 10 ? 'red' : 'initial' }}>Time Left: {timeLeft} seconds</h3>
      </div>
      {isAnswerCorrect === false && (
        <div style={{ backgroundColor: 'orange', padding: '10px', marginTop: '10px' }}>
          Correct Answer: {sheetData[currentQuestionIndex][5]}
        </div>
      )}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button onClick={handleBackToCategories}>
          Back to Categories
        </button>
      </div>
    </div>
  );
}

export default QuizComponent;