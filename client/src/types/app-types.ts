export type TAvatar = {
  id: number;
  type: string;
  value: string;
};

export type TUser = {
  id: number;
  firstName: string;
  lastName: string;
  about: string | null;
  gameLevel: string | null;
  rating: number;
  balance?: number;
  countryCode: string;
  avatar: TAvatar | null;
};
