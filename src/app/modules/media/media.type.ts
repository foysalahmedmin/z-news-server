export type TMedia = {
  type: 'image' | 'video' | 'audio' | 'file';
  filename: string;
  path: string;
  url: string;
  size: number;
  mimetype: string;
};
