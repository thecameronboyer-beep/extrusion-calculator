export const GRAMS_PER_POUND = 453.592;

export function toNumber(value) {
  if (value === null || value === undefined || value === '') {
    return Number.NaN;
  }

  const normalized = String(value).replaceAll(',', '').trim();
  if (normalized === '') {
    return Number.NaN;
  }

  return Number(normalized);
}

export function isPositive(value) {
  const number = toNumber(value);
  return Number.isFinite(number) && number > 0;
}

export function isNonNegative(value) {
  const number = toNumber(value);
  return Number.isFinite(number) && number >= 0;
}

function hasPositiveInputs(...values) {
  return values.every(isPositive);
}

export function calculateDesiredGramWeight(values, solveBy) {
  const currentGramWeight = toNumber(values.currentGramWeight);
  const desiredGramWeight = toNumber(values.desiredGramWeight);

  if (!hasPositiveInputs(currentGramWeight, desiredGramWeight)) {
    return null;
  }

  if (solveBy === 'line-speed') {
    const currentLineSpeed = toNumber(values.currentLineSpeed);

    if (!isPositive(currentLineSpeed)) {
      return null;
    }

    const requiredLineSpeed = (currentGramWeight * currentLineSpeed) / desiredGramWeight;

    return {
      requiredValue: requiredLineSpeed,
      change: requiredLineSpeed - currentLineSpeed,
      changePercent: requiredLineSpeed / currentLineSpeed - 1,
      desiredGramWeight,
    };
  }

  const currentRpm = toNumber(values.currentRpm);

  if (!isPositive(currentRpm)) {
    return null;
  }

  const requiredRpm = (desiredGramWeight * currentRpm) / currentGramWeight;

  return {
    requiredValue: requiredRpm,
    change: requiredRpm - currentRpm,
    changePercent: requiredRpm / currentRpm - 1,
    desiredGramWeight,
  };
}

export function calculateMaintainGramWeight(values) {
  const currentGramWeight = toNumber(values.currentGramWeight);
  const currentRpm = toNumber(values.currentRpm);
  const currentLineSpeed = toNumber(values.currentLineSpeed);
  const newLineSpeed = toNumber(values.newLineSpeed);

  if (!hasPositiveInputs(currentGramWeight, currentRpm, currentLineSpeed, newLineSpeed)) {
    return null;
  }

  const requiredRpm = currentRpm * (newLineSpeed / currentLineSpeed);

  return {
    maintainedGramWeight: currentGramWeight,
    requiredRpm,
    rpmChange: requiredRpm - currentRpm,
    rpmChangePercent: requiredRpm / currentRpm - 1,
    lineSpeedChange: newLineSpeed - currentLineSpeed,
    lineSpeedChangePercent: newLineSpeed / currentLineSpeed - 1,
  };
}

export function calculateGramWeightWithOutputChange(values) {
  const currentGramWeight = toNumber(values.currentGramWeight);
  const desiredGramWeight = toNumber(values.desiredGramWeight);
  const currentRpm = toNumber(values.currentRpm);
  const currentLineSpeed = toNumber(values.currentLineSpeed);
  const newLineSpeed = toNumber(values.newLineSpeed);

  if (
    !hasPositiveInputs(
      currentGramWeight,
      desiredGramWeight,
      currentRpm,
      currentLineSpeed,
      newLineSpeed
    )
  ) {
    return null;
  }

  const requiredRpm =
    currentRpm * (desiredGramWeight / currentGramWeight) * (newLineSpeed / currentLineSpeed);

  return {
    requiredRpm,
    rpmChange: requiredRpm - currentRpm,
    rpmChangePercent: requiredRpm / currentRpm - 1,
    desiredGramWeight,
    lineSpeedChange: newLineSpeed - currentLineSpeed,
    lineSpeedChangePercent: newLineSpeed / currentLineSpeed - 1,
  };
}

export function calculateProduction(lineSpeedValue, cutLengthValue, unitsPerContainerValue) {
  const lineSpeed = toNumber(lineSpeedValue);
  const cutLength = toNumber(cutLengthValue);
  const unitsPerContainer = toNumber(unitsPerContainerValue);

  if (!hasPositiveInputs(lineSpeed, cutLength, unitsPerContainer)) {
    return null;
  }

  const unitsPerHour = (lineSpeed * 12 * 60) / cutLength;
  const containersPerHour = unitsPerHour / unitsPerContainer;

  return {
    unitsPerHour,
    containersPerHour,
    timePerContainerHours: 1 / containersPerHour,
  };
}

