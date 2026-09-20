import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, RoundedBox } from '@react-three/drei'
import { Suspense, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

/* ---------- shared scroll progress (0..1 across the whole page) ---------- */
const scroll = { p: 0 }

function smoothstep(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

// piecewise eased interpolation across [pos, value] stops
function track(p: number, stops: number[][]) {
  if (p <= stops[0][0]) return stops[0][1]
  for (let i = 0; i < stops.length - 1; i++) {
    const [pa, va] = stops[i]
    const [pb, vb] = stops[i + 1]
    if (p <= pb) return va + (vb - va) * smoothstep(pa, pb, p)
  }
  return stops[stops.length - 1][1]
}

// contamination spots on the phone face: [x, y] (killed by UV)
const GERMS = [
  [-0.09, 0.27],
  [0.08, 0.21],
  [-0.05, 0.09],
  [0.1, 0.03],
  [-0.11, -0.05],
  [0.05, -0.15],
  [-0.07, -0.26],
  [0.09, -0.31],
]

// loose dust specks on the phone (blown off by the air jet)
const DUST = [
  [-0.1, 0.22],
  [0.09, 0.25],
  [0.12, 0.04],
  [-0.12, -0.1],
  [0.0, 0.14],
  [-0.06, -0.22],
  [0.1, -0.16],
  [0.05, -0.04],
  [-0.11, 0.09],
  [0.07, 0.18],
]

// horizontal wind streaks (air step) — y heights they sweep across at
const WIND = [0.3, 0.16, 0.02, -0.12, -0.26, 0.23, -0.2]

// fine spray droplets (살균수 step): [x, y] — appear wet, then evaporate in dry
const SPRAY = [
  [-0.1, 0.24], [0.08, 0.2], [0.11, 0.06], [-0.05, 0.1], [0.0, -0.02],
  [-0.11, -0.08], [0.09, -0.14], [0.04, 0.0], [-0.07, -0.22], [0.1, -0.26],
  [-0.02, 0.16], [0.06, -0.06], [-0.09, 0.02], [0.02, -0.18],
]

/* ---------- the static kiosk body ---------- */
function KioskBody({
  chamberMat,
  uvLight,
}: {
  chamberMat: React.RefObject<THREE.MeshStandardMaterial>
  uvLight: React.RefObject<THREE.PointLight>
}) {
  const W = 0.8
  const D = 0.7
  return (
    <group>
      <RoundedBox args={[W, 2.0, D]} radius={0.06} smoothness={4} position={[0, -0.55, 0]}>
        <meshStandardMaterial color="#f3f1f8" roughness={0.55} metalness={0.05} />
      </RoundedBox>
      <RoundedBox args={[0.52, 0.92, 0.04]} radius={0.03} smoothness={4} position={[0, -0.35, D / 2 + 0.005]}>
        <meshStandardMaterial color="#15121f" roughness={0.25} emissive="#2b2350" emissiveIntensity={0.35} />
      </RoundedBox>
      <mesh position={[0, -1.32, D / 2 + 0.006]}>
        <boxGeometry args={[0.6, 0.05, 0.02]} />
        <meshStandardMaterial color="#0f0d16" roughness={0.4} />
      </mesh>
      <RoundedBox args={[W * 0.82, 0.18, D * 0.82]} radius={0.04} smoothness={4} position={[0, 0.56, 0]}>
        <meshStandardMaterial color="#e9e6f3" roughness={0.5} />
      </RoundedBox>
      {/* glowing UV chamber on top */}
      <RoundedBox args={[W * 0.78, 0.78, D * 0.78]} radius={0.05} smoothness={4} position={[0, 1.06, 0]}>
        <meshStandardMaterial
          ref={chamberMat}
          color="#ffffff"
          transparent
          opacity={0.2}
          depthWrite={false}
          roughness={0.08}
          emissive="#7c4dff"
          emissiveIntensity={0}
        />
      </RoundedBox>
      <mesh position={[0, 0.69, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[W * 0.42, 0.012, 12, 48]} />
        <meshStandardMaterial color="#7c4dff" emissive="#7c4dff" emissiveIntensity={0.6} />
      </mesh>
      <pointLight ref={uvLight} position={[0, 1.06, 0]} color="#9a6bff" intensity={0} distance={4} />
    </group>
  )
}

/* ---------- the scene: lights + kiosk + scroll-driven choreography ---------- */
function Scene() {
  const group = useRef<THREE.Group>(null)
  const phone = useRef<THREE.Group>(null)
  const chamberMat = useRef<THREE.MeshStandardMaterial>(null)
  const uvLight = useRef<THREE.PointLight>(null)
  const scan = useRef<THREE.Group>(null)
  const germs = useRef<THREE.Mesh[]>([])
  const dust = useRef<THREE.Mesh[]>([])
  const wind = useRef<THREE.Mesh[]>([])
  const spray = useRef<THREE.Mesh[]>([])
  const dryS = useRef<THREE.Mesh[]>([])
  const shadow = useRef<any>(null)
  const cur = useRef(0)

  useFrame((state, dt) => {
    cur.current += (scroll.p - cur.current) * Math.min(1, dt * 9)
    const p = cur.current
    const t = state.clock.elapsedTime
    const k = Math.min(1, dt * 10)

    // --- travel. 9 sections; centers (i+0.5)/9: 0.056 hero R / 0.167 problem L /
    //     0.278 insert R / 0.389 AIR / 0.5 MIST / 0.611 UV / 0.722 DRY (all center) /
    //     0.833 viral L / 0.944 cta R ---
    const x = track(p, [
      [0, 1.3], [0.08, 1.3],
      [0.13, -1.45], [0.2, -1.45],
      [0.24, 1.2], [0.31, 1.2],
      [0.35, 0], [0.77, 0],
      [0.8, -1.2], [0.87, -1.2],
      [0.91, 1.2], [1, 1.2],
    ])

    // --- zoom into the chamber for ALL 4 process beats (air/mist/uv/dry) ---
    const zoom = smoothstep(0.31, 0.37, p) - smoothstep(0.76, 0.82, p)
    const scale = 1 + zoom * 0.85

    // hero entrance: the kiosk dollies in from far away over the first section,
    // so the opening clearly responds to scroll.
    const approach = smoothstep(0.0, 0.1, p)
    const zDolly = THREE.MathUtils.lerp(-3.5, 0, approach)

    if (group.current) {
      group.current.scale.setScalar(scale)
      group.current.position.x = x
      group.current.position.z = zDolly
      const chamberY = THREE.MathUtils.lerp(0.78, 0.1, zoom)
      group.current.position.y = chamberY - 1.06 * scale + Math.sin(t * 0.6) * 0.025
      group.current.rotation.y = (0.22 + Math.sin(t * 0.35) * 0.16) * (1 - zoom)
    }
    if (shadow.current) {
      shadow.current.position.x = x
      shadow.current.position.z = zDolly
    }

    // --- phone: tray -> rises -> tucks into body -> centered in chamber ---
    if (phone.current) {
      const appear = p > 0.21 && p < 0.88
      const rise = smoothstep(0.23, 0.35, p)
      phone.current.visible = appear
      phone.current.position.x = 0
      phone.current.position.y = THREE.MathUtils.lerp(-1.7, 1.06, rise)
      phone.current.position.z = THREE.MathUtils.lerp(0.42, 0.05, smoothstep(0.31, 0.37, p))
      phone.current.rotation.y = 0
    }

    const pulse = 0.55 + Math.sin(t * 6) * 0.45

    // --- 4-stage chamber glow: air cyan / mist teal / uv purple / dry amber ---
    const airGlow = smoothstep(0.33, 0.37, p) * (1 - smoothstep(0.42, 0.46, p))
    const mistGlow = smoothstep(0.45, 0.49, p) * (1 - smoothstep(0.53, 0.57, p))
    const uvGlow = smoothstep(0.56, 0.6, p) * (1 - smoothstep(0.64, 0.68, p))
    const dryGlow = smoothstep(0.67, 0.71, p) * (1 - smoothstep(0.75, 0.79, p))
    let gMax = airGlow
    let gCol = '#56c5ff'
    if (mistGlow > gMax) { gMax = mistGlow; gCol = '#33dcc4' }
    if (uvGlow > gMax) { gMax = uvGlow; gCol = '#7c4dff' }
    if (dryGlow > gMax) { gMax = dryGlow; gCol = '#ffb060' }
    if (chamberMat.current) {
      chamberMat.current.emissive.set(gCol)
      chamberMat.current.emissiveIntensity = gMax * (0.9 + pulse * 1.2)
    }
    if (uvLight.current) {
      uvLight.current.color.set(gCol)
      uvLight.current.intensity = gMax * (5 + pulse * 5)
    }

    // --- AIR: dust blows off + wind streaks sweep across ---
    const air = smoothstep(0.34, 0.42, p)
    dust.current.forEach((m, i) => {
      if (!m) return
      const ang = i * 2.39996
      const distAway = air * (0.5 + (i % 4) * 0.22)
      m.position.x = DUST[i][0] + Math.cos(ang) * distAway
      m.position.y = DUST[i][1] + Math.sin(ang) * distAway * 0.5 + air * 0.7
      m.position.z = 0.04 + air * (0.3 + (i % 3) * 0.25)
      const mat = m.material as THREE.MeshBasicMaterial
      mat.opacity = 1 - smoothstep(0.25, 0.85, air)
      m.visible = mat.opacity > 0.02
    })
    const airEnv = smoothstep(0.34, 0.38, p) * (1 - smoothstep(0.43, 0.47, p))
    wind.current.forEach((m, i) => {
      if (!m) return
      const speed = 1.7 + (i % 3) * 0.6
      const xx = ((t * speed + i * 0.41) % 1.3) / 1.3
      m.position.x = -0.45 + xx * 0.9
      const mat = m.material as THREE.MeshBasicMaterial
      mat.opacity = airEnv * Math.sin(xx * Math.PI) * 0.85
      m.visible = airEnv > 0.02
    })

    // --- MIST (살균수): fine droplets continuously spray from two top nozzles
    //     onto the phone (each loops nozzle -> surface, staggered = a spray stream) ---
    const mistEnv = smoothstep(0.45, 0.49, p) * (1 - smoothstep(0.54, 0.58, p))
    spray.current.forEach((m, i) => {
      if (!m) return
      const nozzleX = i % 2 === 0 ? -0.42 : 0.42
      const travel = (t * 1.5 + i * 0.41) % 1 // 0..1, restarts -> continuous spray
      m.position.x = THREE.MathUtils.lerp(nozzleX, SPRAY[i][0], travel)
      m.position.y = THREE.MathUtils.lerp(0.5, SPRAY[i][1], travel)
      m.position.z = 0.06
      const mat = m.material as THREE.MeshBasicMaterial
      // invisible at the nozzle, bright mid-flight, fades as it hits the surface
      mat.opacity = mistEnv * Math.sin(travel * Math.PI) * 0.95
      m.visible = mat.opacity > 0.02
    })

    // --- DRY (건조): warm streaks rise up ---
    const dryEnv = smoothstep(0.67, 0.71, p) * (1 - smoothstep(0.76, 0.8, p))
    dryS.current.forEach((m, i) => {
      if (!m) return
      const speed = 0.9 + (i % 3) * 0.3
      const yy = ((t * speed + i * 0.5) % 1.4) / 1.4
      m.position.y = -0.3 + yy * 0.7
      const mat = m.material as THREE.MeshBasicMaterial
      mat.opacity = dryEnv * Math.sin(yy * Math.PI) * 0.7
      m.visible = dryEnv > 0.02
    })

    // --- UV: sweep line travels top->bottom, germs vanish behind it ---
    const wipe = smoothstep(0.57, 0.65, p)
    const sy = THREE.MathUtils.lerp(0.36, -0.36, wipe)
    if (scan.current) {
      scan.current.position.y = sy
      scan.current.visible = wipe > 0.02 && wipe < 0.98
    }
    germs.current.forEach((m, i) => {
      if (!m) return
      const cleaned = wipe > 0.02 && sy <= GERMS[i][1]
      const mat = m.material as THREE.MeshBasicMaterial
      mat.opacity += ((cleaned ? 0 : 1) - mat.opacity) * k
      m.visible = mat.opacity > 0.02
    })
  })

  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[4, 6, 4]} intensity={1.7} />
      <directionalLight position={[-5, 2, -3]} intensity={0.5} color="#cdb8ff" />

      <group ref={group} position={[1.3, -0.94, 0]}>
        <KioskBody chamberMat={chamberMat} uvLight={uvLight} />

        <group ref={phone} visible={false}>
          <RoundedBox args={[0.3, 0.64, 0.035]} radius={0.03} smoothness={4}>
            <meshStandardMaterial color="#1a1a22" roughness={0.3} metalness={0.2} />
          </RoundedBox>
          <mesh position={[0, 0, 0.02]}>
            <planeGeometry args={[0.26, 0.56]} />
            <meshStandardMaterial color="#2a2440" emissive="#3a2f66" emissiveIntensity={0.25} roughness={0.2} />
          </mesh>
          {/* contamination spots */}
          {GERMS.map((g, i) => (
            <mesh
              key={i}
              position={[g[0], g[1], 0.05]}
              ref={(el) => {
                if (el) germs.current[i] = el
              }}
            >
              <circleGeometry args={[0.026, 20]} />
              <meshBasicMaterial transparent opacity={1} color="#aec23f" />
            </mesh>
          ))}
          {/* loose dust (blown off during the air step) */}
          {DUST.map((d, i) => (
            <mesh
              key={`dust${i}`}
              position={[d[0], d[1], 0.04]}
              ref={(el) => {
                if (el) dust.current[i] = el
              }}
            >
              <circleGeometry args={[0.013, 12]} />
              <meshBasicMaterial transparent opacity={1} color="#cbbfa9" />
            </mesh>
          ))}
          {/* wind streaks (에어 step) */}
          {WIND.map((y, i) => (
            <mesh
              key={`wind${i}`}
              position={[0, y, 0.085]}
              visible={false}
              ref={(el) => {
                if (el) wind.current[i] = el
              }}
            >
              <planeGeometry args={[0.5, 0.01]} />
              <meshBasicMaterial color="#e2f4ff" transparent opacity={0} />
            </mesh>
          ))}
          {/* spray droplets (살균수 step) */}
          {SPRAY.map((s, i) => (
            <mesh
              key={`spray${i}`}
              position={[s[0], s[1], 0.045]}
              visible={false}
              ref={(el) => {
                if (el) spray.current[i] = el
              }}
            >
              <circleGeometry args={[0.011, 10]} />
              <meshBasicMaterial color="#8fd8ff" transparent opacity={0} />
            </mesh>
          ))}
          {/* warm rising streaks (건조 step) */}
          {[0, 1, 2, 3].map((i) => (
            <mesh
              key={`dry${i}`}
              position={[(i - 1.5) * 0.09, 0, 0.085]}
              visible={false}
              ref={(el) => {
                if (el) dryS.current[i] = el
              }}
            >
              <planeGeometry args={[0.012, 0.26]} />
              <meshBasicMaterial color="#ffc88a" transparent opacity={0} />
            </mesh>
          ))}
          {/* the UV sweep line + soft glow */}
          <group ref={scan} position={[0, 0, 0.07]} visible={false}>
            <mesh>
              <planeGeometry args={[0.38, 0.045]} />
              <meshBasicMaterial color="#f1ecff" transparent opacity={0.98} />
            </mesh>
            <mesh position={[0, 0, -0.004]}>
              <planeGeometry args={[0.46, 0.18]} />
              <meshBasicMaterial color="#9a6bff" transparent opacity={0.3} />
            </mesh>
          </group>
        </group>
      </group>

      <ContactShadows ref={shadow} position={[1.3, -1.98, 0]} opacity={0.3} scale={9} blur={2.8} far={4} />
    </>
  )
}

/* ---------- text wrapper (opacity driven by scroll in App, see updateReveals) ---------- */
function Reveal({ children }: { children: React.ReactNode }) {
  return <div className="reveal">{children}</div>
}

/* ---------- fake-door waitlist ---------- */
function Waitlist() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const [count, setCount] = useState(0)
  useEffect(() => {
    setCount(JSON.parse(localStorage.getItem('wipe_waitlist') || '[]').length)
  }, [])
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) return
    const list = JSON.parse(localStorage.getItem('wipe_waitlist') || '[]')
    list.push({ email, at: new Date().toISOString() })
    localStorage.setItem('wipe_waitlist', JSON.stringify(list))
    setCount(list.length)
    setDone(true)
  }
  if (done) {
    return (
      <div className="wl-done">
        <div className="wl-check">✓</div>
        <p>신청 완료! 1호점 오픈하면 가장 먼저 알려드릴게요.</p>
        <span className="wl-count">현재 {count}명이 기다리고 있어요</span>
      </div>
    )
  }
  return (
    <form className="wl" onSubmit={submit}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일 주소" aria-label="이메일 주소" />
      <button type="submit">오픈 알림 받기</button>
    </form>
  )
}

