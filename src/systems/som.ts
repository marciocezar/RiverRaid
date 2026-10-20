// Som sintetizado com WebAudio. Os eventos vêm do Mundo; o motor é contínuo.
// O contexto é criado e retomado dentro de um gesto do usuário (política de autoplay).
// Todos os sons passam por um canal mestre, que o jogador pode silenciar com M.
import type { Evento } from "../core/mundo.ts";

// Preferência de som salva por jogador. A chave é nova de propósito: valores gravados por
// versões anteriores (que podiam ter silenciado o jogo sem querer) são ignorados.
// O padrão é sempre o som ligado; só fica desligado se o jogador apertar M.
const CHAVE_SILENCIO = "river-raid:som";
const VALOR_DESLIGADO = "desligado";

/** Estado para a interface: desligado pelo jogador, aguardando um gesto, ou ligado. */
export type EstadoSom = "desligado" | "aguardando" | "ligado";

export class Som {
  private contexto: AudioContext | null = null;
  private mestre: GainNode | null = null;
  private ganhoMotor: GainNode | null = null;
  private filtroMotor: BiquadFilterNode | null = null;
  private corpoMotor: OscillatorNode | null = null;
  private ganhoCorpo: GainNode | null = null;
  private ruido: AudioBuffer | null = null;
  private confirmado = false;
  private silenciado = lerSilencio();

  /**
   * Chamar dentro de um evento do usuário (toque, clique, tecla). Cria o contexto na primeira
   * vez e retoma sempre que o navegador ou o sistema o suspendeu. Seguro chamar várias vezes.
   * Sem áudio, o jogo segue normalmente.
   */
  desbloquear(): void {
    try {
      if (!this.contexto) {
        const Contexto = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.contexto = new Contexto();
        this.criarMotor();
      }
      this.retomar();
    } catch {
      this.contexto = null;
    }
  }

  /** Retoma o contexto se estiver parado. Ao liberar pela primeira vez, toca um bipe de confirmação. */
  retomar(): void {
    if (!this.contexto || this.contexto.state === "running") return;
    this.contexto.resume().then(
      () => {
        if (this.confirmado) return;
        this.confirmado = true;
        this.tom(660, 990, 0.14, "triangle", 0.2);
      },
      () => undefined,
    );
  }

  /** Estado visível para o jogador: mostrado no título para explicar por que o som ainda não toca. */
  estado(): EstadoSom {
    if (this.silenciado) return "desligado";
    if (!this.contexto || this.contexto.state !== "running") return "aguardando";
    return "ligado";
  }

  /** Liga ou desliga o som. A preferência fica salva no navegador deste jogador. */
  alternar(): void {
    this.silenciado = !this.silenciado;
    gravarSilencio(this.silenciado);
    if (this.mestre && this.contexto) {
      this.mestre.gain.setTargetAtTime(this.silenciado ? 0 : 1, this.contexto.currentTime, 0.02);
    }
    if (!this.silenciado) this.retomar();
  }

  private criarRuido(): AudioBuffer {
    const ctx = this.contexto!;
    const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const dados = buffer.getChannelData(0);
    let semente = 0x2a2a;
    for (let i = 0; i < dados.length; i++) {
      semente = (semente * 1103515245 + 12345) & 0x7fffffff;
      dados[i] = (semente / 0x7fffffff) * 2 - 1;
    }
    return buffer;
  }

  private criarMotor(): void {
    const ctx = this.contexto!;
    this.mestre = ctx.createGain();
    this.mestre.gain.value = this.silenciado ? 0 : 1;
    this.mestre.connect(ctx.destination);

    // Motor: ruído filtrado (o rugido) somado a uma onda grave (o corpo do motor).
    this.ruido = this.criarRuido();
    const fonte = ctx.createBufferSource();
    fonte.buffer = this.ruido;
    fonte.loop = true;
    const filtro = ctx.createBiquadFilter();
    filtro.type = "lowpass";
    filtro.frequency.value = 900;
    const ganho = ctx.createGain();
    ganho.gain.value = 0;
    fonte.connect(filtro).connect(ganho).connect(this.mestre);
    fonte.start();

    const corpo = ctx.createOscillator();
    corpo.type = "sawtooth";
    corpo.frequency.value = 96;
    const ganhoCorpo = ctx.createGain();
    ganhoCorpo.gain.value = 0;
    corpo.connect(ganhoCorpo).connect(this.mestre);
    corpo.start();

    this.filtroMotor = filtro;
    this.ganhoMotor = ganho;
    this.corpoMotor = corpo;
    this.ganhoCorpo = ganhoCorpo;
  }