export function calculateContainerProgressTiming(
  currentContainerValue,
  totalContainersValue,
  containersPerHourValue
) {
  const currentContainer = toNumber(currentContainerValue);
  const totalContainers = toNumber(totalContainersValue);
  const containersPerHour = toNumber(containersPerHourValue);

  if (
    !isNonNegative(currentContainer) ||
    !isPositive(totalContainers) ||
    !isPositive(containersPerHour)
  ) {
    return null;
  }

  const completedContainers = Math.min(Math.max(currentContainer, 0), totalContainers);
  const containersRemaining = Math.max(totalContainers - completedContainers, 0);
  const percentComplete = completedContainers / totalContainers;

  return {
    completedContainers,
    totalContainers,
    containersRemaining,
    percentComplete,
    remainingTimeHours: containersRemaining / containersPerHour,
    totalTimeHours: totalContainers / containersPerHour,
  };
}

export function calculateActiveContainerProgressTiming(
  currentContainerValue,
  totalContainersValue,
  containersPerHourValue,
  unitsPerContainerValue,
  currentUnitsInContainerValue = 0
) {
  const currentContainer = toNumber(currentContainerValue);
  const totalContainers = toNumber(totalContainersValue);
  const containersPerHour = toNumber(containersPerHourValue);
  const unitsPerContainer = toNumber(unitsPerContainerValue);
  const currentUnitsInContainer = toNumber(currentUnitsInContainerValue);

  if (
    !isNonNegative(currentContainer) ||
    !isPositive(totalContainers) ||
    !isPositive(containersPerHour)
  ) {
    return null;
  }

  const completedBeforeCurrent = Math.min(
    Math.max(currentContainer - 1, 0),
    totalContainers
  );
  const partialContainerProgress =
    isPositive(unitsPerContainer) && isNonNegative(currentUnitsInContainer)
      ? Math.min(currentUnitsInContainer / unitsPerContainer, 1)
      : 0;
  const completedContainers = Math.min(
    completedBeforeCurrent + partialContainerProgress,
    totalContainers
  );
  const containersRemaining = Math.max(totalContainers - completedContainers, 0);
  const percentComplete = completedContainers / totalContainers;

  return {
    completedContainers,
    totalContainers,
    containersRemaining,
    percentComplete,
    remainingTimeHours: containersRemaining / containersPerHour,
    totalTimeHours: totalContainers / containersPerHour,
  };
}

export function calculateOrderTime(totalOrderUnitsValue, unitsPerHourValue) {
  const totalOrderUnits = toNumber(totalOrderUnitsValue);
  const unitsPerHour = toNumber(unitsPerHourValue);

  if (!hasPositiveInputs(totalOrderUnits, unitsPerHour)) {
    return null;
  }

  return totalOrderUnits / unitsPerHour;
}

export function calculateMaintainWeight(values) {
  const currentRpm = toNumber(values.currentRpm);
  const currentLineSpeed = toNumber(values.currentLineSpeed);
  const newLineSpeed = toNumber(values.newLineSpeed);
  const totalOrderUnits = toNumber(values.totalOrderUnits);

  if (!hasPositiveInputs(currentRpm, currentLineSpeed, newLineSpeed)) {
    return null;
  }

  const requiredRpm = currentRpm * (newLineSpeed / currentLineSpeed);
  const currentProduction = calculateProduction(
    values.currentLineSpeed,
    values.cutLength,
    values.unitsPerContainer
  );
  const newProduction = calculateProduction(
    values.newLineSpeed,
    values.cutLength,
    values.unitsPerContainer
  );

  if (!currentProduction || !newProduction) {
    return {
      requiredRpm,
      currentProduction: null,
      newProduction: null,
      currentOrderTimeHours: null,
      newOrderTimeHours: null,
      deltas: null,
    };
  }

  const currentOrderTimeHours = calculateOrderTime(totalOrderUnits, currentProduction.unitsPerHour);
  const newOrderTimeHours = calculateOrderTime(totalOrderUnits, newProduction.unitsPerHour);

  return {
    requiredRpm,
    currentProduction,
    newProduction,
    currentOrderTimeHours,
    newOrderTimeHours,
    deltas: {
      throughputPercent: newLineSpeed / currentLineSpeed - 1,
      unitsPerHour: newProduction.unitsPerHour - currentProduction.unitsPerHour,
      containersPerHour: newProduction.containersPerHour - currentProduction.containersPerHour,
      orderTimeHours:
        currentOrderTimeHours !== null && newOrderTimeHours !== null
          ? currentOrderTimeHours - newOrderTimeHours
          : null,
    },
  };
}

