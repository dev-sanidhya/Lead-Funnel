"""Builds the film's soundtrack: an ambient score plus UI sounds synced to scripts/cues.json.
Run:  node scripts/dump-cues.mjs && python scripts/make_audio.py
"""
import json, math, os, wave
import numpy as np
from scipy import signal

SR = 44100
HERE = os.path.dirname(os.path.abspath(__file__))
data = json.load(open(os.path.join(HERE, 'cues.json')))
TOTAL = data['total']
S_ZOOM = data['S']['zoom']
S_OUTRO = data['S']['outro']
N = int(SR * TOTAL)
rng = np.random.default_rng(7)

def tarr(d):
    return np.arange(int(SR * d)) / SR

def env_ad(n, a, d, power=3.0):
    t = np.arange(n) / SR
    att = np.clip(t / max(a, 1e-4), 0, 1)
    dec = np.exp(-t / max(d, 1e-4))
    return (att ** 0.7) * dec

def place(buf, sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N or i < 0:
        return
    j = min(N, i + len(sig))
    seg = sig[: j - i] * gain
    l = math.cos((pan + 1) * math.pi / 4)
    r = math.sin((pan + 1) * math.pi / 4)
    buf[0, i:j] += seg * l
    buf[1, i:j] += seg * r

def hz(m):  # midi to Hz
    return 440.0 * 2 ** ((m - 69) / 12)

def lowpass(x, fc, order=2):
    sos = signal.butter(order, fc, 'low', fs=SR, output='sos')
    return signal.sosfilt(sos, x)

def highpass(x, fc, order=2):
    sos = signal.butter(order, fc, 'high', fs=SR, output='sos')
    return signal.sosfilt(sos, x)

def bandpass_sweep(n, f0, f1, q=1.2):
    """Noise through a sweeping resonant band (whoosh)."""
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    block = 512
    for s in range(0, n, block):
        p = s / n
        fc = f0 * (f1 / f0) ** p
        sos = signal.butter(2, [max(40, fc / q), min(SR / 2 - 100, fc * q)], 'band', fs=SR, output='sos')
        out[s:s + block] = signal.sosfilt(sos, noise[s:s + block])
    return out

# ---------------------------------------------------------------- sfx
def sfx_boom():
    t = tarr(2.2)
    f = 38 + 60 * np.exp(-t * 5)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 1.9)
    air = lowpass(rng.standard_normal(len(t)), 900) * np.exp(-t * 4) * 0.6
    return (body + air) * 0.9

def sfx_whoosh(d=1.1, f0=250, f1=5200, g=1.0):
    n = int(SR * d)
    w = bandpass_sweep(n, f0, f1)
    t = np.arange(n) / n
    env = np.sin(np.pi * t) ** 2.2
    return w * env * 0.9 * g

def sfx_tap():
    t = tarr(0.12)
    click = np.sin(2 * np.pi * 1700 * t) * np.exp(-t * 90)
    thump = np.sin(2 * np.pi * 150 * t) * np.exp(-t * 55)
    return (click * 0.5 + thump * 0.7)

PENT = [76, 79, 81, 83, 86, 88]
def sfx_tick(i):
    m = PENT[i % len(PENT)]
    t = tarr(0.5)
    f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 2.0 * t) + 0.12 * np.sin(2 * np.pi * f * 3.01 * t)
    return s * np.exp(-t * 11) * 0.35

def sfx_send():
    t = tarr(0.22)
    f = 520 + 520 * (1 - np.exp(-t * 28))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 22)
    return s * 0.42

def sfx_recv():
    t = tarr(0.35)
    f = 380 + 300 * (1 - np.exp(-t * 20))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11)
    s2 = np.sin(2 * np.pi * hz(88) * t) * np.exp(-t * 14) * 0.25
    return (s + s2) * 0.45

