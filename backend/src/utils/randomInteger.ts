/**
 * 
 * @param min Minimum integer that can be generated (included)
 * @param max Maximum integer that can be generated (included)
 * @returns The random integer generated
 */
export function getRandomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}