const GITHUB_REPO = 'MehranQadirian/prompt-forge';
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
const CHANGES_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/CHANGES.txt`;

export interface UpdateInfo {
  hasUpdate: boolean;
  latestVersion: string;
  downloadUrl: string;
  releaseNotes: string;
}

function parseVersion(tagName: string): string | null {
  const match = tagName.match(/v(\d+)-(\d+)-(\d+)/);
  if (!match) return null;
  return `${match[1]}.${match[2]}.${match[3]}`;
}

function isNewer(latest: string, current: string): boolean {
  const latestParts = latest.split('.').map(Number);
  const currentParts = current.split('.').map(Number);
  return latestParts.some((v, i) => v > (currentParts[i] || 0));
}

async function fetchReleaseNotes(version: string): Promise<string> {
  try {
    const response = await fetch(CHANGES_URL);
    if (!response.ok) return '';
    const text = await response.text();
    const versionHeader = `## v${version}`;
    const versionIndex = text.indexOf(versionHeader);
    if (versionIndex === -1) return '';

    const nextVersionMatch = text.substring(versionIndex + versionHeader.length).match(/\n## v\d/);
    const nextVersionIndex = nextVersionMatch && nextVersionMatch.index !== undefined
      ? versionIndex + versionHeader.length + nextVersionMatch.index
      : text.length;

    return text.substring(versionIndex + versionHeader.length, nextVersionIndex).trim();
  } catch {
    return '';
  }
}

export async function checkForUpdate(currentVersion: string): Promise<UpdateInfo> {
  const defaultResult: UpdateInfo = {
    hasUpdate: false,
    latestVersion: '',
    downloadUrl: '',
    releaseNotes: '',
  };

  try {
    const response = await fetch(GITHUB_API_URL, {
      headers: { Accept: 'application/vnd.github.v3+json' },
    });

    if (!response.ok) return defaultResult;

    const data = await response.json();
    const tagName = data.tag_name || '';
    const version = parseVersion(tagName);

    if (!version || !isNewer(version, currentVersion)) return defaultResult;

    const apkAsset = data.assets?.find((a: any) => a.name?.endsWith('.apk'));
    const downloadUrl = apkAsset?.browser_download_url || '';

    const releaseNotes = await fetchReleaseNotes(version);

    return {
      hasUpdate: true,
      latestVersion: version,
      downloadUrl,
      releaseNotes,
    };
  } catch {
    return defaultResult;
  }
}
