const KM_PER_MILE = 1.609;

export const calculateGear = ({
  chainringTeeth,
  cogTeeth,
  wheelCircumference,
  wheelDiameter,
  cadence,
}) => {
  const ratio = chainringTeeth / cogTeeth;
  const distance = ratio * wheelCircumference;

  return {
    ratio,
    gearInches: ratio * wheelDiameter,
    distance,
    speedKmh: (distance * cadence * 60) / 1000,
  };
};

export const formatSpeed = (speedKmh) =>
  `${speedKmh.toFixed(1)} km/h (${(speedKmh / KM_PER_MILE).toFixed(1)} mph)`;
