/**
 * Web Audio API を用いて、SF調のBGMおよび効果音を動的に合成するクラス。
 * 外部音声ファイルの読み込みが不要なため、ロード時間がゼロで動作します。
 */
class CelestialSoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMutedState: boolean = false;

  // BGM用ノード
  private bgmOsc: OscillatorNode | null = null;
  private bgmLfo: OscillatorNode | null = null;
  private bgmGain: GainNode | null = null;

  constructor() {
    // ユーザー操作のイベントハンドラー内で明示的に init() を呼び出します。
  }

  /**
   * AudioContext の初期化、およびマスターゲインの設定。
   * 自動再生ポリシーに対応するため、ユーザー操作のタイミングで呼び出します。
   */
  public async init(): Promise<void> {
    if (this.ctx) {
      if (this.ctx.state === "suspended") {
        await this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) {
        console.warn("Web Audio API is not supported in this browser.");
        return;
      }

      this.ctx = new AudioCtxClass();
      this.masterGain = this.ctx.createGain();
      
      // マスター音量は控えめに設定 (ミュート状態なら0)
      this.masterGain.gain.value = this.isMutedState ? 0 : 0.35;
      this.masterGain.connect(this.ctx.destination);
    } catch (error) {
      console.error("Failed to initialize AudioContext:", error);
    }
  }

  /**
   * ミュート状態を切り替えます。
   */
  public setMute(mute: boolean): void {
    this.isMutedState = mute;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(mute ? 0 : 0.35, this.ctx.currentTime);
    }
  }

  /**
   * 現在ミュート状態かどうかを返します。
   */
  public isMuted(): boolean {
    return this.isMutedState;
  }

  /**
   * UIタップ音 (未来的な「ピピッ」という電子音) を再生します。
   */
  public playClick(): void {
    if (!this.ctx || this.isMutedState) return;

    // サスペンド状態なら再開を試みる
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    // 800Hzから1300Hzへ一瞬で周波数を跳ね上げてSF感を出す
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1300, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  /**
   * 解析完了音 (深宇宙の重厚な広がりを感じさせるシンセパッド和音) を再生します。
   */
  public playSuccess(): void {
    if (!this.ctx || this.isMutedState) return;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    // C3 (130.81Hz), G3 (196.00Hz), C4 (261.63Hz), E4 (329.63Hz), G4 (392.00Hz)
    // 低音から広がるメジャーセブンス系の和音
    const baseFreqs = [130.81, 196.00, 261.63, 329.63, 392.00];

    baseFreqs.forEach((freq) => {
      if (!this.ctx) return;
      
      const gainNode = this.ctx.createGain();
      const filterNode = this.ctx.createBiquadFilter();

      // コーラス効果（厚みと重厚感）を出すため、微妙に周波数をデチューンした2つの鋸歯状波を重ねる
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();

      osc1.type = "sawtooth";
      osc1.frequency.value = freq;

      osc2.type = "sawtooth";
      osc2.frequency.value = freq + 1.5; // デチューン

      // フィルターの設定 (Lowpassで音色の開閉をコントロール)
      filterNode.type = "lowpass";
      // フィルター・エンベロープ: 最初は低く、アタックで開き、その後ゆっくり閉じる
      filterNode.frequency.setValueAtTime(120, now);
      filterNode.frequency.exponentialRampToValueAtTime(1600, now + 0.22);
      filterNode.frequency.exponentialRampToValueAtTime(250, now + 1.8);
      filterNode.Q.value = 4.0; // レゾナンスで「ミューン」というSF感を強調

      // ボリューム・エンベロープ (アタックは少しゆったり、リリースは長く)
      const targetVolume = 0.09 / baseFreqs.length; // 音割れ防止
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(targetVolume, now + 0.15); // アタック
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 2.4); // 長いリリース

      // 接続
      osc1.connect(filterNode);
      osc2.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(this.masterGain!);

      // 再生開始
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 2.5);
      osc2.stop(now + 2.5);
    });
  }

  /**
   * 低音の深宇宙スペース・アンビエントBGMを開始します。
   */
  public startAmbientBGM(): void {
    if (!this.ctx || this.bgmOsc) return;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;

    // 低音ドローン用のメインオシレーター
    this.bgmOsc = this.ctx.createOscillator();
    this.bgmGain = this.ctx.createGain();
    
    const filter = this.ctx.createBiquadFilter();

    // 55Hz (A1) の鋸歯状波で厚みのある低音を作る
    this.bgmOsc.type = "sawtooth";
    this.bgmOsc.frequency.value = 55;

    // ローパスフィルターで高音をカットし、温かみのあるドローンにする
    filter.type = "lowpass";
    filter.frequency.value = 160;
    filter.Q.value = 4; // 少しレゾナンスをつけてうねりを際立たせる

    // LFO（低周波発振器）でフィルターのカットオフ周波数をゆっくり変調させる (Filter Sweep)
    this.bgmLfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();

    this.bgmLfo.type = "sine";
    this.bgmLfo.frequency.value = 0.08; // 周期約12.5秒の非常にゆったりしたうねり
    lfoGain.gain.value = 60; // フィルターカットオフを ±60Hz 変動させる

    // LFO -> lfoGain -> filter.frequency に接続して変調をかける
    this.bgmLfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    // BGMの音量は非常に控えめに
    this.bgmGain.gain.setValueAtTime(0, now);
    this.bgmGain.gain.linearRampToValueAtTime(0.04, now + 1.5); // フェードイン

    // 接続: osc -> filter -> bgmGain -> masterGain
    this.bgmOsc.connect(filter);
    filter.connect(this.bgmGain);
    this.bgmGain.connect(this.masterGain!);

    // 再生開始
    this.bgmOsc.start(now);
    this.bgmLfo.start(now);
  }

  /**
   * BGMを停止します。
   */
  public stopAmbientBGM(): void {
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    if (this.bgmOsc && this.bgmGain) {
      const osc = this.bgmOsc;
      const lfo = this.bgmLfo;
      const gain = this.bgmGain;

      // フェードアウトしてから停止
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + 1.0);

      setTimeout(() => {
        try {
          osc.stop();
          lfo?.stop();
          osc.disconnect();
          lfo?.disconnect();
        } catch (e) {
          // すでに停止している場合などのエラーをハンドリング
        }
      }, 1000);

      this.bgmOsc = null;
      this.bgmLfo = null;
      this.bgmGain = null;
    }
  }
}

export const celestialSound = new CelestialSoundManager();
