import { UNIQUE_CODE_LENGTH, RANDOM_NUMBER_LENGTH } from "../configs/app.constant";

export const generateUniqueCode = () => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  const current = new Date();

  let result = '';
  result += characters.charAt(
    Math.trunc(current.getFullYear() / charactersLength),
  );
  result += characters.charAt(current.getFullYear() % charactersLength);
  result += characters.charAt(current.getMonth());
  result += characters.charAt(current.getDate());
  result += characters.charAt(current.getHours());
  result += characters.charAt(current.getMinutes());
  result += characters.charAt(current.getSeconds());
  result += characters.charAt(
    Math.trunc(current.getMilliseconds() / charactersLength),
  );
  result += characters.charAt(current.getMilliseconds() % charactersLength);
  for (let i = 0; i < UNIQUE_CODE_LENGTH; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

export const generateNumber = (max: number = RANDOM_NUMBER_LENGTH) => {
  return Math.floor(Math.random() * max).toString();
}

export const slugGenerator = (title: string) => {
  return `${title.replaceAll(' ', '-')}-${generateNumber()}`
}
