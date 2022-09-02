import * as bcrypt from 'bcryptjs';

export const hashEmail = async (email: string) => {
  const parts = email.split('@');
  return await bcrypt.hash(parts[0], 5);
};
