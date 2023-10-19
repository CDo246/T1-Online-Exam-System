export function generateUniqueCode(digits: number): string {
  const characters = "0123456789";
  let result = "";

  for (let i = 0; i < digits; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return result;
}
