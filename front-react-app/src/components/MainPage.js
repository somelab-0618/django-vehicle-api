import React from 'react';
import { useHistory } from 'react-router-dom';

const MainPage = () => {
  const history = useHistory();

  const Logout = () => {
    localStorage.removeItem('token');
    history.push('/');
  };
  return (
    <div>
      <button data-testid='btn-logout' onClick={Logout}>
        Logout
      </button>
    </div>
  );
};

export default MainPage;
