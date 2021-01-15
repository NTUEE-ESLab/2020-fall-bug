import React, { useCallback, useState } from 'react'
import { Button } from '@chakra-ui/react'

type PlayPauseButtonProps = {
  initialPlaying?: boolean
  onPlay: (...args: any[]) => any
  onPause: (...args: any[]) => any
}

const PlayPauseButton = ({
  initialPlaying = false,
  onPlay,
  onPause,
}: PlayPauseButtonProps) => {
  const [playing, setPlaying] = useState(initialPlaying)

  const onClick = useCallback(
    (current) => {
      const next = !current
      setPlaying(next)
      if (next) {
        onPlay?.()
      } else {
        onPause?.()
      }
    },
    [onPlay, onPause],
  )

  return (
    <Button
      onClick={() => onClick(playing)}
      variant="unstyled"
      width="0"
      height="1em"
      borderColor="transparent transparent transparent #202020"
      borderStyle="solid"
      borderWidth="0.5em 0 0.5em 0.9em"
      transition="0.1s all ease"
      {...(playing
        ? {
            borderStyle: 'double',
            borderWidth: '0 0 0 0.9em',
          }
        : {})}
    />
  )
}

export default PlayPauseButton
