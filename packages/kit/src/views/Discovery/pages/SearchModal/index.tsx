import { useCallback, useEffect, useRef, useState } from 'react';

import { useFocusEffect, useRoute } from '@react-navigation/core';
import { useIntl } from 'react-intl';
import { Keyboard, StyleSheet } from 'react-native';

import {
  Icon,
  Image,
  Page,
  RichSizeableText,
  ScrollView,
  SearchBar,
  SizableText,
  Skeleton,
  Stack,
  XStack,
  useMedia,
} from '@onekeyhq/components';
import backgroundApiProxy from '@onekeyhq/kit/src/background/instance/backgroundApiProxy';
import { ListItem } from '@onekeyhq/kit/src/components/ListItem';
import useAppNavigation from '@onekeyhq/kit/src/hooks/useAppNavigation';
import { usePromiseResult } from '@onekeyhq/kit/src/hooks/usePromiseResult';
import { useBrowserAction } from '@onekeyhq/kit/src/states/jotai/contexts/discovery';
import { ETranslations } from '@onekeyhq/shared/src/locale';
import { defaultLogger } from '@onekeyhq/shared/src/logger/logger';
import { EEnterMethod } from '@onekeyhq/shared/src/logger/scopes/discovery/scenes/dapp';
import type { IDiscoveryModalParamList } from '@onekeyhq/shared/src/routes';
import {
  EDiscoveryModalRoutes,
  EModalRoutes,
} from '@onekeyhq/shared/src/routes';
import type { IDApp } from '@onekeyhq/shared/types/discovery';

import { DiscoveryIcon } from '../../components/DiscoveryIcon';
import { withBrowserProvider } from '../Browser/WithBrowserProvider';

import { DappSearchModalSectionHeader } from './DappSearchModalSectionHeader';

import type { RouteProp } from '@react-navigation/core';

const SEARCH_ITEM_ID = 'SEARCH_ITEM_ID';

const LoadingSkeleton = (
  <Image.Loading>
    <Skeleton width="100%" height="100%" />
  </Image.Loading>
);

