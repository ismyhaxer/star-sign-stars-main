import { useState } from 'react';

export const ProfileForm = ({ username, onSave }) => {
  const [avatar, setAvatar] = useState('');
  const [bio, setBio] = useState('');
  const [favoriteSign, setFavoriteSign] = useState('');

  return (
    <form onSubmit={e => { e.preventDefault(); onSave({ avatar, bio, favoriteSign }); }}>
      <label>
        Avatar URL:
        <input value={avatar} onChange={e => setAvatar(e.target.value)} />
      </label>
      <label>
        Bio:
        <input value={bio} onChange={e => setBio(e.target.value)} />
      </label>
      <label>
        Favorite Zodiac Sign:
        <input value={favoriteSign} onChange={e => setFavoriteSign(e.target.value)} />
      </label>
      <button type="submit">Save Profile</button>
    </form>
  );
};