def chime(notes, spacing=0.07, dur=1.8, decay=2.4, g=0.3):
    n = int(SR * dur)
    out = np.zeros(n)
    for k, m in enumerate(notes):
        t = tarr(dur - k * spacing)
        f = hz(m)
        s = np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * 2.0 * f * t) + 0.18 * np.sin(2 * np.pi * 3.02 * f * t)
        s *= np.exp(-t * decay) * (1 - np.exp(-t * 400))
        i0 = int(k * spacing * SR)
        m_ = min(len(s), n - i0)
        out[i0:i0 + m_] += s[:m_] * g
    return out

def sfx_success():
    return chime([84, 88], 0.09, 1.6, 2.6, 0.32)

def sfx_chime():
    return chime([79, 84, 88, 91, 96], 0.075, 2.8, 1.9, 0.26)

def sfx_orb():
    d = 1.7
    t = tarr(d)
    f = 260 * (5.2 ** (t / d)) * (1 + 0.012 * np.sin(2 * np.pi * 7 * t))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR)
    env = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.5
    spark = highpass(rng.standard_normal(len(t)), 5200) * 0.04 * env
    return s * env * 0.28 + spark

def sfx_land():
    t = tarr(1.4)
    thump = np.sin(2 * np.pi * (60 + 80 * np.exp(-t * 18)) * t) * np.exp(-t * 6) * 0.9
    return thump * 0.8 + chime([88, 95], 0.05, 1.4, 2.8, 0.2)[: len(t)]

def build_sfx():
    buf = np.zeros((2, N))
    tick_i = 0
    for c in data['cues']:
        n, t0 = c['n'], c['t']
        if n == 'boom': place(buf, sfx_boom(), t0, 0.9)
        elif n == 'whoosh': place(buf, sfx_whoosh(1.2), t0 - 0.45, 0.55)
        elif n == 'whoosh_s': place(buf, sfx_whoosh(0.7, 500, 4200), t0 - 0.2, 0.3)
        elif n == 'tap': place(buf, sfx_tap(), t0, 0.55)
        elif n == 'tick': place(buf, sfx_tick(tick_i), t0, 0.7); tick_i += 1
        elif n == 'send': place(buf, sfx_send(), t0, 0.8, 0.25)
        elif n == 'recv': place(buf, sfx_recv(), t0, 0.8, -0.25)
        elif n == 'success': place(buf, sfx_success(), t0, 0.8)
        elif n == 'chime': place(buf, sfx_chime(), t0, 0.9)
        elif n == 'orb': place(buf, sfx_orb(), t0 - 0.35, 0.8)
        elif n == 'land': place(buf, sfx_land(), t0, 0.85)
    return buf

# ---------------------------------------------------------------- music
CHORDS = [  # (root midi bass, voicing)
    (45, [57, 60, 64, 67, 71]),   # Am9
    (41, [53, 57, 60, 64, 67]),   # Fmaj9
    (48, [55, 60, 64, 67, 71]),   # Cmaj7
    (43, [55, 59, 62, 66, 69]),   # G6/9
]
BAR = 8.0  # seconds per chord

def pad_voice(f, dur, detune=0.0035):
    t = tarr(dur)
    s = np.zeros(len(t))
    for d in (-detune, 0, detune):
        ff = f * (1 + d)
        s += np.sin(2 * np.pi * ff * t + rng.uniform(0, 6.28)) + 0.3 * np.sin(2 * np.pi * 2 * ff * t) + 0.12 * np.sin(2 * np.pi * 3 * ff * t)
    a, r = 2.4, 2.8
    e = np.clip(t / a, 0, 1) * np.clip((dur - t) / r, 0, 1)
    return s * e / 3.0

