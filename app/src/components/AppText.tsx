import { Text, type TextProps, type TextStyle } from 'react-native';
import { colors, type as typeScale, type TypeVariant } from '@/theme/tokens';

interface Props extends TextProps {
  variant?: TypeVariant;
  color?: string;
  align?: TextStyle['textAlign'];
}

/** All text in Monty goes through this so it uses Nunito and the type scale. */
export function AppText({ variant = 'body', color, align, style, ...rest }: Props) {
  const isMuted = variant === 'secondary' || variant === 'small' || variant === 'label';
  return (
    <Text
      {...rest}
      style={[
        typeScale[variant] as TextStyle,
        { color: color ?? (isMuted ? colors.muted : colors.ink), textAlign: align },
        style,
      ]}
    />
  );
}
