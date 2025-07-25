import React, { useEffect, useState } from 'react';
import UserService from '../services/userService';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    UserService.getProfile()
      .then(response => {
        setProfile(response.data);
      })
      .catch(error => console.error('Ошибка при загрузке профиля', error));
  }, []);

  if (!profile) return <div>Загрузка профиля...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Профиль</h1>
      <p>Имя пользователя: {profile?.userName}</p>
      <p>Email: {profile.email}</p>
      {/* Дополнительные поля профиля */}
    </div>
  );
};

export default ProfilePage;