export function calculateContainersInHours(values) {
  const hours = toNumber(values.hours);
  const production = calculateProduction(
    values.lineSpeed,
    values.cutLength,
    values.unitsPerContainer
  );

  if (!production || !isPositive(hours)) {
    return null;
  }

  return {
    unitsProduced: production.unitsPerHour * hours,
    containersProduced: production.containersPerHour * hours,
    unitsPerHour: production.unitsPerHour,
    containersPerHour: production.containersPerHour,
  };
}

export function calculatePalletTiming(values) {
  const currentContainerNumber = toNumber(values.currentContainerNumber);
  const totalContainersOnPallet = toNumber(values.totalContainersOnPallet);
  const containersPerPallet = isPositive(values.containersPerPallet)
    ? toNumber(values.containersPerPallet)
    : totalContainersOnPallet;
  const production = calculateProduction(
    values.lineSpeed,
    values.cutLength,
    values.unitsPerContainer
  );

  if (
    !production ||
    !hasPositiveInputs(containersPerPallet, currentContainerNumber, totalContainersOnPallet)
  ) {
    return null;
  }

  const containersRemaining = Math.max(totalContainersOnPallet - currentContainerNumber + 1, 0);

  return {
    unitsPerHour: production.unitsPerHour,
    containersPerHour: production.containersPerHour,
    timePerContainerHours: production.timePerContainerHours,
    timePerPalletHours: containersPerPallet / production.containersPerHour,
    containersRemaining,
    timeRemainingHours: containersRemaining / production.containersPerHour,
  };
}

export function calculateLargeContainerTiming(values) {
  const unitsPerContainer = toNumber(values.unitsPerContainer);
  const currentUnitsInContainer = toNumber(values.currentUnitsInContainer);
  const production = calculateProduction(
    values.lineSpeed,
    values.cutLength,
    values.unitsPerContainer
  );

  if (!production || !isPositive(unitsPerContainer) || !isNonNegative(currentUnitsInContainer)) {
    return null;
  }

  const unitsRemaining = Math.max(unitsPerContainer - currentUnitsInContainer, 0);

  return {
    unitsPerHour: production.unitsPerHour,
    timePerContainerHours: unitsPerContainer / production.unitsPerHour,
    unitsRemaining,
    timeUntilCompleteHours: unitsRemaining / production.unitsPerHour,
  };
}

export function calculateSixSampleWeight(sampleGramsValue, cutLengthValue = 6, unitsPerContainerValue) {
  const sampleGrams = toNumber(sampleGramsValue);
  const cutLength = toNumber(cutLengthValue);
  const unitsPerContainer = toNumber(unitsPerContainerValue);

  if (!hasPositiveInputs(sampleGrams, cutLength)) {
    return null;
  }

  const singleUnitGrams = (sampleGrams / 6) * cutLength;
  const gramWeightPerFoot = (sampleGrams / 6) * 12;

  return {
    singleUnitGrams,
    gramWeightPerFoot,
    singleUnitPounds: singleUnitGrams / GRAMS_PER_POUND,
    containerWeightPounds: isPositive(unitsPerContainer)
      ? (singleUnitGrams * unitsPerContainer) / GRAMS_PER_POUND
      : null,
  };
}

export function calculateSingleUnitWeight(
  singleUnitGramsValue,
  cutLengthValue,
  unitsPerContainerValue
) {
  const singleUnitGrams = toNumber(singleUnitGramsValue);
  const cutLength = toNumber(cutLengthValue);
  const unitsPerContainer = toNumber(unitsPerContainerValue);

  if (!isPositive(singleUnitGrams)) {
    return null;
  }

  return {
    singleUnitGrams,
    gramWeightPerFoot: isPositive(cutLength) ? (singleUnitGrams / cutLength) * 12 : null,
    singleUnitPounds: singleUnitGrams / GRAMS_PER_POUND,
    containerWeightPounds: isPositive(unitsPerContainer)
      ? (singleUnitGrams * unitsPerContainer) / GRAMS_PER_POUND
      : null,
  };
}

export function calculateCutTimer(values) {
  const currentCutLength = toNumber(values.currentCutLength);
  const currentTimer = toNumber(values.currentTimer);
  const desiredCutLength = toNumber(values.desiredCutLength);

  if (!hasPositiveInputs(currentCutLength, currentTimer, desiredCutLength)) {
    return null;
  }

  const newTimer = currentTimer * (desiredCutLength / currentCutLength);

  return {
    newTimer,
    change: newTimer - currentTimer,
  };
}
