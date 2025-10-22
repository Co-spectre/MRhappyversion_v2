// Notification sound utility for admin panel
// Plays a bell sound when new orders arrive

class NotificationSound {
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = true;

  constructor() {
    // Initialize on user interaction to comply with browser autoplay policies
    if (typeof window !== 'undefined') {
      const AudioContextConstructor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioContextConstructor();
    }
  }

  /**
   * Enable notification sounds
   */
  enable() {
    this.isEnabled = true;
  }

  /**
   * Disable notification sounds
   */
  disable() {
    this.isEnabled = false;
  }

  /**
   * Check if notifications are enabled
   */
  isNotificationEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Play a pleasant bell notification sound
   */
  async playNotification() {
    if (!this.isEnabled || !this.audioContext) {
      return;
    }

    try {
      // Resume audio context if suspended (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const currentTime = this.audioContext.currentTime;

      // Create a pleasant bell sound using Web Audio API
      // This creates a layered bell tone with harmonics

      // First bell tone (main frequency)
      this.playBellTone(800, currentTime, 0.3, 0.5);
      
      // Second harmonic
      this.playBellTone(1000, currentTime + 0.05, 0.2, 0.4);
      
      // Third harmonic (higher pitch)
      this.playBellTone(1200, currentTime + 0.1, 0.15, 0.3);

    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }

  /**
   * Play a single bell tone
   */
  private playBellTone(frequency: number, startTime: number, volume: number, duration: number) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    // Use sine wave for smooth bell-like tone
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, startTime);

    // Envelope: quick attack, exponential decay
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01); // Quick attack
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration); // Smooth decay

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Play the tone
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  /**
   * Play a double bell for urgent notifications
   */
  async playUrgentNotification() {
    if (!this.isEnabled || !this.audioContext) {
      return;
    }

    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const currentTime = this.audioContext.currentTime;

      // First bell
      this.playBellTone(900, currentTime, 0.4, 0.3);
      this.playBellTone(1100, currentTime + 0.05, 0.3, 0.25);

      // Second bell (slightly delayed)
      this.playBellTone(900, currentTime + 0.2, 0.4, 0.3);
      this.playBellTone(1100, currentTime + 0.25, 0.3, 0.25);

    } catch (error) {
      console.warn('Could not play urgent notification sound:', error);
    }
  }
}

// Export a singleton instance
export const notificationSound = new NotificationSound();
