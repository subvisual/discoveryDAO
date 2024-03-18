import { getPublicInfo } from '@/app/_server/idos';
import { Info } from './info';

export async function InfoWithServerDetails() {
  const serverInfo = await getPublicInfo();

  return <Info serverInfo={serverInfo} />;
}
