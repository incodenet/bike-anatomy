// Numbered parts in the "whole bike" drawing, keyed by their marker number.
export const PARTS = {
  1: {
    name: "Top tube",
    system: "Frame",
    description:
      "The top bar of the front triangle, joining the seat tube to the head tube.",
  },
  2: {
    name: "Down tube",
    system: "Frame",
    description:
      "The biggest tube: it runs from the head tube down to the pedals and takes most of the load.",
  },
  3: {
    name: "Seat tube",
    system: "Frame",
    description: "Holds the seatpost and runs down to the bottom bracket.",
  },
  4: {
    name: "Head tube",
    system: "Frame",
    description: "The short front tube the fork turns inside.",
  },
  5: {
    name: "Seat stays",
    system: "Frame",
    description:
      "Two thin tubes from under the saddle down to the rear axle; they form the rear triangle.",
  },
  6: {
    name: "Chainstays",
    system: "Frame",
    description:
      "Two tubes from the pedals back to the rear axle; the bottom of the rear triangle.",
  },
  7: {
    name: "Fork",
    system: "Steering",
    description: "Holds the front wheel and turns with the handlebar.",
  },
  8: {
    name: "Headset",
    system: "Steering",
    description: "Bearings in the head tube that let the fork turn smoothly.",
  },
  9: {
    name: "Stem",
    system: "Steering",
    description: "Clamps the handlebar to the fork.",
  },
  10: {
    name: "Handlebar",
    system: "Steering",
    description:
      "Steers the bike and carries the grips, brake levers and shifter.",
  },
  11: {
    name: "Tyre",
    system: "Wheels",
    description: "Rubber tyre with an inner tube; it grips the road.",
  },
  12: {
    name: "Rim",
    system: "Wheels",
    description: "The metal hoop the tyre sits on; rim brakes grip it.",
  },
  13: {
    name: "Spokes",
    system: "Wheels",
    description: "Tight wires that hold the rim to the hub.",
  },
  14: {
    name: "Hub",
    system: "Wheels",
    description:
      "The wheel's centre, spinning on bearings; the rear hub carries the seven cogs.",
  },
  15: {
    name: "Pedal",
    system: "Contact points",
    description: "Where your foot pushes.",
  },
  16: {
    name: "Crank arm",
    system: "Drivetrain",
    description: "Lever that turns the chainring when you push the pedal.",
  },
  17: {
    name: "Chainring",
    system: "Drivetrain",
    description: "The one front toothed ring (44 teeth).",
  },
  18: {
    name: "Bottom bracket",
    system: "Drivetrain",
    description: "The bearing the cranks spin on.",
  },
  19: {
    name: "Chain",
    system: "Drivetrain",
    description:
      "Carries the turning force from the chainring to the rear cog.",
  },
  20: {
    name: "Cogs (freewheel)",
    system: "Drivetrain",
    description:
      "Seven toothed rings on the rear wheel, 14 to 28 teeth: one per gear.",
  },
  21: {
    name: "Rear derailleur",
    system: "Drivetrain",
    description: "Moves the chain from cog to cog when you shift.",
  },
  22: {
    name: "Shifter",
    system: "Drivetrain",
    description:
      "Right-hand trigger with 7 clicks; it pulls or releases the gear cable.",
  },
  23: {
    name: "Brake lever",
    system: "Brakes",
    description: "Squeeze to pull the brake cable.",
  },
  24: {
    name: "V-brakes",
    system: "Brakes",
    description:
      "Two arms that press rubber pads onto the rim to slow the wheel.",
  },
  25: {
    name: "Saddle",
    system: "Contact points",
    description: "The seat; its height sets how well your legs can push.",
  },
  26: {
    name: "Seatpost",
    system: "Contact points",
    description: "Holds the saddle; slides up and down to set its height.",
  },
  27: {
    name: "Grips",
    system: "Contact points",
    description: "Where your hands hold the handlebar.",
  },
};
