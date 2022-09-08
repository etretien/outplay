import { FaHouseUser, FaUserFriends, FaFlagCheckered } from 'react-icons/fa';

export const INNER_MENU = [
  { to: 'profile', text: 'Profile', icon: <FaHouseUser /> },
  { to: 'players', text: 'Players', icon: <FaUserFriends /> },
];

export const INNER_MENU_PROFILE = [
  { to: 'profile', text: 'Profile', icon: <FaHouseUser /> },
  { to: 'challenges', text: 'My Challenges', icon: <FaFlagCheckered /> },
  { to: 'players', text: 'Players', icon: <FaUserFriends /> },
];

export const REFRESH_TOKEN_NAME = 'outplay_refresh_token';
export const USER_EMAIL_NAME = 'outplay_user_email';