export default function App() {
  useEffect(() => {
    const reveals = Array.from(document.querySelectorAll<HTMLElement>('.reveal'))
    const n = reveals.length
    const onScroll = () => {
      // progress = where the viewport CENTER sits in the page, so each
      // section's center maps to a fixed fraction regardless of page height.
      const total = document.documentElement.scrollHeight
      const p = Math.min(1, Math.max(0, (window.scrollY + window.innerHeight / 2) / total))
      scroll.p = p
      // each section's text owns the band around its center (i+0.5)/n and
      // fades out toward the edges, so adjacent sections never overlap.
      // text stays solid across most of its section (readable while scrolling)
      // and only crossfades briefly right at the boundary, so no overlap.
      for (let i = 0; i < n; i++) {
        const d = Math.abs(p - (i + 0.5) / n)
        // normalize to the half-section width so this adapts to ANY section count:
        // dn = 0 at the section center, 1 at the boundary with the next section.
        const dn = d * 2 * n
        const op = 1 - smoothstep(0.78, 0.98, dn)
        reveals[i].style.opacity = String(op)
        reveals[i].style.transform = `translateY(${(1 - op) * 12}px)`
        reveals[i].style.pointerEvents = op > 0.5 ? 'auto' : 'none'
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <>
      <div className="canvas-wrap">
        <Canvas camera={{ position: [0, 0.2, 6], fov: 34 }} dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>

      <header className="brand">WIPE</header>

      <main className="content">
        <section className="sec left">
          <Reveal>
            <p className="eyebrow">스마트폰 UV-C 살균 키오스크</p>
            <h1>
              30초,
              <br />빛으로 끝내는<br />
              <span className="accent">폰 위생.</span>
            </h1>
            <p className="lead">넣고 기다리면 끝. 손 댈 필요도, 닦을 필요도 없습니다.</p>
            <div className="scroll-hint">스크롤 ↓</div>
          </Reveal>
        </section>

        <section className="sec right">
          <Reveal>
            <h2>
              당신의 폰은<br />
              <span className="accent">변기보다 더럽습니다.</span>
            </h2>
            <p className="body">하루 종일 손에 쥐고, 식탁에 놓고, 화장실에도 들고 가죠. 그런데 한 번이라도 제대로 살균한 적, 있나요?</p>
          </Reveal>
        </section>

        <section className="sec left">
          <Reveal>
            <h2>
              넣고, 30초.<br />
              <span className="accent">그게 다예요.</span>
            </h2>
            <p className="body">트레이에 폰을 올려놓으면 챔버가 폰을 챔버 안으로 들어올립니다. 물도, 물티슈도, 기다림도 필요 없습니다.</p>
          </Reveal>
        </section>

        <section className="sec center">
          <Reveal>
            <h2 className="big">
              먼지는, <span className="accent">바람으로.</span>
            </h2>
            <p className="body center-body">강한 에어가 표면의 먼지와 이물질을 먼저 날려보냅니다.</p>
          </Reveal>
        </section>

        <section className="sec center">
          <Reveal>
            <h2 className="big">
              세척은, <span className="accent">살균수로.</span>
            </h2>
            <p className="body center-body">3% 과산화수소수를 미세하게 분사해 표면을 닦아냅니다.</p>
          </Reveal>
        </section>

        <section className="sec center">
          <Reveal>
            <h2 className="big">
              닦이는 게, <span className="accent">눈에 보입니다.</span>
            </h2>
            <p className="body center-body">UV-C가 폰 표면을 훑고 지나간 자리, 오염이 사라집니다.</p>
          </Reveal>
        </section>

        <section className="sec center">
          <Reveal>
            <h2 className="big">
              마무리는, <span className="accent">보송하게.</span>
            </h2>
            <p className="body center-body">남은 수분까지 바람으로 날려 깨끗하게 끝냅니다.</p>
          </Reveal>
        </section>

        <section className="sec right">
          <Reveal>
            <h2>
              그래서<br />
              <span className="accent">찍게 됩니다.</span>
            </h2>
            <p className="body">투명 챔버 속 비포·애프터를 손님이 알아서 SNS에 올립니다. &lsquo;인증샷이 되는 위생&rsquo;.</p>
          </Reveal>
        </section>

        <section className="sec left">
          <Reveal>
            <p className="eyebrow">성수 · 홍대 &middot; 1호점 오픈 예정</p>
            <h2>
              가장 먼저<br />
              <span className="accent">무료로 체험하세요.</span>
            </h2>
            <p className="body">오픈하면 1호점 위치와 무료 체험 코드를 보내드릴게요.</p>
            <Waitlist />
          </Reveal>
        </section>
      </main>
    </>
  )
}
