import { useAccountSelectorContextData } from '@onekeyhq/kit/src/states/jotai/contexts/accountSelector';
import type {
  IDBAccount,
  IDBIndexedAccount,
} from '@onekeyhq/kit-bg/src/dbs/local/types';

import { WalletOptionItem } from '../../pages/AccountSelectorStack/WalletDetails/WalletOptions/WalletOptionItem';
import { showAccountRemoveDialog } from '../AccountEdit/AccountRemoveButton';

export function AccountRemoveButton({
  accountsCount,
  indexedAccount,
  account,
}: {
  accountsCount: number;
  indexedAccount?: IDBIndexedAccount;
  account?: IDBAccount;
}) {
  const { config } = useAccountSelectorContextData();
  return (
    <WalletOptionItem
      icon="DeleteOutline"
      label="Remove"
      onPress={() => {
        showAccountRemoveDialog({
          accountsCount,
          config,
          title: 'Remove Account 1',
          description: 'This account will be removed.',
          account,
          indexedAccount,
        });
      }}
    />
  );
}