def build_music():
    buf = np.zeros((2, N))
    nbar = int(math.ceil(TOTAL / BAR)) + 1
    for b in range(nbar):
        root, notes = CHORDS[b % 4]
        t0 = b * BAR
        dur = BAR + 3.0
        for k, m in enumerate(notes):
            pan = (k - 2) * 0.28
            place(buf, pad_voice(hz(m), dur), t0 - 0.5, 0.075, pan)
        # sub bass
        t = tarr(dur)
        sub = np.sin(2 * np.pi * hz(root - 12) * t) * np.clip(t / 1.5, 0, 1) * np.clip((dur - t) / 2.5, 0, 1)
        place(buf, sub, t0 - 0.4, 0.2)
    # plucks: start after the title card, sparse and airy
    step = 0.3
    pat = [0, 2, 1, 3, 2, 4, 3, 2, 1, 3, 2, 0, 4, 2, 3, 1]
    t = 6.0
    k = 0
    while t < TOTAL - 7.5:
        b = int(t // BAR)
        root, notes = CHORDS[b % 4]
        if k % 8 in (0, 2, 3, 5, 6) or (k % 16 == 11):
            m = notes[pat[k % len(pat)] % len(notes)] + 12
            tt = tarr(1.4)
            f = hz(m)
            s = (np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt * 9) + 0.2 * np.sin(2 * np.pi * 3 * f * tt) * np.exp(-tt * 14))
            s *= np.exp(-tt * 4.5) * (1 - np.exp(-tt * 500))
            place(buf, s, t, 0.085, ((k % 5) - 2) * 0.3)
        t += step
        k += 1
    # soft pulse underneath the product demo
    for kk in range(int((TOTAL - 8) / 0.6)):
        tt0 = 6.0 + kk * 0.6
        if tt0 > TOTAL - 8: break
        tt = tarr(0.35)
        kick = np.sin(2 * np.pi * (46 + 70 * np.exp(-tt * 38)) * tt) * np.exp(-tt * 12)
        place(buf, kick, tt0, 0.10)
    # risers into the zoom and outro
    for t0, dur in ((S_ZOOM - 3.0, 3.0), (S_OUTRO - 2.6, 2.6)):
        n = int(SR * dur)
        w = bandpass_sweep(n, 300, 7000, 1.6)
        e = (np.arange(n) / n) ** 2.2
        place(buf, w * e, t0, 0.22)
    return buf

def reverb(buf, wet=0.3, length=2.8, predelay=0.02):
    n = int(SR * length)
    t = np.arange(n) / SR
    ir = rng.standard_normal((2, n)) * np.exp(-t * 2.3)
    ir = np.stack([highpass(lowpass(ir[0], 6500), 160), highpass(lowpass(ir[1], 6500), 160)])
    ir /= np.sqrt(np.sum(ir ** 2, axis=1, keepdims=True))
    pd = int(predelay * SR)
    out = np.zeros_like(buf)
    for ch in range(2):
        out[ch] = np.pad(signal.fftconvolve(buf[ch], ir[ch])[: N - pd], (pd, 0))[:N]
    return buf * (1 - wet) + out * wet * 1.6

def gain_curve():
    """Music level over time (dips under the chat so UI sounds read, swells on transitions)."""
    pts = [(0, 0.0), (1.2, 0.8), (6, 0.95), (15.6, 0.7), (42, 0.7), (45, 1.0), (52, 0.8), (66.6, 0.9), (79.5, 1.0), (85, 0.9), (TOTAL, 0.0)]
    xs, ys = zip(*pts)
    return np.interp(np.arange(N) / SR, xs, ys)

def main():
    music = build_music()
    music = reverb(music, 0.35, 3.2) * gain_curve()
    sfx = build_sfx()
    sfx = reverb(sfx, 0.22, 1.8)
    mix = music * 0.75 + sfx * 1.0
    # soft master limiter + fades
    mix = np.tanh(mix * 1.15) / np.tanh(1.15)
    fade_in = np.clip(np.arange(N) / (SR * 0.6), 0, 1)
    fade_out = np.clip((N - np.arange(N)) / (SR * 2.0), 0, 1)
    mix *= fade_in * fade_out
    peak = np.max(np.abs(mix))
    mix = mix / peak * 0.89
    pcm = (mix.T * 32767).astype('<i2')
    out = os.path.join(HERE, '..', 'public', 'soundtrack.wav')
    with wave.open(out, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print('wrote', out, round(TOTAL, 1), 's')

if __name__ == '__main__':
    main()
