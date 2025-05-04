import { useState, useEffect, useRef } from 'react';

// Base64 encoded WAV sounds (short and small)
const DING_SOUND_B64 = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA'; // Simple short ding
const BZZT_SOUND_B64 = 'data:audio/wav;base64,UklGRlIAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhFAAAAL8/v/+/v7+/v7+/v7+/v7+/v78='; // Short buzz/error

export const SOUNDS = {
  ding: DING_SOUND_B64,
  bzzt: BZZT_SOUND_B64,
};

export type SoundName = keyof typeof SOUNDS;

export function useSound(soundName: SoundName, muted: boolean) {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Preload audio element
    const audioInstance = new Audio(SOUNDS[soundName]);
    audioInstance.preload = 'auto';
    audioRef.current = audioInstance;
    setAudio(audioInstance);

    // Cleanup function to pause and remove the audio element if component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        // No need to remove from DOM as it wasn't added
      }
    };
  }, [soundName]); // Re-create if soundName changes

  const play = () => {
    if (audio && !muted) {
      // Reset playback to the start in case it's played again quickly
      audio.currentTime = 0;
      audio.play().catch(error => console.error("Audio play failed:", error));
    }
  };

  return play; // Return only the play function
} 