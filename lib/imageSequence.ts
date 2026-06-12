'use client';

export interface ImageSequenceOptions {
  totalFrames: number;
  initialLoad: number;
  basePath: string;
  extension: string;
  onProgress?: (loaded: number, total: number) => void;
  onReady?: () => void;
}

export class ImageSequenceLoader {
  private frames: (HTMLImageElement | null)[];
  private loadedCount: number = 0;
  private loadingPromises: Map<number, Promise<HTMLImageElement>> = new Map();
  private totalFrames: number;
  private basePath: string;
  private extension: string;
  private onProgress?: (loaded: number, total: number) => void;
  private onReady?: () => void;

  constructor(options: ImageSequenceOptions) {
    this.totalFrames = options.totalFrames;
    this.basePath = options.basePath;
    this.extension = options.extension;
    this.onProgress = options.onProgress;
    this.onReady = options.onReady;
    this.frames = new Array(options.totalFrames).fill(null);
  }

  private getFramePath(index: number): string {
    const padded = String(index).padStart(3, '0');
    return `${this.basePath}/frame_${padded}.${this.extension}`;
  }

  private loadImage(index: number): Promise<HTMLImageElement> {
    if (this.frames[index]) {
      return Promise.resolve(this.frames[index]!);
    }

    if (this.loadingPromises.has(index)) {
      return this.loadingPromises.get(index)!;
    }

    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.frames[index] = img;
        this.loadedCount++;
        this.onProgress?.(this.loadedCount, this.totalFrames);
        this.loadingPromises.delete(index);
        resolve(img);
      };
      img.onerror = () => {
        this.loadingPromises.delete(index);
        reject(new Error(`Failed to load frame ${index + 1}`));
      };
      img.src = this.getFramePath(index + 11);
    });

    this.loadingPromises.set(index, promise);
    return promise;
  }

  async preloadInitial(count: number): Promise<void> {
    const promises = Array.from({ length: count }, (_, i) => this.loadImage(i));
    await Promise.all(promises);
    this.onReady?.();
  }

  async preloadAll(): Promise<void> {
    // Load in chunks to avoid overwhelming the browser
    const chunkSize = 10;
    for (let i = 0; i < this.totalFrames; i += chunkSize) {
      const end = Math.min(i + chunkSize, this.totalFrames);
      const promises = Array.from({ length: end - i }, (_, j) => this.loadImage(i + j));
      const results = await Promise.allSettled(promises);
      results.forEach((result, j) => {
        if (result.status === 'rejected') {
          console.warn(`Frame ${i + j + 1} failed to load:`, result.reason);
        }
      });
      // Small delay between chunks to keep UI responsive
      await new Promise(resolve => setTimeout(resolve, 16));
    }
  }

  async loadFrame(index: number): Promise<HTMLImageElement | null> {
    const safeIndex = Math.max(0, Math.min(index, this.totalFrames - 1));
    try {
      return await this.loadImage(safeIndex);
    } catch {
      return this.getNearestLoadedFrame(safeIndex);
    }
  }

  getFrame(index: number): HTMLImageElement | null {
    return this.frames[Math.max(0, Math.min(index, this.totalFrames - 1))];
  }

  private getNearestLoadedFrame(index: number): HTMLImageElement | null {
    const startIndex = Math.max(0, Math.min(index, this.totalFrames - 1));
    if (this.frames[startIndex]) {
      return this.frames[startIndex];
    }

    for (let offset = 1; offset < this.totalFrames; offset += 1) {
      const prev = startIndex - offset;
      const next = startIndex + offset;
      if (prev >= 0 && this.frames[prev]) {
        return this.frames[prev];
      }
      if (next < this.totalFrames && this.frames[next]) {
        return this.frames[next];
      }
    }
    return null;
  }

  drawFrame(canvas: HTMLCanvasElement, frameIndex: number): void {
    const img = this.getNearestLoadedFrame(frameIndex);
    if (!img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const canvasAspect = width / height;

    let drawW = width;
    let drawH = height;
    let offsetX = 0;
    let offsetY = 0;

    if (imgAspect > canvasAspect) {
      drawH = height;
      drawW = height * imgAspect;
      offsetX = (width - drawW) / 2;
    } else {
      drawW = width;
      drawH = width / imgAspect;
      offsetY = (height - drawH) / 2;
    }

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  }

  isFrameLoaded(index: number): boolean {
    return this.frames[index] !== null;
  }

  get progress(): number {
    return this.loadedCount / this.totalFrames;
  }
}
