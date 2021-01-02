/* eslint-disable import/no-extraneous-dependencies */

import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  HStack,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  VStack,
} from '@chakra-ui/react'
import WaveSurfer, { WaveSurferParams } from 'wavesurfer.js'
import dayjs from 'dayjs'
// Component
import PlayPauseButton from '~/components/UI/Button/PlayPauseButton'

const DEFAULT_WAV_SURFER_HEIGHT = 128

const genWaveSurferParams = (ref: HTMLDivElement): WaveSurferParams => ({
  container: ref,
  waveColor: '#F6AD55',
  progressColor: '#F6AD55',
  cursorColor: '#F6AD55',
  barWidth: 3,
  barRadius: 3,
  height: DEFAULT_WAV_SURFER_HEIGHT,
  responsive: true,
  normalize: true,
  partialRender: true,
})

type WavPlayerProps = {
  url: string
  shouldReRender: boolean
}

const WavPlayer = ({ url, shouldReRender }: WavPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const waveSurfer = useRef<WaveSurfer | null>(null)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  useEffect(() => {
    if (containerRef.current) {
      waveSurfer.current = WaveSurfer.create(
        genWaveSurferParams(containerRef.current),
      )
      waveSurfer.current.load(url)

      waveSurfer.current?.on('ready', () => {
        waveSurfer.current?.setVolume(0.5)
        setDuration(waveSurfer.current?.getDuration() ?? 0)
      })

      let finished = false
      let innerCurrentTime = 0
      waveSurfer.current.on('audioprocess', () => {
        const newCurrentTime = waveSurfer.current?.getCurrentTime() ?? 0
        if (finished) {
          innerCurrentTime = 0
          setCurrentTime(innerCurrentTime)
          finished = false
        } else if (
          (waveSurfer.current?.getDuration() ?? 0) - newCurrentTime > 1 &&
          newCurrentTime - innerCurrentTime > 1
        ) {
          innerCurrentTime += 1
          setCurrentTime(innerCurrentTime)
        }
      })
      waveSurfer.current.on('finish', () => {
        setCurrentTime(waveSurfer.current?.getDuration() ?? 0)
        finished = true
      })
    }

    return () => waveSurfer.current?.destroy()
  }, [url, setCurrentTime]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (shouldReRender) {
      setTimeout(() => {
        waveSurfer.current?.setHeight(DEFAULT_WAV_SURFER_HEIGHT)
      }, 100)
    }
  }, [shouldReRender])

  return (
    <VStack alignItems="stretch">
      <Box ref={containerRef} />
      <HStack spacing="3">
        <PlayPauseButton
          onPlay={() => waveSurfer.current?.play()}
          onPause={() => waveSurfer.current?.pause()}
        />
        <HStack spacing="1">
          <Box>{dayjs(0).second(currentTime).format('mm:ss')}</Box>
          <Box>/</Box>
          <Box>{dayjs(0).second(duration).format('mm:ss')}</Box>
        </HStack>
        <Slider
          aria-label="slider-ex-4"
          defaultValue={0.5}
          min={0.01}
          max={1}
          step={0.025}
          onChange={waveSurfer.current?.setVolume}
          maxWidth="10em"
        >
          <SliderTrack bg="orange.100">
            <SliderFilledTrack bg="orange.300" />
          </SliderTrack>
          <SliderThumb boxSize={3} _focus={{ boxShadow: 'none' }}>
            <Box color="tomato" />
          </SliderThumb>
        </Slider>
      </HStack>
    </VStack>
  )
}

export default WavPlayer