function SearchModal() {
  const intl = useIntl();
  const navigation = useAppNavigation();
  const route =
    useRoute<
      RouteProp<IDiscoveryModalParamList, EDiscoveryModalRoutes.SearchModal>
    >();
  const { useCurrentWindow, tabId, url = '' } = route.params ?? {};

  const [searchValue, setSearchValue] = useState(url);
  const { gtMd } = useMedia();
  const { handleOpenWebSite } = useBrowserAction().current;

  const { serviceDiscovery } = backgroundApiProxy;
  const { result: localData, run: refreshLocalData } =
    usePromiseResult(async () => {
      const bookmarkData = await serviceDiscovery.getBookmarkData({
        generateIcon: true,
        sliceCount: 8,
      });
      const historyData = await serviceDiscovery.getHistoryData({
        generateIcon: true,
        sliceCount: 8,
        keyword: searchValue ?? undefined,
      });
      return {
        bookmarkData,
        historyData,
      };
    }, [serviceDiscovery, searchValue]);

  const { result: searchResult } = usePromiseResult(async () => {
    const res = await serviceDiscovery.searchDApp(searchValue);
    return res;
  }, [searchValue, serviceDiscovery]);

  const jumpPageRef = useRef(false);
  useFocusEffect(() => {
    if (jumpPageRef.current) {
      setTimeout(() => {
        void refreshLocalData();
      }, 300);
      jumpPageRef.current = false;
    }
  });

  const [searchList, setSearchList] = useState<IDApp[]>([]);

  useEffect(() => {
    void (async () => {
      if (!searchValue) {
        setSearchList([]);
        return;
      }
      const logo = 'https://uni.onekey-asset.com/static/logo/google.png';
      setSearchList([
        {
          dappId: SEARCH_ITEM_ID,
          name: `${intl.formatMessage({
            id: ETranslations.explore_search_placeholder,
          })} "${searchValue}"`,
          url: '',
          logo,
        } as IDApp,
        ...(searchResult ?? []),
      ]);
    })();
  }, [searchValue, searchResult, intl]);

  const displaySearchList = Array.isArray(searchList) && searchList.length > 0;
  const displayBookmarkList =
    (localData?.bookmarkData ?? []).length > 0 && !displaySearchList;
  const displayHistoryList = (localData?.historyData ?? []).length > 0;

  const renderList = useCallback(
    (list: IDApp[]) =>
      list.map((item, index) => (
        <ListItem
          key={index}
          avatarProps={{
            src: item.logo || item.originLogo,
            loading: LoadingSkeleton,
            fallbackProps: {
              bg: '$bgStrong',
              justifyContent: 'center',
              alignItems: 'center',
              children: <Icon name="GlobusOutline" />,
            },
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: '$borderSubdued',
          }}
          renderItemText={() => (
            <RichSizeableText
              linkList={{ a: { url: undefined, cursor: 'auto' } }}
              numberOfLines={1}
              size="$bodyLgMedium"
              flex={1}
            >
              {item?.keyword
                ? item.name.replace(
                    new RegExp(item.keyword, 'ig'),
                    `<a>${item.keyword}</a>`,
                  )
                : item.name}
            </RichSizeableText>
          )}
          subtitleProps={{
            numberOfLines: 1,
          }}
          onPress={() => {
            if (item.dappId === SEARCH_ITEM_ID) {
              handleOpenWebSite({
                switchToMultiTabBrowser: gtMd,
                navigation,
                useCurrentWindow,
                tabId,
                webSite: {
                  url: searchValue,
                  title: searchValue,
                },
              });
              defaultLogger.discovery.dapp.enterDapp({
                dappDomain: searchValue,
                dappName: searchValue,
                enterMethod: EEnterMethod.search,
              });
            } else {
              handleOpenWebSite({
                switchToMultiTabBrowser: gtMd,
                navigation,
                useCurrentWindow,
                tabId,
                dApp: item,
              });
              defaultLogger.discovery.dapp.enterDapp({
                dappDomain: item.name,
                dappName: item.url,
                enterMethod: EEnterMethod.search,
              });
            }
          }}
          testID={`dapp-search${index}`}
        />
      )),
    [gtMd, handleOpenWebSite, navigation, searchValue, tabId, useCurrentWindow],
  );

  return (
    <Page safeAreaEnabled>
      <Page.Header
        headerTitle={intl.formatMessage({
          id: ETranslations.explore_search_placeholder,
        })}
      />
      <Page.Body>
        <Stack mx="$4">
          <SearchBar
            autoFocus
            zIndex={20}
            selectTextOnFocus
            value={searchValue}
            onSearchTextChange={setSearchValue}
            placeholder={intl.formatMessage({
              id: ETranslations.browser_search_dapp_or_enter_url,
            })}
            onSubmitEditing={() => {
              if (!searchValue) {
                navigation.pop();
              } else {
                handleOpenWebSite({
                  switchToMultiTabBrowser: gtMd,
                  navigation,
                  useCurrentWindow,
                  tabId,
                  webSite: {
                    url: searchValue,
                    title: searchValue,
                  },
                });

                defaultLogger.discovery.dapp.enterDapp({
                  dappDomain: searchValue,
                  dappName: searchValue,
                  enterMethod: EEnterMethod.addressBar,
                });
              }
            }}
          />
        </Stack>
        <ScrollView
          pt="$2"
          pb="$5"
          keyboardDismissMode="none"
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={Keyboard.dismiss}
        >
          {displaySearchList ? renderList(searchList) : null}

          {displayBookmarkList ? (
            <Stack>
              <DappSearchModalSectionHeader
                title={intl.formatMessage({
                  id: ETranslations.explore_bookmarks,
                })}
                onMorePress={() => {
                  jumpPageRef.current = true;
                  navigation.pushModal(EModalRoutes.DiscoveryModal, {
                    screen: EDiscoveryModalRoutes.BookmarkListModal,
                  });
                }}
              />
              <XStack>
                {localData?.bookmarkData?.map((item, index) => (
                  <Stack
                    key={index}
                    flexBasis="25%"
                    alignItems="center"
                    py="$2"
                    $gtMd={{
                      flexBasis: '16.66666667%',
                    }}
                    onPress={() => {
                      handleOpenWebSite({
                        switchToMultiTabBrowser: gtMd,
                        navigation,
                        useCurrentWindow,
                        tabId,
                        webSite: {
                          url: item.url,
                          title: item.title,
                        },
                      });

                      defaultLogger.discovery.dapp.enterDapp({
                        dappDomain: item.url,
                        dappName: item.title,
                        enterMethod: EEnterMethod.bookmarkInSearch,
                      });
                    }}
                  >
                    <DiscoveryIcon
                      uri={item.logo}
                      size="$14"
                      borderRadius="$3"
                    />
                    <SizableText
                      mt="$2"
                      px="$2"
                      size="$bodyLgMedium"
                      textAlign="center"
                      $gtMd={{
                        size: '$bodyMdMedium',
                      }}
                      numberOfLines={1}
                    >
                      {item.title}
                    </SizableText>
                  </Stack>
                ))}
              </XStack>
            </Stack>
          ) : null}
          {displayHistoryList ? (
            <Stack pt="$5">
              <DappSearchModalSectionHeader
                title={intl.formatMessage({
                  id: ETranslations.explore_history,
                })}
                onMorePress={() => {
                  jumpPageRef.current = true;
                  navigation.pushModal(EModalRoutes.DiscoveryModal, {
                    screen: EDiscoveryModalRoutes.HistoryListModal,
                  });
                }}
              />
              {localData?.historyData.map((item, index) => (
                <ListItem
                  key={index}
                  avatarProps={{
                    src: item.logo,
                    loading: LoadingSkeleton,
                    fallbackProps: {
                      bg: '$bgStrong',
                      justifyContent: 'center',
                      alignItems: 'center',
                      children: <Icon name="GlobusOutline" />,
                    },
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: '$borderSubdued',
                  }}
                  title={item.title}
                  titleMatch={item.titleMatch}
                  titleProps={{
                    numberOfLines: 1,
                  }}
                  subtitle={item.url}
                  subTitleMatch={item.urlMatch}
                  subtitleProps={{
                    numberOfLines: 1,
                  }}
                  testID={`search-modal-${item.title.toLowerCase()}`}
                  onPress={() => {
                    handleOpenWebSite({
                      switchToMultiTabBrowser: gtMd,
                      navigation,
                      useCurrentWindow,
                      tabId,
                      webSite: {
                        url: item.url,
                        title: item.title,
                      },
                    });

                    defaultLogger.discovery.dapp.enterDapp({
                      dappDomain: item.url,
                      dappName: item.title,
                      enterMethod: EEnterMethod.historyInSearch,
                    });
                  }}
                />
              ))}
            </Stack>
          ) : null}
        </ScrollView>
      </Page.Body>
    </Page>
  );
}

export default withBrowserProvider(SearchModal);
