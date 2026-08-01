import playerUrl from '@/assets/player.svg';
import groundUrl from '@/assets/ground.svg';
import coinUrl from '@/assets/coin.svg';
import obstacleUrl from '@/assets/obstacle.svg';
import jumpSfxUrl from '@/audio/sfx_jump.wav';
import coinSfxUrl from '@/audio/sfx_coin.wav';
import hitSfxUrl from '@/audio/sfx_hit.wav';
import musicUrl from '@/audio/music_theme.wav';

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

export interface AudioAssetDef {
  key: string;
  url: string;
}

export const AudioAssets: AudioAssetDef[] = [
  { key: 'sfx_jump', url: jumpSfxUrl },
  { key: 'sfx_coin', url: coinSfxUrl },
  { key: 'sfx_hit', url: hitSfxUrl },
  { key: 'music_theme', url: musicUrl },
];