  /** Motor do jato: mais alto e mais agudo em velocidade maior. Silencia quando parado. */
  motor(velocidade: number, ativo: boolean): void {
    if (!this.contexto || !this.ganhoMotor || !this.filtroMotor || !this.ganhoCorpo || !this.corpoMotor) return;
    const agora = this.contexto.currentTime;
    const ligado = ativo && !this.silenciado;
    this.ganhoMotor.gain.setTargetAtTime(ligado ? 0.09 + velocidade * 0.035 : 0, agora, 0.05);
    this.ganhoCorpo.gain.setTargetAtTime(ligado ? 0.035 + velocidade * 0.012 : 0, agora, 0.05);
    this.filtroMotor.frequency.setTargetAtTime(700 + velocidade * 260, agora, 0.05);
    this.corpoMotor.frequency.setTargetAtTime(84 + velocidade * 9, agora, 0.08);
  }

  /** Dispara o som de cada evento do quadro. */
  processar(eventos: Evento[]): void {
    for (const evento of eventos) this.tocar(evento);
  }

  private tocar(evento: Evento): void {
    if (!this.contexto || this.silenciado) return;
    this.retomar();
    switch (evento) {
      case "tiro":
        this.tom(1200, 300, 0.12, "square", 0.16);
        break;
      case "explosao":
        this.rajadaRuido(0.6, 0.5);
        break;
      case "inimigo_abatido":
        this.rajadaRuido(0.18, 0.3);
        break;
      case "posto_destruido":
        this.rajadaRuido(0.45, 0.4);
        break;
      case "ponte_destruida":
        this.rajadaRuido(0.8, 0.5);
        this.tom(330, 110, 0.5, "sawtooth", 0.12);
        break;
      case "impacto":
        this.tom(1800, 900, 0.04, "square", 0.07);
        break;
      case "reabastecer":
        this.tom(500, 900, 0.08, "square", 0.08);
        break;
      case "combustivel_baixo":
        this.tom(880, 880, 0.12, "square", 0.12);
        break;
      case "nivel":
        this.tom(440, 880, 0.3, "triangle", 0.18);
        break;
    }
  }

  private tom(frequenciaInicial: number, frequenciaFinal: number, duracao: number, tipo: OscillatorType, volume: number): void {
    const ctx = this.contexto!;
    const agora = ctx.currentTime;
    const oscilador = ctx.createOscillator();
    const ganho = ctx.createGain();
    oscilador.type = tipo;
    oscilador.frequency.setValueAtTime(frequenciaInicial, agora);
    oscilador.frequency.exponentialRampToValueAtTime(frequenciaFinal, agora + duracao);
    ganho.gain.setValueAtTime(volume, agora);
    ganho.gain.exponentialRampToValueAtTime(0.0001, agora + duracao);
    oscilador.connect(ganho).connect(this.mestre ?? ctx.destination);
    oscilador.start(agora);
    oscilador.stop(agora + duracao + 0.02);
  }

  private rajadaRuido(duracao: number, volume: number): void {
    const ctx = this.contexto!;
    const agora = ctx.currentTime;
    const fonte = ctx.createBufferSource();
    fonte.buffer = this.ruido;
    const ganho = ctx.createGain();
    ganho.gain.setValueAtTime(volume, agora);
    ganho.gain.exponentialRampToValueAtTime(0.0001, agora + duracao);
    fonte.connect(ganho).connect(this.mestre ?? ctx.destination);
    fonte.start(agora, Math.random() * 0.5, duracao);
  }
}

/** Preferência de silêncio salva por jogador. Sem armazenamento disponível, vale o padrão (ligado). */
function lerSilencio(): boolean {
  try {
    return window.localStorage.getItem(CHAVE_SILENCIO) === VALOR_DESLIGADO;
  } catch {
    return false;
  }
}

function gravarSilencio(silenciado: boolean): void {
  try {
    if (silenciado) window.localStorage.setItem(CHAVE_SILENCIO, VALOR_DESLIGADO);
    else window.localStorage.removeItem(CHAVE_SILENCIO);
  } catch {
    // Sem armazenamento, a preferência vale só nesta sessão.
  }
}
