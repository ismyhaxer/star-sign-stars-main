import React from 'react';

export const Profile = ({ username }) => {
  const users = JSON.parse(localStorage.getItem('zodiac-users') || '{}');
  const userProfile = users[username];

  if (!userProfile) {
    return <div>No profile found for {username}.</div>;
  }

  return (
    <div>
      <img src={userProfile.avatar} alt="Avatar" style={{ width: 100, height: 100, borderRadius: '50%' }} />
      <p>{userProfile.bio}</p>
      <p>Favorite Sign: {userProfile.favoriteSign}</p>
    </div>
  );
};