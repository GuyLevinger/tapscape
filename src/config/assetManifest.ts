import playerUrl from '@/assets/player.svg';
import groundUrl from '@/assets/ground.svg';
import coinUrl from '@/assets/coin.svg';
import obstacleUrl from '@/assets/obstacle.svg';
import powerupUrl from '@/assets/powerup.svg';
import legbookObstacleUrl from '@/assets/legbook_obstacle.svg';
import legbookCoinUrl from '@/assets/legbook_coin.svg';
import legbookPowerupUrl from '@/assets/legbook_powerup.svg';
import slowgramObstacleUrl from '@/assets/slowgram_obstacle.svg';
import slowgramCoinUrl from '@/assets/slowgram_coin.svg';
import slowgramPowerupUrl from '@/assets/slowgram_powerup.svg';
import chatzapObstacleUrl from '@/assets/chatzap_obstacle.svg';
import chatzapCoinUrl from '@/assets/chatzap_coin.svg';
import chatzapPowerupUrl from '@/assets/chatzap_powerup.svg';
import metubeObstacleUrl from '@/assets/metube_obstacle.svg';
import metubeCoinUrl from '@/assets/metube_coin.svg';
import metubePowerupUrl from '@/assets/metube_powerup.svg';
import wrongturnObstacleUrl from '@/assets/wrongturn_obstacle.svg';
import wrongturnCoinUrl from '@/assets/wrongturn_coin.svg';
import wrongturnPowerupUrl from '@/assets/wrongturn_powerup.svg';
import wrongturnSignUrl from '@/assets/wrongturn_sign.svg';
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
  { key: 'powerup', url: powerupUrl, width: 36, height: 36 },
  { key: 'legbook_obstacle', url: legbookObstacleUrl, width: 48, height: 64 },
  { key: 'legbook_coin', url: legbookCoinUrl, width: 32, height: 32 },
  { key: 'legbook_powerup', url: legbookPowerupUrl, width: 36, height: 36 },
  { key: 'slowgram_obstacle', url: slowgramObstacleUrl, width: 48, height: 64 },
  { key: 'slowgram_coin', url: slowgramCoinUrl, width: 32, height: 32 },
  { key: 'slowgram_powerup', url: slowgramPowerupUrl, width: 36, height: 36 },
  { key: 'chatzap_obstacle', url: chatzapObstacleUrl, width: 48, height: 64 },
  { key: 'chatzap_coin', url: chatzapCoinUrl, width: 32, height: 32 },
  { key: 'chatzap_powerup', url: chatzapPowerupUrl, width: 36, height: 36 },
  { key: 'metube_obstacle', url: metubeObstacleUrl, width: 48, height: 64 },
  { key: 'metube_coin', url: metubeCoinUrl, width: 32, height: 32 },
  { key: 'metube_powerup', url: metubePowerupUrl, width: 36, height: 36 },
  { key: 'wrongturn_obstacle', url: wrongturnObstacleUrl, width: 48, height: 64 },
  { key: 'wrongturn_coin', url: wrongturnCoinUrl, width: 32, height: 32 },
  { key: 'wrongturn_powerup', url: wrongturnPowerupUrl, width: 36, height: 36 },
  { key: 'wrongturn_sign', url: wrongturnSignUrl, width: 80, height: 80 },
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
