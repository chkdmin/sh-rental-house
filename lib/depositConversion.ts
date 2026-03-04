import { Property } from '@/types/property';

export type DepositMode = 'default' | 'min' | 'max';

export interface AdjustedValues {
  deposit: number;
  monthlyRent: number;
}

/**
 * 보증금 전환율에 따라 조정된 보증금/월세를 계산합니다.
 *
 * 공식: totalRentalValue = deposit × depositConversionRate + monthlyRent × 12
 * 이 총액이 일정하므로, 보증금을 바꾸면 월세가 자동 조정됩니다.
 * adjustedMonthlyRent = (totalRentalValue - adjustedDeposit × depositConversionRate) / 12
 */
export function getAdjustedValues(property: Property, mode: DepositMode): AdjustedValues {
  if (mode === 'default') {
    return { deposit: property.deposit, monthlyRent: property.monthlyRent };
  }

  const adjustedDeposit = mode === 'min'
    ? property.minConvertibleDeposit
    : property.maxConvertibleDeposit;

  const totalRentalValue =
    property.deposit * property.depositConversionRate + property.monthlyRent * 12;

  const adjustedMonthlyRent = Math.max(
    0,
    Math.round((totalRentalValue - adjustedDeposit * property.depositConversionRate) / 12)
  );

  return { deposit: adjustedDeposit, monthlyRent: adjustedMonthlyRent };
}
