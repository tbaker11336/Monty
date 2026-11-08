import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type TabIconName = 'home' | 'today' | 'week' | 'habits';

/**
 * Simple stroke icons. The selected tab is also filled, so state is not shown
 * by colour alone (brief section 13).
 */
export function TabIcon({ name, color, filled }: { name: TabIconName; color: string; filled: boolean }) {
  const fill = filled ? color : 'none';
  const common = { stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no">
      {name === 'home' && <Path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" fill={fill} {...common} />}
      {name === 'today' && (
        <>
          <Circle cx={12} cy={12} r={8} fill={fill} {...common} />
          <Path d="M12 8v4l3 2" {...common} stroke={filled ? '#FFFFFF' : color} />
        </>
      )}
      {name === 'week' && (
        <>
          <Rect x={4} y={5} width={16} height={15} rx={3} fill={fill} {...common} />
          <Path d="M4 10h16M9 3v4M15 3v4" {...common} stroke={filled ? '#FFFFFF' : color} />
        </>
      )}
      {name === 'habits' && (
        <>
          <Path d="M12 20V11" {...common} />
          <Path d="M12 13c-4 0-6-3-6-6 4 0 6 3 6 6Z" fill={fill} {...common} />
          <Path d="M12 11c4 0 6-3 6-6-4 0-6 3-6 6Z" fill={fill} {...common} />
        </>
      )}
    </Svg>
  );
}
