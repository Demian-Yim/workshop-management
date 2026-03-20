import QRCode from 'qrcode';

const QR_OPTIONS = {
  width: 300,
  margin: 2,
  color: { dark: '#1E293B', light: '#FFFFFF' },
} as const;

/** 세션 코드로 /join?code= URL을 만들어 QR 데이터 URL을 생성 */
export async function generateJoinQrDataUrl(
  code: string,
  origin: string
): Promise<string> {
  const joinUrl = `${origin}/join?code=${code}`;
  return QRCode.toDataURL(joinUrl, QR_OPTIONS);
}

/** 임의의 URL로 QR 데이터 URL을 생성 */
export async function generateQrDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, QR_OPTIONS);
}
