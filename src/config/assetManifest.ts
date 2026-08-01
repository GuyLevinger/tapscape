import playerUrl from '@/assets/player.svg';
import groundUrl from '@/assets/ground.svg';
import coinUrl from '@/assets/coin.svg';
import obstacleUrl from '@/assets/obstacle.svg';

export interface ImageAssetDef {
  key: string;
  url: string;
  width?: number;
  height?: number;
}

export const ImageAssets: ImageAssetDef[] = [
  { key: 'player', url: playerUrl, width: 96, height: 128 },
  { key: 'ground', url: groundUrl, width: 128, height: 64 },
  { key: 'coin', url: coinUrl, width: 32, height: 32 },
  { key: 'obstacle', url: obstacleUrl, width: 48, height: 64 },
];
