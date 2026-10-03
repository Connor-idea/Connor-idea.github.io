import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * 首页 Hero 背景：低对比星尘 + 陶土色线框多面体
 * - prefers-reduced-motion 时静止渲染单帧
 * - 页面不可见时暂停动画循环
 */
export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const geometry = new THREE.IcosahedronGeometry(2, 1);
    const material = new THREE.MeshBasicMaterial({
      color: 0xc97b52,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    });
    const polyhedron = new THREE.Mesh(geometry, material);
    scene.add(polyhedron);

    const starCount = 360;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 22;
      positions[i + 1] = (Math.random() - 0.5) * 12;
      positions[i + 2] = (Math.random() - 0.5) * 10;
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xe8dcc8,
      size: 0.028,
      transparent: true,
      opacity: 0.4,
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    const mouse = new THREE.Vector2(0, 0);
    const onPointerMove = (event: PointerEvent) => {
      if (reduceMotion) return;
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('pointermove', onPointerMove);

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    let frameId = 0;
    let running = true;
    const clock = new THREE.Clock();

    const animate = () => {
      if (!running) return;
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      polyhedron.rotation.x = elapsed * 0.12;
      polyhedron.rotation.y = elapsed * 0.18;
      stars.rotation.y = elapsed * 0.02;

      camera.position.x += (mouse.x * 0.45 - camera.position.x) * 0.025;
      camera.position.y += (mouse.y * 0.3 - camera.position.y) * 0.025;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    if (reduceMotion) {
      // 静态单帧：有视觉、无动画
      polyhedron.rotation.set(0.35, 0.55, 0);
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    } else {
      animate();
    }

    // 页面不可见时暂停，省电省 CPU
    const onVisibility = () => {
      if (reduceMotion) return;
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(frameId);
      } else {
        running = true;
        clock.getDelta(); // 丢弃隐藏期间的时间跳变
        animate();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(frameId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      geometry.dispose();
      material.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} aria-hidden="true" className="absolute inset-0" />;
}
