import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Quiz from './Quiz';
import Rules from './Rules';
import * as constants from './Constants';

function App() {
  const [category, setCategory] = useState('');
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [sheetData, setSheetData] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentRowIndex, setCurrentRowIndex] = useState(0); // Current row index
  const [currentSheetKey, setCurrentSheetKey] = useState(''); // Key to track sheets
  const [rowsStatus, setRowsStatus] = useState([]); // Array to track rows status
  const [isRulesPopupOpen, setIsRulesPopupOpen] = useState(false);
  const [fullStats, setFullStats] = useState([]); // Array to store full stats
  const [error, setError] = useState(''); // State to store error message

  const toggleRulesPopup = () => {
    setIsRulesPopupOpen(!isRulesPopupOpen);
  };

  const RulesPopup = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
      <div className="popup-overlay">
        <div className="popup-content">
          <Rules />
          <div className="closeButtonWrapper">
            <button onClick={onClose} className="closeButton">{constants.closeRulesText}</button>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    // Load rowsStatus from localStorage on initial render
    const storedRowsStatus = JSON.parse(localStorage.getItem('rowsStatus')) || [];
    setRowsStatus(storedRowsStatus);
  }, []);

  useEffect(() => {
    if (category) {
      let file;
      switch (category.toLowerCase()) {
        case constants.cat1:
          file = constants.qust_cat1;
          break;
        case constants.cat2:
          file = constants.qust_cat2;
          break;
        case constants.cat3:
          file = constants.qust_cat3;
          break;
        case constants.cat4:
          file = constants.qust_cat4;
          break;
        case constants.cat5:
          file = constants.qust_cat5;
          break;
        default:
          throw new Error('Unknown category');
      }

      fetch(file)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
          }
          return response.arrayBuffer();
        })
        .then(data => {
          const workbook = XLSX.read(data, { type: 'array' });
          setSheetNames(workbook.SheetNames);

          // Populate fullStats array
          const stats = workbook.SheetNames.map((sheetName, index) => {
            const worksheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }).length;
            return { category, sheetIndex: index, rows };
          });
          setFullStats(stats);

          // Check for errors
          const hasError = rowsStatus.some(status => {
            const stat = stats.find(stat => 
              stat.category === status.category && stat.sheetIndex === status.sheetIndex
            );
            return stat && status.row > stat.rows;
          });

          if (hasError) {
            setError('Error: One or more rows in rowsStatus exceed the number of rows in fullStats.');
          } else {
            setError('');
          }
        })
        .catch(error => {
          console.error('Error loading file:', error);
          alert(`Error loading file: ${error.message}`);
        });
    }
  }, [category, rowsStatus]);

  useEffect(() => {
    // Reset selectedSheet and sheetData when category changes
    setSelectedSheet('');
    setSheetData([]);
  }, [category]);

  const handleSheetSelect = (sheetName) => {
    setSelectedSheet(sheetName);
    setCurrentSheetKey(`${category}/${sheetName}`); // Update the key for the current sheet

    let file;
    switch (category.toLowerCase()) {
      case constants.cat1:
        file = constants.qust_cat1;
        break;
      case constants.cat2:
        file = constants.qust_cat2;
        break;
      case constants.cat3:
        file = constants.qust_cat3;
        break;
      case constants.cat4:
        file = constants.qust_cat4;
        break;
      case constants.cat5:
        file = constants.qust_cat5;
        break;
      default:
        throw new Error('Unknown category');
    }

    fetch(file)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        return response.arrayBuffer();
      })
      .then(data => {
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) {
          throw new Error(`Sheet not found in ${file}`);
        }
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Include all rows
        setSheetData(jsonData); // Update the state with the sheet data

        // Update the row index if the sheet has been selected before
        const storedRowIndex = JSON.parse(localStorage.getItem(currentSheetKey));
        setCurrentRowIndex(storedRowIndex || 0);
      })
      .catch(error => {
        console.error('Error loading file:', error);
        alert(`Error loading file: ${error.message}`);
      });
  };

  const startQuiz = () => {
    const sheetIndex = sheetNames.indexOf(selectedSheet);
    const rowStatus = rowsStatus.find(status =>
      status.category === category && status.sheetIndex === sheetIndex
    );
  
    if (rowStatus) {
      setCurrentRowIndex(rowStatus.row); // Set to the correct row index (0-based)
    } else {
      setCurrentRowIndex(0); // Default to row 0 if no status is found
    }
  
    // Update RowsStatus on category and sheet change
    const existingStatusIndex = rowsStatus.findIndex(status =>
      status.category === category && status.sheetIndex === sheetIndex
    );
  
    if (existingStatusIndex !== -1) {
      const updatedRowsStatus = [...rowsStatus];
      updatedRowsStatus[existingStatusIndex] = {
        ...updatedRowsStatus[existingStatusIndex],
        row: updatedRowsStatus[existingStatusIndex].row + 1,
      };
      setRowsStatus(updatedRowsStatus);
      localStorage.setItem('rowsStatus', JSON.stringify(updatedRowsStatus)); // Save updated status to localStorage
    } else {
      const newRowsStatus = [
        ...rowsStatus,
        {
          category,
          sheetIndex,
          row: 1,
        },
      ];
      setRowsStatus(newRowsStatus);
      localStorage.setItem('rowsStatus', JSON.stringify(newRowsStatus)); // Save new status to localStorage
    }
  
    setQuizStarted(true);
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('categoryProgress');
    localStorage.removeItem('rowsStatus'); // Clear rowsStatus from localStorage
    localStorage.clear();
    setRowsStatus([]);
    window.location.reload(true);
  };

  const handleQuizEnd = () => {
    // Save the current row index for the sheet to localStorage
    localStorage.setItem(currentSheetKey, JSON.stringify(currentRowIndex + 1)); // Store the next row index (1-based)
    setQuizStarted(false);
    setCategory('');
    setSelectedSheet(null); // Clear the selected sheet
    setSheetData([]); // Clear the sheet data
  };

  // Compare number of rows from fullStats to rowsStatus and show error if necessary
  useEffect(() => {
    if (category) {
      const hasError = rowsStatus.some(status => {
        const stat = fullStats.find(stat => 
          stat.category === status.category && stat.sheetIndex === status.sheetIndex
        );
        return stat && status.row >= stat.rows;
      });

      if (hasError) {
        setError('Error: One or more rows in rowsStatus exceed the number of rows in fullStats.');
      } else {
        setError('');
      }
    }
  }, [category, rowsStatus, fullStats]);

  return (
    <Router>
      {(!quizStarted && (
        <div className='cat-page-title'>
          {constants.catPageTitle}
        </div>
      )) || (
        <div className='cat-page-title'>
          {category === constants.cat1 ? constants.cat1Trans :
            category === constants.cat2 ? constants.cat2Trans :
              category === constants.cat3 ? constants.cat3Trans :
                category === constants.cat4 ? constants.cat4Trans :
                  category === constants.cat5 ? constants.cat5Trans :
                    category}
        </div>
      )}

      <div className="app-container">
        {!quizStarted && (
          <>
            <div className="category-container">
              {[constants.cat1, constants.cat2, constants.cat3, constants.cat4, constants.cat5].map(cat => (
                <div
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`category-item ${category === cat ? 'selected' : ''}`}
                >
                  <img
                    src={constants.catImage}
                    alt={cat}
                    className="category-image"
                  />
                  <div className="category-label">
                    {cat === constants.cat1 ? constants.cat1Trans :
                      cat === constants.cat2 ? constants.cat2Trans :
                        cat === constants.cat3 ? constants.cat3Trans :
                          cat === constants.cat4 ? constants.cat4Trans :
                            cat === constants.cat5 ? constants.cat5Trans :
                              cat}
                  </div>
                </div>
              ))}
            </div>
            {sheetNames.length > 0 && !error && (
              <div className="sheet-container">
                {sheetNames.map(name => (
                  <div
                    key={name}
                    onClick={() => handleSheetSelect(name)}
                    className={`sheet-item ${selectedSheet === name ? 'selected-sheet' : ''}`}
                  >
                    <img
                      src={name.toLowerCase() === 'easy' ? constants.sheetEasyImage : constants.sheetHardImage}
                      alt={name}
                      className="sheet-image"
                    />
                    <div className="sheet-label">
                      {name === constants.easySheet ? constants.easySheetTrans :
                        name === constants.hardSheet ? constants.hardSheetTrans :
                          name}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {sheetData.length > 0 && !error && (
              <div className="start-quiz-container">
                <button onClick={startQuiz} className="startQuizButton">{constants.StartQuizText}</button>
              </div>
            )}
            <div className="clear-progress-container">
              <button onClick={clearLocalStorage}>{constants.clearProgressText}</button>
            </div>
            <div className="rules-container">
              <button onClick={toggleRulesPopup} className="show-rules-button">{constants.showRulesText}</button>
            </div>
            {error && (
              <div className="error-message">
                {constants.noMoreQuestions} {category === constants.cat1 ? constants.cat1Trans :
            category === constants.cat2 ? constants.cat2Trans :
              category === constants.cat3 ? constants.cat3Trans :
                category === constants.cat4 ? constants.cat4Trans :
                  category === constants.cat5 ? constants.cat5Trans :
                    category} {constants.noMoreQuestions_2}
              </div>
            )}
          </>
        )}
        {quizStarted && (
          <Quiz
            sheetData={sheetData}
            setQuizStarted={setQuizStarted}
            setCategory={setCategory}
            setSelectedSheet={setSelectedSheet}
            setSheetData={setSheetData}
            currentRowIndex={currentRowIndex}
            setCurrentRowIndex={setCurrentRowIndex}
            handleQuizEnd={handleQuizEnd} // Pass the handler to Quiz
            rowsStatus={rowsStatus} // Pass RowsStatus to Quiz
          />
        )}
      </div>
      <Routes>
        <Route
          path="/quiz"
          element={
            <Quiz
              sheetData={sheetData}
              setQuizStarted={setQuizStarted}
              setCategory={setCategory}
              setSelectedSheet={setSelectedSheet}
              setSheetData={setSheetData}
              currentRowIndex={currentRowIndex}
              setCurrentRowIndex={setCurrentRowIndex}
              handleQuizEnd={handleQuizEnd} // Pass the handler to Quiz
              rowsStatus={rowsStatus} // Pass RowsStatus to Quiz
            />
          }
        />
      </Routes>
      <RulesPopup isOpen={isRulesPopupOpen} onClose={toggleRulesPopup} />
    </Router>
  );
}

export default App;