import { AuthenticationType } from 'expo-local-authentication';

import platformEnv from '@onekeyhq/shared/src/platformEnv';

import { ETranslations } from '../locale';
import {
  getDefaultLocale,
  getLocaleMessages,
} from '../locale/getDefaultLocale';
import { memoizee } from '../utils/cacheUtils';

import type { IBiologyAuth } from './types';
import type { LocalAuthenticationResult } from 'expo-local-authentication';

const isSupportBiologyAuthFn = () =>
  new Promise<boolean>((resolve) => {
    const result = platformEnv.isE2E
      ? false
      : globalThis?.desktopApi?.canPromptTouchID();
    resolve(!!result);
  });

export const isSupportBiologyAuth = memoizee(isSupportBiologyAuthFn, {
  promise: true,
});

const getBiologyAuthTypeFn: () => Promise<AuthenticationType[]> = () =>
  Promise.resolve([AuthenticationType.FINGERPRINT]);

export const getBiologyAuthType = memoizee(getBiologyAuthTypeFn, {
  promise: true,
});

export const biologyAuthenticate: () => Promise<LocalAuthenticationResult> =
  async () => {
    const supported = await isSupportBiologyAuth();
    if (!supported) {
      return {
        success: false,
        error: 'biologyAuthenticate no supported',
      };
    }

    try {
      // The prompt text for Electron's touch id uses the system default language,
      //  so it needs the corresponding text in the system default language.
      const locale = getDefaultLocale();
      const messages = await getLocaleMessages(locale);
      const result = await globalThis?.desktopApi?.promptTouchID(
        messages[ETranslations.global_unlock],
      );
      return result.success
        ? { success: true }
        : {
            success: false,
            error: result.error || 'biologyAuthenticate failed',
          };
    } catch (e: any) {
      return {
        success: false,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        error: e?.message || 'biologyAuthenticate failed',
      };
    }
  };

const biologyAuth: IBiologyAuth = {
  isSupportBiologyAuth,
  biologyAuthenticate,
  getBiologyAuthType,
};
export default biologyAuth;
