import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { stageForLevel, type GrowthStage } from '@monty/core';
import { colors } from '@/theme/tokens';

/**
 * Monty: a small plant in a pot with a smiling face, drawn as vectors on a
 * 140x150 grid (from the prototype). The plant sways gently above a still pot.
 * Five growth stages; when resting, Monty's eyes close and it droops a little.
 */

const VIEW_W = 140;
const VIEW_H = 150;
const SOIL_Y = 94;

// Leaves drawn with their attachment point at (0,0).
const LEFT_LEAF = 'M0 0C-22 0 -32 -16 -30 -30C-12 -30 0 -18 0 0Z';
const RIGHT_LEAF = 'M0 0C20 0 32 -14 30 -28C12 -28 0 -16 0 0Z';

interface Leaf {
  side: 'left' | 'right';
  y: number;
  scale: number;
}

interface StageShape {
  stemTop: number;
  leaves: Leaf[];
  flower: boolean;
}

const SHAPES: Record<GrowthStage, StageShape> = {
  seed: {
    stemTop: 86,
    leaves: [
      { side: 'left', y: 86, scale: 0.35 },
      { side: 'right', y: 86, scale: 0.35 },
    ],
    flower: false,
  },
  sprout: {
    stemTop: 62,
    leaves: [
      { side: 'left', y: 74, scale: 0.6 },
      { side: 'right', y: 62, scale: 0.55 },
    ],
    flower: false,
  },
  leafy: {
    stemTop: 46,
    leaves: [
      { side: 'left', y: 66, scale: 1 },
      { side: 'right', y: 52, scale: 1 },
    ],
    flower: false,
  },
  bushy: {
    stemTop: 38,
    leaves: [
      { side: 'left', y: 82, scale: 0.75 },
      { side: 'right', y: 74, scale: 0.75 },
      { side: 'left', y: 60, scale: 1 },
      { side: 'right', y: 46, scale: 1 },
    ],
    flower: false,
  },
  flowering: {
    stemTop: 30,
    leaves: [
      { side: 'left', y: 82, scale: 0.75 },
      { side: 'right', y: 74, scale: 0.75 },
      { side: 'left', y: 60, scale: 1 },
      { side: 'right', y: 46, scale: 1 },
    ],
    flower: true,
  },
};

const PETAL_ANGLES = [0, 72, 144, 216, 288];

function Plant({ stage }: { stage: GrowthStage }) {
  const shape = SHAPES[stage];
  return (
    <>
      <Path
        d={`M70 ${SOIL_Y}V${shape.stemTop}`}
        stroke={colors.stem}
        strokeWidth={stage === 'seed' ? 4 : 5}
        strokeLinecap="round"
        fill="none"
      />
      {shape.leaves.map((leaf, i) => (
        <G key={i} transform={`translate(70 ${leaf.y}) scale(${leaf.scale})`}>
          <Path
            d={leaf.side === 'left' ? LEFT_LEAF : RIGHT_LEAF}
            fill={leaf.side === 'left' ? colors.leafLight : colors.leafDark}
          />
        </G>
      ))}
      {shape.flower ? (
        <G transform={`translate(70 ${shape.stemTop - 4})`}>
          {PETAL_ANGLES.map((a) => (
            <Circle
              key={a}
              cx={Math.sin((a * Math.PI) / 180) * 7}
              cy={-Math.cos((a * Math.PI) / 180) * 7}
              r={6}
              fill={colors.blossom}
            />
          ))}
          <Circle r={4.5} fill={colors.blossomCenter} />
        </G>
      ) : null}
    </>
  );
}

function Pot({ resting }: { resting: boolean }) {
  return (
    <>
      <Path d="M38 100H102L94 144H46Z" fill={colors.pot} />
      <Rect x={34} y={92} width={72} height={14} rx={7} fill={colors.potRim} />
      {resting ? (
        <>
          <Path d="M53 122Q58 126 63 122" stroke={colors.face} strokeWidth={2.5} strokeLinecap="round" fill="none" />
          <Path d="M77 122Q82 126 87 122" stroke={colors.face} strokeWidth={2.5} strokeLinecap="round" fill="none" />
          <Path d="M65 132Q70 134 75 132" stroke={colors.face} strokeWidth={2.5} strokeLinecap="round" fill="none" />
          <SvgText x={108} y={88} fontSize={14} fontWeight="700" fill={colors.muted}>
            z
          </SvgText>
          <SvgText x={118} y={76} fontSize={11} fontWeight="700" fill={colors.muted}>
            z
          </SvgText>
        </>
      ) : (
        <>
          <Circle cx={58} cy={122} r={3.5} fill={colors.face} />
          <Circle cx={82} cy={122} r={3.5} fill={colors.face} />
          <Path d="M62 130Q70 137 78 130" stroke={colors.face} strokeWidth={2.5} strokeLinecap="round" fill="none" />
        </>
      )}
    </>
  );
}

const STAGE_LABEL: Record<GrowthStage, string> = {
  seed: 'a tiny seedling',
  sprout: 'a sprout',
  leafy: 'a leafy plant',
  bushy: 'a bushy plant',
  flowering: 'a flowering plant',
};

interface Props {
  /** Growth level 0-4 (see @monty/core GROWTH_STAGES). */
  level: number;
  resting?: boolean;
  /** Rendered width in dp; height follows the 140:150 shape. */
  size?: number;
}

export function Monty({ level, resting = false, size = 140 }: Props) {
  const stage = stageForLevel(level);
  const reduceMotion = useReducedMotion();
  const sway = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      sway.value = 0;
      return;
    }
    const amplitude = resting ? 1.2 : 2.5;
    const duration = resting ? 3200 : 2000;
    const easing = Easing.inOut(Easing.sin);
    sway.value = withRepeat(
      withSequence(
        withTiming(amplitude, { duration, easing }),
        withTiming(-amplitude, { duration: duration * 2, easing }),
        withTiming(0, { duration, easing }),
      ),
      -1,
    );
    return () => cancelAnimation(sway);
  }, [resting, reduceMotion, sway]);

  const plantStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sway.value + (resting ? -4 : 0)}deg` }],
  }));

  const height = (size * VIEW_H) / VIEW_W;
  const label = `Monty, ${STAGE_LABEL[stage]}${resting ? ', taking a nap' : ''}`;

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={label} style={{ width: size, height }}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { transformOrigin: ['50%', `${(SOIL_Y / VIEW_H) * 100}%`, 0] },
          plantStyle,
        ]}
      >
        <Svg width={size} height={height} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}>
          <Plant stage={stage} />
        </Svg>
      </Animated.View>
      <Svg width={size} height={height} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} style={StyleSheet.absoluteFill}>
        <Pot resting={resting} />
      </Svg>
    </View>
  );
}
