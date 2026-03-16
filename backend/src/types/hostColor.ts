/* Options avaiable when creating a challenge */
export type HostColor = 'white' | 'black' | 'random';

/* The actual color assigned to the host once the game starts */
export type DefinedHostColor = Exclude<HostColor, 'random'>;