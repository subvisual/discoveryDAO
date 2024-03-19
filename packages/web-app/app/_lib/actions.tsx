import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useIdOS } from '../_providers/idos';
import { PublicInfo } from '../_server/types';

export const useAcquireAccessGrantMutation = () => {
  const { sdk } = useIdOS();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      serverInfo,
    }: {
      id: string;
      serverInfo: PublicInfo;
    }) => {
      if (!sdk) return;

      return sdk.grants.create(
        'credentials',
        id,
        serverInfo.grantee,
        Math.floor(Date.now() / 1000) + serverInfo.lockTimeSpanSeconds,
        serverInfo.encryptionPublicKey,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
      queryClient.invalidateQueries({ queryKey: ['credential-content'] });
      queryClient.invalidateQueries({ queryKey: ['grants'] });
    },
  });
};
