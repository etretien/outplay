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

export type TChallenge = {
  id: number;
  event: {
    id: number;
    name: string;
  };
  creator: TUser;
};

export type TEvent = {
  creator: TUser;
  endDate: string | null;
  id: number;
  name: string;
  participants: (TUser & { challenge: TChallenge & { status: string } })[];
  winners: TUser[];
  startDate: string | null;
  status: string;
  timestamp: string;
};
