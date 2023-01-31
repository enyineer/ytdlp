import { createStyles, Button, Progress, DefaultMantineColor, ButtonProps } from "@mantine/core";
import { ReactNode } from 'react';

const useStyles = createStyles(() => ({
  button: {
    position: "relative",
    transition: "background-color 150ms ease",
  },

  progress: {
    position: "absolute",
    bottom: -1,
    right: -1,
    left: -1,
    top: -1,
    height: "auto",
    backgroundColor: "transparent",
    zIndex: 0,
  },

  label: {
    position: "relative",
    zIndex: 1,
  },
}));

type ProgressButtonProps = {
  progress: number;
  texts: {
    default: string;
    inProgress: string;
  }
  color: DefaultMantineColor;
  finishedColor: DefaultMantineColor;
  leftIcon?: ReactNode;
  onClick?: () => void;
  variant?: ButtonProps['variant'];
  type?: ButtonProps['type'];
}

export function ProgressButton(props: ProgressButtonProps) {
  const { classes, theme } = useStyles();

  return (
    <Button
      fullWidth
      className={classes.button}
      onClick={props.onClick}
      color={props.color}
      leftIcon
      variant={props.variant}
      loading={props.progress !== 0}
      type={props.type}
    >
      <div className={classes.label}>
        {props.progress !== 0
          ? props.texts.inProgress
          : props.texts.default}
      </div>
      {props.progress !== 0 && (
        <Progress
          value={props.progress}
          className={classes.progress}
          color={theme.fn.rgba(props.finishedColor, 0.35)}
          radius="sm"
        />
      )}
    </Button>
  );
}
