import coreChainApi from '@onekeyhq/core/src/instance/coreChainApi';

import { KeyringHardwareBtcBase } from '../btc/KeyringHardwareBtcBase';

import type {
  IBuildHwAllNetworkPrepareAccountsParams,
  IHwSdkNetwork,
} from '../../types';
import type { AllNetworkAddressParams } from '@onekeyfe/hd-core';

export class KeyringHardware extends KeyringHardwareBtcBase {
  override coreApi = coreChainApi.ltc.hd;

  override hwSdkNetwork: IHwSdkNetwork = 'ltc';

  override async buildHwAllNetworkPrepareAccountsParams({
    template,
    index,
  }: IBuildHwAllNetworkPrepareAccountsParams): Promise<
    AllNetworkAddressParams | undefined
  > {
    return {
      network: this.hwSdkNetwork,
      path: this.buildPrepareAccountsPrefixedPath({ template, index }),
      showOnOneKey: false,
    };
  }
}
