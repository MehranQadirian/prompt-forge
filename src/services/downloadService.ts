import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_DOWNLOAD_STATE = '@promptforge_download_state';

export type DownloadStatus = 'idle' | 'downloading' | 'downloaded' | 'installing' | 'error';

export interface DownloadState {
  status: DownloadStatus;
  progress: number;
  version: string;
  downloadUrl: string;
  filePath: string | null;
  error: string | null;
}

type ProgressCallback = (progress: number) => void;
type StatusCallback = (status: DownloadStatus) => void;
type CompleteCallback = (filePath: string) => void;

const DEFAULT_STATE: DownloadState = {
  status: 'idle',
  progress: 0,
  version: '',
  downloadUrl: '',
  filePath: null,
  error: null,
};

class DownloadService {
  private state: DownloadState = { ...DEFAULT_STATE };
  private downloadResumable: FileSystem.DownloadResumable | null = null;
  private progressCallbacks: Set<ProgressCallback> = new Set();
  private statusCallbacks: Set<StatusCallback> = new Set();
  private completeCallbacks: Set<CompleteCallback> = new Set();

  constructor() {
    this.restoreState();
  }

  private async restoreState() {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY_DOWNLOAD_STATE);
      if (saved) {
        const parsed = JSON.parse(saved) as DownloadState;
        if (parsed.status === 'downloading') {
          parsed.status = 'error';
          parsed.error = 'Download interrupted. Please try again.';
        }
        this.state = parsed;
      }
    } catch {
      // Ignore restore errors
    }
  }

  private async saveState() {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_DOWNLOAD_STATE, JSON.stringify(this.state));
    } catch {
      // Ignore save errors
    }
  }

  private notifyProgress(progress: number) {
    this.progressCallbacks.forEach((cb) => cb(progress));
  }

  private notifyStatus(status: DownloadStatus) {
    this.statusCallbacks.forEach((cb) => cb(status));
  }

  private notifyComplete(filePath: string) {
    this.completeCallbacks.forEach((cb) => cb(filePath));
  }

  onProgress(callback: ProgressCallback): () => void {
    this.progressCallbacks.add(callback);
    return () => this.progressCallbacks.delete(callback);
  }

  onStatusChange(callback: StatusCallback): () => void {
    this.statusCallbacks.add(callback);
    return () => this.statusCallbacks.delete(callback);
  }

  onComplete(callback: CompleteCallback): () => void {
    this.completeCallbacks.add(callback);
    return () => this.completeCallbacks.delete(callback);
  }

  getState(): DownloadState {
    return { ...this.state };
  }

  async startDownload(downloadUrl: string, version: string): Promise<void> {
    if (this.downloadResumable) {
      this.downloadResumable.cancelAsync();
      this.downloadResumable = null;
    }

    await this.deleteDownloadedFile();

    const filePath = (FileSystem.documentDirectory || '') + `prompt-forge-v${version}.apk`;

    this.state = {
      status: 'downloading',
      progress: 0,
      version,
      downloadUrl,
      filePath,
      error: null,
    };
    await this.saveState();
    this.notifyStatus('downloading');
    this.notifyProgress(0);

    try {
      this.downloadResumable = FileSystem.createDownloadResumable(
        downloadUrl,
        filePath,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          this.state.progress = progress;
          this.notifyProgress(progress);
        }
      );

      const result = await this.downloadResumable.downloadAsync();

      if (result && result.uri) {
        this.state.status = 'downloaded';
        this.state.progress = 1;
        this.state.filePath = result.uri;
        await this.saveState();
        this.notifyStatus('downloaded');
        this.notifyComplete(result.uri);
      } else {
        throw new Error('Download failed');
      }
    } catch (error: any) {
      if (error?.message !== 'Download canceled') {
        this.state.status = 'error';
        this.state.error = 'Download failed. Please try again.';
        await this.saveState();
        this.notifyStatus('error');
      }
    } finally {
      this.downloadResumable = null;
    }
  }

  async cancelDownload(): Promise<void> {
    if (this.downloadResumable) {
      this.downloadResumable.cancelAsync();
      this.downloadResumable = null;
    }

    this.state = { ...DEFAULT_STATE };
    await this.saveState();
    this.notifyStatus('idle');
    this.notifyProgress(0);
  }

  async installUpdate(): Promise<void> {
    if (!this.state.filePath || this.state.status !== 'downloaded') return;

    this.state.status = 'installing';
    this.notifyStatus('installing');

    try {
      if (Platform.OS === 'android') {
        const contentUri = await FileSystem.getContentUriAsync(this.state.filePath);
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: contentUri,
          flags: 3,
          type: 'application/vnd.android.package-archive',
        });
        await this.cleanupAfterInstall();
      } else {
        await Sharing.shareAsync(this.state.filePath);
        await this.cleanupAfterInstall();
      }
    } catch (error) {
      console.error('Install failed:', error);
      try {
        await Sharing.shareAsync(this.state.filePath);
        this.state.status = 'downloaded';
        this.notifyStatus('downloaded');
      } catch {
        this.state.status = 'error';
        this.state.error = 'Installation failed. Please install manually.';
        await this.saveState();
        this.notifyStatus('error');
      }
    }
  }

  async deleteDownloadedFile(): Promise<void> {
    if (this.state.filePath) {
      try {
        const info = await FileSystem.getInfoAsync(this.state.filePath);
        if (info.exists) {
          await FileSystem.deleteAsync(this.state.filePath);
        }
      } catch {
        // Ignore delete errors
      }
    }
  }

  private async cleanupAfterInstall(): Promise<void> {
    await this.deleteDownloadedFile();
    this.state = { ...DEFAULT_STATE };
    await this.saveState();
    this.notifyStatus('idle');
  }
}

export const downloadService = new DownloadService();
