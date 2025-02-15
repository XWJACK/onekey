import {
  NumberSizeableText,
  SizableText,
  Stack,
  XStack,
} from '@onekeyhq/components';
import type { IStackProps } from '@onekeyhq/components';
import { useSettingsPersistAtom } from '@onekeyhq/kit-bg/src/states/jotai/atoms';

type IPriceLabelProps = {
  price: number | null;
  basePrice: number;
  time: string;
  opacity: IStackProps['opacity'];
};

// function formatMarketValueForFixed(value?: number, fractionDigits?: number) {
//   if (value) {
//     // const resValue = fractionDigits
//     //   ? value.toFixed(fractionDigits).replace(/0+$/g, '')
//     //   : value.toFixed(2).replace(/0+$/g, '');

//     return fractionDigits ? value.toFixed(fractionDigits) : value.toFixed(2);
//   }
//   return '0.00';
// }
// function parseExponential(value?: number) {
//   if (!value) return 0;
//   const e = /\d(?:\.(\d*))?e([+-]\d+)/.exec(value.toExponential());
//   return e
//     ? value.toFixed(Math.max(0, (e[1] || '').length - parseInt(e[2])))
//     : value;
// }

// function formatDecimalZero(value: number) {
//   if (value >= 1) return formatMarketValueForFixed(value);
//   const noRexponentail = parseExponential(value);
//   const effectIndex = noRexponentail.toString().search(/[^-.0]/g);
//   const zeroCount = effectIndex - 2;
//   const fixedValue = formatMarketValueForFixed(value, 3 + zeroCount);
//   if (zeroCount >= 3) {
//     return `0.{${zeroCount}}${fixedValue.toString().substring(effectIndex)}`;
//   }
//   return fixedValue;
// }

// function calculateGains({
//   basePrice,
//   price,
// }: {
//   basePrice?: number;
//   price?: number | string | null;
// }) {
//   let gainTextColor = '$textSubdued';

//   const priceNum = new BigNumber(
//     typeof price === 'string' ? +price : price ?? 0,
//   );

//   const gain = priceNum.minus(basePrice ?? 0);

//   if (priceNum.isNaN() || gain.isNaN()) {
//     return {
//       gain: 0,
//       gainNumber: 0,
//       gainText: '0.00',
//       percentageGain: '0.00%',
//       isPositive: false,
//       gainTextColor,
//     };
//   }
//   const gainNumber = gain.toNumber();
//   const isPositive = gainNumber >= 0;
//   let percentageGain: number | string = basePrice
//     ? gain.dividedBy(basePrice).multipliedBy(100).toNumber()
//     : 0;
//   const gainText = isPositive
//     ? `+${formatDecimalZero(gainNumber)}`
//     : formatDecimalZero(gainNumber);

//   percentageGain = isPositive
//     ? `+${percentageGain.toFixed(2)}%`
//     : `${percentageGain.toFixed(2)}%`;

//   if (!isPositive) {
//     gainTextColor = '$textCritical';
//   } else {
//     gainTextColor = '$textSuccess';
//   }

//   return {
//     gain,
//     gainNumber,
//     gainText,
//     gainTextColor,
//     percentageGain,
//     isPositive,
//   };
// }

export function PriceLabel({
  price,
  // basePrice,
  time,
  opacity,
}: IPriceLabelProps) {
  let displayInfo;
  if (price !== null) {
    // const { gainText, percentageGain, gainTextColor } = calculateGains({
    //   basePrice,
    //   price,
    // });
    displayInfo = (
      <>
        <SizableText
          size="$bodyMd"
          color="$textSubdued"
          $md={{ color: '$text' }}
        >
          {time}
        </SizableText>
        {/* <SizableText size="$bodyMdMedium" color={gainTextColor}>
          {gainText}({percentageGain})
        </SizableText> */}
      </>
    );
  }
  //  else {
  //   displayInfo = (
  //     <SizableText size="$bodyMdMedium" color="$textSubdued" ml={8}>
  //       +0.00(+0.00%)
  //     </SizableText>
  //   );
  // }
  // const { selectedFiatMoneySymbol } = useSettings();

  const [settings] = useSettingsPersistAtom();
  const currency = settings.currencyInfo.symbol;
  return (
    <Stack
      opacity={opacity}
      flexDirection="column"
      $md={{ flexDirection: 'row', pt: '$6' }}
      $gtMd={{ height: '$10' }}
    >
      <XStack>{displayInfo}</XStack>
      <XStack $md={{ ml: '$2' }}>
        <NumberSizeableText
          size="$bodyMd"
          formatter="price"
          formatterOptions={{ currency }}
        >
          {String(price)}
        </NumberSizeableText>
      </XStack>
    </Stack>
  );
}
