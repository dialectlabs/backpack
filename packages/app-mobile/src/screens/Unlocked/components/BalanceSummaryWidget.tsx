import { StyleSheet, Text, View } from "react-native";
import { Margin } from "@components";
import { formatUSD } from "@coral-xyz/common";
import {
  totalBalance as totalBalanceSelector,
  useLoader,
} from "@coral-xyz/recoil";
import { HOVER_OPACITY } from "@coral-xyz/themes";
import { useTheme } from "@hooks";

function TextTotalChange({ totalChange }) {
  const theme = useTheme();
  const color =
    totalChange === 0
      ? theme.custom.colors.neutral
      : totalChange < 0
      ? theme.custom.colors.negative
      : theme.custom.colors.positive;

  return (
    <Text style={[styles.totalChangeText, { color }]}>
      {formatUSD(totalChange)}
    </Text>
  );
}

function TextPercentChange({ isLoading, totalChange, percentChange }) {
  const theme = useTheme();
  const color =
    totalChange === 0
      ? theme.custom.colors.neutral
      : totalChange < 0
      ? theme.custom.colors.negative
      : theme.custom.colors.positive;

  const backgroundColor = isLoading
    ? undefined
    : totalChange === 0
    ? theme.custom.colors.balanceChangeNeutral
    : totalChange < 0
    ? theme.custom.colors.balanceChangeNegative
    : theme.custom.colors.balanceChangePositive;

  return (
    <Text style={[styles.percentChangeText, { backgroundColor, color }]}>
      {totalChange > 0 ? "+" : ""}
      {Number.isFinite(percentChange)
        ? `${percentChange.toFixed(2)}%`
        : "0.00%"}
    </Text>
  );
}

export function BalanceSummaryWidget() {
  const theme = useTheme();
  const [{ totalBalance, totalChange, percentChange }, _, isLoading] =
    useLoader(totalBalanceSelector, {
      totalBalance: 0,
      totalChange: 0,
      percentChange: 0,
    });

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.totalBalanceText,
          { color: theme.custom.colors.fontColor },
        ]}
      >
        {formatUSD(totalBalance)}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Margin right={12}>
          <TextTotalChange totalChange={totalChange} />
        </Margin>
        <TextPercentChange
          isLoading={isLoading}
          totalChange={totalChange}
          percentChange={percentChange}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  totalBalanceText: {
    fontWeight: "600",
    fontSize: 40,
  },
  totalChangeText: {
    fontSize: 12,
    lineHeight: 24,
    paddingVeritcal: 12,
  },
  percentChangeText: {
    fontSize: 12,
    lineHeight: 24,
    borderRadius: 28,
    paddingHorizontal: 8,
    paddingVeritcal: 2,
  },
  positive: {
    fontSize: 12,
    lineHeight: 24,
  },
  negative: {
    fontSize: 12,
    lineHeight: 24,
  },
});
