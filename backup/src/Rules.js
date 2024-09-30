import React from 'react';
import * as constants from './Constants'
import './Rules.css';
const RulesPage = () => {
  return (
    <div>
      <div>
        <h1 className='rules-rtl'>{constants.RulesPageTitle}</h1>
        <p className='rules-rtl'>1. כל אחד בתורו בוחר קטגוריה</p>
        <p className='rules-rtl'>2. שאר השחקנים מצביעים באופן חשאי ידע או לא ידע</p>
        <p className='rules-rtl'>3. במידה ויותר הצביעו ידע הוא יקבל שאלה קשה</p>
        <p className='rules-rtl'>4. במידה ויותר הצביעו לא ידע הוא יקבל שאלה קלה</p>
        <p className='rules-rtl'>5. במקרה של תיקו יקבל שאלה קשה</p>
        <p className='rules-rtl'>6. במידה והמתמודד ידע את התשובה כל מי שהצביע "לא ידע" שותה</p>
        <p className='rules-rtl'>7. במידה והמתמודד לא ידע את התשובה כל מי שהצביע "ידע" שותה כולל המתמודד</p>
        <p className='rules-rtl'>8. מי שכבר שתה לפחות 3 פעמים יכול להמיר שתיה לדלי על הראש או קפיצה לבריכה</p>
      </div>
    </div>
  );
};

export default RulesPage;